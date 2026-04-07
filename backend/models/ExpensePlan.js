const mongoose = require('mongoose');

const expensePlanSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
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
        lastBackfilledAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ExpensePlan', expensePlanSchema);
