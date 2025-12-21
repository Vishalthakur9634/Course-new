import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut, User, BookOpen, Heart, Award, Grid3x3,
    Users, DollarSign, Search, Bell, ShoppingCart,
    Menu, X, Book, ChevronDown, Rocket, Sparkles,
    Package, MessageSquare, HelpCircle, LayoutGrid,
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        ],
        instructor: [
            { name: 'Dashboard', path: '/instructor', icon: Grid3x3 },
            { name: 'Courses', path: '/instructor/courses', icon: BookOpen },
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
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-dark-text/70 hover:text-white transition-all"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-orange-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-brand-primary/20">
                            <Rocket size={22} className="text-white fill-current" />
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-brand-primary transition-all">
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

                {/* Search & User Controls */}
                <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
                    <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative group">
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

                        {isSearchFocused && (
                            <div className="absolute top-full left-0 right-0 mt-3 w-full bg-dark-layer1 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 space-y-6">
                                    {isSearching ? (
                                        <div className="py-10 flex flex-col items-center justify-center space-y-3">
                                            <Sparkles className="text-brand-primary animate-spin" size={24} />
                                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">Scanning Database...</p>
                                        </div>
                                    ) : searchQuery.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] px-2">Search Results</p>
                                            <div className="space-y-1">
                                                {searchResults.length > 0 ? searchResults.map((result) => (
                                                    <Link
                                                        key={result._id}
                                                        to={`/course/${result._id}`}
                                                        onClick={() => setIsSearchFocused(false)}
                                                        className="w-full text-left p-3 rounded-xl hover:bg-white/5 flex items-center justify-between group/item transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-dark-layer2 overflow-hidden border border-white/5">
                                                                <img src={result.thumbnail} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-white font-bold block">{result.title}</span>
                                                                <span className="text-[10px] text-dark-muted font-medium">{result.category} • ${result.price}</span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight size={14} className="text-dark-muted group-hover/item:text-brand-primary group-hover/item:translate-x-1 transition-all" />
                                                    </Link>
                                                )) : (
                                                    <div className="p-4 text-center">
                                                        <p className="text-sm text-dark-muted">No courses found matching "{searchQuery}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between px-2">
                                                    <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">Popular Courses</p>
                                                    <Zap size={12} className="text-brand-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    {popularCourses.length > 0 ? popularCourses.map((course) => (
                                                        <Link
                                                            key={course._id}
                                                            to={`/course/${course._id}`}
                                                            onClick={() => setIsSearchFocused(false)}
                                                            className="w-full text-left p-2 rounded-xl hover:bg-white/5 flex items-center justify-between group/item"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <History size={14} className="text-dark-muted group-hover/item:text-brand-primary" />
                                                                <span className="text-sm text-dark-text group-hover/item:text-white font-medium line-clamp-1">{course.title}</span>
                                                            </div>
                                                            <span className="text-[10px] bg-dark-layer2 px-2 py-0.5 rounded text-dark-muted group-hover/item:bg-brand-primary/20 group-hover/item:text-brand-primary">${course.price}</span>
                                                        </Link>
                                                    )) : (
                                                        <p className="text-xs text-dark-muted p-2">Loading popular courses...</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                                    <TrendingUp size={12} /> Trending Categories
                                                </p>
                                                <div className="flex flex-wrap gap-2 px-2">
                                                    {trendingCategories.length > 0 ? trendingCategories.map((c, i) => (
                                                        <span
                                                            key={i}
                                                            onClick={() => setSearchQuery(c)}
                                                            className="px-3 py-1.5 bg-dark-layer2 rounded-xl text-xs font-bold text-dark-muted hover:text-white hover:bg-dark-layer2/80 cursor-pointer transition-all border border-transparent hover:border-white/10"
                                                        >
                                                            {c}
                                                        </span>
                                                    )) : (
                                                        <p className="text-xs text-dark-muted">Loading categories...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl hover:bg-white/5 text-dark-text/70 hover:text-white transition-all relative group"
                        >
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} className="text-brand-primary" />}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-2 py-1 bg-dark-layer2 text-[10px] font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/5">
                                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                            </div>
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
                                        <ChevronDown size={14} className={`text-dark-muted transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showProfileMenu && (
                                        <div className="absolute top-full right-0 mt-3 w-64 bg-dark-layer1 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-5 border-b border-white/5">
                                                <p className="text-sm font-black text-white tracking-tight">{user.name}</p>
                                                <p className="text-xs text-dark-muted truncate mt-0.5">{user.email}</p>
                                                <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-black text-brand-primary uppercase tracking-wider">
                                                    <Sparkles size={10} /> {user.role || 'Explorer'}
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-dark-muted hover:text-white transition-all">
                                                    <User size={18} /> Profile Settings
                                                </Link>
                                                {user.role === 'student' && (
                                                    <Link to="/my-learning" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-dark-muted hover:text-white transition-all">
                                                        <Book size={18} /> My Learning
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm text-red-400 font-bold transition-all mt-1"
                                                >
                                                    <LogOut size={18} /> Sign Out
                                                </button>
                                            </div>
                                            <div className="p-4 bg-dark-layer2/30 flex items-center justify-between border-t border-white/5">
                                                <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Orbit XP</span>
                                                <div className="flex items-center gap-1.5 text-brand-primary">
                                                    <Sparkles size={14} className="animate-pulse" />
                                                    <span className="text-xs font-black">1,240</span>
                                                </div>
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

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-dark-bg border-b border-white/10 p-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
                    <div className="flex flex-col gap-1">
                        {currentLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-black transition-all ${location.pathname === link.path ? 'bg-brand-primary/10 text-brand-primary' : 'text-dark-text/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <link.icon size={20} />
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
