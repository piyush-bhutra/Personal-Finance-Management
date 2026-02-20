import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import dashboardService from "../features/dashboard/dashboardService";
import expenseService from "../features/expenses/expenseService";
import investmentService from "../features/investments/investmentService";
import { formatCurrency, formatDate, toISODate } from "../lib/format";

const startOfCurrentMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const endOfMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
};

const ReportsPage = () => {
  const [rangeMode, setRangeMode] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );
  const [from, setFrom] = useState(toISODate(startOfCurrentMonth()));
  const [to, setTo] = useState(toISODate(new Date()));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [investments, setInvestments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [investmentTransactions, setInvestmentTransactions] = useState([]);

  const fromDate = useMemo(() => new Date(from), [from]);
  const toDate = useMemo(() => new Date(to), [to]);

  useEffect(() => {
    if (rangeMode !== "month") return;
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    if (!year || monthIndex < 0) return;
    setFrom(toISODate(new Date(year, monthIndex, 1)));
    setTo(toISODate(endOfMonth(year, monthIndex)));
  }, [rangeMode, selectedMonth]);

  useEffect(() => {
    if (!from || !to) return;
    if (fromDate > toDate) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [txData, expenseData, investmentData] = await Promise.all([
          dashboardService.getRecentTransactions({
            type: "investment",
            sort: "date",
            order: "desc",
            limit: 5000,
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          }),
          expenseService.getExpenses(),
          investmentService.getInvestments(),
        ]);

        setInvestmentTransactions(txData || []);
        setExpenses(expenseData || []);
        setInvestments(investmentData || []);
      } catch {
        setError("Could not load reports right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to, fromDate, toDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const date = new Date(e.date);
      return date >= fromDate && date <= toDate;
    });
  }, [expenses, fromDate, toDate]);

  const monthlySummary = useMemo(() => {
    const realizedIncome = investmentTransactions
      .filter((tx) => tx.mode === "sold" || tx.category === "Investment Return")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const totalExpenses = filteredExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    return {
      realizedIncome,
      totalExpenses,
      netSavings: realizedIncome - totalExpenses,
    };
  }, [investmentTransactions, filteredExpenses]);

  const performance = useMemo(() => {
    const activePlans = investments.filter((plan) => plan.status !== "closed");
    const closedPlans = investments.filter((plan) => plan.status === "closed");

    const investedAmount = investments.reduce(
      (sum, plan) => sum + Number(plan.totalInvested || 0),
      0
    );
    const currentOrRealizedValue = investments.reduce(
      (sum, plan) => sum + Number(plan.currentValue || 0),
      0
    );

    return {
      activeCount: activePlans.length,
      closedCount: closedPlans.length,
      investedAmount,
      currentOrRealizedValue,
      delta: currentOrRealizedValue - investedAmount,
    };
  }, [investments]);

  const expenseByCategory = useMemo(() => {
    const grouped = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const hasNoData =
    !loading &&
    investments.length === 0 &&
    investmentTransactions.length === 0 &&
    filteredExpenses.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar variant="auth" />
      <div className="container mx-auto py-10 px-4 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Read-only financial reports across your selected time period.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rangeMode">Mode</Label>
              <select
                id="rangeMode"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={rangeMode}
                onChange={(e) => setRangeMode(e.target.value)}
              >
                <option value="month">Selected Month</option>
                <option value="range">Custom Date Range</option>
              </select>
            </div>

            {rangeMode === "month" ? (
              <div className="space-y-2">
                <Label htmlFor="selectedMonth">Month</Label>
                <Input
                  id="selectedMonth"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fromDate">From</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDate">To</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {from && to && fromDate > toDate && (
          <Card>
            <CardContent className="py-6 text-sm text-red-500">
              Invalid range: "From" date must be earlier than or equal to "To" date.
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading reports...
            </CardContent>
          </Card>
        )}

        {error && !loading && (
          <Card>
            <CardContent className="py-6 text-red-500">{error}</CardContent>
          </Card>
        )}

        {hasNoData && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No data found for this period.
            </CardContent>
          </Card>
        )}

        {!loading && !error && !hasNoData && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span>Total Income (Realized Exits)</span>
                    <span className="font-semibold text-emerald-500">
                      {formatCurrency(monthlySummary.realizedIncome)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Total Expenses</span>
                    <span className="font-semibold text-red-500">
                      {formatCurrency(monthlySummary.totalExpenses)}
                    </span>
                  </p>
                  <p className="flex justify-between border-t pt-2">
                    <span>Net Savings</span>
                    <span
                      className={`font-semibold ${
                        monthlySummary.netSavings >= 0 ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(monthlySummary.netSavings)}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investment Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span>Active Investments</span>
                    <span className="font-semibold">{performance.activeCount}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Closed Investments</span>
                    <span className="font-semibold">{performance.closedCount}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Invested Amount</span>
                    <span className="font-semibold">{formatCurrency(performance.investedAmount)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Current/Realized Value</span>
                    <span className="font-semibold">
                      {formatCurrency(performance.currentOrRealizedValue)}
                    </span>
                  </p>
                  <p className="flex justify-between border-t pt-2">
                    <span>Difference</span>
                    <span
                      className={`font-semibold ${
                        performance.delta >= 0 ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(performance.delta)}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Report Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span>From</span>
                    <span className="font-semibold">{formatDate(fromDate)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>To</span>
                    <span className="font-semibold">{formatDate(toDate)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Expense categories are computed strictly for this selected period.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expense Category Report</CardTitle>
              </CardHeader>
              <CardContent>
                {expenseByCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No expenses in the selected period.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {expenseByCategory.map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between border-b pb-2 last:border-none last:pb-0"
                      >
                        <span>{item.category}</span>
                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
