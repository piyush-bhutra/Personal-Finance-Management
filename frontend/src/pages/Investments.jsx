import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Download } from "lucide-react";
import investmentService from "../features/investments/investmentService";
import { formatCurrency, formatDate, toISODate } from "../lib/format";
import { exportToCSV } from "../utils/exportToCSV";

const ASSET_TYPES = ["Stock", "Crypto", "Real Estate", "Bond", "Mutual Fund", "Fixed Deposit", "Gold", "SIP", "Other"];
const MAX_AMOUNT = 100000000;
const MAX_RETURN = 100;

const recurringDefaults = { investmentMode: "recurring", assetName: "", type: "Mutual Fund", monthlyAmount: "", startDate: "", expectedReturnRate: "", description: "" };
const oneTimeDefaults = { investmentMode: "one-time", assetName: "", type: "Stock", amount: "", date: "", expectedReturnRate: "", description: "" };

const nowYM = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("recurring");
  const [formData, setFormData] = useState(recurringDefaults);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editData, setEditData] = useState({});
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [fromDate, setFromDate] = useState(nowYM());
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const [stopOpen, setStopOpen] = useState(false);
  const [stopTarget, setStopTarget] = useState(null);
  const [stopDate, setStopDate] = useState(toISODate(new Date()));
  const [realizedValue, setRealizedValue] = useState("");

  const loadInvestments = async () => {
    setLoading(true);
    setApiError("");
    try {
      const data = await investmentService.getInvestments();
      setInvestments(data || []);
    } catch (error) {
      const msg = error.response?.data?.message || "Unable to load investments right now. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const isFutureDate = (v) => {
    const d = new Date(v);
    const t = new Date();
    t.setHours(23, 59, 59, 999);
    return Number.isNaN(d.getTime()) || d > t;
  };

  const validateCommon = (assetName, returnRate) => {
    if (!assetName?.trim()) return "Asset name is required.";
    if (returnRate !== "" && (Number(returnRate) < 0 || Number(returnRate) > MAX_RETURN)) return `Expected return must be between 0 and ${MAX_RETURN}.`;
    return "";
  };

  const validateCreate = () => {
    const common = validateCommon(formData.assetName, formData.expectedReturnRate);
    if (common) return common;
    if (mode === "recurring") {
      const m = Number(formData.monthlyAmount);
      if (!Number.isFinite(m) || m <= 0 || m > MAX_AMOUNT) return "Monthly amount must be between 1 and 100000000.";
      if (!formData.startDate || isFutureDate(formData.startDate)) return "Start date is required and cannot be in the future.";
    } else {
      const a = Number(formData.amount);
      if (!Number.isFinite(a) || a <= 0 || a > MAX_AMOUNT) return "Amount must be between 1 and 100000000.";
      if (!formData.date || isFutureDate(formData.date)) return "Investment date is required and cannot be in the future.";
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
      const payload = { ...formData, assetName: formData.assetName.trim() };
      await investmentService.createInvestment(payload);
      setFormData(mode === "recurring" ? recurringDefaults : oneTimeDefaults);
      await loadInvestments();
    } catch (error) {
      const msg = error.response?.data?.message || "Could not save investment. Please check values and try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (inv) => {
    setEditTarget(inv);
    if (inv.investmentMode === "recurring") {
      setEditData({ assetName: inv.assetName, type: inv.type, monthlyAmount: inv.monthlyAmount, expectedReturnRate: inv.expectedReturnRate ?? "", description: inv.description ?? "" });
      setFromDate(nowYM());
      setFromDateOpen(true);
    } else {
      setEditData({ assetName: inv.assetName, type: inv.type, amount: inv.amount, date: toISODate(inv.date), expectedReturnRate: inv.expectedReturnRate ?? "", description: inv.description ?? "" });
      setEditOpen(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const common = validateCommon(editData.assetName, editData.expectedReturnRate);
    if (common) return setFormError(common);
    if (editTarget.investmentMode === "recurring" && (Number(editData.monthlyAmount) <= 0 || Number(editData.monthlyAmount) > MAX_AMOUNT)) return setFormError("Monthly amount must be between 1 and 100000000.");
    if (editTarget.investmentMode === "one-time") {
      if (Number(editData.amount) <= 0 || Number(editData.amount) > MAX_AMOUNT) return setFormError("Amount must be between 1 and 100000000.");
      if (!editData.date || isFutureDate(editData.date)) return setFormError("Valid non-future date is required.");
    }

    setSubmitting(true);
    setFormError("");
    setApiError("");
    try {
      const payload = { ...editData, assetName: editData.assetName.trim() };
      if (editTarget.investmentMode === "recurring") payload.fromDate = fromDate;
      await investmentService.updateInvestment(editTarget._id, payload);
      setEditOpen(false);
      setEditTarget(null);
      await loadInvestments();
    } catch (error) {
      const msg = error.response?.data?.message || "Could not update investment right now. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const doDelete = async (id, fd) => {
    setSubmitting(true);
    setApiError("");
    try {
      await investmentService.deleteInvestment(id, fd);
      setInvestments((prev) => prev.filter((x) => x._id !== id));
    } catch (error) {
      const msg = error.response?.data?.message || "Could not delete investment right now. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openStop = (inv) => {
    setStopTarget(inv);
    setStopDate(toISODate(new Date()));
    setRealizedValue(String(inv.currentValue || 0));
    setStopOpen(true);
  };

  const confirmStop = async () => {
    if (!stopDate || isFutureDate(stopDate)) return setFormError("Stop date cannot be in the future.");
    if (!Number.isFinite(Number(realizedValue)) || Number(realizedValue) < 0) return setFormError("Realized value must be 0 or greater.");
    setSubmitting(true);
    setFormError("");
    setApiError("");
    try {
      await investmentService.stopInvestment(stopTarget._id, { stopDate, realizedValue: Number(realizedValue) });
      setStopOpen(false);
      setStopTarget(null);
      await loadInvestments();
    } catch (error) {
      const msg = error.response?.data?.message || "Could not stop/sell investment right now. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const exportData = investments.map(inv => ({
      Name: inv.assetName,
      Category: inv.type,
      Mode: inv.investmentMode === 'recurring' ? 'Recurring (SIP)' : 'One-Time',
      Monthly_Amount: inv.investmentMode === 'recurring' ? inv.monthlyAmount : 'N/A',
      Principal_Invested: inv.totalInvested,
      Current_Value: inv.currentValue,
      Gain: inv.gain,
      Expected_Return_Pct: inv.expectedReturnRate || 0,
      Start_Date: inv.investmentMode === 'recurring' ? toISODate(inv.startDate) : toISODate(inv.date),
      Status: inv.status,
      Closed_Date: inv.status === 'closed' ? toISODate(inv.stopDate) : 'N/A'
    }));
    exportToCSV(exportData, 'My_Investments');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar variant="auth" />
      <div className="container mx-auto py-10 px-4 max-w-6xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Investments</h1>
          <Button variant="outline" onClick={handleExport} disabled={investments.length === 0}>
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
        </div>
        {apiError && <Card><CardContent className="py-4 text-sm text-red-500">{apiError}</CardContent></Card>}

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 h-fit sticky top-24">
            <CardHeader><CardTitle>Add Investment</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button type="button" variant={mode === "recurring" ? "default" : "outline"} onClick={() => { setMode("recurring"); setFormData(recurringDefaults); setFormError(""); }}>Recurring</Button>
                <Button type="button" variant={mode === "one-time" ? "default" : "outline"} onClick={() => { setMode("one-time"); setFormData(oneTimeDefaults); setFormError(""); }}>One-Time</Button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div><Label htmlFor="assetName">Asset Name</Label><Input id="assetName" value={formData.assetName} onChange={(e) => setFormData({ ...formData, assetName: e.target.value })} required /></div>
                <div><Label htmlFor="type">Type</Label><select id="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>{ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
                {mode === "recurring" ? (
                  <>
                    <div><Label htmlFor="monthlyAmount">Monthly Amount (INR)</Label><Input id="monthlyAmount" type="number" min="1" max={MAX_AMOUNT} value={formData.monthlyAmount} onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })} required /></div>
                    <div><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" max={toISODate(new Date())} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
                  </>
                ) : (
                  <>
                    <div><Label htmlFor="amount">Amount (INR)</Label><Input id="amount" type="number" min="1" max={MAX_AMOUNT} value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required /></div>
                    <div><Label htmlFor="date">Investment Date</Label><Input id="date" type="date" max={toISODate(new Date())} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
                  </>
                )}
                <div><Label htmlFor="expectedReturnRate">Expected Return (% p.a.)</Label><Input id="expectedReturnRate" type="number" step="0.1" min="0" max={MAX_RETURN} value={formData.expectedReturnRate} onChange={(e) => setFormData({ ...formData, expectedReturnRate: e.target.value })} /></div>
                <div><Label htmlFor="description">Notes</Label><Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                {formError && <p className="text-sm text-red-500">{formError}</p>}
                <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Saving..." : "Add Investment"}</Button>
              </form>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-4">
            {loading ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">Loading investments...</CardContent></Card>
            ) : investments.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">No investments yet. Add one to get started.</CardContent></Card>
            ) : (
              investments.map((inv) => (
                <Card key={inv._id}>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{inv.assetName} <span className="text-xs text-muted-foreground">({inv.type})</span></p>
                        <p className="text-xs text-muted-foreground">{inv.investmentMode === "recurring" ? `${formatCurrency(inv.monthlyAmount)}/mo` : `Date: ${formatDate(inv.date)}`}{inv.status === "closed" ? ` • Closed on ${formatDate(inv.stopDate)}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Invested</p>
                        <p className="font-semibold">{formatCurrency(inv.totalInvested)}</p>
                        <p className="text-xs text-muted-foreground">{inv.status === "closed" ? "Realized" : "Current"}</p>
                        <p className="font-semibold">{formatCurrency(inv.currentValue)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {inv.status !== "closed" && <Button variant="outline" size="sm" onClick={() => openEdit(inv)}>Edit</Button>}
                      {inv.status !== "closed" && <Button variant="outline" size="sm" onClick={() => openStop(inv)}>Stop/Sell</Button>}
                      <Button variant="destructive" size="sm" onClick={() => inv.investmentMode === "recurring" ? (setPendingDeleteId(inv._id), setFromDate(nowYM()), setFromDateOpen(true)) : doDelete(inv._id, null)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={fromDateOpen} onOpenChange={setFromDateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Select Month</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="fromDate">From Month</Label>
            <Input id="fromDate" type="month" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFromDateOpen(false)}>Cancel</Button>
            <Button onClick={() => { setFromDateOpen(false); pendingDeleteId ? doDelete(pendingDeleteId, fromDate) : setEditOpen(true); setPendingDeleteId(""); }}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Investment</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <div><Label>Asset Name</Label><Input value={editData.assetName || ""} onChange={(e) => setEditData({ ...editData, assetName: e.target.value })} /></div>
            <div><Label>Type</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editData.type || "Stock"} onChange={(e) => setEditData({ ...editData, type: e.target.value })}>{ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            {editTarget?.investmentMode === "recurring" ? (
              <div><Label>Monthly Amount (INR)</Label><Input type="number" min="1" max={MAX_AMOUNT} value={editData.monthlyAmount || ""} onChange={(e) => setEditData({ ...editData, monthlyAmount: e.target.value })} /></div>
            ) : (
              <>
                <div><Label>Amount (INR)</Label><Input type="number" min="1" max={MAX_AMOUNT} value={editData.amount || ""} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} /></div>
                <div><Label>Date</Label><Input type="date" max={toISODate(new Date())} value={editData.date || ""} onChange={(e) => setEditData({ ...editData, date: e.target.value })} /></div>
              </>
            )}
            <div><Label>Expected Return (% p.a.)</Label><Input type="number" step="0.1" min="0" max={MAX_RETURN} value={editData.expectedReturnRate || ""} onChange={(e) => setEditData({ ...editData, expectedReturnRate: e.target.value })} /></div>
            <div><Label>Notes</Label><Input value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} /></div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={stopOpen} onOpenChange={setStopOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Stop/Sell Investment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Stop Date</Label><Input type="date" max={toISODate(new Date())} value={stopDate} onChange={(e) => setStopDate(e.target.value)} /></div>
            <div><Label>Realized Value (INR)</Label><Input type="number" min="0" value={realizedValue} onChange={(e) => setRealizedValue(e.target.value)} /></div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <Button className="w-full" onClick={confirmStop} disabled={submitting}>{submitting ? "Processing..." : "Confirm Stop/Sell"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
