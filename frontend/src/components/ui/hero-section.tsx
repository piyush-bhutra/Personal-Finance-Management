import { useEffect, useState } from "react";
import { BorderBeam } from "./border-beam";
import { TracingBeam } from "./tracing-beam";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Button } from "./button";
import { ArrowUpRight, CreditCard, DollarSign, Wallet, TrendingUp } from "lucide-react";
import expenseService from "../../features/expenses/expenseService";
import investmentService from "../../features/investments/investmentService";

export function HeroSection() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [investments, setInvestments] = useState<any[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalInvestments, setTotalInvestments] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    try {
                        const expenseData = await expenseService.getExpenses(user.token);
                        const investmentData = await investmentService.getInvestments(user.token);

                        setExpenses(expenseData);
                        setInvestments(investmentData);

                        const totalExp = expenseData.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
                        const totalInv = investmentData.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

                        setTotalExpenses(totalExp);
                        setTotalInvestments(totalInv);
                    } catch (error) {
                        console.error("Error fetching data:", error);
                    }
                }
            }
        };

        fetchData();
    }, []);

    const totalNetWorth = 45000 + totalInvestments - totalExpenses; // Placeholder base + calc

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
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">${totalNetWorth.toLocaleString()}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    +20.1% from last month
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
                                                <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    +4.5% from last month
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Sales */}
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">₹{totalInvestments.toLocaleString('en-IN')}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    +12.5% from last month
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Active Now */}
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Active Cards
                                                </CardTitle>
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">+3</div>
                                                <p className="text-xs text-muted-foreground">
                                                    No issues reported
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                        <Card className="col-span-4 transition-all hover:shadow-md">
                                            <CardHeader>
                                                <CardTitle>Recent Transactions</CardTitle>
                                                <CardDescription>
                                                    You made {expenses.length} transactions this month.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-8">
                                                    {expenses.slice(0, 5).map((expense: any, i) => (
                                                        <div key={i} className="flex items-center">
                                                            <div className="ml-4 space-y-1">
                                                                <p className="text-sm font-medium leading-none">{expense.description || expense.category}</p>
                                                                <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="ml-auto font-medium text-red-500">-₹{expense.amount}</div>
                                                        </div>
                                                    ))}
                                                    {expenses.length === 0 && (
                                                        <p className="text-sm text-muted-foreground">No recent transactions.</p>
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
                                                {/* Simple Visual Representation */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Stocks</span>
                                                        <div className="h-2 w-1/2 rounded-full bg-blue-500"></div>
                                                        <span className="text-sm text-muted-foreground">50%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Crypto</span>
                                                        <div className="h-2 w-1/4 rounded-full bg-orange-500"></div>
                                                        <span className="text-sm text-muted-foreground">25%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Cash</span>
                                                        <div className="h-2 w-1/6 rounded-full bg-green-500"></div>
                                                        <span className="text-sm text-muted-foreground">15%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Real Estate</span>
                                                        <div className="h-2 w-[10%] rounded-full bg-purple-500"></div>
                                                        <span className="text-sm text-muted-foreground">10%</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="analytics" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Analytics</CardTitle>
                                            <CardDescription>Detailed expense analysis coming soon.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                                            Chart placeholder
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <Button size="lg" className="gap-2">
                            View Full Report <ArrowUpRight className="h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline">
                            Manage Accounts
                        </Button>
                    </div>

                </div>
            </TracingBeam>
        </div>
    );
}
