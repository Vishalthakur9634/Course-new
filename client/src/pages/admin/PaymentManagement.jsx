import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { DollarSign, TrendingUp, CreditCard, Download, Calendar, Filter } from 'lucide-react';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        thisMonthRevenue: 0,
        transactionCount: 0,
        pendingPayouts: 0
    });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/admin/payments');
            setPayments(data);

            // Calculate stats
            const totalRevenue = data.reduce((sum, p) => sum + p.amount, 0);
            const thisMonth = new Date();
            thisMonth.setDate(1);
            const thisMonthRevenue = data
                .filter(p => new Date(p.createdAt) >= thisMonth)
                .reduce((sum, p) => sum + p.amount, 0);

            setStats({
                totalRevenue,
                thisMonthRevenue,
                transactionCount: data.length,
                pendingPayouts: data.filter(p => p.status === 'pending').length
            });
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        if (filterStatus === 'all') return true;
        return payment.status === filterStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading payments...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Payments & Payouts</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <DollarSign size={24} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-full">
                            <TrendingUp size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">This Month</p>
                            <p className="text-2xl font-bold text-white">${stats.thisMonthRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-full">
                            <CreditCard size={24} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Transactions</p>
                            <p className="text-2xl font-bold text-white">{stats.transactionCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-full">
                            <Calendar size={24} className="text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Pending Payouts</p>
                            <p className="text-2xl font-bold text-white">{stats.pendingPayouts}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex justify-between items-center">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-dark-layer1 border border-dark-layer2 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
                >
                    <option value="all">All Transactions</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>

                <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors">
                    <Download size={18} />
                    Export
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-dark-layer1 rounded-lg border border-dark-layer2 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-dark-layer2">
                        <tr>
                            <th className="text-left p-4 text-dark-muted font-medium">Transaction ID</th>
                            <th className="text-left p-4 text-dark-muted font-medium">User</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Course</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Amount</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Status</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map(payment => (
                            <tr key={payment._id} className="border-t border-dark-layer2 hover:bg-dark-layer2 transition-colors">
                                <td className="p-4">
                                    <p className="text-white font-mono text-sm">{payment._id.slice(-8)}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-white">{payment.userId?.name || 'Unknown'}</p>
                                    <p className="text-sm text-dark-muted">{payment.userId?.email || 'N/A'}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-white">{payment.courseId?.title || 'Course Deleted'}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-white font-bold">${payment.amount}</p>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <p className="text-white text-sm">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                    <p className="text-xs text-dark-muted">{new Date(payment.createdAt).toLocaleTimeString()}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredPayments.length === 0 && (
                <div className="text-center text-dark-muted py-10">
                    No transactions found.
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
