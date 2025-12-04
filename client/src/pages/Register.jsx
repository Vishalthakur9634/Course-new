import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { User, BookOpen } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            if (data.user.role === 'instructor') {
                navigate('/instructor');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-dark-layer1 p-8 rounded-lg shadow-lg w-full max-w-md border border-dark-layer2">
                <h2 className="text-2xl font-bold mb-6 text-center text-dark-text">Create Account</h2>
                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2.5 text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>
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

                    {/* ROLE SELECTION */}
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-3">I want to</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`p-4 rounded-lg border-2 transition-all ${role === 'student'
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-dark-layer2 text-dark-muted hover:border-dark-muted'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <User size={32} />
                                    <span className="font-semibold">Learn Courses</span>
                                    <span className="text-xs opacity-75">Course Buyer</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('instructor')}
                                className={`p-4 rounded-lg border-2 transition-all ${role === 'instructor'
                                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                                        : 'border-dark-layer2 text-dark-muted hover:border-dark-muted'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <BookOpen size={32} />
                                    <span className="font-semibold">Teach Courses</span>
                                    <span className="text-xs opacity-75">Course Seller</span>
                                </div>
                            </button>
                        </div>
                        {role === 'instructor' && (
                            <p className="mt-2 text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded">
                                ⚠️ Instructor accounts require admin approval before you can create courses.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-hover text-white font-medium py-2.5 rounded transition-colors"
                    >
                        Sign Up as {role === 'student' ? 'Student' : 'Instructor'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-dark-muted">
                    Already have an account? <Link to="/login" className="text-brand-primary hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
