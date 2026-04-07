const mongoose = require('mongoose');

const investmentPlanSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
        },
        investmentMode: {
            type: String,
            required: true,
            enum: ['recurring', 'one-time'],
        },
        assetName: {
            type: String,
            required: [true, 'Please add an asset name'],
        },
        type: {
            type: String,
            required: [true, 'Please add investment type'],
            enum: [
                'Stock', 'Crypto', 'Real Estate', 'Bond',
                'Mutual Fund', 'Fixed Deposit', 'Gold', 'SIP', 'Other',
            ],
        },
        monthlyAmount: {
            type: Number,
        },
        startDate: {
            type: Date,
        },
        amount: {
            type: Number,
        },
        date: {
            type: Date,
        },
        expectedReturnRate: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ['active', 'closed'],
            default: 'active',
        },
        stopDate: {
            type: Date,
        },
        realizedValue: {
            type: Number,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema);
