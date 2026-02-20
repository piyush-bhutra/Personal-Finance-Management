import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Edit2, Plus, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import expenseService from "../features/expenses/expenseService";
import { formatCurrency, formatDate, toISODate } from "../lib/format";

const EMPTY_FORM = {
  category: "",
  amount: "",
  date: "",
  description: "",
};

const MAX_EXPENSE_AMOUNT = 100000000;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setApiError("");
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setApiError("Unable to load expenses right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setFormError("");
  };

  const validateForm = () => {
    const category = formData.category.trim();
    const amount = Number(formData.amount);
    const date = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (!category) return "Category is required.";
    if (!Number.isFinite(amount) || amount <= 0) return "Amount must be greater than 0.";
    if (amount > MAX_EXPENSE_AMOUNT) return "Amount is too large. Please enter a realistic value.";
    if (!formData.date || Number.isNaN(date.getTime())) return "Valid date is required.";
    if (date > today) return "Expense date cannot be in the future.";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setApiError("");
    try {
      const payload = {
        category: formData.category.trim(),
        amount: Number(formData.amount),
        date: formData.date,
        description: formData.description?.trim() || "",
      };

      if (currentExpense) {
        await expenseService.updateExpense(currentExpense._id, payload);
        setIsEditOpen(false);
        setCurrentExpense(null);
      } else {
        await expenseService.createExpense(payload);
      }

      setFormData(EMPTY_FORM);
      await fetchExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      setApiError("Could not save expense. Please check values and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      category: expense.category || "",
      amount: String(expense.amount ?? ""),
      date: toISODate(expense.date),
      description: expense.description || "",
    });
    setFormError("");
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    setApiError("");
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((expense) => expense._id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      setApiError("Could not delete expense right now. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar variant="auth" />
      <div className="container mx-auto py-10 px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Manage Expenses</h1>
        </Motion.div>

        {apiError && (
          <Card className="mb-6 border-red-500/30">
            <CardContent className="py-4 text-red-500 text-sm">{apiError}</CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1"
          >
            <Card className="h-fit sticky top-24">
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g. Food, Rent"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (INR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      max={MAX_EXPENSE_AMOUNT}
                      placeholder="0"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      max={toISODate(new Date())}
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Details..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  {formError && <p className="text-sm text-red-500">{formError}</p>}
                  <Button type="submit" className="w-full flex items-center gap-2" disabled={isSubmitting}>
                    <Plus size={16} /> {isSubmitting ? "Saving..." : "Add Expense"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
                ) : (
                  <div className="space-y-4">
                    {expenses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No expenses found. Add your first expense to get started.
                      </p>
                    ) : (
                      expenses.map((expense) => (
                        <Motion.div
                          layout
                          key={expense._id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="font-semibold">{expense.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(expense.date, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                              {expense.description ? ` - ${expense.description}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-red-500">-{formatCurrency(expense.amount)}</span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(expense)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(expense._id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </Motion.div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Motion.div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Food, Rent"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (INR)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max={MAX_EXPENSE_AMOUNT}
                  placeholder="0"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  max={toISODate(new Date())}
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Details..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Expense"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
