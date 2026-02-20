const mongoose = require('mongoose');

/**
 * ExpenseEntry — a single period's expense record.
 * Recurring: one entry per month (date = start of that month).
 * One-time: one entry with the exact expense date.
 */
const expenseEntrySchema = mongoose.Schema(
    {
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'ExpensePlan',
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
expenseEntrySchema.index({ plan: 1, date: 1 });
expenseEntrySchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('ExpenseEntry', expenseEntrySchema);
