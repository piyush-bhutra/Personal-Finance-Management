const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load models
const User = require('../models/User');
const ExpensePlan = require('../models/ExpensePlan');
const ExpenseEntry = require('../models/ExpenseEntry');
const InvestmentPlan = require('../models/InvestmentPlan');
const InvestmentEntry = require('../models/InvestmentEntry');
const Budget = require('../models/Budget');

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected.');

        // 1. Find User
        const userEmail = 'piyushbhutra1@gmail.com';
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.error(`User with email ${userEmail} not found. Please register this user first.`);
            process.exit(1);
        }

        const userId = user._id;
        console.log(`Found user: ${user.name} (${userId})`);

        // 2. Clear Existing Data
        console.log('Clearing existing data for user...');
        const deleteResult = await Promise.all([
            ExpensePlan.deleteMany({ user: userId }),
            ExpenseEntry.deleteMany({ user: userId }),
            InvestmentPlan.deleteMany({ user: userId }),
            InvestmentEntry.deleteMany({ user: userId }),
            Budget.deleteMany({ user: userId })
        ]);

        console.log(`Deleted:
- ExpensePlans: ${deleteResult[0].deletedCount}
- ExpenseEntries: ${deleteResult[1].deletedCount}
- InvestmentPlans: ${deleteResult[2].deletedCount}
- InvestmentEntries: ${deleteResult[3].deletedCount}
- Budgets: ${deleteResult[4].deletedCount}
`);

        // Helper to generate dates for a specific month
        const getDatesForMonth = (year, monthIndex) => {
            const date = new Date(year, monthIndex, 1);
            return date;
        };

        let expensePlansCreated = 0;
        let expenseEntriesCreated = 0;
        let investmentPlansCreated = 0;
        let investmentEntriesCreated = 0;
        let budgetsCreated = 0;

        // --- 3. SEED EXPENSES ---
        console.log('Seeding Expenses...');

        // Recurring Expenses
        const recurringExpensesData = [
            { category: 'Rent', amount: 15000, startYear: 2025, startMonth: 9 }, // Oct (0-indexed)
            { category: 'Groceries', amount: 6500, startYear: 2025, startMonth: 9 }, // Oct
            { category: 'Entertainment', desc: 'Netflix', amount: 649, startYear: 2025, startMonth: 10 }, // Nov
            { category: 'Entertainment', desc: 'Spotify', amount: 179, startYear: 2025, startMonth: 10 }, // Nov
            { category: 'Utilities', desc: 'Internet', amount: 999, startYear: 2025, startMonth: 9 }, // Oct
            { category: 'Health & Fitness', desc: 'Gym membership', amount: 1200, startYear: 2026, startMonth: 0 }, // Jan
        ];

        for (const data of recurringExpensesData) {
            const startDate = getDatesForMonth(data.startYear, data.startMonth);

            const plan = await ExpensePlan.create({
                user: userId,
                expenseMode: 'recurring',
                category: data.category,
                description: data.desc || data.category,
                monthlyAmount: data.amount,
                startDate: startDate,
                isActive: true,
                status: 'active'
            });
            expensePlansCreated++;

            // Create entries from start month up to Apr 2026 (month index 3)
            let currYear = data.startYear;
            let currMonth = data.startMonth;

            while (currYear < 2026 || (currYear === 2026 && currMonth <= 3)) {
                await ExpenseEntry.create({
                    plan: plan._id,
                    user: userId,
                    amount: data.amount,
                    date: getDatesForMonth(currYear, currMonth),
                    isActive: true
                });
                expenseEntriesCreated++;

                currMonth++;
                if (currMonth > 11) {
                    currMonth = 0;
                    currYear++;
                }
            }
        }

        // One-time Expenses
        const oneTimeExpensesData = [
            { category: 'Shopping', desc: 'Laptop repair', amount: 4500, year: 2025, month: 11, day: 15 }, // Dec
            { category: 'Transport', desc: 'Flight ticket', amount: 8200, year: 2026, month: 0, day: 10 }, // Jan
            { category: 'Food & Dining', desc: 'Birthday dinner', amount: 3100, year: 2026, month: 1, day: 20 }, // Feb
            { category: 'Shopping', desc: 'New keyboard', amount: 2800, year: 2026, month: 2, day: 5 }, // Mar
        ];

        for (const data of oneTimeExpensesData) {
            const date = new Date(data.year, data.month, data.day);

            const plan = await ExpensePlan.create({
                user: userId,
                expenseMode: 'one-time',
                category: data.category,
                description: data.desc,
                amount: data.amount,
                date: date,
                isActive: true,
                status: 'active' // One-time expenses have 'active' status but no further entries
            });
            expensePlansCreated++;

            await ExpenseEntry.create({
                plan: plan._id,
                user: userId,
                amount: data.amount,
                date: date,
                isActive: true
            });
            expenseEntriesCreated++;
        }

        // --- 4. SEED INVESTMENTS ---
        console.log('Seeding Investments...');

        // Recurring SIP Investments
        const recurringInvestmentsData = [
            { assetName: 'Nifty 50 Index Fund', type: 'Mutual Fund', amount: 5000, expectedReturnRate: 12, startYear: 2025, startMonth: 9 }, // Oct
            { assetName: 'Mid Cap Fund', type: 'Mutual Fund', amount: 3000, expectedReturnRate: 15, startYear: 2025, startMonth: 10 }, // Nov
            { assetName: 'ELSS Tax Saver', type: 'Mutual Fund', amount: 2000, expectedReturnRate: 14, startYear: 2025, startMonth: 9 }, // Oct
        ];

        for (const data of recurringInvestmentsData) {
            const startDate = getDatesForMonth(data.startYear, data.startMonth);

            const plan = await InvestmentPlan.create({
                user: userId,
                investmentMode: 'recurring',
                type: data.type,
                assetName: data.assetName,
                monthlyAmount: data.amount,
                expectedReturnRate: data.expectedReturnRate,
                startDate: startDate,
                isActive: true,
                status: 'active'
            });
            investmentPlansCreated++;

            // Create entries from start month up to Apr 2026 (month index 3)
            let currYear = data.startYear;
            let currMonth = data.startMonth;

            while (currYear < 2026 || (currYear === 2026 && currMonth <= 3)) {
                await InvestmentEntry.create({
                    plan: plan._id,
                    user: userId,
                    amount: data.amount,
                    date: getDatesForMonth(currYear, currMonth),
                    isActive: true
                });
                investmentEntriesCreated++;

                currMonth++;
                if (currMonth > 11) {
                    currMonth = 0;
                    currYear++;
                }
            }
        }

        // One-time Investments
        const oneTimeInvestmentsData = [
            // Closed Investment
            { assetName: 'Tata Motors', type: 'Stock', amount: 25000, expectedReturnRate: 18, year: 2025, month: 11, day: 5, closed: true, closeYear: 2026, closeMonth: 1, closeDay: 28, realizedValue: 31500 }, // Bought Dec 2025, Sold Feb 2026
            // Active Investments
            { assetName: 'Fixed Deposit', type: 'Fixed Deposit', amount: 50000, expectedReturnRate: 7, year: 2025, month: 9, day: 10, closed: false }, // Oct 2025
            { assetName: 'Infosys', type: 'Stock', amount: 18000, expectedReturnRate: 15, year: 2026, month: 0, day: 15, closed: false }, // Jan 2026
        ];

        for (const data of oneTimeInvestmentsData) {
            const date = new Date(data.year, data.month, data.day);
            const stopDate = data.closed ? new Date(data.closeYear, data.closeMonth, data.closeDay) : null;

            const plan = await InvestmentPlan.create({
                user: userId,
                investmentMode: 'one-time',
                type: data.type,
                assetName: data.assetName,
                amount: data.amount,
                expectedReturnRate: data.expectedReturnRate,
                date: date,
                isActive: !data.closed, // Closed items have isActive: false
                status: data.closed ? 'closed' : 'active',
                stopDate: stopDate,
                realizedValue: data.closed ? data.realizedValue : undefined
            });
            investmentPlansCreated++;

            await InvestmentEntry.create({
                plan: plan._id,
                user: userId,
                amount: data.amount,
                date: date,
                isActive: true
            });
            investmentEntriesCreated++;
        }

        // --- 5. SEED BUDGETS ---
        console.log('Seeding Budgets...');

        const budgetCategories = [
            { category: 'Rent', limit: 15000 },
            { category: 'Groceries', limit: 7000 },
            { category: 'Entertainment', limit: 1500 },
            { category: 'Transport', limit: 3000 },
            { category: 'Food & Dining', limit: 4000 },
            { category: 'Utilities', limit: 1500 },
            { category: 'Health & Fitness', limit: 1500 },
            { category: 'Shopping', limit: 5000 },
        ];

        const budgetMonths = [
            new Date(2026, 1, 1), // Feb 2026
            new Date(2026, 2, 1), // Mar 2026
            new Date(2026, 3, 1), // Apr 2026
        ];

        for (const monthDate of budgetMonths) {
            for (const item of budgetCategories) {
                await Budget.create({
                    user: userId,
                    month: monthDate,
                    category: item.category,
                    limit: item.limit
                });
                budgetsCreated++;
            }
        }

        console.log('\n--- SEEDING COMPLETE ---');
        console.log(`Expense Plans:        ${expensePlansCreated}`);
        console.log(`Expense Entries:      ${expenseEntriesCreated}`);
        console.log(`Investment Plans:     ${investmentPlansCreated}`);
        console.log(`Investment Entries:   ${investmentEntriesCreated}`);
        console.log(`Budgets:              ${budgetsCreated}`);
        console.log('------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
