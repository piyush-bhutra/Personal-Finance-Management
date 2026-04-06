import { useEffect, useState } from "react";
import { BorderBeam } from "./border-beam";
import { TracingBeam } from "./tracing-beam";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Button } from "./button";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CreditCard,
  IndianRupee,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import expenseService from "@/features/expenses/expenseService";
import investmentService from "@/features/investments/investmentService";
import dashboardService from "@/features/dashboard/dashboardService";
import { ExpenseChart, PortfolioChart } from "./analytics-charts";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { formatCurrency, formatDate } from "@/lib/format";
// @ts-ignore
import AnalyticsPage from "../../pages/Analytics";
// @ts-ignore
import { exportToCSV } from "../../utils/exportToCSV";
import { Input } from "./input";
import { Label } from "./label";

const DEFAULT_BUDGET_OVERVIEW = {
  month: "",
  monthLabel: "",
  totalBudget: 0,
  budgetedSpent: 0,
  totalSpent: 0,
  unbudgetedSpent: 0,
  remaining: 0,
  utilizationPercent: 0,
  overspentCategories: 0,
  categoryCount: 0,
  categories: [] as any[],
};

const DEFAULT_DASHBOARD_DATA = {
  netWorth: 0,
  totalActiveInvestments: 0,
  totalRealizedInvestments: 0,
  totalExpenses: 0,
  activePlanCount: 0,
  monthlyBudget: DEFAULT_BUDGET_OVERVIEW,
};

