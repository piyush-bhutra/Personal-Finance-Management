const asyncHandler = require('express-async-handler');
const InvestmentPlan = require('../models/InvestmentPlan');
const InvestmentEntry = require('../models/InvestmentEntry');

const { startOfMonth, monthsBetween, compoundValue } = require('../utils/calc');

const computePlanSummary = (plan, entries) => {
    let totalInvested = 0;
    let currentValue = 0;

    for (const entry of entries) {
        if (!entry.isActive) continue;
        totalInvested += entry.amount;

        if (plan.status === 'active') {
            const now = new Date();
            const nowMonthStart = startOfMonth(now);
            const entryMonth = startOfMonth(entry.date);
            const diffMs = nowMonthStart - entryMonth;
            const ageMonths = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44)));
            currentValue += compoundValue(entry.amount, plan.expectedReturnRate, ageMonths);
        }
    }

    if (plan.status === 'closed' && plan.realizedValue !== undefined) {
        currentValue = plan.realizedValue;
    }

    const gain = currentValue - totalInvested;
    return { totalInvested, currentValue: Math.round(currentValue), gain: Math.round(gain) };
};

const getInvestments = asyncHandler(async (req, res) => {
    const plans = await InvestmentPlan.find({ user: req.user.id, isActive: true });

    const planIds = plans.map(p => p._id);
    const entryQuery = {
        plan: { $in: planIds },
        isActive: true,
    };

    if (req.query.fromDate || req.query.toDate) {
        const dateFilter = {};

        if (req.query.fromDate) {
            dateFilter.$gte = new Date(req.query.fromDate);
        }

        if (req.query.toDate) {
            dateFilter.$lt = new Date(req.query.toDate);
        }

        entryQuery.date = dateFilter;
    }

    const allEntries = planIds.length > 0
        ? await InvestmentEntry.find(entryQuery).sort({ date: 1 })
        : [];

    const entriesByPlanId = {};
    for (const entry of allEntries) {
        const planId = String(entry.plan);
        if (!entriesByPlanId[planId]) {
            entriesByPlanId[planId] = [];
        }
        entriesByPlanId[planId].push(entry);
    }

    const results = plans.map((plan) => {
        const entries = entriesByPlanId[String(plan._id)] || [];
        const summary = computePlanSummary(plan, entries);
        return {
            ...plan.toObject(),
            ...summary,
            entries,
        };
    });

    res.status(200).json(results);
});

const getInvestmentSummary = asyncHandler(async (req, res) => {
    const plans = await InvestmentPlan.find({ user: req.user.id, isActive: true });

    const planIds = plans.map(p => p._id);
    const allEntries = await InvestmentEntry.find({ plan: { $in: planIds }, isActive: true });

    const entriesByPlanId = {};
    for (const entry of allEntries) {
        const planId = String(entry.plan);
        if (!entriesByPlanId[planId]) {
            entriesByPlanId[planId] = [];
        }
        entriesByPlanId[planId].push(entry);
    }

    let totalInvested = 0;
    let currentValue = 0;

    for (const plan of plans) {
        const entries = entriesByPlanId[String(plan._id)] || [];
        const summary = computePlanSummary(plan, entries);
        totalInvested += summary.totalInvested;
        currentValue += summary.currentValue;
    }

    res.status(200).json({
        totalInvested: Math.round(totalInvested),
        currentValue: Math.round(currentValue),
        gain: Math.round(currentValue - totalInvested),
        planCount: plans.length,
    });
});

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

    const updatedPlan = await InvestmentPlan.findByIdAndUpdate(
        plan._id,
        {
            status: 'closed',
            isActive: false,
            stopDate: new Date(stopDate),
            realizedValue: Number(realizedValue)
        },
        { new: true }
    );

    if (plan.investmentMode === 'recurring') {
        const cutoff = new Date(stopDate);
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
