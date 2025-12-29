import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, BookOpen, Users, User, LayoutDashboard, Search, Film } from 'lucide-react';

const MobileNav = ({ user }) => {
    const location = useLocation();
    const isInstructor = user?.role === 'instructor';

    const studentLinks = [
        { to: '/dashboard', icon: Home, label: 'Home' },
        { to: '/reels', icon: Film, label: 'Shorts' }, // Replaced Browse
        { to: '/my-learning', icon: BookOpen, label: 'My Learning' },
        { to: '/community', icon: Users, label: 'Community' },
        { to: '/profile', icon: User, label: 'Profile' }
    ];

    const instructorLinks = [
        { to: '/instructor', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/instructor/courses', icon: BookOpen, label: 'Courses' },
        { to: '/reels', icon: Film, label: 'Shorts' }, // Replaced Community
        { to: '/instructor/analytics', icon: Compass, label: 'Analytics' },
        { to: '/profile', icon: User, label: 'Profile' }
    ];

    const links = isInstructor ? instructorLinks : studentLinks;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-layer1/90 backdrop-blur-xl border-t border-white/10 pb-safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {links.map((link) => {
                    const isActive = location.pathname === link.to;
                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative ${isActive ? 'text-brand-primary' : 'text-dark-muted hover:text-white'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-12 h-[2px] bg-brand-primary shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded-full" />
                            )}

                            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-brand-primary/10' : ''}`}>
                                <Icon size={20} className={isActive ? 'fill-current' : ''} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            <span className="text-[10px] font-medium tracking-wide">
                                {link.label}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
