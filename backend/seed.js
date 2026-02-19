const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Investment = require('./models/Investment');
const connectDB = require('./config/db');

connectDB();

const seedData = async () => {
    try {
        await User.deleteMany();
        await Expense.deleteMany();
        await Investment.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const user = await User.create({
            name: 'Trial User',
            email: 'trial@example.com',
            password: hashedPassword,
        });

        console.log('User created:', user.email);

        const expenses = [
            {
                user: user._id,
                category: 'Food',
                amount: 500,
                date: new Date(),
                description: 'Lunch',
            },
            {
                user: user._id,
                category: 'Transport',
                amount: 200,
                date: new Date(),
                description: 'Taxi',
            },
            {
                user: user._id,
                category: 'Utilities',
                amount: 1500,
                date: new Date(),
                description: 'Electricity Bill',
            },
        ];

        await Expense.insertMany(expenses);
        console.log('Expenses created');

        const investments = [
            {
                user: user._id,
                type: 'Stock',
                assetName: 'Apple Inc',
                amount: 10000,
                startDate: new Date(),
                description: 'Long term hold',
            },
            {
                user: user._id,
                type: 'Crypto',
                assetName: 'Bitcoin',
                amount: 50000,
                startDate: new Date(),
                description: 'HODL',
            },
        ];

        await Investment.insertMany(investments);
        console.log('Investments created');

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
