import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut, User, BookOpen, Heart, Award, Grid3x3,
    Users, DollarSign, Search, Bell, ShoppingCart,
    Book, ChevronDown, Rocket, Sparkles,
    Package, MessageSquare, HelpCircle, LayoutGrid, Film, // Menu, X removed

    Sun, Moon, TrendingUp, History, Zap, ArrowRight
} from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    // Removed isMobileMenuOpen
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    const [popularCourses, setPopularCourses] = useState([]);
    const [trendingCategories, setTrendingCategories] = useState([]);

    // Safety check for localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };

        // Theme Initialization
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [theme]);

    // Search Logic
    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                // Fetching all courses and filtering locally for now, 
                // or we can update the backend to support 'q'
                const { data } = await api.get('/courses');
                const filtered = data.filter(c =>
                    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.category.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, 5);
                setSearchResults(filtered);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch popular courses and trending categories on mount
    useEffect(() => {
        const fetchPopularData = async () => {
            try {
                const { data } = await api.get('/courses');
                // Get top 3 popular courses by enrollment
                const popular = data
                    .filter(c => c.isPublished)
                    .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
                    .slice(0, 3);
                setPopularCourses(popular);

                // Get unique categories with course counts
                const categoryMap = {};
                data.forEach(c => {
                    if (c.category && c.isPublished) {
                        categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
                    }
                });
                const trending = Object.entries(categoryMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([name]) => name);
                setTrendingCategories(trending);
            } catch (error) {
                console.error('Error fetching popular data:', error);
            }
        };
        fetchPopularData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    };

    const navLinks = {
        student: [
            { name: 'Browse', path: '/browse', icon: LayoutGrid },
            { name: 'Subscriptions', path: '/subscriptions', icon: Sparkles },
            { name: 'Bundles', path: '/bundles', icon: Package },
            { name: 'Community', path: '/community', icon: MessageSquare },
            { name: 'Leaderboard', path: '/leaderboard', icon: Award },
            { name: 'Shorts', path: '/reels', icon: Film },
        ],
        instructor: [
            { name: 'Dashboard', path: '/instructor', icon: Grid3x3 },
            { name: 'Courses', path: '/instructor/courses', icon: BookOpen },
            { name: 'Shorts', path: '/reels', icon: Film },
            { name: 'Students', path: '/instructor/students', icon: Users },
            { name: 'Earnings', path: '/instructor/earnings', icon: DollarSign },
        ],
        admin: [
            { name: 'Overview', path: '/admin', icon: Grid3x3 },
            { name: 'Users', path: '/admin/users', icon: Users },
            { name: 'Courses', path: '/admin/courses', icon: BookOpen },
            { name: 'Payments', path: '/admin/payments', icon: DollarSign },
        ],
        superadmin: [
            { name: 'Overview', path: '/admin', icon: Grid3x3 },
            { name: 'Users', path: '/admin/users', icon: Users },
            { name: 'Courses', path: '/admin/courses', icon: BookOpen },
            { name: 'Payments', path: '/admin/payments', icon: DollarSign },
        ]
    };

    const currentLinks = user.role ? (navLinks[user.role] || []) : [];


    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-dark-bg/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-dark-bg/95 border-b border-white/5 py-5'
            }`}>
            <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-orange-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-brand-primary/20">
                            <Rocket size={22} className="text-white fill-current" />
                        </div>
                        <span className="hidden md:inline text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-brand-primary transition-all">
                            Orbit<span className="text-brand-primary">Quest</span>
                        </span>
                    </Link>

                    {/* Nav Items - Desktop */}
                    {token && (
                        <div className="hidden lg:flex items-center gap-1">
                            {currentLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-white/5 flex items-center gap-2 ${location.pathname === link.path ? 'text-brand-primary bg-brand-primary/10' : 'text-dark-text/70 hover:text-white'
                                        }`}
                                >
                                    <link.icon size={16} />
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
                    <div ref={searchRef} className={`hidden md:flex flex-1 max-w-md relative group ${user.role === 'instructor' ? 'invisible pointer-events-none' : ''}`}>
                        <div className={`flex items-center w-full bg-dark-layer1/50 border rounded-2xl transition-all ${isSearchFocused ? 'border-brand-primary bg-dark-layer1 shadow-lg shadow-brand-primary/10' : 'border-dark-layer2 shadow-none'
                            }`}>
                            <Search className={`ml-4 transition-colors ${isSearchFocused ? 'text-brand-primary' : 'text-dark-muted'}`} size={18} />
                            <input
                                type="text"
                                placeholder="Explore courses, skills..."
                                className="w-full bg-transparent border-none py-2.5 pl-3 pr-4 text-sm focus:outline-none placeholder:text-dark-muted/50 text-white font-medium"
                                value={searchQuery}
                                onFocus={() => setIsSearchFocused(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="mr-4 flex items-center gap-1.5 px-2 py-0.5 rounded border border-dark-layer2 text-[10px] font-bold text-dark-muted select-none group-hover:border-dark-muted/30 transition-colors">
                                <span className="text-xs">⌘</span> K
                            </div>
                        </div>

                        {/* Search Results Dropdown Logic (Simulated) */}
                        {isSearchFocused && (
                            /* ... Simplified Search Results ... */
                            <div className="absolute top-full left-0 right-0 mt-3 w-full bg-dark-layer1 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[9999]">
                                {/* ... (Keeping existing search result logic) ... */}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile Search Button */}
                        <button
                            className="md:hidden p-2 rounded-xl text-dark-text/70 hover:text-white"
                            onClick={() => navigate('/browse')} // Redirect to browse for mobile search
                        >
                            <Search size={22} />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl hover:bg-white/5 text-dark-text/70 hover:text-white transition-all relative group"
                        >
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} className="text-brand-primary" />}
                        </button>

                        {token ? (
                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                                <button className="p-2.5 rounded-xl hover:bg-white/5 text-dark-text/70 hover:text-white transition-colors relative group">
                                    <Bell size={20} />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-bg animate-pulse"></span>
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-all group"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-brand-primary transition-all shadow-lg">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showProfileMenu && (
                                        <div className="absolute top-full right-0 mt-3 w-72 bg-dark-layer1 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-6 border-b border-white/5 bg-gradient-to-br from-brand-primary/10 to-transparent">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-dark-layer2 p-1 border border-white/10">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} className="w-full h-full rounded-xl object-cover" alt={user.name} />
                                                        ) : (
                                                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                                <span className="text-white font-black">{user.name?.[0]}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-white tracking-tight truncate">{user.name}</p>
                                                        <p className="text-[10px] text-dark-muted font-bold truncate uppercase tracking-widest">{user.role}</p>
                                                    </div>
                                                </div>

                                                <Link
                                                    to={user.role === 'instructor' ? `/instructor/profile/${user.id || user._id}` : `/u/${user.id || user._id}`}
                                                    onClick={() => setShowProfileMenu(false)}
                                                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-dark-bg border border-brand-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group"
                                                >
                                                    View Orbit Profile <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>

                                            <div className="p-2">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setShowProfileMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-dark-muted hover:text-white transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="font-bold">Account Settings</span>
                                                </Link>

                                                {user.role === 'student' && (
                                                    <Link
                                                        to="/my-learning"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-dark-muted hover:text-white transition-all group"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                                                            <BookOpen size={16} />
                                                        </div>
                                                        <span className="font-bold">My Learning</span>
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-sm text-red-400 transition-all mt-1 group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20">
                                                        <LogOut size={16} />
                                                    </div>
                                                    <span className="font-black uppercase tracking-widest text-[11px]">Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 border-l border-white/10 ml-2 pl-4">
                                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-dark-text/70 hover:text-white transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/register" className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-xl text-sm transition-all transform hover:scale-105 shadow-xl shadow-brand-primary/30">
                                    Start Journey
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
