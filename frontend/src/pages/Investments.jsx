import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import investmentService from '../features/investments/investmentService';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, RefreshCw, Zap, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────── Helpers ─────── */
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const nowYM = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const SELECT_CLS =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ' +
    'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const ASSET_TYPES = ['Stock', 'Crypto', 'Real Estate', 'Bond', 'Mutual Fund', 'Fixed Deposit', 'Gold', 'SIP', 'Other'];

/* ─────── Default form states ─────── */
const RECURRING_DEFAULTS = {
    investmentMode: 'recurring',
    assetName: '',
    type: 'Mutual Fund',
    monthlyAmount: '',
    startDate: '',
    expectedReturnRate: '',
    description: '',
};

const ONETIME_DEFAULTS = {
    investmentMode: 'one-time',
    assetName: '',
    type: 'Stock',
    amount: '',
    date: '',
    expectedReturnRate: '',
    description: '',
};

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add form
    const [mode, setMode] = useState('recurring'); // 'recurring' | 'one-time'
    const [formData, setFormData] = useState(RECURRING_DEFAULTS);

    // Edit
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editData, setEditData] = useState({});
    // Month picker for edit/delete of recurring
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // { type: 'edit'|'delete', id, data? }
    const [fromDate, setFromDate] = useState(nowYM());

    /* ─── Fetch ─── */
    const getToken = () => JSON.parse(localStorage.getItem('user'))?.token;

    const fetchInvestments = async () => {
        const token = getToken();
        if (!token) return;
        setLoading(true);
        try {
            const data = await investmentService.getInvestments(token);
            setInvestments(data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvestments(); }, []);

    /* ─── Mode switch ─── */
    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        setFormData(newMode === 'recurring' ? RECURRING_DEFAULTS : ONETIME_DEFAULTS);
    };

    /* ─── Add Investment ─── */
    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;
        try {
            await investmentService.createInvestment(formData, token);
            setFormData(mode === 'recurring' ? RECURRING_DEFAULTS : ONETIME_DEFAULTS);
            fetchInvestments();
        } catch (err) {
            console.error('Create error:', err);
        }
    };

    /* ─── Edit ─── */
    const openEdit = (inv) => {
        setEditTarget(inv);
        if (inv.investmentMode === 'recurring') {
            setEditData({
                monthlyAmount: inv.monthlyAmount,
                assetName: inv.assetName,
                type: inv.type,
                expectedReturnRate: inv.expectedReturnRate ?? 12,
                description: inv.description ?? '',
            });
        } else {
            setEditData({
                amount: inv.amount,
                assetName: inv.assetName,
                type: inv.type,
                date: inv.date ? inv.date.split('T')[0] : '',
                expectedReturnRate: inv.expectedReturnRate ?? 10,
                description: inv.description ?? '',
            });
        }
        if (inv.investmentMode === 'recurring') {
            // Need to ask "from which month?"
            setFromDate(nowYM());
            setPendingAction({ type: 'edit', id: inv._id });
            setFromDateOpen(true);
        } else {
            setEditOpen(true);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;
        try {
            const payload = { ...editData };
            if (editTarget.investmentMode === 'recurring') payload.fromDate = fromDate;
            await investmentService.updateInvestment(editTarget._id, payload, token);
            setEditOpen(false);
            setEditTarget(null);
            fetchInvestments();
        } catch (err) {
            console.error('Edit error:', err);
        }
    };

    /* ─── Delete ─── */
    const handleDelete = (inv) => {
        if (inv.investmentMode === 'recurring') {
            setFromDate(nowYM());
            setPendingAction({ type: 'delete', id: inv._id });
            setFromDateOpen(true);
        } else {
            confirmDelete(inv._id, null);
        }
    };

    const confirmDelete = async (id, fd) => {
        const token = getToken();
        if (!token) return;
        try {
            await investmentService.deleteInvestment(id, token, fd);
            setInvestments((prev) => prev.filter((i) => i._id !== id));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    /* ─── From-date dialog: confirm ─── */
    const confirmFromDateAction = () => {
        setFromDateOpen(false);
        if (!pendingAction) return;
        if (pendingAction.type === 'delete') {
            confirmDelete(pendingAction.id, fromDate);
        } else if (pendingAction.type === 'edit') {
            setEditOpen(true);
        }
        setPendingAction(null);
    };

    /* ─────────────────────── RENDER ─────────────────────── */
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar variant="auth" />
            <div className="container mx-auto py-10 px-4 max-w-6xl">

                <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold mb-8"
                >
                    Investments
                </motion.h1>

                <div className="grid md:grid-cols-3 gap-8">

                    {/* ── Add Form ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }} className="md:col-span-1"
                    >
                        <Card className="sticky top-24">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Add Investment</CardTitle>
                                {/* Mode toggle */}
                                <div className="flex mt-2 rounded-lg border border-border overflow-hidden">
                                    {['recurring', 'one-time'].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleModeSwitch(m)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors
                                                ${mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                                        >
                                            {m === 'recurring' ? <RefreshCw size={12} /> : <Zap size={12} />}
                                            {m === 'recurring' ? 'Recurring' : 'One-Time'}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    {/* Asset name */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="assetName">Asset Name</Label>
                                        <Input id="assetName" placeholder="e.g. Nifty 50 Index Fund"
                                            value={formData.assetName} onChange={handleChange} required />
                                    </div>
                                    {/* Type */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="type">Type</Label>
                                        <select id="type" className={SELECT_CLS}
                                            value={formData.type} onChange={handleChange} required>
                                            {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    {mode === 'recurring' ? (
                                        <>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="monthlyAmount">Monthly Amount (₹)</Label>
                                                <Input id="monthlyAmount" type="number" min="1" placeholder="5000"
                                                    value={formData.monthlyAmount} onChange={handleChange} required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="startDate">Start Date</Label>
                                                <Input id="startDate" type="date"
                                                    value={formData.startDate} onChange={handleChange} required />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="amount">Amount (₹)</Label>
                                                <Input id="amount" type="number" min="1" placeholder="50000"
                                                    value={formData.amount} onChange={handleChange} required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="date">Investment Date</Label>
                                                <Input id="date" type="date"
                                                    value={formData.date} onChange={handleChange} required />
                                            </div>
                                        </>
                                    )}

                                    {/* Expected return */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="expectedReturnRate">Expected Return (% p.a.)</Label>
                                        <Input id="expectedReturnRate" type="number" step="0.1" min="0" max="100"
                                            placeholder="12" value={formData.expectedReturnRate} onChange={handleChange} />
                                    </div>
                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="description">Notes (optional)</Label>
                                        <Input id="description" placeholder="Details..."
                                            value={formData.description} onChange={handleChange} />
                                    </div>

                                    <Button type="submit" className="w-full flex items-center gap-2 mt-1">
                                        <Plus size={15} />
                                        Add {mode === 'recurring' ? 'Recurring' : 'One-Time'} Investment
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* ── Investments List ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }} className="md:col-span-2 space-y-4"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                                Loading…
                            </div>
                        ) : investments.length === 0 ? (
                            <Card>
                                <CardContent className="py-16 text-center text-muted-foreground">
                                    No investments yet. Add one on the left.
                                </CardContent>
                            </Card>
                        ) : (
                            <AnimatePresence>
                                {investments.map((inv) => {
                                    const isUp = (inv.gain ?? 0) >= 0;
                                    const activeEntries = (inv.entries ?? []).filter((e) => e.isActive);
                                    return (
                                        <motion.div
                                            key={inv._id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <Card className="border-border hover:shadow-sm transition-shadow">
                                                <CardContent className="pt-5 pb-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        {/* Left info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-semibold truncate">{inv.assetName}</p>
                                                                <Badge variant="secondary" className="text-xs shrink-0">{inv.type}</Badge>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-xs shrink-0 ${inv.investmentMode === 'recurring' ? 'border-blue-500/40 text-blue-500' : 'border-amber-500/40 text-amber-500'}`}
                                                                >
                                                                    {inv.investmentMode === 'recurring' ? <RefreshCw size={10} className="inline mr-1" /> : <Zap size={10} className="inline mr-1" />}
                                                                    {inv.investmentMode === 'recurring' ? 'Recurring' : 'One-Time'}
                                                                </Badge>
                                                            </div>

                                                            <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                                                {inv.investmentMode === 'recurring' ? (
                                                                    <>
                                                                        <span>{fmt(inv.monthlyAmount)}/mo</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <CalendarDays size={11} />
                                                                            {activeEntries.length} month{activeEntries.length !== 1 ? 's' : ''}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="flex items-center gap-1">
                                                                        <CalendarDays size={11} />
                                                                        {inv.date ? new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                                    </span>
                                                                )}
                                                                {inv.expectedReturnRate > 0 && (
                                                                    <span>{inv.expectedReturnRate}% p.a.</span>
                                                                )}
                                                                {inv.description && <span className="italic truncate max-w-[160px]">{inv.description}</span>}
                                                            </div>
                                                        </div>

                                                        {/* Right financials */}
                                                        <div className="text-right shrink-0">
                                                            <p className="text-xs text-muted-foreground">Invested</p>
                                                            <p className="font-bold">{fmt(inv.totalInvested)}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">Current</p>
                                                            <p className="font-semibold">{fmt(inv.currentValue)}</p>
                                                            <div className={`flex items-center justify-end gap-1 text-xs font-medium mt-1 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                                {isUp ? '+' : ''}{fmt(inv.gain)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-border">
                                                        <Button variant="ghost" size="sm" onClick={() => openEdit(inv)}
                                                            className="text-muted-foreground hover:text-primary h-7 px-2 text-xs gap-1">
                                                            <Edit2 size={12} /> Edit
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(inv)}
                                                            className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs gap-1">
                                                            <Trash2 size={12} /> Delete
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* ── "From which month?" Dialog ── */}
            <Dialog open={fromDateOpen} onOpenChange={setFromDateOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {pendingAction?.type === 'delete' ? 'Stop from which month?' : 'Edit from which month?'}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {pendingAction?.type === 'delete'
                            ? 'Entries before this month will be preserved.'
                            : 'Only entries from this month onward will be changed. Earlier entries remain unchanged.'}
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="fromDatePicker">Month</Label>
                        <Input id="fromDatePicker" type="month"
                            value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="outline" onClick={() => setFromDateOpen(false)}>Cancel</Button>
                        <Button
                            onClick={confirmFromDateAction}
                            variant={pendingAction?.type === 'delete' ? 'destructive' : 'default'}
                        >
                            {pendingAction?.type === 'delete' ? 'Stop Investment' : 'Continue Editing'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Edit — {editTarget?.assetName}
                            {editTarget?.investmentMode === 'recurring' && (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">from {fromDate}</span>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-3">
                        <div className="space-y-1.5">
                            <Label>Asset Name</Label>
                            <Input value={editData.assetName ?? ''} onChange={(e) => setEditData({ ...editData, assetName: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Type</Label>
                            <select className={SELECT_CLS} value={editData.type ?? 'Stock'} onChange={(e) => setEditData({ ...editData, type: e.target.value })}>
                                {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        {editTarget?.investmentMode === 'recurring' ? (
                            <div className="space-y-1.5">
                                <Label>Monthly Amount (₹)</Label>
                                <Input type="number" min="1" value={editData.monthlyAmount ?? ''}
                                    onChange={(e) => setEditData({ ...editData, monthlyAmount: e.target.value })} required />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <Label>Amount (₹)</Label>
                                    <Input type="number" min="1" value={editData.amount ?? ''}
                                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Date</Label>
                                    <Input type="date" value={editData.date ?? ''}
                                        onChange={(e) => setEditData({ ...editData, date: e.target.value })} />
                                </div>
                            </>
                        )}
                        <div className="space-y-1.5">
                            <Label>Expected Return (% p.a.)</Label>
                            <Input type="number" step="0.1" min="0" max="100" value={editData.expectedReturnRate ?? ''}
                                onChange={(e) => setEditData({ ...editData, expectedReturnRate: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes</Label>
                            <Input value={editData.description ?? ''}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                        </div>
                        <Button type="submit" className="w-full mt-1">Save Changes</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
