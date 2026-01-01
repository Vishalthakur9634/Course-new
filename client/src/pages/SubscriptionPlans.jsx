import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Rocket, Shield, Star, Infinity, Sparkles, Loader2, X, CheckCircle2, Target, Award, Activity } from 'lucide-react';
import api from '../utils/api';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const fallbackPlans = [
        {
            name: 'Standard Tier',
            price: 0,
            description: 'Essential access for developing professional fundamentals.',
            features: ['Public Curriculum Access', 'Community Forum Access', 'Standard Progress Reports'],
            icon: 'Shield',
            color: 'blue',
            border: 'border-blue-500/20'
        },
        {
            name: 'Professional Tier',
            price: 19.99,
            description: 'The industry-standard selection for career advancement.',
            features: ['Premium Domain Access', 'Verified Certifications', 'Strategic Study Groups', 'Synchronized Support'],
            icon: 'Zap',
            color: 'orange',
            isPopular: true
        },
        {
            name: 'Enterprise Tier',
            price: 49.99,
            description: 'High-fidelity mentorship for executive-level performance.',
            features: ['Everything in Professional', 'Strategic 1-on-1 Sessions', 'Early Registry Access'],
            icon: 'Award',
            color: 'purple'
        }
    ];

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/mega/plans');
                if (response.data && response.data.length > 0) {
                    setPlans(response.data);
                } else {
                    setPlans(fallbackPlans);
                }
            } catch (error) {
                console.error('Error fetching plans:', error);
                setPlans(fallbackPlans);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        // Simulate a subscription process
        setTimeout(() => setShowSuccess(true), 500);
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Shield': return Shield;
            case 'Zap': return Zap;
            case 'Award': return Award;
            case 'Rocket': return Target;
            case 'Crown': return Award;
            default: return Activity;
        }
    };

    const getColorClasses = (color) => {
        switch (color) {
            case 'blue': return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20 shadow-blue-500/5' };
            case 'orange': return { text: 'text-brand-primary', bg: 'bg-brand-primary/10', border: 'border-brand-primary/20 shadow-brand-primary/5' };
            case 'purple': return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20 shadow-purple-500/5' };
            default: return { text: 'text-brand-primary', bg: 'bg-brand-primary/10', border: 'border-brand-primary/20 shadow-brand-primary/5' };
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-24 py-16 px-4 md:px-8 relative pb-40 font-inter text-white">
            {/* Success Notification Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0a0a0a]/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#141414] border border-brand-primary/30 rounded-[2.5rem] p-12 max-w-md w-full text-center shadow-3xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-inner">
                            <CheckCircle2 className="text-green-500" size={48} />
                        </div>
                        <div className="space-y-4 mb-10">
                            <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Access Synchronized</h2>
                            <p className="text-dark-muted font-medium leading-relaxed opacity-80">Your enrollment into the <span className="text-white font-bold">{selectedPlan?.name}</span> has been processed successfully. Tier features are now active.</p>
                        </div>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full py-5 bg-brand-primary text-dark-bg font-bold rounded-2xl transition-all shadow-xl shadow-brand-primary/20 uppercase tracking-[0.2em] text-[11px] hover:brightness-110 active:scale-95 border border-brand-primary"
                        >
                            Execute Dashboard Transition
                        </button>
                    </div>
                </div>
            )}

            <header className="text-center space-y-8 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-[0.3em]">
                    <Target size={16} /> Performance Tier Matrix
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight uppercase leading-none">Optimize your <span className="text-brand-primary">Strategic</span> Growth</h1>
                    <p className="text-lg text-dark-muted font-medium leading-relaxed opacity-70">Select the performance tier designed to accelerate your technical domain mastery and professional advancement.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {plans.map((plan, i) => {
                    const Icon = getIcon(plan.icon);
                    const styles = getColorClasses(plan.color);
                    return (
                        <div key={i} className={`relative bg-[#141414] border-2 ${styles.border} rounded-[3rem] p-12 flex flex-col shadow-3xl transition-all duration-700 hover:-translate-y-3 group overflow-hidden`}>
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 py-3 px-10 bg-brand-primary text-dark-bg text-[10px] font-bold uppercase tracking-[0.3em] rounded-bl-[2rem] shadow-xl z-20">
                                    Strategic Choice
                                </div>
                            )}
                            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            <div className="space-y-10 flex-1 relative z-10">
                                <div className={`w-20 h-20 ${styles.bg} ${styles.text} rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                                    <Icon size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">{plan.name}</h3>
                                    <p className="text-sm text-dark-muted font-medium opacity-70 leading-relaxed pr-6">{plan.description}</p>
                                </div>
                                <div className="flex items-baseline gap-2 border-b border-white/5 pb-8">
                                    <span className="text-6xl font-bold text-white tracking-tighter">
                                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                                    </span>
                                    {plan.price > 0 && <span className="text-dark-muted font-bold text-lg opacity-40 uppercase tracking-widest">/mo</span>}
                                </div>
                                <ul className="space-y-5 pt-4">
                                    {plan.features.map((feat, j) => (
                                        <li key={j} className="flex items-start gap-4">
                                            <div className={`mt-1.5 w-6 h-6 rounded-lg ${styles.bg} flex items-center justify-center shrink-0 border border-white/5 shadow-md`}>
                                                <Check className={styles.text} size={14} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-white/80 font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                className={`w-full py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] mt-16 transition-all relative z-10 border shadow-2xl ${plan.isPopular
                                    ? 'bg-brand-primary text-dark-bg border-brand-primary hover:brightness-110 active:scale-95 shadow-brand-primary/20'
                                    : 'bg-[#0a0a0a] text-white border-white/10 hover:border-brand-primary/40 active:scale-95'
                                    }`}>
                                Initiate {plan.name} Access
                            </button>
                        </div>
                    );
                })}
            </div>

            <footer className="bg-[#141414] border border-white/5 rounded-[3.5rem] p-16 text-center max-w-5xl mx-auto space-y-12 shadow-3xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
                <div className="flex justify-center -space-x-4 mb-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-16 h-16 rounded-2xl border-4 border-[#0a0a0a] bg-[#141414] flex items-center justify-center overflow-hidden shadow-2xl transform hover:z-20 hover:-translate-y-2 transition-all cursor-pointer">
                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="professional" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                    <div className="w-16 h-16 rounded-2xl border-4 border-[#0a0a0a] bg-brand-primary flex items-center justify-center text-[10px] font-bold text-dark-bg shadow-2xl transform hover:-translate-y-2 transition-all cursor-pointer">
                        +10K
                    </div>
                </div>
                <div className="space-y-6">
                    <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase leading-none">Synchronized by 10,000+ <span className="text-brand-primary">Professionals</span></h3>
                    <p className="text-dark-muted font-medium text-lg italic opacity-70 max-w-3xl mx-auto leading-relaxed">"The Professional Tier has radically optimized my career trajectory. The strategic domain access and synchronized community engagement are unparalleled assets."</p>
                </div>
            </footer>
        </div>
    );
};

export default SubscriptionPlans;
