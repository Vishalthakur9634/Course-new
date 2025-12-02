import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const PaymentModal = ({ course, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;

            // Simulate API call
            const response = await api.post('/payment/purchase', {
                userId,
                courseId: course._id,
                paymentDetails: formData // In a real app, tokenise this!
            });

            if (response.data.success) {
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
                    <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
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
                        Secure Checkout
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
                            className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    Pay ${course.price}
                                </>
                            )}
                        </button>
                    </form>

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
