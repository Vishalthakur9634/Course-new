import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, BookOpen, Award, Heart, User, Settings, LogOut,
    PlayCircle, Users, DollarSign, BarChart3, Upload,
    ShieldCheck, MessageSquare, Bell, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import ResizablePanel from './ResizablePanel';

const RoleSidebar = ({ user, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Student navigation items
    const studentNav = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: BookOpen, label: 'Browse Courses', path: '/browse' },
        { icon: Users, label: 'My Instructors', path: '/my-instructors' }, // Changed from Instructors to My Instructors
        { icon: Users, label: 'All Instructors', path: '/instructors' },
        { icon: PlayCircle, label: 'My Learning', path: '/my-learning' },
        { icon: Heart, label: 'Wishlist', path: '/wishlist' },
        { icon: Bell, label: 'Announcements', path: '/announcements' },
        { icon: Award, label: 'Certificates', path: '/certificates' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: BookOpen, label: 'Categories', path: '/categories' },
    ];

    // Instructor navigation items
    const instructorNav = [
        { icon: BarChart3, label: 'Dashboard', path: '/instructor' },
        { icon: ShieldCheck, label: 'Admin Panel', path: '/instructor/admin' }, // NEW: Admin panel for course launcher
        { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
        { icon: Upload, label: 'Upload Content', path: '/instructor/upload' },
        { icon: Bell, label: 'Announcements', path: '/instructor/announcements' },
        { icon: Users, label: 'Students', path: '/instructor/students' },
        { icon: DollarSign, label: 'Earnings', path: '/instructor/earnings' },
        { icon: BarChart3, label: 'Analytics', path: '/instructor/analytics' },
        { icon: MessageSquare, label: 'Reviews', path: '/instructor/reviews' },
        { icon: Settings, label: 'Settings', path: '/instructor/settings' },
    ];

    // Super Admin navigation items
    const superAdminNav = [
        { icon: BarChart3, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
        { icon: ShieldCheck, label: 'Instructors', path: '/admin/instructors' },
        { icon: DollarSign, label: 'Payments', path: '/admin/payments' },
        { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    // Select navigation based on role
    const getNavItems = () => {
        switch (user?.role) {
            case 'student':
                return studentNav;
            case 'instructor':
                return instructorNav;
            case 'superadmin':
                return superAdminNav;
            default:
                return studentNav;
        }
    };

    const navItems = getNavItems();

    const getRoleBadgeColor = () => {
        switch (user?.role) {
            case 'student':
                return 'bg-blue-500/20 text-blue-400';
            case 'instructor':
                return 'bg-purple-500/20 text-purple-400';
            case 'superadmin':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-dark-layer1 border-r border-dark-layer2">
            {/* Header */}
            <div className="p-4 border-b border-dark-layer2">
                <div className="flex items-center justify-between mb-3">
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold bg-gradient-to-r from-brand-primary to-purple-500 bg-clip-text text-transparent">
                            Course Launcher
                        </h1>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-dark-layer2 rounded-lg transition-colors hidden md:block"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 hover:bg-dark-layer2 rounded-lg transition-colors md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-purple-500 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor()} capitalize`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                : 'text-dark-muted hover:bg-dark-layer2 hover:text-white'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon size={20} />
                            {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-dark-layer2 space-y-1">
                <Link
                    to="/notifications"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-muted hover:bg-dark-layer2 hover:text-white transition-all"
                >
                    <Bell size={20} />
                    {!isCollapsed && <span className="font-medium">Notifications</span>}
                </Link>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-dark-layer1 border border-dark-layer2 rounded-lg md:hidden"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent />
            </div>

            {/* Desktop Resizable Sidebar */}
            <div className="hidden md:block">
                {isCollapsed ? (
                    <div className="w-16">
                        <SidebarContent />
                    </div>
                ) : (
                    <ResizablePanel
                        defaultWidth={280}
                        minWidth={240}
                        maxWidth={400}
                        position="left"
                        storageKey={`sidebar-width-${user?.role}`}
                    >
                        <SidebarContent />
                    </ResizablePanel>
                )}
            </div>
        </>
    );
};

export default RoleSidebar;
