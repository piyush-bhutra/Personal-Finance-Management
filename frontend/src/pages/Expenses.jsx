import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Edit2, Plus, Trash2, StopCircle, Download } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import expenseService from "../features/expenses/expenseService";
import { formatCurrency, formatDate, toISODate } from "../lib/format";
import { exportToCSV } from "../utils/exportToCSV";

const recurringDefaults = { expenseMode: "recurring", category: "", monthlyAmount: "", startDate: "", description: "" };
const oneTimeDefaults = { expenseMode: "one-time", category: "", amount: "", date: "", description: "" };

const MAX_EXPENSE_AMOUNT = 100000000;

const nowYM = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Create form state
  const [mode, setMode] = useState("recurring");
  const [formData, setFormData] = useState(recurringDefaults);

  // Edit and Delete dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editData, setEditData] = useState({});

  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [fromDate, setFromDate] = useState(nowYM());
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const [stopOpen, setStopOpen] = useState(false);
  const [stopTarget, setStopTarget] = useState(null);
  const [stopDate, setStopDate] = useState(toISODate(new Date()));

  const loadExpenses = async () => {
    setLoading(true);
    setApiError("");
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data || []);
    } catch (error) {
      const msg = error.response?.data?.message || "Unable to load expenses right now. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const isFutureDate = (v) => {
    const d = new Date(v);
    const t = new Date();
    t.setHours(23, 59, 59, 999);
    return Number.isNaN(d.getTime()) || d > t;
  };

  const validateCommon = (category) => {
    if (!category?.trim()) return "Category is required.";
    return "";
  };

  const validateCreate = () => {
    const common = validateCommon(formData.category);
    if (common) return common;
    if (mode === "recurring") {
      const m = Number(formData.monthlyAmount);
      if (!Number.isFinite(m) || m <= 0 || m > MAX_EXPENSE_AMOUNT) return "Monthly amount must be between 1 and 100000000.";
      if (!formData.startDate || isFutureDate(formData.startDate)) return "Start date is required and cannot be in the future.";
    } else {
      const a = Number(formData.amount);
      if (!Number.isFinite(a) || a <= 0 || a > MAX_EXPENSE_AMOUNT) return "Amount must be between 1 and 100000000.";
      if (!formData.date || isFutureDate(formData.date)) return "Expense date is required and cannot be in the future.";
    }
    return "";
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const err = validateCreate();
    if (err) return setFormError(err);

    setSubmitting(true);
    setFormError("");
    setApiError("");
    try {
      const payload = { ...formData, category: formData.category.trim() };
      await expenseService.createExpense(payload);
      setFormData(mode === "recurring" ? recurringDefaults : oneTimeDefaults);
      await loadExpenses();
    } catch (error) {
      const msg = error.response?.data?.message || "Could not save expense. Please check values and try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (exp) => {
    setEditTarget(exp);
    if (exp.expenseMode === "recurring") {
      setEditData({ category: exp.category, monthlyAmount: exp.monthlyAmount, description: exp.description ?? "" });
      setFromDate(nowYM());
      setFromDateOpen(true);
    } else {
      setEditData({ category: exp.category, amount: exp.amount, date: toISODate(exp.date), description: exp.description ?? "" });
      setEditOpen(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const common = validateCommon(editData.category);
    if (common) return setFormError(common);

    if (editTarget.expenseMode === "recurring" && (Number(editData.monthlyAmount) <= 0 || Number(editData.monthlyAmount) > MAX_EXPENSE_AMOUNT)) return setFormError("Monthly amount must be between 1 and 100000000.");
    if (editTarget.expenseMode === "one-time") {
      if (Number(editData.amount) <= 0 || Number(editData.amount) > MAX_EXPENSE_AMOUNT) return setFormError("Amount must be between 1 and 100000000.");
      if (!editData.date || isFutureDate(editData.date)) return setFormError("Valid non-future date is required.");
    }

    setSubmitting(true);
    setFormError("");
    setApiError("");
    try {
      const payload = { ...editData, category: editData.category.trim() };
      if (editTarget.expenseMode === "recurring") payload.fromDate = fromDate;
      await expenseService.updateExpense(editTarget._id, payload);
      setEditOpen(false);
      setEditTarget(null);
      await loadExpenses();
    } catch (error) {
      const msg = error.response?.data?.message || "Could not update expense right now. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const doDelete = async (id, fd) => {
    setSubmitting(true);
    setApiError("");
    try {
      await expenseService.deleteExpense(id, fd);
      setExpenses((prev) => prev.filter((x) => x._id !== id));
    } catch (error) {
      const msg = error.response?.data?.message || "Could not delete expense right now. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openStop = (exp) => {
    setStopTarget(exp);
    setStopDate(toISODate(new Date()));
    setStopOpen(true);
  };

  const confirmStop = async () => {
    if (!stopDate || isFutureDate(stopDate)) return setFormError("Stop date cannot be in the future.");
    setSubmitting(true);
    setFormError("");
    setApiError("");
    try {
      await expenseService.stopExpense(stopTarget._id, { stopDate });
      setStopOpen(false);
      setStopTarget(null);
      await loadExpenses();
    } catch (error) {
      const msg = error.response?.data?.message || "Could not stop expense right now. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const exportData = expenses.map(exp => ({
      Category: exp.category,
      Type: exp.expenseMode === 'recurring' ? 'Recurring' : 'One-Time',
      Amount: exp.expenseMode === 'recurring' ? exp.monthlyAmount : exp.amount,
      Total_Paid: exp.totalAmount || exp.amount,
      Start_Date: exp.expenseMode === 'recurring' ? toISODate(exp.startDate) : toISODate(exp.date),
      End_Date: exp.status === 'closed' ? toISODate(exp.stopDate) : 'Active',
      Status: exp.status,
      Description: exp.description || ""
    }));
    exportToCSV(exportData, 'My_Expenses');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar variant="auth" />
      <div className="container mx-auto py-10 px-4 max-w-6xl space-y-6">
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Manage Expenses</h1>
            <Button variant="outline" onClick={handleExport} disabled={expenses.length === 0}>
              <Download size={16} className="mr-2" /> Export CSV
            </Button>
          </div>
        </Motion.div>

        {apiError && <Card className="border-red-500/30"><CardContent className="py-4 text-sm text-red-500">{apiError}</CardContent></Card>}

        <div className="grid md:grid-cols-3 gap-8">
          <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="md:col-span-1">
            <Card className="h-fit sticky top-24">
              <CardHeader><CardTitle>Add Expense</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button type="button" variant={mode === "recurring" ? "default" : "outline"} onClick={() => { setMode("recurring"); setFormData(recurringDefaults); setFormError(""); }} className="flex-1">Recurring</Button>
                  <Button type="button" variant={mode === "one-time" ? "default" : "outline"} onClick={() => { setMode("one-time"); setFormData(oneTimeDefaults); setFormError(""); }} className="flex-1">One-Time</Button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div><Label htmlFor="category">Category</Label><Input id="category" placeholder="e.g. Rent, Groceries" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required /></div>
                  {mode === "recurring" ? (
                    <>
                      <div><Label htmlFor="monthlyAmount">Monthly Amount (INR)</Label><Input id="monthlyAmount" type="number" min="1" max={MAX_EXPENSE_AMOUNT} placeholder="0" value={formData.monthlyAmount} onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })} required /></div>
                      <div><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" max={toISODate(new Date())} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
                    </>
                  ) : (
                    <>
                      <div><Label htmlFor="amount">Amount (INR)</Label><Input id="amount" type="number" min="1" max={MAX_EXPENSE_AMOUNT} placeholder="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required /></div>
                      <div><Label htmlFor="date">Expense Date</Label><Input id="date" type="date" max={toISODate(new Date())} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
                    </>
                  )}
                  <div><Label htmlFor="description">Notes (Optional)</Label><Input id="description" placeholder="Details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                  {formError && <p className="text-sm text-red-500">{formError}</p>}
                  <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={submitting}><Plus size={16} /> {submitting ? "Saving..." : "Add Expense"}</Button>
                </form>
              </CardContent>
            </Card>
          </Motion.div>

          <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle>Recent Expenses</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-10 text-center text-muted-foreground">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">No expenses found. Add your first expense to get started.</div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((exp) => (
                      <Motion.div layout key={exp._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-muted/50 transition-colors gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{exp.category}</p>
                          <div className="text-sm text-muted-foreground mt-1">
                            {exp.expenseMode === "recurring" ? (
                              <>
                                <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-xs mr-2 border border-primary/20">Recurring</span>
                                <span>Started {formatDate(exp.startDate, { month: 'short', year: 'numeric' })}</span>
                              </>
                            ) : (
                              <span>{formatDate(exp.date, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            )}
                            {exp.status === "closed" && <span className="ml-2 text-red-400"> • Stopped on {formatDate(exp.stopDate)}</span>}
                            {exp.description && <p className="mt-1">{exp.description}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-bold text-red-500 text-lg">
                            -{formatCurrency(exp.expenseMode === 'recurring' ? exp.monthlyAmount : exp.amount)}
                            {exp.expenseMode === 'recurring' && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                          </span>
                          <div className="flex gap-2 mt-2">
                            {exp.status !== "closed" && <Button variant="outline" size="sm" onClick={() => openEdit(exp)} className="h-8 px-2"><Edit2 size={14} className="mr-1" /> Edit</Button>}
                            {exp.status !== "closed" && exp.expenseMode === "recurring" && <Button variant="outline" size="sm" onClick={() => openStop(exp)} className="h-8 px-2"><StopCircle size={14} className="mr-1" /> Stop</Button>}
                            <Button variant="destructive" size="sm" onClick={() => exp.expenseMode === "recurring" ? (setPendingDeleteId(exp._id), setFromDate(nowYM()), setFromDateOpen(true)) : doDelete(exp._id, null)} className="h-8 px-2"><Trash2 size={14} className="mr-1" /> Delete</Button>
                          </div>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Motion.div>
        </div>

        {/* Edit Month Select Modal for Recurring */}
        <Dialog open={fromDateOpen} onOpenChange={setFromDateOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Select Effective Month</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="fromDate">Apply changes from:</Label>
              <Input id="fromDate" type="month" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-2">This ensures historical expense entries remain untouched, maintaining accurate past reporting.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFromDateOpen(false)}>Cancel</Button>
              <Button onClick={() => { setFromDateOpen(false); pendingDeleteId ? doDelete(pendingDeleteId, fromDate) : setEditOpen(true); setPendingDeleteId(""); }}>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Edit Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div><Label>Category</Label><Input value={editData.category || ""} onChange={(e) => setEditData({ ...editData, category: e.target.value })} required /></div>
              {editTarget?.expenseMode === "recurring" ? (
                <div><Label>Monthly Amount (INR)</Label><Input type="number" min="1" max={MAX_EXPENSE_AMOUNT} value={editData.monthlyAmount || ""} onChange={(e) => setEditData({ ...editData, monthlyAmount: e.target.value })} required /></div>
              ) : (
                <>
                  <div><Label>Amount (INR)</Label><Input type="number" min="1" max={MAX_EXPENSE_AMOUNT} value={editData.amount || ""} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} required /></div>
                  <div><Label>Date</Label><Input type="date" max={toISODate(new Date())} value={editData.date || ""} onChange={(e) => setEditData({ ...editData, date: e.target.value })} required /></div>
                </>
              )}
              <div><Label>Notes</Label><Input value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} /></div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Stop Recurring Expense Modal */}
        <Dialog open={stopOpen} onOpenChange={setStopOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Stop Recurring Expense</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">This will stop generating new expense entries from this date forward. Past entries will be preserved for accurate historical tracking.</p>
              <div><Label>Stop Date</Label><Input type="date" max={toISODate(new Date())} value={stopDate} onChange={(e) => setStopDate(e.target.value)} /></div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <Button className="w-full" onClick={confirmStop} disabled={submitting}>{submitting ? "Processing..." : "Confirm Stop"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
