const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Expense = require('./models/Expense');
const InvestmentPlan = require('./models/InvestmentPlan');
const InvestmentEntry = require('./models/InvestmentEntry');
const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();

        console.log('🌱 Starting seeder...');

        // 1. Create Demo User
        const email = 'demo@example.com';
        const passwordRaw = 'password123';

        // Cleanup existing demo data
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('🗑️  Cleaning up existing demo user match...');
            await Expense.deleteMany({ user: existingUser._id });
            await InvestmentPlan.deleteMany({ user: existingUser._id });
            await InvestmentEntry.deleteMany({ user: existingUser._id });
            await User.deleteOne({ _id: existingUser._id });
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(passwordRaw, salt);

        const user = await User.create({
            name: 'Demo User',
            email,
            password
        });
        console.log(`✅ User created: ${email} / ${passwordRaw}`);

        const userId = user._id;

        // 2. Create Expenses
        const expenses = [
            { description: 'Rent', amount: 15000, category: 'Housing', date: new Date('2024-02-01') },
            { description: 'Grocery Shopping', amount: 3500, category: 'Food', date: new Date('2024-02-05') },
            { description: 'Netflix Subscription', amount: 649, category: 'Entertainment', date: new Date('2024-02-10') },
            { description: 'Uber Rides', amount: 1200, category: 'Transportation', date: new Date('2024-02-15') },
            { description: 'Gym Membership', amount: 2000, category: 'Health', date: new Date('2024-02-18') },
            { description: 'Dining Out', amount: 2500, category: 'Food', date: new Date('2024-01-28') }, // last month
        ];

        await Expense.insertMany(expenses.map(e => ({ ...e, user: userId })));
        console.log(`✅ Added ${expenses.length} expenses`);

        // 3. Create Investments

        // A. Recurring SIP (Active)
        const sipPlan = await InvestmentPlan.create({
            user: userId,
            investmentMode: 'recurring',
            assetName: 'Nifty 50 Index Fund',
            type: 'Mutual Fund',
            monthlyAmount: 5000,
            startDate: new Date('2023-09-01'), // 6 months ago
            expectedReturnRate: 12,
            isActive: true
        });

        // Backfill 6 entries
        const sipEntries = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date('2023-09-01');
            date.setMonth(date.getMonth() + i);
            sipEntries.push({
                plan: sipPlan._id,
                user: userId,
                amount: 5000,
                date: date,
                isActive: true
            });
        }
        await InvestmentEntry.insertMany(sipEntries);
        console.log('✅ Added Recurring SIP (Nifty 50)');

        // B. One-Time Investment (Active)
        const oneTimePlan = await InvestmentPlan.create({
            user: userId,
            investmentMode: 'one-time',
            assetName: 'Bitcoin',
            type: 'Crypto',
            amount: 50000,
            date: new Date('2023-12-15'),
            expectedReturnRate: 45, // volatile!
            isActive: true
        });

        await InvestmentEntry.create({
            plan: oneTimePlan._id,
            user: userId,
            amount: 50000,
            date: new Date('2023-12-15'),
            isActive: true
        });
        console.log('✅ Added One-Time Investment (Bitcoin)');

        // C. Stopped Investment (Realized Gain Test)
        const stoppedPlan = await InvestmentPlan.create({
            user: userId,
            investmentMode: 'one-time',
            assetName: 'Adani Green Energy',
            type: 'Stock',
            amount: 25000,
            date: new Date('2023-01-10'),
            expectedReturnRate: 15,
            isActive: false // Stopped/Sold
        });

        await InvestmentEntry.create({
            plan: stoppedPlan._id,
            user: userId,
            amount: 25000,
            date: new Date('2023-01-10'),
            isActive: false // Entries also technically inactive if stopped via deletion logic
        });
        console.log('✅ Added Stopped Investment (Adani Green)');

        console.log('🎉 Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeder Error:', error);
        process.exit(1);
    }
};

seedData();
