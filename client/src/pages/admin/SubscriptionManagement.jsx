import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Shield, Star, Rocket, Crown, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const SubscriptionManagement = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        period: 'monthly',
        description: '',
        features: '',
        icon: 'Rocket',
        color: 'blue',
        isPopular: false
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/mega/plans');
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            features: formData.features.split('\n').filter(f => f.trim() !== ''),
            price: Number(formData.price)
        };

        try {
            if (editingPlan) {
                await api.put(`/mega/plans/${editingPlan._id}`, data);
            } else {
                await api.post('/mega/plans', data);
            }
            fetchPlans();
            setShowModal(false);
            setEditingPlan(null);
            resetForm();
        } catch (error) {
            alert('Error saving plan: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this plan?')) {
            try {
                await api.put(`/mega/plans/${id}`, { isActive: false });
                fetchPlans();
            } catch (error) {
                alert('Error deactivating plan');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            period: 'monthly',
            description: '',
            features: '',
            icon: 'Rocket',
            color: 'blue',
            isPopular: false
        });
    };

    const openEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            ...plan,
            features: plan.features.join('\n')
        });
        setShowModal(true);
    };

    if (loading) return <div className="flex items-center justify-center h-96 text-white"><Loader2 className="animate-spin mr-2" /> Loading Plans...</div>;

    return (
        <div className="space-y-8 p-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white">Subscription Manager</h1>
                    <p className="text-dark-muted">Configure platform membership tiers and pricing</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingPlan(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-dark-bg font-bold rounded-xl hover:bg-brand-hover transition-all"
                >
                    <Plus size={20} /> Create New Plan
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan._id} className={`bg-dark-layer1 border border-white/10 rounded-3xl p-8 relative flex flex-col ${!plan.isActive ? 'opacity-50 grayscale' : ''}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl bg-${plan.color === 'blue' ? 'blue' : plan.color === 'orange' ? 'brand-primary' : 'purple'}-500/10 text-${plan.color === 'blue' ? 'blue' : plan.color === 'orange' ? 'brand-primary' : 'purple'}-400`}>
                                {plan.icon === 'Rocket' ? <Rocket size={24} /> : plan.icon === 'Shield' ? <Shield size={24} /> : <Crown size={24} />}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(plan)} className="p-2 hover:bg-white/5 rounded-lg text-white transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(plan._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="space-y-2 mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {plan.name}
                                {plan.isPopular && <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full">Popular</span>}
                            </h3>
                            <p className="text-sm text-dark-muted line-clamp-2">{plan.description}</p>
                        </div>
                        <div className="text-3xl font-black text-white mb-6">
                            ${plan.price}<span className="text-sm text-dark-muted font-normal">/{plan.period === 'monthly' ? 'mo' : plan.period === 'yearly' ? 'yr' : 'life'}</span>
                        </div>
                        <div className="space-y-3 flex-1">
                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Features</p>
                            {plan.features.slice(0, 3).map((f, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-dark-text/80">
                                    <Check size={12} className="text-brand-primary" /> {f}
                                </div>
                            ))}
                            {plan.features.length > 3 && <p className="text-[10px] text-dark-muted italic">+{plan.features.length - 3} more</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-dark-layer1 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 overflow-hidden">
                        <h2 className="text-2xl font-black text-white mb-8">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-muted uppercase">Plan Name</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-dark-layer2 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                                        placeholder="e.g. Orbit Pro"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-muted uppercase">Price ($)</label>
                                    <input
                                        type="number" required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-dark-layer2 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                                        placeholder="0 for free"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-muted uppercase">Period</label>
                                    <select
                                        value={formData.period}
                                        onChange={e => setFormData({ ...formData, period: e.target.value })}
                                        className="w-full bg-dark-layer2 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="lifetime">Lifetime</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-muted uppercase">Brand Color</label>
                                    <select
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full bg-dark-layer2 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none"
                                    >
                                        <option value="blue">Blue</option>
                                        <option value="orange">Orange</option>
                                        <option value="purple">Purple</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-muted uppercase">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-dark-layer2 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none h-24"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-muted uppercase">Features (One per line)</label>
                                <textarea
                                    required
                                    value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                    className="w-full bg-dark-layer2 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none h-32"
                                    placeholder="Access to courses\nUnlimited downloads..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isPopular}
                                    onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                                    className="w-4 h-4 accent-brand-primary"
                                />
                                <label className="text-sm text-white">Mark as Most Popular</label>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover transition-all">Save Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
