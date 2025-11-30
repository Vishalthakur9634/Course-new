import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-dark-layer1 border-b border-dark-layer2 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="text-2xl font-bold text-brand-primary flex items-center gap-2">
                <span>&lt;CodeCourse /&gt;</span>
            </Link>

            <div className="flex items-center gap-6">
                <Link to="/" className="text-dark-text hover:text-brand-primary transition-colors">Courses</Link>
                {token ? (
                    <div className="flex items-center gap-4">
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-dark-text hover:text-brand-primary transition-colors">Admin</Link>
                        )}
                        <div className="flex items-center gap-2 text-dark-muted">
                            <User size={18} />
                            <span>{user.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-dark-layer2 hover:bg-red-500/20 hover:text-red-500 text-dark-text px-3 py-1.5 rounded transition-all"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-dark-text hover:text-brand-primary transition-colors">Log In</Link>
                        <Link to="/register" className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded font-medium transition-colors">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
