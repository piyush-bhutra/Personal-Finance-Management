const mongoose = require('mongoose');

/**
 * ExpensePlan — the template / definition of an expense.
 * For recurring expenses, ExpenseEntry records are the actual ledger.
 * For one-time expenses, a single ExpenseEntry is created.
 */
const expensePlanSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        expenseMode: {
            type: String,
            required: true,
            enum: ['recurring', 'one-time'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        // For recurring expenses
        monthlyAmount: {
            type: Number,
        },
        startDate: {
            type: Date, // The first month this expense began
        },
        // For one-time expenses
        amount: {
            type: Number,
        },
        date: {
            type: Date,
        },
        // Shared
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
    },
    { timestamps: true }
);

module.exports = mongoose.model('ExpensePlan', expensePlanSchema);
