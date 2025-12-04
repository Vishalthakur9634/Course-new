import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to proper home page
            if (data.user.role === 'superadmin') {
                navigate('/admin');  // Head Admin Panel
            } else if (data.user.role === 'instructor') {
                navigate('/instructor');  // Course Seller Panel
            } else {
                navigate('/dashboard');  // Student Dashboard
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-dark-layer1 p-8 rounded-lg shadow-lg w-full max-w-md border border-dark-layer2">
                <h2 className="text-2xl font-bold mb-6 text-center text-dark-text">Sign In</h2>
                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2.5 text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2.5 text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-hover text-white font-medium py-2.5 rounded transition-colors"
                    >
                        Sign In
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-dark-muted">
                    Don't have an account? <Link to="/register" className="text-brand-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