export function HeroSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(
    DEFAULT_DASHBOARD_DATA,
  );
  const [budgetOverview, setBudgetOverview] = useState<any>(
    DEFAULT_BUDGET_OVERVIEW,
  );
  const [budgetForm, setBudgetForm] = useState({ category: "", limit: "" });
  const [budgetBusy, setBudgetBusy] = useState(false);
  const [budgetStatusMessage, setBudgetStatusMessage] = useState("");
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      const [expenseRes, investmentRes, summaryRes, txRes, budgetRes] =
        await Promise.allSettled([
          expenseService.getExpenses(),
          investmentService.getInvestments(),
          dashboardService.getDashboardSummary(),
          dashboardService.getRecentTransactions({ limit: 5 }),
          dashboardService.getBudgets({ month: currentMonthKey }),
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
        setDashboardData({
          ...DEFAULT_DASHBOARD_DATA,
          ...(summaryRes.value || {}),
        });
        anySuccess = true;
      } else {
        console.error("Dashboard summary fetch failed:", summaryRes.reason);
        setDashboardData(DEFAULT_DASHBOARD_DATA);
      }

      if (txRes.status === "fulfilled") {
        setRecentTransactions(txRes.value || []);
        anySuccess = true;
      } else {
        console.error("Recent transactions fetch failed:", txRes.reason);
        setRecentTransactions([]);
      }

      if (budgetRes.status === "fulfilled") {
        setBudgetOverview(budgetRes.value || DEFAULT_BUDGET_OVERVIEW);
        anySuccess = true;
      } else {
        console.error("Budget overview fetch failed:", budgetRes.reason);
        setBudgetOverview(DEFAULT_BUDGET_OVERVIEW);
      }

      if (!anySuccess) {
        setError("Unable to load dashboard data right now.");
      } else {
        setError("");
      }
      setLoading(false);
    };

    fetchData();
  }, [currentMonthKey]);

  const refreshBudgetAndSummary = async () => {
    const [budgetData, summaryData] = await Promise.all([
      dashboardService.getBudgets({ month: currentMonthKey }),
      dashboardService.getDashboardSummary(),
    ]);

    setBudgetOverview(budgetData || DEFAULT_BUDGET_OVERVIEW);
    setDashboardData({
      ...DEFAULT_DASHBOARD_DATA,
      ...(summaryData || {}),
    });
  };

  const handleSaveBudget = async (e: any) => {
    e.preventDefault();
    const category = budgetForm.category.trim();
    const limit = Number(budgetForm.limit);

    if (!category || !Number.isFinite(limit) || limit <= 0) {
      setBudgetStatusMessage("Enter a valid category and monthly limit.");
      return;
    }

    setBudgetBusy(true);
    setBudgetStatusMessage("");
    try {
      await dashboardService.upsertBudget({
        category,
        limit,
        month: currentMonthKey,
      });
      await refreshBudgetAndSummary();
      setBudgetForm({ category: "", limit: "" });
      setBudgetStatusMessage("Budget saved.");
    } catch (saveError: any) {
      setBudgetStatusMessage(
        saveError.response?.data?.message ||
        "Could not save budget right now. Please try again.",
      );
    } finally {
      setBudgetBusy(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    setBudgetBusy(true);
    setBudgetStatusMessage("");
    try {
      await dashboardService.deleteBudget(budgetId);
      await refreshBudgetAndSummary();
      setBudgetStatusMessage("Budget deleted.");
    } catch (deleteError: any) {
      setBudgetStatusMessage(
        deleteError.response?.data?.message ||
        "Could not delete budget right now. Please try again.",
      );
    } finally {
      setBudgetBusy(false);
    }
  };

  const normalize = (e: any) => ({ ...e, date: e.date ?? e.startDate, amount: e.amount ?? e.monthlyAmount });

  const monthlyExpenses = expenses
    .map(normalize)
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
    .map(normalize)
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

  const budgetNotifications: any[] = [];

  if ((budgetOverview.categories || []).length === 0) {
    budgetNotifications.push({
      id: "setup-budget",
      level: "info",
      title: "Set Your First Monthly Budget",
      description:
        "Add category limits to start receiving overspending alerts.",
      actionLabel: "Manage Budgets",
      actionTab: "reports",
    });
  }

  for (const item of budgetOverview.categories || []) {
    const utilization = Number(item.utilizationPercent || 0);
    const remaining = Number(item.remaining || 0);

    if (remaining < 0) {
      budgetNotifications.push({
        id: `over-${item._id}`,
        level: "danger",
        title: `${item.category} Budget Exceeded`,
        description: `Over by ${formatCurrency(Math.abs(remaining))} this month.`,
        actionLabel: "Review Expenses",
        actionPath: "/expenses",
      });
      continue;
    }

    if (utilization >= 80) {
      budgetNotifications.push({
        id: `near-${item._id}`,
        level: "warning",
        title: `${item.category} Near Budget Limit`,
        description: `${utilization.toFixed(1)}% used. ${formatCurrency(remaining)} remaining.`,
        actionLabel: "Open Reports",
        actionPath: "/reports",
      });
    }
  }

  if (Number(budgetOverview.unbudgetedSpent || 0) > 0) {
    budgetNotifications.push({
      id: "unbudgeted-spend",
      level: "warning",
      title: "Unbudgeted Expenses Detected",
      description: `${formatCurrency(Number(budgetOverview.unbudgetedSpent || 0))} spent in categories without a set budget.`,
      actionLabel: "Set Budgets",
      actionTab: "reports",
    });
  }

  if (budgetNotifications.length === 0) {
    budgetNotifications.push({
      id: "all-good",
      level: "success",
      title: "All Budget Categories Are Healthy",
      description: "No budget alerts for the current month.",
      actionLabel: "View Full Report",
      actionPath: "/reports",
    });
  }

  const handleExportReport = () => {
    const reportData = [
      {
        Month: now.toLocaleString("en-IN", { month: "long", year: "numeric" }),
        Income_Realized: monthlyRealizedIncome,
        Expenses: monthlyExpenses,
        Net_Savings: monthlyNetSavings,
        Active_Investments_Value: dashboardData.totalActiveInvestments,
        Total_Net_Worth: dashboardData.netWorth,
        Budget_Limit: budgetOverview.totalBudget,
        Budgeted_Spent: budgetOverview.budgetedSpent,
        Budget_Remaining: budgetOverview.remaining,
      },
    ];
    exportToCSV(reportData, "Monthly_Report");
  };

  return (
    <div className="relative w-full overflow-hidden bg-background">
      <TracingBeam className="px-6">
        <div className="mx-auto max-w-5xl py-20 lg:py-32">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-primary to-accent dark:from-primary dark:to-accent">
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
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="space-y-4"
                >
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="notifications">
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
                          <div className="text-2xl font-bold tabular-nums">
                            {formatCurrency(dashboardData.netWorth)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Active Investments + Realized Returns
                          </p>
                        </CardContent>
                        <BorderBeam
                          size={100}
                          duration={10}
                          delay={0}
                          borderWidth={1.5}
                          colorFrom="rgb(170,205,220)"
                          colorTo="rgb(129,166,198)"
                        />
                      </Card>

                      {/* Subscriptions */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Monthly Expenses
                          </CardTitle>
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold tabular-nums">
                            {formatCurrency(dashboardData.totalExpenses)}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {expenses.length > 0
                              ? `${expenses.length} transaction${expenses.length !== 1 ? "s" : ""} recorded`
                              : "No expenses logged yet"}
                          </p>
                          {expenses.length === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs w-full mt-1"
                              onClick={() => navigate("/expenses")}
                            >
                              <Plus className="mr-1 h-3 w-3" /> Add Expense
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      {/* Sales */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Investments
                          </CardTitle>
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold tabular-nums">
                            {formatCurrency(
                              dashboardData.totalActiveInvestments,
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {dashboardData.activePlanCount > 0
                              ? `${dashboardData.activePlanCount} active plan${dashboardData.activePlanCount !== 1 ? "s" : ""}`
                              : "No active investments"}
                          </p>
                          {dashboardData.activePlanCount === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs w-full mt-1"
                              onClick={() => navigate("/investments")}
                            >
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
                          <div className="text-2xl font-bold">
                            {dashboardData.activePlanCount}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {dashboardData.activePlanCount > 0
                              ? "Active investment plans"
                              : "No active plans"}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/transactions")}
                          >
                            View All <ArrowUpRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-8">
                            {loading ? (
                              <div className="text-sm text-muted-foreground">
                                Loading recent activity...
                              </div>
                            ) : error ? (
                              <div className="text-sm text-primary">
                                {error}
                              </div>
                            ) : (
                              recentTransactions.map((item, i) => (
                                <div key={i} className="flex items-center">
                                  <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      {item.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDate(item.date)}
                                      {item.type === "investment" && (
                                        <span className="ml-2 text-xs bg-secondary px-1 py-0.5 rounded">
                                          Inv
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div
                                    className={`ml-auto font-medium tabular-nums ${item.type === "expense" ? "text-primary" : "text-accent"}`}
                                  >
                                    {item.type === "expense" ? "-" : "+"}
                                    {formatCurrency(item.amount)}
                                  </div>
                                </div>
                              ))
                            )}
                            {!loading &&
                              !error &&
                              recentTransactions.length === 0 && (
                                <div className="text-center py-4">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    No recent activity.
                                  </p>
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate("/expenses")}
                                    >
                                      Add Expense
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate("/investments")}
                                    >
                                      Add Investment
                                    </Button>
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
                        <CardDescription>
                          Where your money is going.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-[350px]">
                        <ExpenseChart expenses={expenses.map(normalize)} />
                      </CardContent>
                    </Card>
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => setShowDetailedAnalytics(true)}
                        variant="outline"
                      >
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
                              {now.toLocaleString("en-IN", {
                                month: "long",
                                year: "numeric",
                              })}
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportReport}
                          >
                            Export
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm mt-4">
                          <p className="flex justify-between">
                            <span>Income (Realized Exits)</span>
                            <span className="font-semibold text-accent tabular-nums">
                              {formatCurrency(monthlyRealizedIncome)}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Expenses</span>
                            <span className="font-semibold text-primary tabular-nums">
                              {formatCurrency(monthlyExpenses)}
                            </span>
                          </p>
                          <p className="flex justify-between border-t pt-2">
                            <span>Net Savings</span>
                            <span
                              className={`font-semibold tabular-nums ${monthlyNetSavings >= 0 ? "text-accent" : "text-primary"}`}
                            >
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
                            <span className="font-semibold">
                              {dashboardData.activePlanCount}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Active Value</span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(
                                dashboardData.totalActiveInvestments,
                              )}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Realized Value</span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(
                                dashboardData.totalRealizedInvestments,
                              )}
                            </span>
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Top Expense Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {topCategories.length === 0 ? (
                            <p className="text-muted-foreground">
                              No expenses this month.
                            </p>
                          ) : (
                            topCategories.map((item) => (
                              <p
                                key={item.category}
                                className="flex justify-between"
                              >
                                <span>{item.category}</span>
                                <span className="font-semibold tabular-nums">
                                  {formatCurrency(item.amount)}
                                </span>
                              </p>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Budget Snapshot</CardTitle>
                          <CardDescription>
                            {budgetOverview.monthLabel || currentMonthKey}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p className="flex justify-between">
                            <span>Total Budget</span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(budgetOverview.totalBudget || 0)}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Budgeted Spend</span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(
                                budgetOverview.budgetedSpent || 0,
                              )}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Unbudgeted Spend</span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(
                                budgetOverview.unbudgetedSpent || 0,
                              )}
                            </span>
                          </p>
                          <p className="flex justify-between border-t pt-2">
                            <span>Remaining (Budgeted)</span>
                            <span
                              className={`font-semibold tabular-nums ${Number(budgetOverview.remaining || 0) < 0
                                ? "text-primary"
                                : "text-accent"
                                }`}
                            >
                              {formatCurrency(budgetOverview.remaining || 0)}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Utilization:{" "}
                            {Number(
                              budgetOverview.utilizationPercent || 0,
                            ).toFixed(1)}
                            %
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Manage Category Budgets</CardTitle>
                          <CardDescription>
                            Set monthly spending limits per category.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <form
                            onSubmit={handleSaveBudget}
                            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                          >
                            <div className="sm:col-span-2">
                              <Label htmlFor="budget-category">Category</Label>
                              <Input
                                id="budget-category"
                                placeholder="e.g. Groceries"
                                value={budgetForm.category}
                                onChange={(e) =>
                                  setBudgetForm((prev) => ({
                                    ...prev,
                                    category: e.target.value,
                                  }))
                                }
                                disabled={budgetBusy}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="budget-limit">Limit (INR)</Label>
                              <Input
                                id="budget-limit"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="0"
                                value={budgetForm.limit}
                                onChange={(e) =>
                                  setBudgetForm((prev) => ({
                                    ...prev,
                                    limit: e.target.value,
                                  }))
                                }
                                disabled={budgetBusy}
                                required
                              />
                            </div>
                            <Button
                              type="submit"
                              className="sm:col-span-3"
                              disabled={budgetBusy}
                            >
                              {budgetBusy ? "Saving..." : "Save Budget"}
                            </Button>
                          </form>

                          {budgetStatusMessage && (
                            <p className="text-xs text-muted-foreground">
                              {budgetStatusMessage}
                            </p>
                          )}

                          {budgetOverview.categories?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No category budgets set for this month.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {budgetOverview.categories.map((item: any) => (
                                <div
                                  key={item._id}
                                  className="rounded-md border px-3 py-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                      {item.category}
                                    </p>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteBudget(item._id)
                                      }
                                      disabled={budgetBusy}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                      {formatCurrency(item.spent)} /{" "}
                                      {formatCurrency(item.limit)}
                                    </span>
                                    <span
                                      className={
                                        Number(item.remaining) < 0
                                          ? "text-primary"
                                          : "text-accent"
                                      }
                                    >
                                      {Number(item.remaining) < 0
                                        ? `Over by ${formatCurrency(Math.abs(Number(item.remaining || 0)))}`
                                        : `${formatCurrency(item.remaining)} left`}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/reports")}
                      >
                        Open Detailed Reports
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-primary" />
                          Budget Notifications
                        </CardTitle>
                        <CardDescription>
                          Alerts generated from your monthly budget status.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {budgetNotifications.map((alert) => {
                          const toneClass =
                            alert.level === "danger"
                              ? "border-destructive/40 bg-destructive/10"
                              : alert.level === "warning"
                                ? "border-primary/30 bg-primary/10"
                                : "border-accent/30 bg-accent/10";

                          return (
                            <div
                              key={alert.id}
                              className={`rounded-md border p-3 ${toneClass}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {alert.title}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {alert.description}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (alert.actionPath) {
                                      navigate(alert.actionPath);
                                    } else if (alert.actionTab) {
                                      setActiveTab(alert.actionTab);
                                    }
                                  }}
                                >
                                  {alert.actionLabel}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate("/reports")}
            >
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
