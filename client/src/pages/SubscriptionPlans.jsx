import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Rocket, Shield, Star, Infinity, Sparkles, Loader2, X, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const fallbackPlans = [
        {
            name: 'Pioneer',
            price: 0,
            description: 'Start your learning journey with essential access.',
            features: ['Access to Free Courses', 'Community Hub Access', 'Basic Progress Tracking'],
            icon: 'Rocket',
            color: 'blue',
            border: 'border-blue-500/20'
        },
        {
            name: 'Orbit Pro',
            price: 19.99,
            description: 'The most popular choice for dedicated learners.',
            features: ['Unlock All Premium Courses', 'Unlimited Certificates', 'Exclusive Study Groups', 'Priority Support'],
            icon: 'Shield',
            color: 'orange',
            isPopular: true
        },
        {
            name: 'Mastery Elite',
            price: 49.99,
            description: 'Unlimited power for high-performance careers.',
            features: ['Everything in Pro', '1-on-1 Mentorship Sessions', 'Early Access to New Courses'],
            icon: 'Crown',
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
            case 'Rocket': return Rocket;
            case 'Shield': return Shield;
            case 'Crown': return Crown;
            default: return Rocket;
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

    return (
        <div className="max-w-7xl mx-auto space-y-16 py-8 relative">
            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-dark-layer1 border border-brand-primary/30 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                            <CheckCircle2 className="text-green-400" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Welcome to {selectedPlan?.name}!</h2>
                        <p className="text-dark-muted mb-8 font-medium italic">Your journey to mastery has officially accelerated. Let's reach for the stars.</p>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full py-4 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs"
                        >
                            Launch Experience
                        </button>
                    </div>
                </div>
            )}

            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-black uppercase tracking-widest">
                    <Sparkles size={16} /> Subscription Plans
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">Level up your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-orange-500 italic">Potential.</span></h1>
                <p className="text-dark-muted max-w-2xl mx-auto text-lg font-medium leading-relaxed">Choose the plan that fits your ambition. Gain unlimited access to premium content and expert mentorship.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {loading ? (
                    <div className="col-span-3 flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                        <p className="text-dark-muted font-bold tracking-widest uppercase">Initializing Orbit Plans...</p>
                    </div>
                ) : plans.map((plan, i) => {
                    const Icon = getIcon(plan.icon);
                    const styles = getColorClasses(plan.color);
                    return (
                        <div key={i} className={`relative bg-dark-layer1 border-2 ${styles.border} rounded-[3rem] p-10 flex flex-col shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden`}>
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 py-2.5 px-10 bg-brand-primary text-dark-bg text-[10px] font-black uppercase tracking-widest rounded-bl-3xl shadow-lg z-20">
                                    Most Popular
                                </div>
                            )}
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="space-y-7 flex-1 relative z-10">
                                <div className={`w-16 h-16 ${styles.bg} ${styles.text} rounded-[1.5rem] flex items-center justify-center mb-4 shadow-inner border border-white/5`}>
                                    <Icon size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
                                    <p className="text-sm text-dark-muted font-medium mt-1 pr-4">{plan.description}</p>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white tracking-tighter">
                                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                                    </span>
                                    {plan.price > 0 && <span className="text-dark-muted font-bold text-lg">/mo</span>}
                                </div>
                                <ul className="space-y-4 pt-6">
                                    {plan.features.map((feat, j) => (
                                        <li key={j} className="flex items-start gap-3">
                                            <div className={`mt-1 w-5 h-5 rounded-full ${styles.bg} flex items-center justify-center shrink-0 border border-white/5`}>
                                                <Check className={styles.text} size={12} strokeWidth={4} />
                                            </div>
                                            <span className="text-sm text-dark-text/80 font-medium">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] mt-12 transition-all relative z-10 ${plan.isPopular
                                    ? 'bg-brand-primary hover:bg-brand-hover text-dark-bg shadow-xl shadow-brand-primary/20 transform hover:scale-[1.02] active:scale-95'
                                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/5 shadow-lg active:scale-95'
                                    }`}>
                                Select {plan.name}
                            </button>
                        </div>
                    );
                })}
            </div>

            <footer className="bg-dark-layer2/30 border border-white/5 rounded-[3.5rem] p-12 text-center max-w-4xl mx-auto space-y-8 shadow-2xl backdrop-blur-sm">
                <div className="flex justify-center -space-x-3 mb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-14 h-14 rounded-full border-4 border-dark-bg bg-dark-layer1 flex items-center justify-center overflow-hidden shadow-lg transform hover:z-20 hover:scale-110 transition-all cursor-pointer">
                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="w-14 h-14 rounded-full border-4 border-dark-bg bg-brand-primary flex items-center justify-center text-[10px] font-black text-dark-bg shadow-lg transform hover:scale-110 transition-all cursor-pointer">
                        +5k
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none italic">Joined by 10,000+ ambitious learners</h3>
                    <p className="text-dark-muted font-medium italic text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">"Orbit Pro changed my career. The structured roadmap and community support are unparalleled. Best investment I've made."</p>
                </div>
            </footer>
        </div >
    );
};

export default SubscriptionPlans;
