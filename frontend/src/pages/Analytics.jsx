import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import expenseService from '../features/expenses/expenseService';
import investmentService from '../features/investments/investmentService';

const COLORS = ['#8A2BE2', '#00C49F', '#FFBB28', '#FF8042', '#FF4560', '#00E396', '#775DD0', '#FEB019'];

// Helper to format currency
const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);

const AnalyticsPage = ({ isEmbedded = false, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [investments, setInvestments] = useState([]);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                setLoading(true);
                const [expenseData, investmentData] = await Promise.all([
                    expenseService.getExpenses(),
                    investmentService.getInvestments(),
                ]);
                setExpenses(expenseData || []);
                setInvestments(investmentData || []);
            } catch (err) {
                console.error('Failed to load analytics data', err);
                setError('Failed to load analytics data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, []);

    // 1. Expense Trends Over Time (Monthly aggregation)
    const expenseTrends = useMemo(() => {
        const trends = {};
        expenses.forEach((expense) => {
            const date = new Date(expense.date);
            // Format as YYYY-MM
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            trends[monthYear] = (trends[monthYear] || 0) + Number(expense.amount);
        });

        return Object.keys(trends)
            .sort() // Chronological order
            .map((key) => ({
                month: key,
                amount: trends[key],
            }));
    }, [expenses]);

    // 2. Category-wise Expense Distribution
    const categoryDistribution = useMemo(() => {
        const distribution = {};
        expenses.forEach((expense) => {
            const cat = expense.category || 'Other';
            distribution[cat] = (distribution[cat] || 0) + Number(expense.amount);
        });

        return Object.entries(distribution)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Decending order
    }, [expenses]);

    // 3. Investment Allocation Overview (Current Value of ACTIVE investments)
    const investmentAllocation = useMemo(() => {
        const activeInvestments = investments.filter((inv) => inv.status !== 'closed');
        const allocation = {};

        activeInvestments.forEach((inv) => {
            const type = inv.type || 'Other Component';
            allocation[type] = (allocation[type] || 0) + Number(inv.currentValue || inv.totalInvested);
        });

        return Object.entries(allocation)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [investments]);

    // 4. Investment Performance Trends (Invested vs Current Value per Asset Type)
    const investmentPerformance = useMemo(() => {
        const activeInvestments = investments.filter((inv) => inv.status !== 'closed');
        const performance = {};

        activeInvestments.forEach((inv) => {
            const type = inv.type || 'Other';
            if (!performance[type]) {
                performance[type] = { type, invested: 0, currentValue: 0 };
            }
            performance[type].invested += Number(inv.totalInvested || 0);
            performance[type].currentValue += Number(inv.currentValue || inv.totalInvested || 0);
        });

        return Object.values(performance);
    }, [investments]);

    // Custom Tooltips for Charts
    const CurrencyTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-muted-foreground capitalize">{entry.name}:</span>
                            <span className="font-medium">{formatCurrency(entry.value)}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className={`flex flex-col bg-background text-foreground ${isEmbedded ? 'h-full' : 'min-h-screen'}`}>
                {!isEmbedded && <Navbar variant="auth" />}
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col bg-background text-foreground ${isEmbedded ? 'h-full' : 'min-h-screen'}`}>
                {!isEmbedded && <Navbar variant="auth" />}
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-background text-foreground pb-20 ${isEmbedded ? '' : 'min-h-screen'}`}>
            {!isEmbedded && <Navbar variant="auth" />}
            <div className={`container mx-auto px-4 max-w-7xl space-y-8 ${isEmbedded ? 'py-2' : 'py-10'}`}>
                <div className="flex items-center gap-4">
                    {isEmbedded && onBack && (
                        <button
                            onClick={onBack}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            ← Back to Dashboard
                        </button>
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics Overview</h1>
                    <p className="text-muted-foreground">
                        Visual insights and trends across your financial data.
                    </p>
                </div>

                {/* Top Row: Expense Trends */}
                <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Expense Trends</CardTitle>
                        <CardDescription>Monthly spending trajectory over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {expenseTrends.length > 0 ? (
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={expenseTrends} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8A2BE2" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8A2BE2" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="hsl(var(--muted-foreground))"
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="hsl(var(--muted-foreground))"
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                            dx={-10}
                                        />
                                        <Tooltip content={<CurrencyTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            name="Spent"
                                            stroke="#8A2BE2"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorAmount)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                No expense data available.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Category Distribution */}
                    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Expense Distribution</CardTitle>
                            <CardDescription>Breakdown of spending by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {categoryDistribution.length > 0 ? (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={120}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {categoryDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CurrencyTooltip />} />
                                            <Legend
                                                layout="horizontal"
                                                verticalAlign="bottom"
                                                align="center"
                                                wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                    No category data available.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Investment Allocation */}
                    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Portfolio Allocation</CardTitle>
                            <CardDescription>Current value distribution across active assets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {investmentAllocation.length > 0 ? (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={investmentAllocation}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={120}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="hsl(var(--background))"
                                                strokeWidth={2}
                                            >
                                                {investmentAllocation.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[(index + 3) % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CurrencyTooltip />} />
                                            <Legend
                                                layout="horizontal"
                                                verticalAlign="bottom"
                                                align="center"
                                                wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                    No active investments found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row: Investment Performance */}
                <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Investment Performance</CardTitle>
                        <CardDescription>Invested Principle vs Current Value</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {investmentPerformance.length > 0 ? (
                            <div className="h-[400px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={investmentPerformance}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="type"
                                            stroke="hsl(var(--muted-foreground))"
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="hsl(var(--muted-foreground))"
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                            dx={-10}
                                        />
                                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar
                                            dataKey="invested"
                                            name="Total Invested"
                                            fill="hsl(var(--muted-foreground)/0.5)"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={60}
                                        />
                                        <Bar
                                            dataKey="currentValue"
                                            name="Current Value"
                                            fill="#00E396"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={60}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                No investment data available.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
