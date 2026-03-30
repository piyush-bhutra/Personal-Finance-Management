const asyncHandler = require("express-async-handler");
const InvestmentPlan = require("../models/InvestmentPlan");
const InvestmentEntry = require("../models/InvestmentEntry");
const ExpensePlan = require("../models/ExpensePlan");
const ExpenseEntry = require("../models/ExpenseEntry");
const Budget = require("../models/Budget");

const { startOfMonth, compoundValue } = require("../utils/calc");

const parseMonthInput = (input) => {
  if (!input) return startOfMonth(new Date());

  if (typeof input === "string" && /^\d{4}-\d{2}$/.test(input)) {
    const [year, month] = input.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("month must be in YYYY-MM format");
  }

  return startOfMonth(parsed);
};

const monthLabel = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const roundToTwo = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};

const getMonthRange = (monthStart) => {
  const start = startOfMonth(monthStart);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
};

const buildBudgetOverview = async (userId, monthStart) => {
  const { start, end } = getMonthRange(monthStart);

  const [budgets, expenseEntries] = await Promise.all([
    Budget.find({ user: userId, month: start }).sort({ category: 1 }).lean(),
    ExpenseEntry.find({
      user: userId,
      isActive: true,
      date: { $gte: start, $lt: end },
    })
      .populate("plan", "category")
      .lean(),
  ]);

  const spentByCategory = {};
  let totalSpent = 0;

  for (const entry of expenseEntries) {
    const amount = Number(entry.amount) || 0;
    const category = entry.plan?.category || "Uncategorized";
    spentByCategory[category] = (spentByCategory[category] || 0) + amount;
    totalSpent += amount;
  }

  const budgetCategorySet = new Set(budgets.map((budget) => budget.category));
  let budgetedSpent = 0;

  const categories = budgets.map((budget) => {
    const spent = roundToTwo(spentByCategory[budget.category] || 0);
    const limit = roundToTwo(Number(budget.limit) || 0);
    const remaining = roundToTwo(limit - spent);
    const utilizationPercent =
      limit > 0 ? roundToTwo((spent / limit) * 100) : 0;
    const status =
      remaining < 0 ? "over" : utilizationPercent >= 80 ? "near" : "within";

    budgetedSpent += spent;

    return {
      _id: budget._id,
      category: budget.category,
      limit,
      spent,
      remaining,
      utilizationPercent,
      status,
      month: budget.month,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  });

  const unbudgetedSpent = roundToTwo(
    Object.entries(spentByCategory)
      .filter(([category]) => !budgetCategorySet.has(category))
      .reduce((sum, [, amount]) => sum + amount, 0),
  );

  const totalBudget = roundToTwo(
    budgets.reduce((sum, budget) => sum + (Number(budget.limit) || 0), 0),
  );
  const roundedBudgetedSpent = roundToTwo(budgetedSpent);
  const remaining = roundToTwo(totalBudget - roundedBudgetedSpent);
  const utilizationPercent =
    totalBudget > 0
      ? roundToTwo((roundedBudgetedSpent / totalBudget) * 100)
      : 0;

  return {
    month: start,
    monthLabel: monthLabel(start),
    totalBudget,
    budgetedSpent: roundedBudgetedSpent,
    totalSpent: roundToTwo(totalSpent),
    unbudgetedSpent,
    remaining,
    utilizationPercent,
    overspentCategories: categories.filter((item) => item.remaining < 0).length,
    categoryCount: categories.length,
    categories,
  };
};

/* ─────────────────────────────────────────────────────────────
   GET /api/dashboard/summary
   Returns:
     - netWorth = (Active Inv Value + Realized Inactive Inv Value)
     - totalActiveInvestments = Active Inv Value only
     - totalExpenses = Sum of all expenses
     - activePlanCount
───────────────────────────────────────────────────────────── */
const getDashboardSummary = asyncHandler(async (req, res) => {
  // 1. Calculate Active Investments Value
  const activePlans = await InvestmentPlan.find({
    user: req.user.id,
    isActive: true,
  });
  let activeValue = 0;

  if (activePlans.length > 0) {
    const activePlanIds = activePlans.map((p) => p._id);
    const activeEntries = await InvestmentEntry.find({
      plan: { $in: activePlanIds },
      isActive: true,
    });

    // Build a map of plan details for quick lookup
    const activePlanMap = {};
    for (const p of activePlans) {
      activePlanMap[p._id] = p;
    }

    for (const entry of activeEntries) {
      const plan = activePlanMap[entry.plan];
      if (!plan) continue;
      const entryMonth = startOfMonth(entry.date);
      const diffMs = new Date() - entryMonth;
      const ageMonths = Math.max(
        0,
        Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44)),
      );
      activeValue += compoundValue(
        entry.amount,
        plan.expectedReturnRate,
        ageMonths,
      );
    }
  }

  // 2. Calculate Realized Value from Inactive (Stopped) Plans
  // Assumption: Value is realized at the principal amount + growth up to today
  const inactivePlans = await InvestmentPlan.find({
    user: req.user.id,
    status: "closed",
  });
  let realizedValue = 0;
  const legacyInactivePlanIds = [];
  const inactivePlanMap = {};

  for (const plan of inactivePlans) {
    // If plan has an explicit realized value (stopped/sold), use it
    if (plan.realizedValue !== undefined) {
      realizedValue += plan.realizedValue;
    } else {
      legacyInactivePlanIds.push(plan._id);
      inactivePlanMap[plan._id] = plan;
    }
  }

  if (legacyInactivePlanIds.length > 0) {
    const legacyEntries = await InvestmentEntry.find({
      plan: { $in: legacyInactivePlanIds },
    });
    for (const entry of legacyEntries) {
      const plan = inactivePlanMap[entry.plan];
      if (!plan) continue;
      const entryMonth = startOfMonth(entry.date);
      const diffMs = new Date() - entryMonth;
      const ageMonths = Math.max(
        0,
        Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44)),
      );
      realizedValue += compoundValue(
        entry.amount,
        plan.expectedReturnRate,
        ageMonths,
      );
    }
  }

  // 3. Calculate Total Expenses
  const expenses = await ExpenseEntry.find({
    user: req.user.id,
    isActive: true,
  });
  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0,
  );

  // 4. Net Worth (Total Assets)
  const netWorth = activeValue + realizedValue;
  const monthlyBudget = await buildBudgetOverview(
    req.user.id,
    startOfMonth(new Date()),
  );

  res.status(200).json({
    netWorth: Math.round(netWorth),
    totalActiveInvestments: Math.round(activeValue),
    totalRealizedInvestments: Math.round(realizedValue),
    totalExpenses: Math.round(totalExpenses),
    activePlanCount: activePlans.length,
    monthlyBudget,
  });
});

