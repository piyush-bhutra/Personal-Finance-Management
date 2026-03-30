import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Legend,
} from "recharts";

export function ExpenseChart({ expenses }: { expenses: any[] }) {
  const data = useMemo(() => {
    const categoryMap = new Map();
    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + Number(expense.amount));
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      total: value,
    }));
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="rgb(129,166,198)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgb(129,166,198)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid rgba(129,166,198,0.25)",
            boxShadow: "0 4px 12px rgba(129,166,198,0.16)",
          }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PortfolioChart({ investments }: { investments: any[] }) {
  const data = useMemo(() => {
    const typeMap = new Map();
    investments.forEach((inv) => {
      const type = inv.type || "Other";
      const current = typeMap.get(type) || 0;
      // New schema: totalInvested for all plan types (computed by backend)
      // Fallback to amount for one-time plans that may not have totalInvested yet
      const value = Number(inv.totalInvested ?? inv.amount ?? 0);
      typeMap.set(type, current + value);
    });

    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [investments]);

  const COLORS = [
    "rgb(129,166,198)",
    "rgb(170,205,220)",
    "rgb(243,227,208)",
    "rgb(210,196,180)",
    "rgb(129,166,198)",
    "rgb(170,205,220)",
  ];

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No investment data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
