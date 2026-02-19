import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import investmentService from '../features/investments/investmentService';
import { Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentInvestment, setCurrentInvestment] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: '',
        description: ''
    });

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            try {
                const data = await investmentService.getInvestments(user.token);
                setInvestments(data);
            } catch (error) {
                console.error("Error fetching investments:", error);
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            try {
                if (currentInvestment) {
                    await investmentService.updateInvestment(currentInvestment._id, formData, user.token);
                    setIsEditOpen(false);
                    setCurrentInvestment(null);
                } else {
                    await investmentService.createInvestment(formData, user.token);
                }
                setFormData({ category: '', amount: '', date: '', description: '' });
                fetchInvestments();
            } catch (error) {
                console.error("Error saving investment:", error);
            }
        }
    };

    const handleEditClick = (investment) => {
        setCurrentInvestment(investment);
        setFormData({
            category: investment.category,
            amount: investment.amount,
            date: investment.date.split('T')[0],
            description: investment.description
        });
        setIsEditOpen(true);
    };

    const handleDelete = async (id) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            try {
                await investmentService.deleteInvestment(id, user.token);
                setInvestments(investments.filter(inv => inv._id !== id));
            } catch (error) {
                console.error("Error deleting investment:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar variant="auth" />
            <div className="container mx-auto py-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold mb-8">Manage Investments</h1>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Add Investment Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-1"
                    >
                        <Card className="h-fit sticky top-24">
                            <CardHeader>
                                <CardTitle>Add New Investment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Type/Category</Label>
                                        <Input id="category" placeholder="e.g. Stocks, Crypto" value={formData.category} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount (₹)</Label>
                                        <Input id="amount" type="number" placeholder="0.00" value={formData.amount} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Input id="description" placeholder="Details..." value={formData.description} onChange={handleChange} />
                                    </div>
                                    <Button type="submit" className="w-full flex items-center gap-2">
                                        <Plus size={16} /> Add Investment
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Investments List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-2"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Investments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {investments.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No investments found.</p>
                                    ) : (
                                        investments.map((inv) => (
                                            <motion.div
                                                layout
                                                key={inv._id}
                                                className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-muted/50 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold">{inv.category}</p>
                                                    <p className="text-sm text-muted-foreground">{new Date(inv.date).toLocaleDateString()} - {inv.description}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-green-500">+₹{inv.amount}</span>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(inv)} className="text-muted-foreground hover:text-primary">
                                                            <Edit2 size={16} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(inv._id)} className="text-muted-foreground hover:text-destructive">
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Investment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" placeholder="e.g. Stocks" value={formData.category} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (₹)</Label>
                                <Input id="amount" type="number" placeholder="0.00" value={formData.amount} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input id="description" placeholder="Details..." value={formData.description} onChange={handleChange} />
                            </div>
                            <Button type="submit" className="w-full">Update Investment</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
