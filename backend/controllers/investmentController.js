const asyncHandler = require('express-async-handler');
const InvestmentPlan = require('../models/InvestmentPlan');
const InvestmentEntry = require('../models/InvestmentEntry');

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

/** Return the first day of a month given any date */
const startOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

/** Return an array of month-start dates from startDate up to (and including) today */
const monthsBetween = (startDate, endDate) => {
    const months = [];
    const start = startOfMonth(startDate);
    const end = startOfMonth(endDate);
    const cursor = new Date(start);
    while (cursor <= end) {
        months.push(new Date(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
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

/** Compute summary fields for a plan given its active entries */
const computePlanSummary = (plan, entries) => {
    let totalInvested = 0;
    let currentValue = 0;

    // Calculate total invested from active entries
    for (const entry of entries) {
        if (!entry.isActive) continue;
        totalInvested += entry.amount;

        // Only compute compound diff if plan is ACTIVE
        if (plan.status === 'active') {
            const now = new Date();
            const nowMonthStart = startOfMonth(now);
            const entryMonth = startOfMonth(entry.date);
            const diffMs = nowMonthStart - entryMonth;
            const ageMonths = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44)));
            currentValue += compoundValue(entry.amount, plan.expectedReturnRate, ageMonths);
        }
    }

    // If closed, use the stored realized value
    if (plan.status === 'closed' && plan.realizedValue !== undefined) {
        currentValue = plan.realizedValue;
    }

    // If active plan but no entries (newly created), currentValue is 0 or just totalInvested?
    // compoundValue returns principal if rate is 0 or age is 0.
    // If we rely on loop, currentValue is correct for active plans (sum of compounded entries).

    const gain = currentValue - totalInvested;
    return { totalInvested, currentValue: Math.round(currentValue), gain: Math.round(gain) };
};

/* ─────────────────────────────────────────────────────────────
   GET /api/investments
   Returns all active plans for the user with computed totals.
───────────────────────────────────────────────────────────── */
const getInvestments = asyncHandler(async (req, res) => {
    const plans = await InvestmentPlan.find({ user: req.user.id, isActive: true });

    const results = await Promise.all(plans.map(async (plan) => {
        const entries = await InvestmentEntry.find({ plan: plan._id, isActive: true }).sort({ date: 1 });
        const summary = computePlanSummary(plan, entries);
        return {
            ...plan.toObject(),
            ...summary,
            entries,
        };
    }));

    res.status(200).json(results);
});

/* ─────────────────────────────────────────────────────────────
   GET /api/investments/summary
   Returns aggregate totals across all plans (for the dashboard).
───────────────────────────────────────────────────────────── */
const getInvestmentSummary = asyncHandler(async (req, res) => {
    const plans = await InvestmentPlan.find({ user: req.user.id, isActive: true });

    let totalInvested = 0;
    let currentValue = 0;

    await Promise.all(plans.map(async (plan) => {
        const entries = await InvestmentEntry.find({ plan: plan._id, isActive: true });
        const summary = computePlanSummary(plan, entries);
        totalInvested += summary.totalInvested;
        currentValue += summary.currentValue;
    }));

    res.status(200).json({
        totalInvested: Math.round(totalInvested),
        currentValue: Math.round(currentValue),
        gain: Math.round(currentValue - totalInvested),
        planCount: plans.length,
    });
});

/* ─────────────────────────────────────────────────────────────
   POST /api/investments
   Creates a new plan and backfills entries.
───────────────────────────────────────────────────────────── */
const createInvestment = asyncHandler(async (req, res) => {
    const { investmentMode, assetName, type, monthlyAmount, startDate,
        amount, date, expectedReturnRate, description } = req.body;

    if (!investmentMode || !assetName || !type) {
        res.status(400);
        throw new Error('Please provide investmentMode, assetName, and type');
    }

    if (investmentMode === 'recurring') {
        if (!monthlyAmount || !startDate) {
            res.status(400);
            throw new Error('Recurring investments require monthlyAmount and startDate');
        }

        const plan = await InvestmentPlan.create({
            user: req.user.id,
            investmentMode: 'recurring',
            assetName,
            type,
            monthlyAmount: Number(monthlyAmount),
            startDate: new Date(startDate),
            expectedReturnRate: expectedReturnRate ? Number(expectedReturnRate) : 0,
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

        await InvestmentEntry.insertMany(entries);

        const allEntries = await InvestmentEntry.find({ plan: plan._id, isActive: true }).sort({ date: 1 });
        const summary = computePlanSummary(plan, allEntries);

        res.status(201).json({ ...plan.toObject(), ...summary, entries: allEntries });

    } else if (investmentMode === 'one-time') {
        if (!amount || !date) {
            res.status(400);
            throw new Error('One-time investments require amount and date');
        }

        const plan = await InvestmentPlan.create({
            user: req.user.id,
            investmentMode: 'one-time',
            assetName,
            type,
            amount: Number(amount),
            date: new Date(date),
            expectedReturnRate: expectedReturnRate ? Number(expectedReturnRate) : 0,
            description,
        });

        const entry = await InvestmentEntry.create({
            plan: plan._id,
            user: req.user.id,
            amount: Number(amount),
            date: new Date(date),
            isActive: true,
        });

        const summary = computePlanSummary(plan, [entry]);
        res.status(201).json({ ...plan.toObject(), ...summary, entries: [entry] });

    } else {
        res.status(400);
        throw new Error('investmentMode must be "recurring" or "one-time"');
    }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/investments/:id
   For recurring: update from fromDate forward, preserve history.
   For one-time: replace the entry wholesale.
   Body: { fromDate (YYYY-MM), ...updatedFields }
───────────────────────────────────────────────────────────── */
const updateInvestment = asyncHandler(async (req, res) => {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) { res.status(404); throw new Error('Investment not found'); }
    if (!req.user) { res.status(401); throw new Error('Not authenticated'); }
    if (plan.user.toString() !== req.user.id) { res.status(401); throw new Error('Not authorized'); }

    const { fromDate, monthlyAmount, amount, assetName, type,
        expectedReturnRate, description, date } = req.body;

    if (plan.investmentMode === 'recurring') {
        if (!fromDate) { res.status(400); throw new Error('fromDate is required for recurring edits'); }

        const cutoff = startOfMonth(new Date(fromDate));

        // Deactivate all entries from cutoff forward
        await InvestmentEntry.updateMany(
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
        await InvestmentEntry.insertMany(newEntries);

        // Update plan metadata
        const updatedPlan = await InvestmentPlan.findByIdAndUpdate(
            plan._id,
            {
                monthlyAmount: newMonthlyAmount,
                ...(assetName && { assetName }),
                ...(type && { type }),
                ...(expectedReturnRate !== undefined && { expectedReturnRate: Number(expectedReturnRate) }),
                ...(description !== undefined && { description }),
            },
            { new: true }
        );

        const entries = await InvestmentEntry.find({ plan: plan._id, isActive: true }).sort({ date: 1 });
        const summary = computePlanSummary(updatedPlan, entries);
        res.status(200).json({ ...updatedPlan.toObject(), ...summary, entries });

    } else {
        // One-time: update plan and its single entry
        const updatedPlan = await InvestmentPlan.findByIdAndUpdate(
            plan._id,
            {
                ...(assetName && { assetName }),
                ...(type && { type }),
                ...(amount !== undefined && { amount: Number(amount) }),
                ...(date && { date: new Date(date) }),
                ...(expectedReturnRate !== undefined && { expectedReturnRate: Number(expectedReturnRate) }),
                ...(description !== undefined && { description }),
            },
            { new: true }
        );

        // Replace the single entry
        await InvestmentEntry.findOneAndUpdate(
            { plan: plan._id },
            {
                amount: Number(amount ?? plan.amount),
                date: date ? new Date(date) : plan.date,
                isActive: true,
            }
        );

        const entries = await InvestmentEntry.find({ plan: plan._id, isActive: true });
        const summary = computePlanSummary(updatedPlan, entries);
        res.status(200).json({ ...updatedPlan.toObject(), ...summary, entries });
    }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/investments/:id
   For recurring: deactivate entries from fromDate forward.
     If fromDate equals startDate (or no active entries remain before cutoff),
     also deactivate the plan itself.
   For one-time: fully delete plan + entry.
   Body: { fromDate (YYYY-MM) }  — required only for recurring
───────────────────────────────────────────────────────────── */
const deleteInvestment = asyncHandler(async (req, res) => {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) { res.status(404); throw new Error('Investment not found'); }
    if (!req.user) { res.status(401); throw new Error('Not authenticated'); }
    if (plan.user.toString() !== req.user.id) { res.status(401); throw new Error('Not authorized'); }

    if (plan.investmentMode === 'recurring') {
        const fromDate = req.body?.fromDate;
        if (!fromDate) { res.status(400); throw new Error('fromDate is required for recurring deletes'); }

        const cutoff = startOfMonth(new Date(fromDate));

        await InvestmentEntry.updateMany(
            { plan: plan._id, date: { $gte: cutoff }, isActive: true },
            { $set: { isActive: false } }
        );

        // If no active entries remain, mark the plan as inactive too
        const remaining = await InvestmentEntry.countDocuments({ plan: plan._id, isActive: true });
        if (remaining === 0) {
            await InvestmentPlan.findByIdAndUpdate(plan._id, { isActive: false });
        }

        res.status(200).json({ id: req.params.id, message: 'Investment stopped from ' + fromDate });

    } else {
        await plan.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Investment deleted' });
    }
});
/* ─────────────────────────────────────────────────────────────
   PUT /api/investments/:id/stop
   Stops/Sells an investment.
   Body: { stopDate, realizedValue }
───────────────────────────────────────────────────────────── */
const stopInvestment = asyncHandler(async (req, res) => {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) { res.status(404); throw new Error('Investment not found'); }
    if (!req.user) { res.status(401); throw new Error('Not authenticated'); }
    if (plan.user.toString() !== req.user.id) { res.status(401); throw new Error('Not authorized'); }

    const { stopDate, realizedValue } = req.body;
    if (!stopDate || realizedValue === undefined) {
        res.status(400);
        throw new Error('Please provide stopDate and realizedValue');
    }

    // Close the plan
    const updatedPlan = await InvestmentPlan.findByIdAndUpdate(
        plan._id,
        {
            status: 'closed',
            stopDate: new Date(stopDate),
            realizedValue: Number(realizedValue)
        },
        { new: true }
    );

    // Prune future entries if recurring (entries after stop date)
    if (plan.investmentMode === 'recurring') {
        const cutoff = new Date(stopDate);
        // We delete entries strictly AFTER the stop date's month?
        // Usually if I stop on Feb 15, I keep Feb 1? Yes.
        // Any entry with date > stopDate is future.
        await InvestmentEntry.deleteMany({
            plan: plan._id,
            date: { $gt: cutoff }
        });
    }

    const entries = await InvestmentEntry.find({ plan: plan._id, isActive: true }).sort({ date: 1 });
    const summary = computePlanSummary(updatedPlan, entries);

    res.status(200).json({ ...updatedPlan.toObject(), ...summary, entries });
});


module.exports = {
    getInvestments,
    getInvestmentSummary,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    stopInvestment,
};
