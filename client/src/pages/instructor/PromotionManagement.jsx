import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Calendar, Users, Zap, Loader2, Search, Percent, DollarSign, X } from 'lucide-react';
import api from '../../utils/api';

const PromotionManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: '0',
        minPurchase: '0'
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await api.get('/mega/coupons');
            setCoupons(response.data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/mega/coupons', {
                ...formData,
                discountValue: Number(formData.discountValue),
                usageLimit: Number(formData.usageLimit),
                minPurchase: Number(formData.minPurchase)
            });
            fetchCoupons();
            setShowModal(false);
            resetForm();
        } catch (error) {
            alert('Error creating coupon: ' + error.response?.data?.message || error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: '',
            usageLimit: '0',
            minPurchase: '0'
        });
    };

    if (loading) return <div className="flex items-center justify-center h-96 text-white"><Loader2 className="animate-spin mr-2" /> Loading Promotions...</div>;

    return (
        <div className="space-y-8 p-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white">Promotion Hub</h1>
                    <p className="text-dark-muted">Drive sales with custom discount codes and seasonal offers</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-dark-bg font-bold rounded-xl hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20"
                >
                    <Plus size={20} /> Create New Coupon
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <div key={coupon._id} className="bg-dark-layer1 border border-white/10 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-110 transition-transform">
                            <Tag size={120} className="text-white" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase border border-brand-primary/20">
                                {coupon.code}
                            </div>
                            <button className="p-2 hover:bg-red-500/10 rounded-xl text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white">
                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                <span className="text-sm text-dark-muted font-bold ml-2">OFF</span>
                            </p>
                            <p className="text-xs text-dark-muted font-medium">Applied to All Courses</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest flex items-center gap-2"><Users size={12} /> Usage</p>
                                <p className="text-sm font-bold text-white">{coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest flex items-center gap-2"><Calendar size={12} /> Expires</p>
                                <p className="text-sm font-bold text-white">{new Date(coupon.validUntil).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {coupons.length === 0 && (
                    <div className="col-span-3 py-32 bg-dark-layer1/30 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-dark-muted"><Tag size={40} /></div>
                        <div className="text-center">
                            <p className="text-white font-black text-xl">Boost Your Course Growth</p>
                            <p className="text-dark-muted text-sm mt-1">Create your first discount code to attract new students</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-dark-layer1 border border-white/10 w-full max-w-lg rounded-[3rem] p-12 overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black text-white">New Promotion</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-dark-muted"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Coupon Code</label>
                                <input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white font-black tracking-widest focus:outline-none focus:border-brand-primary uppercase" placeholder="e.g. ORBITFLOW50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Type</label>
                                    <div className="flex bg-dark-layer2 p-1.5 rounded-2xl border border-white/5">
                                        <button type="button" onClick={() => setFormData({ ...formData, discountType: 'percentage' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${formData.discountType === 'percentage' ? 'bg-brand-primary text-dark-bg' : 'text-dark-muted hover:text-white'}`}>
                                            <Percent size={18} /> <span className="text-xs font-black">PERCENT</span>
                                        </button>
                                        <button type="button" onClick={() => setFormData({ ...formData, discountType: 'fixed' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${formData.discountType === 'fixed' ? 'bg-brand-primary text-dark-bg' : 'text-dark-muted hover:text-white'}`}>
                                            <DollarSign size={18} /> <span className="text-xs font-black">FIXED</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Value</label>
                                    <input type="number" required value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none" placeholder={formData.discountType === 'percentage' ? '50%' : '$50'} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Valid Until</label>
                                    <input type="date" required value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Usage Limit</label>
                                    <input type="number" value={formData.usageLimit} onChange={e => setFormData({ ...formData, usageLimit: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none" placeholder="0 for unlimited" />
                                </div>
                            </div>
                            <div className="pt-6">
                                <button type="submit" className="w-full py-5 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover shadow-xl shadow-brand-primary/20 transition-all uppercase tracking-[0.2em]">Activate Promotion</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionManagement;
