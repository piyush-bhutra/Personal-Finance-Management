import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import expenseService from '../features/expenses/expenseService';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: '',
        description: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            try {
                const data = await expenseService.getExpenses(user.token);
                setExpenses(data);
            } catch (error) {
                console.error("Error fetching expenses:", error);
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
                if (currentExpense) {
                    await expenseService.updateExpense(currentExpense._id, formData, user.token);
                    setIsEditOpen(false);
                    setCurrentExpense(null);
                } else {
                    await expenseService.createExpense(formData, user.token);
                }
                setFormData({ category: '', amount: '', date: '', description: '' });
                fetchExpenses();
            } catch (error) {
                console.error("Error saving expense:", error);
            }
        }
    };

    const handleEditClick = (expense) => {
        setCurrentExpense(expense);
        setFormData({
            category: expense.category,
            amount: expense.amount,
            date: expense.date.split('T')[0], // Format date for input
            description: expense.description
        });
        setIsEditOpen(true);
    };

    const handleDelete = async (id) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            try {
                await expenseService.deleteExpense(id, user.token);
                setExpenses(expenses.filter(expense => expense._id !== id));
            } catch (error) {
                console.error("Error deleting expense:", error);
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
                    <h1 className="text-3xl font-bold mb-8">Manage Expenses</h1>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Add Expense Form */}
                    <motion.div
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
                                        <Input id="category" placeholder="e.g. Food, Rent" value={formData.category} onChange={handleChange} required />
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
                                        <Plus size={16} /> Add Expense
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Expenses List */}
                    <motion.div
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
                                <div className="space-y-4">
                                    {expenses.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No expenses found.</p>
                                    ) : (
                                        expenses.map((expense) => (
                                            <motion.div
                                                layout
                                                key={expense._id}
                                                className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-muted/50 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold">{expense.category}</p>
                                                    <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()} - {expense.description}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-red-500">-₹{expense.amount}</span>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(expense)} className="text-muted-foreground hover:text-primary">
                                                            <Edit2 size={16} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(expense._id)} className="text-muted-foreground hover:text-destructive">
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
                            <DialogTitle>Edit Expense</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" placeholder="e.g. Food, Rent" value={formData.category} onChange={handleChange} required />
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
                            <Button type="submit" className="w-full">Update Expense</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
