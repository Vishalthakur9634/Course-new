import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Save, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            setFormData(prev => ({ ...prev, email: parsedUser.email }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        try {
            const updateData = { email: formData.email };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await api.put(`/users/profile/${user.id}`, updateData);

            // Update local storage if email changed
            const updatedUser = { ...user, email: response.data.user.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setMessage({ type: 'success', text: 'Admin credentials updated successfully' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User size={24} className="text-brand-primary" />
                Admin Credentials
            </h2>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-dark-muted mb-2">Admin Email</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-dark-bg border border-dark-layer2 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">New Password (Optional)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-dark-bg border border-dark-layer2 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-dark-bg border border-dark-layer2 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    {loading ? 'Saving...' : (
                        <>
                            <Save size={20} />
                            Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AdminSettings;
