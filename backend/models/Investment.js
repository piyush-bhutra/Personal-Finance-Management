const mongoose = require('mongoose');

const investmentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            required: [true, 'Please add investment type'],
            enum: ['Stock', 'Crypto', 'Real Estate', 'Bond', 'Mutual Fund', 'Fixed Deposit', 'Gold', 'Other', 'Lump Sum', 'SIP'],
        },
        assetName: {
            type: String,
            required: [true, 'Please add asset name'],
        },
        amount: {
            type: Number,
            required: [true, 'Please add amount'],
        },
        startDate: {
            type: Date,
            required: [true, 'Please add start date'],
        },
        description: {
            type: String,
            required: false,
        },
        expectedReturnRate: {
            type: Number,
            required: false,
        },
        duration: {
            type: Number,
            required: false,
        },
        durationUnit: {
            type: String,
            required: false,
            enum: ['Years', 'Months'],
        },
        sipFrequency: {
            type: String,
            enum: ['Monthly', 'Quarterly', 'Yearly'],
            required: false,
        },
        currentValue: {
            type: Number,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Investment', investmentSchema);
