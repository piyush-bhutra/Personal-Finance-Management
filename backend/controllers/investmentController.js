const asyncHandler = require('express-async-handler');
const Investment = require('../models/Investment');

// @desc    Get investments
// @route   GET /api/investments
// @access  Private
const getInvestments = asyncHandler(async (req, res) => {
    const investments = await Investment.find({ user: req.user.id });
    res.status(200).json(investments);
});

// @desc    Create investment
// @route   POST /api/investments
// @access  Private
const createInvestment = asyncHandler(async (req, res) => {
    if (!req.body.assetName || !req.body.amount || !req.body.type) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const investment = await Investment.create({
        user: req.user.id,
        type: req.body.type,
        assetName: req.body.assetName,
        amount: req.body.amount,
        startDate: req.body.startDate,
        expectedReturnRate: req.body.expectedReturnRate,
        duration: req.body.duration,
        durationUnit: req.body.durationUnit,
        sipFrequency: req.body.sipFrequency,
        currentValue: req.body.currentValue,
    });

    res.status(200).json(investment);
});

// @desc    Update investment
// @route   PUT /api/investments/:id
// @access  Private
const updateInvestment = asyncHandler(async (req, res) => {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
        res.status(400);
        throw new Error('Investment not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the investment user
    if (investment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedInvestment = await Investment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).json(updatedInvestment);
});

// @desc    Delete investment
// @route   DELETE /api/investments/:id
// @access  Private
const deleteInvestment = asyncHandler(async (req, res) => {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
        res.status(400);
        throw new Error('Investment not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the investment user
    if (investment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await investment.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
};
