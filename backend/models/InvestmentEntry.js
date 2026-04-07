const mongoose = require('mongoose');

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

investmentEntrySchema.index({ plan: 1, date: 1 });
investmentEntrySchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('InvestmentEntry', investmentEntrySchema);
