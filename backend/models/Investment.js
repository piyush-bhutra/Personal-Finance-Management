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
            enum: ['Lump Sum', 'SIP'],
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
        expectedReturnRate: {
            type: Number,
            required: [true, 'Please add expected annual return rate (%)'],
        },
        duration: {
            type: Number,
            required: [true, 'Please add duration'],
        },
        durationUnit: {
            type: String,
            required: [true, 'Please select duration unit'],
            enum: ['Years', 'Months'],
        },
        sipFrequency: {
            type: String,
            enum: ['Monthly', 'Quarterly', 'Yearly'],
            required: function () {
                return this.type === 'SIP';
            },
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
