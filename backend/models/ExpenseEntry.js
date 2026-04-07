const mongoose = require('mongoose');

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
            default: true,
        },
    },
    { timestamps: true }
);

expenseEntrySchema.index({ plan: 1, date: 1 });
expenseEntrySchema.index({ user: 1, date: 1 });
expenseEntrySchema.index({ plan: 1, isActive: 1, date: -1 });

module.exports = mongoose.model('ExpenseEntry', expenseEntrySchema);
