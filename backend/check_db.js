require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ExpensePlan = require('./models/ExpensePlan');
const ExpenseEntry = require('./models/ExpenseEntry');
const connectDB = require('./config/db');

const checkDb = async () => {
    try {
        await connectDB();
        const users = await User.find();
        for (const user of users) {
            const plans = await ExpensePlan.find({ user: user._id });
            const entries = await ExpenseEntry.find({ user: user._id });
            console.log(`User: ${user.email} -> ${plans.length} Expense Plans, ${entries.length} Expense Entries`);
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkDb();
