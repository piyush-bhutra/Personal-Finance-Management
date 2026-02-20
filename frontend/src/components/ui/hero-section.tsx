import { useEffect, useState } from "react";
import { BorderBeam } from "./border-beam";
import { TracingBeam } from "./tracing-beam";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Button } from "./button";
import { ArrowUpRight, CreditCard, IndianRupee, Plus, TrendingUp } from "lucide-react";
import expenseService from "@/features/expenses/expenseService";
import investmentService from "@/features/investments/investmentService";
import dashboardService from "@/features/dashboard/dashboardService";
import { ExpenseChart, PortfolioChart } from "./analytics-charts";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDate } from "@/lib/format";
import AnalyticsPage from "../../pages/Analytics";
import { exportToCSV } from "../../utils/exportToCSV";

export function HeroSection() {
    const navigate = useNavigate();
    const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [investments, setInvestments] = useState<any[]>([]);
    const [dashboardData, setDashboardData] = useState({
        netWorth: 0,
        totalActiveInvestments: 0,
        totalRealizedInvestments: 0,
        totalExpenses: 0,
        activePlanCount: 0
    });
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            const [expenseRes, investmentRes, summaryRes, txRes] = await Promise.allSettled([
                expenseService.getExpenses(),
                investmentService.getInvestments(),
                dashboardService.getDashboardSummary(),
                dashboardService.getRecentTransactions({ limit: 5 }),
            ]);

            let anySuccess = false;

            if (expenseRes.status === "fulfilled") {
                setExpenses(expenseRes.value || []);
                anySuccess = true;
            } else {
                console.error("Expenses fetch failed:", expenseRes.reason);
                setExpenses([]);
            }

            if (investmentRes.status === "fulfilled") {
                setInvestments(investmentRes.value || []);
                anySuccess = true;
            } else {
                console.error("Investments fetch failed:", investmentRes.reason);
                setInvestments([]);
            }

            if (summaryRes.status === "fulfilled") {
                setDashboardData(summaryRes.value || {
                    netWorth: 0,
                    totalActiveInvestments: 0,
                    totalRealizedInvestments: 0,
                    totalExpenses: 0,
                    activePlanCount: 0
                });
                anySuccess = true;
            } else {
                console.error("Dashboard summary fetch failed:", summaryRes.reason);
                setDashboardData({
                    netWorth: 0,
                    totalActiveInvestments: 0,
                    totalRealizedInvestments: 0,
                    totalExpenses: 0,
                    activePlanCount: 0
                });
            }

            if (txRes.status === "fulfilled") {
                setRecentTransactions(txRes.value || []);
                anySuccess = true;
            } else {
                console.error("Recent transactions fetch failed:", txRes.reason);
                setRecentTransactions([]);
            }

            if (!anySuccess) {
                setError("Unable to load dashboard data right now.");
            } else {
                setError("");
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = expenses
        .filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const monthlyRealizedIncome = recentTransactions
        .filter((t) => {
            const d = new Date(t.date);
            return (
                (t.mode === "sold" || t.category === "Investment Return") &&
                d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear
            );
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const monthlyNetSavings = monthlyRealizedIncome - monthlyExpenses;

    const expenseByCategory = expenses
        .filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc: Record<string, number>, e) => {
            const key = e.category || "Uncategorized";
            acc[key] = (acc[key] || 0) + Number(e.amount || 0);
            return acc;
        }, {});

    const topCategories = Object.entries(expenseByCategory)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);


    const handleExportReport = () => {
        const reportData = [
            {
                Month: now.toLocaleString("en-IN", { month: "long", year: "numeric" }),
                Income_Realized: monthlyRealizedIncome,
                Expenses: monthlyExpenses,
                Net_Savings: monthlyNetSavings,
                Active_Investments_Value: dashboardData.totalActiveInvestments,
                Total_Net_Worth: dashboardData.netWorth
            }
        ];
        exportToCSV(reportData, "Monthly_Report");
    };

    return (
        <div className="relative w-full overflow-hidden bg-background">
            <TracingBeam className="px-6">
                <div className="mx-auto max-w-5xl py-20 lg:py-32">
                    {/* Header Section */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 dark:from-neutral-200 dark:to-neutral-600">
                            Your Financial Overview
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Track your expenses, investments, and net worth in one place.
                        </p>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative rounded-xl border bg-card text-card-foreground shadow-sm">
                        <BorderBeam size={250} duration={12} delay={9} />

                        <div className="p-6">
                            {showDetailedAnalytics ? (
                                <AnalyticsPage
                                    isEmbedded={true}
                                    onBack={() => setShowDetailedAnalytics(false)}
                                />
                            ) : (
                                <Tabs defaultValue="overview" className="space-y-4">
                                    <TabsList>
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                        <TabsTrigger value="reports">Reports</TabsTrigger>
                                        <TabsTrigger value="notifications" disabled>
                                            Notifications
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            {/* Total Revenue */}
                                            <Card className="relative overflow-hidden">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Total Net Worth
                                                    </CardTitle>
                                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{formatCurrency(dashboardData.netWorth)}</div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Active Investments + Realized Returns
                                                    </p>
                                                </CardContent>
                                                <BorderBeam size={100} duration={10} delay={0} borderWidth={1.5} colorFrom="#10b981" colorTo="#3b82f6" />
                                            </Card>

                                            {/* Subscriptions */}
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalExpenses)}</div>
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        {expenses.length > 0 ? `${expenses.length} transaction${expenses.length !== 1 ? 's' : ''} recorded` : "No expenses logged yet"}
                                                    </p>
                                                    {expenses.length === 0 && (
                                                        <Button variant="outline" size="sm" className="h-6 text-xs w-full mt-1" onClick={() => navigate('/expenses')}>
                                                            <Plus className="mr-1 h-3 w-3" /> Add Expense
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Sales */}
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalActiveInvestments)}</div>
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        {dashboardData.activePlanCount > 0
                                                            ? `${dashboardData.activePlanCount} active plan${dashboardData.activePlanCount !== 1 ? 's' : ''}`
                                                            : 'No active investments'}
                                                    </p>
                                                    {dashboardData.activePlanCount === 0 && (
                                                        <Button variant="outline" size="sm" className="h-6 text-xs w-full mt-1" onClick={() => navigate('/investments')}>
                                                            <Plus className="mr-1 h-3 w-3" /> Add Investment
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Active Investments */}
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Active Investments
                                                    </CardTitle>
                                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{dashboardData.activePlanCount}</div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {dashboardData.activePlanCount > 0 ? 'Active investment plans' : 'No active plans'}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                            <Card className="col-span-4 transition-all hover:shadow-md">
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <div>
                                                        <CardTitle>Recent Activity</CardTitle>
                                                        <CardDescription>
                                                            Your latest 5 financial transactions.
                                                        </CardDescription>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                                                        View All <ArrowUpRight className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-8">
                                                        {loading ? (
                                                            <div className="text-sm text-muted-foreground">Loading recent activity...</div>
                                                        ) : error ? (
                                                            <div className="text-sm text-red-500">{error}</div>
                                                        ) : recentTransactions.map((item, i) => (
                                                            <div key={i} className="flex items-center">
                                                                <div className="ml-4 space-y-1">
                                                                    <p className="text-sm font-medium leading-none">{item.description}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {formatDate(item.date)}
                                                                        {item.type === 'investment' && <span className="ml-2 text-xs bg-secondary px-1 py-0.5 rounded">Inv</span>}
                                                                    </p>
                                                                </div>
                                                                <div className={`ml-auto font-medium ${item.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                    {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {!loading && !error && recentTransactions.length === 0 && (
                                                            <div className="text-center py-4">
                                                                <p className="text-sm text-muted-foreground mb-4">No recent activity.</p>
                                                                <div className="flex gap-2 justify-center">
                                                                    <Button variant="outline" size="sm" onClick={() => navigate('/expenses')}>Add Expense</Button>
                                                                    <Button variant="outline" size="sm" onClick={() => navigate('/investments')}>Add Investment</Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="col-span-3">
                                                <CardHeader>
                                                    <CardTitle>Portfolio Distribution</CardTitle>
                                                    <CardDescription>
                                                        Your asset allocation.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <PortfolioChart investments={investments} />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="analytics" className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Expense Breakdown</CardTitle>
                                                <CardDescription>Where your money is going.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="h-[350px]">
                                                <ExpenseChart expenses={expenses} />
                                            </CardContent>
                                        </Card>
                                        <div className="flex justify-end pt-2">
                                            <Button onClick={() => setShowDetailedAnalytics(true)} variant="outline">
                                                View Detailed Analysis
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="reports" className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <div>
                                                        <CardTitle>Monthly Summary</CardTitle>
                                                        <CardDescription>
                                                            {now.toLocaleString("en-IN", { month: "long", year: "numeric" })}
                                                        </CardDescription>
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={handleExportReport}>
                                                        Export
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-sm mt-4">
                                                    <p className="flex justify-between">
                                                        <span>Income (Realized Exits)</span>
                                                        <span className="font-semibold text-emerald-500">{formatCurrency(monthlyRealizedIncome)}</span>
                                                    </p>
                                                    <p className="flex justify-between">
                                                        <span>Expenses</span>
                                                        <span className="font-semibold text-red-500">{formatCurrency(monthlyExpenses)}</span>
                                                    </p>
                                                    <p className="flex justify-between border-t pt-2">
                                                        <span>Net Savings</span>
                                                        <span className={`font-semibold ${monthlyNetSavings >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                            {formatCurrency(monthlyNetSavings)}
                                                        </span>
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Investment Performance</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    <p className="flex justify-between">
                                                        <span>Active Plans</span>
                                                        <span className="font-semibold">{dashboardData.activePlanCount}</span>
                                                    </p>
                                                    <p className="flex justify-between">
                                                        <span>Active Value</span>
                                                        <span className="font-semibold">{formatCurrency(dashboardData.totalActiveInvestments)}</span>
                                                    </p>
                                                    <p className="flex justify-between">
                                                        <span>Realized Value</span>
                                                        <span className="font-semibold">{formatCurrency(dashboardData.totalRealizedInvestments)}</span>
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Top Expense Categories</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {topCategories.length === 0 ? (
                                                        <p className="text-muted-foreground">No expenses this month.</p>
                                                    ) : (
                                                        topCategories.map((item) => (
                                                            <p key={item.category} className="flex justify-between">
                                                                <span>{item.category}</span>
                                                                <span className="font-semibold">{formatCurrency(item.amount)}</span>
                                                            </p>
                                                        ))
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button variant="outline" onClick={() => navigate("/reports")}>
                                                Open Detailed Reports
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <Button size="lg" className="gap-2" onClick={() => navigate('/reports')}>
                            View Full Report <ArrowUpRight className="h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline">
                            Manage Accounts
                        </Button>
                    </div>

                </div>
            </TracingBeam >
        </div >
    );
}
