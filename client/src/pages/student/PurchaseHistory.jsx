import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CreditCard, Download, ExternalLink, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const PurchaseHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/payment/my-history');
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <CreditCard size={32} className="text-brand-primary" />
                    Purchase History
                </h1>
                <p className="text-dark-muted mt-2">Track your orders and invoices</p>
            </header>

            {loading ? (
                <div className="text-center py-20 text-dark-muted">Loading history...</div>
            ) : history.length === 0 ? (
                <div className="text-center py-20 bg-dark-layer1 border border-white/10 rounded-3xl">
                    <CreditCard size={48} className="mx-auto text-dark-muted opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Purchases Yet</h3>
                    <p className="text-dark-muted mt-2">Your course purchases will appear here.</p>
                </div>
            ) : (
                <div className="bg-dark-layer1 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-dark-muted uppercase text-xs font-black tracking-wider">
                                <tr>
                                    <th className="p-6">Course</th>
                                    <th className="p-6">Date</th>
                                    <th className="p-6">Order ID</th>
                                    <th className="p-6">Amount</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.map(item => (
                                    <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-dark-layer2 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.courseId?.thumbnail && (
                                                        <img src={item.courseId.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{item.courseId?.title || 'Unknown Course'}</p>
                                                    <p className="text-xs text-dark-muted">{item.paymentMethod}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm text-dark-muted whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-mono text-dark-muted">
                                            {item.transactionId || item._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="p-6 font-black text-white">
                                            ${item.amount.toFixed(2)}
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center w-fit gap-1.5 ${getStatusColor(item.status)}`}>
                                                {item.status === 'completed' && <CheckCircle size={12} />}
                                                {item.status === 'pending' && <Clock size={12} />}
                                                {item.status === 'failed' && <XCircle size={12} />}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button className="p-2 text-dark-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Download Invoice">
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseHistory;
