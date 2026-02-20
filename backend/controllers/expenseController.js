const asyncHandler = require('express-async-handler');
const ExpensePlan = require('../models/ExpensePlan');
const ExpenseEntry = require('../models/ExpenseEntry');
const { startOfMonth, monthsBetween } = require('../utils/calc');

/* ─────────────────────────────────────────────────────────────
   GET /api/expenses
   Returns all active expense plans for the user, with their entries.
───────────────────────────────────────────────────────────── */
const getExpenses = asyncHandler(async (req, res) => {
    const plans = await ExpensePlan.find({ user: req.user.id, isActive: true });

    const results = await Promise.all(plans.map(async (plan) => {
        const entries = await ExpenseEntry.find({ plan: plan._id, isActive: true }).sort({ date: 1 });
        const totalAmount = entries.reduce((acc, entry) => acc + entry.amount, 0);

        return {
            ...plan.toObject(),
            entries,
            totalAmount
        };
    }));

    res.status(200).json(results);
});

/* ─────────────────────────────────────────────────────────────
   POST /api/expenses
   Creates a new expense plan and backfills its entries.
───────────────────────────────────────────────────────────── */
const createExpense = asyncHandler(async (req, res) => {
    const { expenseMode, category, monthlyAmount, startDate, amount, date, description } = req.body;

    if (!expenseMode || !category) {
        res.status(400);
        throw new Error('Please provide expenseMode and category');
    }

    if (expenseMode === 'recurring') {
        if (!monthlyAmount || !startDate) {
            res.status(400);
            throw new Error('Recurring expenses require monthlyAmount and startDate');
        }

        const plan = await ExpensePlan.create({
            user: req.user.id,
            expenseMode: 'recurring',
            category,
            monthlyAmount: Number(monthlyAmount),
            startDate: new Date(startDate),
            description,
        });

        // Backfill one entry per month from startDate to today
        const today = new Date();
        const months = monthsBetween(startDate, today);
        const entries = months.map((monthDate) => ({
            plan: plan._id,
            user: req.user.id,
            amount: Number(monthlyAmount),
            date: monthDate,
            isActive: true,
        }));

        await ExpenseEntry.insertMany(entries);
        const allEntries = await ExpenseEntry.find({ plan: plan._id, isActive: true }).sort({ date: 1 });
        const totalAmount = allEntries.reduce((acc, entry) => acc + entry.amount, 0);

        res.status(201).json({ ...plan.toObject(), entries: allEntries, totalAmount });

    } else if (expenseMode === 'one-time') {
        if (!amount || !date) {
            res.status(400);
            throw new Error('One-time expenses require amount and date');
        }

        const plan = await ExpensePlan.create({
            user: req.user.id,
            expenseMode: 'one-time',
            category,
            amount: Number(amount),
            date: new Date(date),
            description,
        });

        const entry = await ExpenseEntry.create({
            plan: plan._id,
            user: req.user.id,
            amount: Number(amount),
            date: new Date(date),
            isActive: true,
        });

        res.status(201).json({ ...plan.toObject(), entries: [entry], totalAmount: entry.amount });
    } else {
        res.status(400);
        throw new Error('expenseMode must be "recurring" or "one-time"');
    }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/expenses/:id
   Updates an expense plan and its future/current entries.
───────────────────────────────────────────────────────────── */
const updateExpense = asyncHandler(async (req, res) => {
    const plan = await ExpensePlan.findById(req.params.id);
    if (!plan) { res.status(404); throw new Error('Expense not found'); }
    if (!req.user) { res.status(401); throw new Error('Not authenticated'); }
    if (plan.user.toString() !== req.user.id) { res.status(401); throw new Error('Not authorized'); }

    const { fromDate, monthlyAmount, amount, category, description, date } = req.body;

    if (plan.expenseMode === 'recurring') {
        if (!fromDate) { res.status(400); throw new Error('fromDate is required for recurring edits'); }

        const cutoff = startOfMonth(new Date(fromDate));

        // Deactivate entries from cutoff forward
        await ExpenseEntry.updateMany(
            { plan: plan._id, date: { $gte: cutoff }, isActive: true },
            { $set: { isActive: false } }
        );

        const newMonthlyAmount = monthlyAmount ? Number(monthlyAmount) : plan.monthlyAmount;
        const today = new Date();
        const months = monthsBetween(cutoff, today);
        const newEntries = months.map((monthDate) => ({
            plan: plan._id,
            user: req.user.id,
            amount: newMonthlyAmount,
            date: monthDate,
            isActive: true,
        }));
        await ExpenseEntry.insertMany(newEntries);

        const updatedPlan = await ExpensePlan.findByIdAndUpdate(
            plan._id,
            {
                monthlyAmount: newMonthlyAmount,
                ...(category && { category }),
                ...(description !== undefined && { description }),
            },
            { new: true }
        );

        const entries = await ExpenseEntry.find({ plan: plan._id, isActive: true }).sort({ date: 1 });
        const totalAmount = entries.reduce((acc, entry) => acc + entry.amount, 0);

        res.status(200).json({ ...updatedPlan.toObject(), entries, totalAmount });

    } else {
        const updatedPlan = await ExpensePlan.findByIdAndUpdate(
            plan._id,
            {
                ...(category && { category }),
                ...(amount !== undefined && { amount: Number(amount) }),
                ...(date && { date: new Date(date) }),
                ...(description !== undefined && { description }),
            },
            { new: true }
        );

        await ExpenseEntry.findOneAndUpdate(
            { plan: plan._id },
            {
                amount: Number(amount ?? plan.amount),
                date: date ? new Date(date) : plan.date,
                isActive: true,
            }
        );

        const entries = await ExpenseEntry.find({ plan: plan._id, isActive: true });
        res.status(200).json({ ...updatedPlan.toObject(), entries, totalAmount: entries[0].amount });
    }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/expenses/:id
   Soft deletes or prunes expenses based on date.
───────────────────────────────────────────────────────────── */
const deleteExpense = asyncHandler(async (req, res) => {
    const plan = await ExpensePlan.findById(req.params.id);
    if (!plan) { res.status(404); throw new Error('Expense not found'); }
    if (!req.user) { res.status(401); throw new Error('Not authenticated'); }
    if (plan.user.toString() !== req.user.id) { res.status(401); throw new Error('Not authorized'); }

    if (plan.expenseMode === 'recurring') {
        const fromDate = req.body?.fromDate;
        if (!fromDate) { res.status(400); throw new Error('fromDate is required for recurring deletes'); }

        const cutoff = startOfMonth(new Date(fromDate));

        await ExpenseEntry.updateMany(
            { plan: plan._id, date: { $gte: cutoff }, isActive: true },
            { $set: { isActive: false } }
        );

        const remaining = await ExpenseEntry.countDocuments({ plan: plan._id, isActive: true });
        if (remaining === 0) {
            await ExpensePlan.findByIdAndUpdate(plan._id, { isActive: false });
        }

        res.status(200).json({ id: req.params.id, message: 'Expense stopped from ' + fromDate });
    } else {
        await plan.deleteOne();
        await ExpenseEntry.deleteMany({ plan: plan._id });
        res.status(200).json({ id: req.params.id, message: 'Expense deleted' });
    }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/expenses/:id/stop
   Stops a recurring expense.
───────────────────────────────────────────────────────────── */
const stopExpense = asyncHandler(async (req, res) => {
    const plan = await ExpensePlan.findById(req.params.id);
    if (!plan) { res.status(404); throw new Error('Expense not found'); }
    if (!req.user) { res.status(401); throw new Error('Not authenticated'); }
    if (plan.user.toString() !== req.user.id) { res.status(401); throw new Error('Not authorized'); }

    const { stopDate } = req.body;
    if (!stopDate) {
        res.status(400);
        throw new Error('Please provide stopDate');
    }

    const updatedPlan = await ExpensePlan.findByIdAndUpdate(
        plan._id,
        {
            status: 'closed',
            stopDate: new Date(stopDate),
        },
        { new: true }
    );

    if (plan.expenseMode === 'recurring') {
        const cutoff = new Date(stopDate);
        await ExpenseEntry.deleteMany({
            plan: plan._id,
            date: { $gt: cutoff }
        });
    }

    const entries = await ExpenseEntry.find({ plan: plan._id, isActive: true }).sort({ date: 1 });
    const totalAmount = entries.reduce((acc, entry) => acc + entry.amount, 0);

    res.status(200).json({ ...updatedPlan.toObject(), entries, totalAmount });
});

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    stopExpense
};
