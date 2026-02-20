require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const InvestmentPlan = require('./models/InvestmentPlan');
const InvestmentEntry = require('./models/InvestmentEntry');
const ExpensePlan = require('./models/ExpensePlan');
const ExpenseEntry = require('./models/ExpenseEntry');
const connectDB = require('./config/db');
const { startOfMonth, monthsBetween } = require('./utils/calc');

// Helper to add months to a date
const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

const seedData = async () => {
    try {
        await connectDB();

        // Ensure completely clean slate
        await User.deleteMany();
        await InvestmentPlan.deleteMany();
        await InvestmentEntry.deleteMany();
        await ExpensePlan.deleteMany();
        await ExpenseEntry.deleteMany();
        console.log('Database CLEARED for new seed.');

        // Current Date references
        const today = new Date();
        const twelveMonthsAgo = addMonths(today, -11);
        const sixMonthsAgo = addMonths(today, -5);

        // ==========================================
        // CREATE USERS
        // ==========================================
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const alice = await User.create({
            name: 'Alice (Disciplined)',
            email: 'alice@example.com',
            password: hashedPassword,
        });

        const bob = await User.create({
            name: 'Bob (Irregular)',
            email: 'bob@example.com',
            password: hashedPassword,
        });

        console.log('Users created: alice@example.com (Disciplined), bob@example.com (Irregular)');


        // ==========================================
        // HELPER FUNCTIONS FOR SEEDING RECURRING
        // ==========================================

        const createRecurringExpense = async (user, category, monthlyAmount, startDate, description) => {
            const plan = await ExpensePlan.create({ user: user._id, expenseMode: 'recurring', category, monthlyAmount, startDate, description });
            const months = monthsBetween(startDate, today);
            const entries = months.map(date => ({ plan: plan._id, user: user._id, amount: monthlyAmount, date, isActive: true }));
            await ExpenseEntry.insertMany(entries);
        };

        const createOneTimeExpense = async (user, category, amount, date, description) => {
            const plan = await ExpensePlan.create({ user: user._id, expenseMode: 'one-time', category, amount, date, description });
            await ExpenseEntry.create({ plan: plan._id, user: user._id, amount, date, isActive: true });
        };

        const createRecurringInvestment = async (user, assetName, type, monthlyAmount, startDate, expectedReturnRate) => {
            const plan = await InvestmentPlan.create({ user: user._id, investmentMode: 'recurring', assetName, type, monthlyAmount, startDate, expectedReturnRate });
            const months = monthsBetween(startDate, today);
            const entries = months.map(date => ({ plan: plan._id, user: user._id, amount: monthlyAmount, date, isActive: true }));
            await InvestmentEntry.insertMany(entries);
        };

        const createOneTimeInvestment = async (user, assetName, type, amount, date, expectedReturnRate, status = 'active', stopDate = null, realizedValue = null) => {
            const plan = await InvestmentPlan.create({ user: user._id, investmentMode: 'one-time', assetName, type, amount, date, expectedReturnRate, status, stopDate });
            // If realized value is passed, use update to force it beyond schema default schema bounds if missing
            if (status === 'closed' && realizedValue) await InvestmentPlan.findByIdAndUpdate(plan._id, { realizedValue });
            await InvestmentEntry.create({ plan: plan._id, user: user._id, amount, date, isActive: true });
        };


        // ==========================================
        // ALICE - DISCIPLINED (12 months data)
        // High, consistent investments. Controlled, predictable expenses.
        // ==========================================

        // Recurring Expenses
        await createRecurringExpense(alice, 'Rent', 25000, twelveMonthsAgo, 'Monthly Appartment Rent');
        await createRecurringExpense(alice, 'Utilities', 3000, twelveMonthsAgo, 'Electricity/Water');
        await createRecurringExpense(alice, 'Groceries', 8000, twelveMonthsAgo, 'Monthly Grocery Budget');
        await createRecurringExpense(alice, 'Gym', 1500, twelveMonthsAgo, 'Fitness Club');

        // One-time Expenses (Occasional)
        await createOneTimeExpense(alice, 'Travel', 12000, addMonths(today, -8), 'Weekend trip');
        await createOneTimeExpense(alice, 'Healthcare', 2500, addMonths(today, -3), 'Dentist visit');
        await createOneTimeExpense(alice, 'Car Service', 6500, addMonths(today, -5), 'Routine checkups');

        // Recurring Investments
        await createRecurringInvestment(alice, 'Nifty 50 Index', 'Mutual Fund', 15000, twelveMonthsAgo, 12);
        await createRecurringInvestment(alice, 'Flexi Cap Fund', 'Mutual Fund', 10000, twelveMonthsAgo, 14);
        await createRecurringInvestment(alice, 'PPF', 'Fixed Deposit', 5000, twelveMonthsAgo, 7.1);

        // One-time Investments
        await createOneTimeInvestment(alice, 'Reliance Shares', 'Stock', 50000, addMonths(today, -10), 10);
        await createOneTimeInvestment(alice, 'Gold Coins', 'Gold', 45000, addMonths(today, -6), 5, 'closed', addMonths(today, -1), 48500); // Sold recently for a profit


        // ==========================================
        // BOB - IRREGULAR (6 months data)
        // High variable expenses. Sporadic investing. Crypto volatility.
        // ==========================================

        // Recurring Expenses
        await createRecurringExpense(bob, 'Rent', 35000, sixMonthsAgo, 'Luxury Apartment Rent');
        await createRecurringExpense(bob, 'Car EMI', 18000, sixMonthsAgo, 'Loan Payment');
        await createRecurringExpense(bob, 'Subscriptions', 4500, sixMonthsAgo, 'Netflix, Spotify, etc');
        await createRecurringExpense(bob, 'Personal Coach', 10000, sixMonthsAgo, 'Golf lessons');

        // One-time Expenses (Frequent & High)
        await createOneTimeExpense(bob, 'Shopping', 22000, addMonths(today, -5), 'New Wardrobe');
        await createOneTimeExpense(bob, 'Electronics', 65000, addMonths(today, -4), 'New Laptop');
        await createOneTimeExpense(bob, 'Dining Out', 8000, addMonths(today, -2), 'Fine Dining');
        await createOneTimeExpense(bob, 'Travel', 45000, addMonths(today, -1), 'Vacation');
        await createOneTimeExpense(bob, 'Concert Tickets', 15000, addMonths(today, -3), 'VIP Tickets');

        // Recurring Investments
        await createRecurringInvestment(bob, 'Tax Saver ELSS', 'Mutual Fund', 2000, sixMonthsAgo, 10); // Very low SIP

        // One-time Investments
        await createOneTimeInvestment(bob, 'Bitcoin', 'Crypto', 100000, addMonths(today, -5), -20); // Held at a loss right now
        await createOneTimeInvestment(bob, 'Dogecoin', 'Crypto', 50000, addMonths(today, -4), -40, 'closed', addMonths(today, -2), 30000); // Realized a massive loss


        console.log('Seed data perfectly aligned and populated!');
        process.exit();

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
