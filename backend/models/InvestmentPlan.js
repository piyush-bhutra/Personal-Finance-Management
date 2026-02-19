const mongoose = require('mongoose');

/**
 * InvestmentPlan — the template / definition of an investment.
 * For recurring investments, InvestmentEntry records are the actual ledger.
 * For one-time investments, a single InvestmentEntry is created.
 */
const investmentPlanSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
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
        // For recurring investments
        monthlyAmount: {
            type: Number,
        },
        startDate: {
            type: Date, // The first month this investment began
        },
        // For one-time investments
        amount: {
            type: Number,
        },
        date: {
            type: Date,
        },
        // Shared
        expectedReturnRate: {
            type: Number,
            default: 0, // Annual % e.g. 12 means 12% p.a.
        },
        description: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true, // false means soft-deleted (trash)
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
