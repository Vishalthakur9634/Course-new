import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, Zap } from 'lucide-react';
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
            setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
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
                paymentDetails: formData
            });

            if (response.data.success) {
                // Enroll User using the payment ID
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
            setError(err.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-dark-layer1 border border-brand-primary/50 p-8 rounded-2xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Enrollment Successful!</h2>
                    <p className="text-dark-muted">You have successfully enrolled in {course.title}.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-dark-layer1 border border-dark-layer2 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-dark-layer2 flex justify-between items-center bg-dark-layer2/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lock size={20} className="text-brand-primary" />
                        Checkout
                    </h2>
                    <button onClick={onClose} className="text-dark-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6 flex items-center gap-4 p-4 bg-dark-layer2 rounded-lg">
                        <img src={course.thumbnail} alt={course.title} className="w-16 h-16 object-cover rounded" />
                        <div>
                            <h3 className="text-white font-medium line-clamp-1">{course.title}</h3>
                            <p className="text-brand-primary font-bold text-lg">${course.price}</p>
                        </div>
                    </div>

                    {/* Quick Enroll (Fake Payment) */}
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Zap className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
                            <div className="flex-1">
                                <h4 className="text-yellow-400 font-semibold mb-1">Testing Mode</h4>
                                <p className="text-sm text-dark-muted mb-3">Skip payment and enroll instantly for testing purposes.</p>
                                <button
                                    onClick={handleFakePayment}
                                    disabled={loading}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-all"
                                >
                                    {loading ? 'Processing...' : 'Enroll for Free (Test Mode)'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dark-layer2"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-dark-layer1 text-dark-muted">OR</span>
                        </div>
                    </div>

                    {/* Real Payment Form */}
                    {!useRealPayment ? (
                        <button
                            onClick={() => setUseRealPayment(true)}
                            className="w-full text-brand-primary hover:text-brand-hover transition-colors text-sm font-medium"
                        >
                            Use Real Payment Method →
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-dark-muted mb-1 uppercase">Cardholder Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-dark-bg border border-dark-layer2 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-dark-muted mb-1 uppercase">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        required
                                        value={formData.cardNumber}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-dark-layer2 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-primary transition-colors"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-dark-muted mb-1 uppercase">Expiry Date</label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        required
                                        value={formData.expiry}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-dark-layer2 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary transition-colors"
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-dark-muted mb-1 uppercase">CVC</label>
                                    <input
                                        type="text"
                                        name="cvc"
                                        required
                                        value={formData.cvc}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-dark-layer2 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary transition-colors"
                                        placeholder="123"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    <>Pay ${course.price}</>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setUseRealPayment(false)}
                                className="w-full text-dark-muted hover:text-white transition-colors text-sm"
                            >
                                ← Back to test mode
                            </button>
                        </form>
                    )}

                    <div className="mt-4 text-center">
                        <p className="text-xs text-dark-muted flex items-center justify-center gap-1">
                            <Lock size={12} /> Payments are secure and encrypted.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
