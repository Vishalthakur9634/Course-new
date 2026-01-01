import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, Zap, ShieldCheck, Activity } from 'lucide-react';
import api from '../utils/api';

const PaymentModal = ({ course, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [useRealPayment, setUseRealPayment] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFakePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/enrollment/enroll', {
                courseId: course._id
            });

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Transaction failed. Please re-synchronize.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            const response = await api.post('/payment/purchase', {
                userId,
                courseId: course._id,
                paymentDetails: formData,
                referralCode: localStorage.getItem('currentReferral')
            });

            if (response.data.success) {
                await api.post('/enrollment/enroll', {
                    courseId: course._id,
                    paymentId: response.data.paymentId
                });

                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Transaction failed. Please re-synchronize.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
                <div className="bg-[#0a0a0a] border border-brand-primary/40 p-12 rounded-[2.5rem] text-center max-w-md w-full animate-in fade-in zoom-in duration-500 shadow-[0_0_80px_rgba(255,161,22,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary shadow-[0_0_20px_rgba(255,161,22,0.8)]" />
                    <div className="bg-brand-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-primary/20">
                        <CheckCircle size={56} className="text-brand-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-tight">Access Validated</h2>
                    <p className="text-dark-muted font-medium text-sm leading-relaxed opacity-60">Your credentials have been successfully indexed. Initializing curriculum synchronization for {course.title}.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] w-full max-w-[500px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300 relative">
                {/* TRANSACTION HEADER */}
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-[#141414]/30">
                    <div className="space-y-1">
                        <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.4em]">Investment Registry</h2>
                        <h3 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                            <ShieldCheck size={24} className="text-brand-primary" /> Checkout
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 text-dark-muted hover:text-white rounded-2xl transition-all border border-white/5">
                        <X size={24} />
                    </button>
                </div>

                {/* DOMAIN BODY */}
                <div className="p-10">
                    <div className="mb-10 flex items-center gap-6 p-6 bg-[#111] rounded-3xl border border-white/5 group">
                        <img src={course.thumbnail} alt={course.title} className="w-20 h-20 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                        <div className="space-y-2">
                            <h3 className="text-white font-bold uppercase tracking-tight line-clamp-1">{course.title}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest opacity-40">Program Valuation:</span>
                                <p className="text-brand-primary font-black text-2xl uppercase tracking-tighter">${course.price || '0.00'}</p>
                            </div>
                        </div>
                    </div>

                    {/* VALIDATION TERMINAL (Test Mode) */}
                    <div className="mb-10 p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[50px] rounded-full" />
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary border border-brand-primary/20 group-hover:bg-brand-primary group-hover:text-dark-bg transition-all">
                                <Activity size={20} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h4 className="text-brand-primary font-black text-[10px] uppercase tracking-[0.4em]">Evaluation Environment</h4>
                                <p className="text-[11px] text-dark-muted font-medium leading-relaxed opacity-70">Bypass transaction infrastructure to authorize immediate developmental access.</p>
                                <button
                                    onClick={handleFakePayment}
                                    disabled={loading}
                                    className="w-full mt-4 bg-brand-primary hover:brightness-110 text-dark-bg font-black py-4 px-6 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 group/btn"
                                >
                                    <Zap size={16} className="group-hover:animate-pulse" /> {loading ? 'PROCESSING...' : 'AUTHORIZE ACCESS (BETA)'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative my-10 px-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] items-center">
                            <span className="px-6 bg-[#0a0a0a] text-dark-muted font-black tracking-[0.4em]">OR</span>
                        </div>
                    </div>

                    {/* SECURE GATEWAY FORM */}
                    {!useRealPayment ? (
                        <button
                            onClick={() => setUseRealPayment(true)}
                            className="w-full py-4 bg-white/5 border border-white/5 text-dark-muted hover:text-white hover:border-brand-primary/30 transition-all rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                        >
                            <CreditCard size={18} /> Initialize Secure Gateway
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-dark-muted mb-2 uppercase tracking-widest opacity-40">Account Holder Identifier</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white font-medium focus:outline-none focus:border-brand-primary transition-all placeholder:opacity-20"
                                        placeholder="ARCHITECT NAME"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-dark-muted mb-2 uppercase tracking-widest opacity-40">Registry ID (Card Number)</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-muted opacity-40" size={18} />
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            required
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            className="w-full bg-[#111] border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white font-medium focus:outline-none focus:border-brand-primary transition-all placeholder:opacity-20"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-dark-muted mb-2 uppercase tracking-widest opacity-40">Validation Window</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            required
                                            value={formData.expiry}
                                            onChange={handleChange}
                                            className="w-full bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white font-medium focus:outline-none focus:border-brand-primary transition-all placeholder:opacity-20"
                                            placeholder="MM / YY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-dark-muted mb-2 uppercase tracking-widest opacity-40">Security Access Code</label>
                                        <input
                                            type="password"
                                            name="cvc"
                                            required
                                            value={formData.cvc}
                                            onChange={handleChange}
                                            className="w-full bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white font-medium focus:outline-none focus:border-brand-primary transition-all placeholder:opacity-20"
                                            placeholder="CVC"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-[11px] font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20 uppercase tracking-widest">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-primary hover:brightness-110 text-dark-bg font-black py-5 rounded-2xl transition-all shadow-2xl shadow-brand-primary/20 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.4em] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="animate-pulse">SYNCHRONIZING...</span>
                                ) : (
                                    <>Commit Investment</>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setUseRealPayment(false)}
                                className="w-full text-[10px] font-black text-dark-muted hover:text-white transition-all uppercase tracking-[0.3em] pt-2"
                            >
                                ← Return to Beta Terminal
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-[9px] font-black text-dark-muted uppercase tracking-[0.3em] flex items-center justify-center gap-2 opacity-30">
                            <Lock size={12} className="text-brand-primary" /> End-to-End Encryption Enabled
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
