import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, BookOpen, Users, User, LayoutDashboard,
    Zap, Radio, Rocket, Globe, Sparkles, Film, MessageSquare
} from 'lucide-react';

const MobileNav = ({ user }) => {
    const location = useLocation();
    const isInstructor = user?.role === 'instructor';
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    const getLinks = () => {
        if (isAdmin) return [
            { to: '/admin', icon: LayoutDashboard, label: 'Admin' },
            { to: '/admin/users', icon: Users, label: 'Users' },
            { to: '/social', icon: MessageSquare, label: 'Social' },
            { to: '/profile', icon: User, label: 'Profile' }
        ];
        if (isInstructor) return [
            { to: '/instructor', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/instructor/courses', icon: BookOpen, label: 'Courses' },
            { to: '/social', icon: MessageSquare, label: 'Social' },
            { to: '/reels', icon: Film, label: 'Shorts' },
            { to: '/profile', icon: User, label: 'Profile' }
        ];
        return [
            { to: '/dashboard', icon: Home, label: 'Home' },
            { to: '/my-learning', icon: BookOpen, label: 'Learning' },
            { to: '/social', icon: MessageSquare, label: 'Social' },
            { to: '/reels', icon: Film, label: 'Shorts' },
            { to: '/profile', icon: User, label: 'Profile' }
        ];
    };

    const links = getLinks();

    return (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[200] pb-safe-area-bottom">
            <nav className="flex items-center justify-around h-20 px-4 neo-blur bg-black/40 border border-white/5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {links.map((link) => {
                    const isActive = location.pathname === link.to;
                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className="relative flex flex-col items-center justify-center p-2 group outline-none"
                        >
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-pill"
                                        className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </AnimatePresence>

                            <motion.div
                                animate={isActive ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                                className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-brand-primary' : 'text-dark-muted'}`}
                            >
                                <Icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,204,0,0.5)]' : ''} />
                            </motion.div>

                            <AnimatePresence>
                                {isActive && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -bottom-1 text-[8px] font-black uppercase tracking-[0.2em] text-brand-primary"
                                    >
                                        {link.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default MobileNav;
