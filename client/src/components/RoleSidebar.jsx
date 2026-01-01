import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, Users, DollarSign,
    Settings, LogOut, PlusCircle, BarChart, MessageSquare,
    Bell, Star, Award, Search, Sparkles, Package,
    LayoutGrid, Rocket,
    Upload, BarChart3, ChevronLeft, ChevronRight, Heart, TrendingUp,
    FileText, Clock, Video, PenTool, Film, ShieldCheck, ClipboardList,
    Cpu, GitBranch, Database, Globe, Map, Radio, Trophy
} from 'lucide-react';

const RoleSidebar = ({ user, onLogout, isCollapsed, setIsCollapsed }) => {
    const location = useLocation();
    const scrollRef = useRef(null);

    // Persist scroll position across route changes
    useEffect(() => {
        const savedScroll = localStorage.getItem(`sidebar-scroll-${user?.role}`);
        if (savedScroll && scrollRef.current) {
            scrollRef.current.scrollTop = parseInt(savedScroll, 10);
        }

        const handleScroll = () => {
            if (scrollRef.current) {
                localStorage.setItem(`sidebar-scroll-${user?.role}`, scrollRef.current.scrollTop);
            }
        };

        const navElement = scrollRef.current;
        if (navElement) {
            navElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (navElement) {
                navElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [user?.role]);

    const navConfigs = {
        student: [
            { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
            { icon: BookOpen, label: 'My Learning', path: '/my-learning' },
            { type: 'divider', label: 'Browse' },
            { icon: Search, label: 'Browse Courses', path: '/browse' },
            { icon: LayoutGrid, label: 'Categories', path: '/categories' },
            { icon: Users, label: 'Instructors', path: '/instructors' },
            { icon: Star, label: 'My Instructors', path: '/my-instructors' },
            { type: 'divider', label: 'Discovery' },
            { icon: Film, label: 'Shorts', path: '/reels' },
            { icon: Radio, label: 'Social Media', path: '/social' },
            { icon: TrendingUp, label: 'Trending', path: '/trending' },
            { icon: Globe, label: 'Discover', path: '/discover-sectors' },
            { type: 'divider', label: 'Advanced' },
            { icon: Cpu, label: 'AI Tutor', path: '/intelligent-tutor' },
            { icon: GitBranch, label: 'Skill Paths', path: '/skill-paths' },
            { icon: Database, label: 'Storage', path: '/storage-vault' },
            { type: 'divider', label: 'Learning' },
            { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
            { icon: PenTool, label: 'Practice', path: '/practice' },
            { icon: Video, label: 'Live Sessions', path: '/live' },
            { icon: Award, label: 'Certificates', path: '/certificates' },
            { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
            { icon: Heart, label: 'Wishlist', path: '/wishlist' },
            { type: 'divider', label: 'Communication' },
            { icon: MessageSquare, label: 'Messages', path: '/messages' },
            { icon: MessageSquare, label: 'Community', path: '/community' },
            { icon: Bell, label: 'Announcements', path: '/announcements' },
            { icon: Bell, label: 'Notifications', path: '/notifications' },
            { type: 'divider', label: 'Account' },
            { icon: FileText, label: 'My Notes', path: '/my-notes' },
            { icon: Star, label: 'My Reviews', path: '/my-reviews' },
            { icon: Clock, label: 'Purchase History', path: '/purchase-history' },
            { icon: Package, label: 'Bundles', path: '/bundles' },
            { icon: Sparkles, label: 'Subscriptions', path: '/subscriptions' },
            { icon: Settings, label: 'Settings', path: '/profile' },
        ],
        instructor: [
            { icon: BarChart3, label: 'Dashboard', path: '/instructor' },
            { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
            { icon: Upload, label: 'Add Course', path: '/instructor/upload' },
            { type: 'divider', label: 'Management' },
            { icon: Users, label: 'My Students', path: '/instructor/students' },
            { icon: ClipboardList, label: 'Assignments', path: '/instructor/assignments' },
            { icon: Award, label: 'Assessments', path: '/instructor/assessments' },
            { icon: Star, label: 'Reviews', path: '/instructor/reviews' },
            { type: 'divider', label: 'Performance' },
            { icon: DollarSign, label: 'Earnings', path: '/instructor/earnings' },
            { icon: BarChart, label: 'Analytics', path: '/instructor/analytics' },
            { icon: TrendingUp, label: 'Promotions', path: '/instructor/promotions' },
            { type: 'divider', label: 'Communication' },
            { icon: Bell, label: 'Announcements', path: '/instructor/announcements' },
            { icon: MessageSquare, label: 'Messages', path: '/messages' },
            { icon: MessageSquare, label: 'Community Feed', path: '/community' },
            { type: 'divider', label: 'Social' },
            { icon: Radio, label: 'Social Media', path: '/social' },
            { icon: Video, label: 'Live Stream', path: '/instructor/live' },
            { type: 'divider', label: 'Tools' },
            { icon: PenTool, label: 'Articles', path: '/instructor/articles' },
            { icon: ClipboardList, label: 'Practice Exams', path: '/instructor/practice' },
            { icon: Award, label: 'Certificates', path: '/instructor/certificates' },
            { icon: Package, label: 'Course Bundles', path: '/instructor/bundles' },
            { icon: Database, label: 'Content Manager', path: '/instructor/content' },
            { type: 'divider', label: 'Account' },
            { icon: Bell, label: 'Notifications', path: '/notifications' },
            { icon: Settings, label: 'Profile Settings', path: '/instructor/settings' },
        ],
        superadmin: [
            { icon: BarChart3, label: 'Admin Dashboard', path: '/admin' },
            { icon: Users, label: 'Users', path: '/admin/users' },
            { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
            { icon: ShieldCheck, label: 'Instructors', path: '/admin/instructors' },
            { icon: DollarSign, label: 'Payments', path: '/admin/payments' },
            { icon: Sparkles, label: 'Subscriptions', path: '/admin/subscriptions' },
            { type: 'divider', label: 'Content' },
            { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
            { icon: Database, label: 'Content Manager', path: '/admin/content' },
            { icon: BarChart, label: 'Analytics', path: '/admin/analytics' },
            { type: 'divider', label: 'System' },
            { icon: Settings, label: 'Settings', path: '/admin/settings' },
        ]
    };

    const navItems = navConfigs[user?.role] || navConfigs.student;

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] border-r border-white/5 relative overflow-hidden group font-orbit">
            {/* Sidebar Header */}
            <div className={`p-6 border-b border-white/5 relative z-10 transition-all ${isCollapsed ? 'px-4' : 'px-8'}`}>
                <div className="flex items-center justify-between gap-4">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-3 overflow-hidden"
                            >
                                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0 border border-brand-primary/20">
                                    <Rocket size={18} className="text-brand-primary" />
                                </div>
                                <span className="text-base font-bold uppercase tracking-tight whitespace-nowrap text-white">
                                    Orbit<span className="text-brand-primary">Quest</span>
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-all text-dark-muted hover:text-white"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* User Identity Module */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-8 flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-lg bg-dark-layer2 p-0.5 border border-white/10 overflow-hidden">
                                    <img
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=ffcc00&color=000`}
                                        alt=""
                                        className="w-full h-full rounded-md object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{user?.name}</p>
                                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{user?.role}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Section */}
            <nav
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar relative z-10"
            >
                <div>
                    <div className="space-y-1">
                        {navItems.map((item, idx) => {
                            if (item.type === 'divider') {
                                return !isCollapsed ? (
                                    <div key={idx} className="px-4 pt-6 pb-2">
                                        <p className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">{item.label}</p>
                                    </div>
                                ) : <div key={idx} className="h-px bg-white/5 my-4 mx-2" />;
                            }

                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`group flex items-center gap-4 px-4 py-3 rounded-lg transition-all relative overflow-hidden ${isActive
                                        ? 'text-brand-primary bg-white/5 shadow-sm'
                                        : 'text-dark-muted hover:text-white hover:bg-white/5'
                                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                                >
                                    <div className={`transition-all ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                                        <Icon size={20} />
                                    </div>
                                    {!isCollapsed && (
                                        <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="absolute right-4 w-1 h-3 rounded-full bg-brand-primary" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-white/5 relative z-10">
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-[11px] font-bold uppercase tracking-wider text-xs">Log Out</span>}
                </button>
            </div>
        </div>
    );
};

export default RoleSidebar;
