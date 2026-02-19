const asyncHandler = require('express-async-handler');
const InvestmentPlan = require('../models/InvestmentPlan');
const InvestmentEntry = require('../models/InvestmentEntry');
const Expense = require('../models/Expense');

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

/** Return the first day of a month given any date */
const startOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Compute the current value of an entry using compound monthly growth.
 * rate: annual % (e.g. 12 = 12%/year → 1% per month)
 * ageMonths: how many complete months since the entry date
 */
const compoundValue = (principal, annualRatePct, ageMonths) => {
    if (!annualRatePct || annualRatePct <= 0) return principal;
    const monthlyRate = annualRatePct / 100 / 12;
    return principal * Math.pow(1 + monthlyRate, ageMonths);
};

/* ─────────────────────────────────────────────────────────────
   GET /api/dashboard/summary
   Returns:
     - netWorth = (Active Inv Value + Realized Inactive Inv Value) - Total Expenses
     - totalActiveInvestments = Active Inv Value only
     - totalExpenses = Sum of all expenses
     - activePlanCount
───────────────────────────────────────────────────────────── */
const getDashboardSummary = asyncHandler(async (req, res) => {
    // 1. Calculate Active Investments Value
    const activePlans = await InvestmentPlan.find({ user: req.user.id, isActive: true });
    let activeValue = 0;

    await Promise.all(activePlans.map(async (plan) => {
        const entries = await InvestmentEntry.find({ plan: plan._id, isActive: true });
        for (const entry of entries) {
            const entryMonth = startOfMonth(entry.date);
            const diffMs = new Date() - entryMonth;
            const ageMonths = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44)));
            activeValue += compoundValue(entry.amount, plan.expectedReturnRate, ageMonths);
        }
    }));

    // 2. Calculate Realized Value from Inactive (Stopped) Plans
    // Assumption: Value is realized at the principal amount + growth up to today
    const inactivePlans = await InvestmentPlan.find({ user: req.user.id, isActive: false });
    let realizedValue = 0;

    await Promise.all(inactivePlans.map(async (plan) => {
        // If plan has an explicit realized value (stopped/sold), use it
        if (plan.realizedValue !== undefined) {
            realizedValue += plan.realizedValue;
            return;
        }

        // Fallback for legacy stopped plans (sum of inactive entries)
        const entries = await InvestmentEntry.find({ plan: plan._id });
        for (const entry of entries) {
            const entryMonth = startOfMonth(entry.date);
            const diffMs = new Date() - entryMonth;
            const ageMonths = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44)));
            realizedValue += compoundValue(entry.amount, plan.expectedReturnRate, ageMonths);
        }
    }));

    // 3. Calculate Total Expenses
    const expenses = await Expense.find({ user: req.user.id });
    const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 4. Net Worth
    const netWorth = (activeValue + realizedValue) - totalExpenses;

    res.status(200).json({
        netWorth: Math.round(netWorth),
        totalActiveInvestments: Math.round(activeValue),
        totalRealizedInvestments: Math.round(realizedValue),
        totalExpenses: Math.round(totalExpenses),
        activePlanCount: activePlans.length
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
    const { type = 'all', sort = 'date', order = 'desc', limit = 50, from, to } = req.query;
    const limitNum = Number(limit);

    // Build query filters
    const dateFilter = {};
    if (from || to) {
        dateFilter.date = {};
        if (from) dateFilter.date.$gte = new Date(from);
        if (to) dateFilter.date.$lte = new Date(to);
    }

    let allTransactions = [];

    // 1. Fetch Expenses
    if (type === 'all' || type === 'expense') {
        const expenses = await Expense.find({ user: req.user.id, ...dateFilter }).lean();
        const formattedExpenses = expenses.map(e => ({
            id: e._id,
            type: 'expense',
            originalDate: e.date,
            date: new Date(e.date),
            amount: Number(e.amount),
            description: e.description || e.category,
            category: e.category,
            asset: null
        }));
        allTransactions.push(...formattedExpenses);
    }

    // 2. Fetch Investments
    if (type === 'all' || type === 'investment') {
        // We include active entries as "Invested" events
        // (Should we also include inactive ones as historical records? Yes, probably.)
        const investmentEntries = await InvestmentEntry.find({ user: req.user.id, ...dateFilter })
            .populate('plan', 'assetName type investmentMode')
            .lean();

        const formattedInvestments = investmentEntries.map(e => ({
            id: e._id,
            type: 'investment',
            originalDate: e.date,
            date: new Date(e.date),
            amount: Number(e.amount),
            description: `Invested in ${e.plan?.assetName || 'Asset'}`,
            category: 'Investment',
            asset: e.plan?.type,
            mode: e.plan?.investmentMode
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
            status: 'closed',
            stopDate: { $ne: null },
            ...stopDateFilter
        }).lean();

        const soldEvents = closedPlans.map(p => ({
            id: p._id + '_sold',
            type: 'investment',
            originalDate: p.stopDate,
            date: new Date(p.stopDate),
            amount: Number(p.realizedValue || 0),
            description: `Sold ${p.assetName}`,
            category: 'Investment Return',
            asset: p.type,
            mode: 'sold'
        }));

        allTransactions.push(...soldEvents);
    }

    // 3. Sort
    allTransactions.sort((a, b) => {
        if (sort === 'amount') {
            return order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        } else {
            // Default: date
            return order === 'asc'
                ? a.date - b.date
                : b.date - a.date;
        }
    });

    // 4. Limit
    if (limitNum > 0) {
        allTransactions = allTransactions.slice(0, limitNum);
    }

    res.status(200).json(allTransactions);
});

module.exports = {
    getDashboardSummary,
    getRecentTransactions
};
