const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        age: {
            type: Number,
            required: false,
            min: 0,
        },
        dateOfBirth: {
            type: Date,
            required: false,
        },
        occupation: {
            type: String,
            required: false,
            trim: true,
        },
        investmentExperience: {
            type: String,
            required: false,
            enum: ['beginner', 'intermediate', 'advanced'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
