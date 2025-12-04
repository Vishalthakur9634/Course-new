import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, Heart, Award, Grid3x3, Users, DollarSign } from 'lucide-react';

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
            <Link to={user.role === 'superadmin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/'} className="text-2xl font-bold text-brand-primary flex items-center gap-2">
                <span>&lt;CodeCourse /&gt;</span>
            </Link>

            <div className="flex items-center gap-6">
                {token ? (
                    <>
                        {/* Student Navigation */}
                        {user.role === 'student' && (
                            <>
                                <Link to="/" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <BookOpen size={18} />
                                    <span>Courses</span>
                                </Link>
                                <Link to="/my-learning" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <Grid3x3 size={18} />
                                    <span>My Learning</span>
                                </Link>
                                <Link to="/wishlist" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <Heart size={18} />
                                    <span>Wishlist</span>
                                </Link>
                                <Link to="/certificates" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <Award size={18} />
                                    <span>Certificates</span>
                                </Link>
                            </>
                        )}

                        {/* Instructor Navigation */}
                        {user.role === 'instructor' && (
                            <>
                                <Link to="/instructor" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <Grid3x3 size={18} />
                                    <span>Dashboard</span>
                                </Link>
                                <Link to="/instructor/courses" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <BookOpen size={18} />
                                    <span>My Courses</span>
                                </Link>
                                <Link to="/instructor/students" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <Users size={18} />
                                    <span>Students</span>
                                </Link>
                                <Link to="/instructor/earnings" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <DollarSign size={18} />
                                    <span>Earnings</span>
                                </Link>
                            </>
                        )}

                        {/* Super Admin Navigation */}
                        {(user.role === 'superadmin' || user.role === 'admin') && (
                            <>
                                <Link to="/admin" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <Grid3x3 size={18} />
                                    <span>Dashboard</span>
                                </Link>
                                <Link to="/admin/users" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <Users size={18} />
                                    <span>Users</span>
                                </Link>
                                <Link to="/admin/courses" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <BookOpen size={18} />
                                    <span>Courses</span>
                                </Link>
                                <Link to="/admin/instructors" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <Award size={18} />
                                    <span>Instructors</span>
                                </Link>
                                <Link to="/admin/payments" className="text-dark-text hover:text-brand-primary transition-colors flex items-center gap-2">
                                    <DollarSign size={18} />
                                    <span>Payments</span>
                                </Link>
                            </>
                        )}

                        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-dark-layer2">
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
                    </>
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