/* ─────────────────────────────────────────────────────────────
   GET /api/dashboard/budgets
   Query:
     - month (optional): YYYY-MM
───────────────────────────────────────────────────────────── */
const getMonthlyBudgets = asyncHandler(async (req, res) => {
  let monthStart;
  try {
    monthStart = parseMonthInput(req.query.month);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const overview = await buildBudgetOverview(req.user.id, monthStart);
  res.status(200).json(overview);
});

/* ─────────────────────────────────────────────────────────────
   POST /api/dashboard/budgets
   Body:
     - category (required)
     - limit (required)
     - month (optional): YYYY-MM
───────────────────────────────────────────────────────────── */
const upsertMonthlyBudget = asyncHandler(async (req, res) => {
  const { category, limit, month } = req.body;

  let monthStart;
  try {
    monthStart = parseMonthInput(month);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const normalizedCategory = String(category || "").trim();
  const normalizedLimit = Number(limit);

  const budget = await Budget.findOneAndUpdate(
    {
      user: req.user.id,
      category: normalizedCategory,
      month: monthStart,
    },
    {
      $set: {
        limit: normalizedLimit,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  const overview = await buildBudgetOverview(req.user.id, monthStart);

  res.status(200).json({
    budget,
    overview,
  });
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/dashboard/budgets/:id
───────────────────────────────────────────────────────────── */
const deleteMonthlyBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    res.status(404);
    throw new Error("Budget not found");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  if (budget.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const monthStart = startOfMonth(budget.month);
  await budget.deleteOne();

  const overview = await buildBudgetOverview(req.user.id, monthStart);

  res.status(200).json({
    id: req.params.id,
    overview,
  });
});

/* ─────────────────────────────────────────────────────────────
   GET /api/dashboard/transactions
   Fetch merged transactions with filtering and sorting.
   Query Params:
     - type: 'all' | 'expense' | 'investment' (default: 'all')
     - sort: 'date' | 'amount'
     - order: 'desc' | 'asc' (default: 'desc')
     - limit: number (default: 50)
───────────────────────────────────────────────────────────── */
const getRecentTransactions = asyncHandler(async (req, res) => {
  const {
    type = "all",
    sort = "date",
    order = "desc",
    limit = 50,
    from,
    to,
  } = req.query;

  // Normalize and clamp limit to avoid unbounded responses
  const rawLimit = Number.isNaN(Number(limit)) ? 50 : Number(limit);
  const limitNum = Math.min(Math.max(rawLimit, 1), 200);

  // Build query filters
  const dateFilter = {};
  if (from || to) {
    dateFilter.date = {};
    if (from) dateFilter.date.$gte = new Date(from);
    if (to) dateFilter.date.$lte = new Date(to);
  }

  let allTransactions = [];

  // 1. Fetch Expenses
  if (type === "all" || type === "expense") {
    const expenseEntries = await ExpenseEntry.find({
      user: req.user.id,
      isActive: true,
      ...dateFilter,
    })
      .populate("plan", "category description expenseMode")
      .lean();
    const formattedExpenses = expenseEntries.map((e) => ({
      id: e._id,
      type: "expense",
      originalDate: e.date,
      date: new Date(e.date),
      amount: Number(e.amount),
      description: e.plan?.description || e.plan?.category || "Expense",
      category: e.plan?.category,
      asset: null,
      mode: e.plan?.expenseMode,
    }));
    allTransactions.push(...formattedExpenses);
  }

  // 2. Fetch Investments
  if (type === "all" || type === "investment") {
    // We include active entries as "Invested" events
    // (Should we also include inactive ones as historical records? Yes, probably.)
    const investmentEntries = await InvestmentEntry.find({
      user: req.user.id,
      ...dateFilter,
    })
      .populate("plan", "assetName type investmentMode")
      .lean();

    const formattedInvestments = investmentEntries.map((e) => ({
      id: e._id,
      type: "investment",
      originalDate: e.date,
      date: new Date(e.date),
      amount: Number(e.amount),
      description: `Invested in ${e.plan?.assetName || "Asset"}`,
      category: "Investment",
      asset: e.plan?.type,
      mode: e.plan?.investmentMode,
    }));
    allTransactions.push(...formattedInvestments);

    // 2b. Fetch "Sold" events (Closed Plans)
    const stopDateFilter = {};
    if (from || to) {
      stopDateFilter.stopDate = {};
      if (from) stopDateFilter.stopDate.$gte = new Date(from);
      if (to) stopDateFilter.stopDate.$lte = new Date(to);
    }

    const closedPlans = await InvestmentPlan.find({
      user: req.user.id,
      status: "closed",
      stopDate: { $ne: null },
      ...stopDateFilter,
    }).lean();

    const soldEvents = closedPlans.map((p) => ({
      id: p._id + "_sold",
      type: "investment",
      originalDate: p.stopDate,
      date: new Date(p.stopDate),
      amount: Number(p.realizedValue || 0),
      description: `Sold ${p.assetName}`,
      category: "Investment Return",
      asset: p.type,
      mode: "sold",
    }));

    allTransactions.push(...soldEvents);
  }

  // 3. Sort
  allTransactions.sort((a, b) => {
    if (sort === "amount") {
      return order === "asc" ? a.amount - b.amount : b.amount - a.amount;
    } else {
      // Default: date
      return order === "asc" ? a.date - b.date : b.date - a.date;
    }
  });

  // 4. Limit
  allTransactions = allTransactions.slice(0, limitNum);

  res.status(200).json(allTransactions);
});

module.exports = {
  getDashboardSummary,
  getRecentTransactions,
  getMonthlyBudgets,
  upsertMonthlyBudget,
  deleteMonthlyBudget,
};
