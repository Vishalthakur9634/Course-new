import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Users, DollarSign,
    Settings, LogOut, PlusCircle, BarChart, MessageSquare,
    Bell, Star, Award, Search, Sparkles, Package,
    LayoutGrid,
    Upload, BarChart3, ChevronLeft, ChevronRight, Heart, TrendingUp,
    FileText, Clock, Video, PenTool, Film, ShieldCheck, ClipboardList, // [NEW]
    Cpu, GitBranch, Database, Globe, Map // [FUTURISTIC NEW]
} from 'lucide-react';
import ResizablePanel from './ResizablePanel';

const RoleSidebar = ({ user, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
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

        // Scroll active item into view
        const activeLink = navElement?.querySelector('a.bg-brand-primary');
        if (activeLink) {
            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        return () => {
            if (navElement) {
                navElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [user?.role, location.pathname]);

    // Student navigation items
    const studentNav = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'My Learning', path: '/my-learning' },
        { icon: Film, label: 'Shorts', path: '/reels' },
        { icon: FileText, label: 'My Assessments', path: '/practice' },
        { icon: ClipboardList, label: 'Course Assignments', path: '/assignments' },
        { icon: Video, label: 'Live Sessions', path: '/live' },
        { icon: FileText, label: 'My Notes', path: '/my-notes' },
        { icon: Heart, label: 'Wishlist', path: '/wishlist' },
        { icon: MessageSquare, label: 'Chats', path: '/announcements' },
        { icon: Clock, label: 'History', path: '/purchase-history' },
        { icon: MessageSquare, label: 'Reviews', path: '/my-reviews' },
        { icon: Sparkles, label: 'Social Feed', path: '/social' },
        { icon: TrendingUp, label: 'Trending Hub', path: '/trending' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Globe, label: 'Discover Sectors', path: '/discover-sectors' },
        { icon: Cpu, label: 'Neural Tutor', path: '/intelligent-tutor' },
        { icon: GitBranch, label: 'Skill Paths', path: '/skill-paths' },
        { icon: Database, label: 'Storage Vault', path: '/storage-vault' },
        { icon: Settings, label: 'Profile', path: '/profile' },
    ];

    // Instructor navigation items
    const instructorNav = [
        { icon: BarChart3, label: 'Dashboard', path: '/instructor' },
        { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
        { icon: Film, label: 'Shorts', path: '/reels' },
        { icon: Video, label: 'Live Sessions', path: '/instructor/live' },
        { icon: PenTool, label: 'Blog Articles', path: '/instructor/articles' },
        { icon: FileText, label: 'Quiz Manager', path: '/instructor/practice' },
        { icon: ClipboardList, label: 'Assignment Manager', path: '/instructor/assignments' },
        { icon: MessageSquare, label: 'Community', path: '/community' },
        { icon: Upload, label: 'Upload Content', path: '/instructor/upload' },
        { icon: MessageSquare, label: 'Chats', path: '/instructor/announcements' },
        // { icon: Users, label: 'Students', path: '/instructor/students' }, // Navbar
        // { icon: DollarSign, label: 'Earnings', path: '/instructor/earnings' }, // Navbar
        { icon: BarChart3, label: 'Analytics', path: '/instructor/analytics' },
        { icon: MessageSquare, label: 'Reviews', path: '/instructor/reviews' },
        { icon: PlusCircle, label: 'Promotions', path: '/instructor/promotions' },
        { icon: Package, label: 'Bundle Creator', path: '/instructor/bundles' },
        { icon: Award, label: 'Assessments', path: '/instructor/assessments' },
        { icon: Award, label: 'Certificates', path: '/instructor/certificates' },
        { icon: Sparkles, label: 'Social Feed', path: '/social' },
        { icon: TrendingUp, label: 'Trending Hub', path: '/trending' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Globe, label: 'Discover Sectors', path: '/discover-sectors' },
        { icon: Cpu, label: 'Neural Tutor', path: '/intelligent-tutor' },
        { icon: GitBranch, label: 'Skill Paths', path: '/skill-paths' },
        { icon: Database, label: 'Storage Vault', path: '/storage-vault' },
        { icon: Settings, label: 'Profile Settings', path: '/instructor/settings' },
    ];

    // Super Admin navigation items
    const superAdminNav = [
        { icon: BarChart3, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
        { icon: ShieldCheck, label: 'Instructors', path: '/admin/instructors' },
        { icon: DollarSign, label: 'Payments', path: '/admin/payments' },
        { icon: Sparkles, label: 'Subscriptions', path: '/admin/subscriptions' },
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
        <div className="flex flex-col h-full bg-dark-layer1 border-r border-dark-layer2 min-h-0">
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
            <nav ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0 custom-scrollbar">
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
        <div className="hidden md:flex flex-col h-full overflow-hidden">
            {isCollapsed ? (
                <div className="w-16 h-full flex flex-col overflow-hidden">
                    <SidebarContent />
                </div>
            ) : (
                <ResizablePanel
                    defaultWidth={280}
                    minWidth={240}
                    maxWidth={400}
                    position="left"
                    storageKey={`sidebar-width-${user?.role}`}
                    className="h-full flex flex-col overflow-hidden"
                >
                    <SidebarContent />
                </ResizablePanel>
            )}
        </div>
    );
};

export default RoleSidebar;
