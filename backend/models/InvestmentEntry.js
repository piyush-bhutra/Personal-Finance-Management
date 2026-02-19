const mongoose = require('mongoose');

/**
 * InvestmentEntry — a single period's investment record.
 * Recurring: one entry per month (date = start of that month).
 * One-time: one entry with the exact investment date.
 */
const investmentEntrySchema = mongoose.Schema(
    {
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'InvestmentPlan',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: true,
        },
        // For recurring: normalised to the 1st of the month.
        // For one-time: the exact date provided by the user.
        date: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true, // false = deleted / stopped from this month onwards
        },
    },
    { timestamps: true }
);

// Compound index to efficiently query entries for a plan in date order
investmentEntrySchema.index({ plan: 1, date: 1 });
investmentEntrySchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('InvestmentEntry', investmentEntrySchema);
