import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Calendar, ArrowUpDown, Download } from 'lucide-react';
import dashboardService from '../features/dashboard/dashboardService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge'; // Create/Use Badge
import { Input } from '../components/ui/input';

const TransactionsPage = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all',
        sort: 'date',
        order: 'desc',
        limit: 50,
        timeRange: 'all' // all, 30d, 90d, year
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                try {
                    // Calculate date range
                    let fromDate = null;
                    const now = new Date();
                    if (filters.timeRange === '30d') {
                        fromDate = new Date(now.setDate(now.getDate() - 30));
                    } else if (filters.timeRange === '90d') {
                        fromDate = new Date(now.setDate(now.getDate() - 90));
                    } else if (filters.timeRange === 'year') {
                        fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    }

                    const params = {
                        type: filters.type,
                        sort: filters.sort,
                        order: filters.order,
                        limit: filters.limit,
                        ...(fromDate && { from: fromDate.toISOString() })
                    };

                    const data = await dashboardService.getRecentTransactions(user.token, params);
                    setTransactions(data);
                } catch (error) {
                    console.error("Failed to fetch transactions", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTransactions();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, limit: 50 })); // Reset limit on filter change
    };

    const loadMore = () => {
        setFilters(prev => ({ ...prev, limit: prev.limit + 50 }));
    };

    return (
        <div className="min-h-screen bg-background p-6 lg:p-12">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Transactions History</h1>
                            <p className="text-muted-foreground">View and manage your financial activity.</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <Card>
                    <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Type Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <select
                                    className="bg-background border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="expense">Expenses Only</option>
                                    <option value="investment">Investments Only</option>
                                </select>
                            </div>

                            {/* Time Range */}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <select
                                    className="bg-background border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={filters.timeRange}
                                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                                >
                                    <option value="all">All Time</option>
                                    <option value="30d">Last 30 Days</option>
                                    <option value="90d">Last 3 Months</option>
                                    <option value="year">Last Year</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                <select
                                    className="bg-background border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={`${filters.sort}-${filters.order}`}
                                    onChange={(e) => {
                                        const [sort, order] = e.target.value.split('-');
                                        setFilters(prev => ({ ...prev, sort, order, limit: 50 }));
                                    }}
                                >
                                    <option value="date-desc">Newest First</option>
                                    <option value="date-asc">Oldest First</option>
                                    <option value="amount-desc">Highest Amount</option>
                                    <option value="amount-asc">Lowest Amount</option>
                                </select>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Showing {transactions.length} results
                        </div>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    {transactions.length === 0 && !loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No transactions found matching your filters.
                        </div>
                    ) : (
                        transactions.map((item) => (
                            <Card key={item.id} className="transition-all hover:bg-accent/5">
                                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex gap-4 items-center">
                                        <div className={`p-2 rounded-full ${item.type === 'expense' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                            {item.type === 'expense' ? <ArrowUpDown className="h-5 w-5 rotate-180" /> : <ArrowUpDown className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                {' · '}
                                                <span className="capitalize">{item.category || item.type}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${item.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {item.type === 'expense' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
                                        </p>
                                        {item.asset && (
                                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full inline-block mt-1">
                                                {item.asset}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Load More */}
                {transactions.length >= filters.limit && (
                    <div className="flex justify-center pt-4">
                        <Button variant="outline" onClick={loadMore} disabled={loading}>
                            {loading ? 'Loading...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
