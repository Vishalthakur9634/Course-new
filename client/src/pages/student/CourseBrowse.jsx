import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Search, Filter, Heart, Users, DollarSign, Star, Share2, Zap } from 'lucide-react';
import UserLink from '../../components/UserLink';

const CourseBrowse = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);

    // Advanced filters
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [minRating, setMinRating] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedInstructor, setSelectedInstructor] = useState('all');
    const [instructors, setInstructors] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        fetchCourses();
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const { data } = await api.get(`/users/${user.id}/wishlist`);
                setWishlist(data.map(c => c._id));
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const toggleWishlist = async (e, courseId) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Please login to add to wishlist');
            return;
        }

        const user = JSON.parse(userStr);
        const userId = user.id || user._id;

        try {
            const { data } = await api.post(`/users/${userId}/wishlist/${courseId}`);
            if (data.action === 'added') {
                setWishlist([...wishlist, courseId]);
            } else {
                setWishlist(wishlist.filter(id => id !== courseId));
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            const published = response.data.filter(c => c.isPublished && c.approvalStatus === 'approved');
            setCourses(published);
            setFilteredCourses(published);

            // Extract unique categories and instructors
            const uniqueCategories = ['All', ...new Set(published.map(c =>
                (c.category || '').trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
            ).filter(Boolean))];
            setCategories(uniqueCategories);

            const uniqueInstructors = Array.from(new Map(published.map(c => [c.instructorId?._id, c.instructorId])).values())
                .filter(Boolean); // Filter out null/undefined instructors
            setInstructors(uniqueInstructors);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = courses;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.instructorId?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(c => c.category === selectedCategory);
        }

        // Price range filter
        filtered = filtered.filter(c => {
            const price = c.sponsorship?.isSponsored && c.sponsorship.sponsorshipType === 'free'
                ? 0
                : c.sponsorship?.isSponsored
                    ? c.price * (1 - (c.sponsorship.sponsorshipDiscount || 0) / 100)
                    : c.price;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Rating filter
        if (minRating > 0) {
            filtered = filtered.filter(c => (c.rating || 0) >= minRating);
        }

        // Level filter
        if (selectedLevel !== 'all') {
            filtered = filtered.filter(c => c.level === selectedLevel);
        }

        // Instructor filter
        if (selectedInstructor !== 'all') {
            filtered = filtered.filter(c => c.instructorId?._id === selectedInstructor);
        }

        setFilteredCourses(filtered);
    }, [searchTerm, selectedCategory, courses, priceRange, minRating, selectedLevel, selectedInstructor]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All');
        setPriceRange([0, 1000]);
        setMinRating(0);
        setSelectedLevel('all');
        setSelectedInstructor('all');
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-10 pb-20">
            {/* Sector Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 px-2">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        STELLAR <span className="text-gradient">DISCOVERY</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-8 bg-brand-primary" />
                        <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.4em]">Live Database Scanning</p>
                    </div>
                </div>
                <div className="relative w-full xl:w-[450px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary" size={20} />
                    <input
                        type="text"
                        placeholder="INPUT SEARCH KEYWORDS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-layer1 border border-brand-primary/20 rounded-2xl py-5 pl-16 pr-6 text-xs font-black text-white uppercase tracking-widest focus:border-brand-primary focus:outline-none focus:shadow-[0_0_20px_rgba(255,204,0,0.1)] transition-all placeholder:text-dark-muted/40"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shadow-lg ${selectedCategory === cat
                            ? 'bg-brand-primary text-dark-bg border-brand-primary shadow-brand-primary/20 scale-105'
                            : 'bg-dark-layer1 text-dark-muted hover:text-white border-white/5 hover:border-white/10'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between bg-dark-layer1/30 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all ${showFilters ? 'bg-brand-primary text-dark-bg border-brand-primary' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                    >
                        <Filter size={14} strokeWidth={3} />
                        {showFilters ? 'Lock Coordinates' : 'Sector Filters'}
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-dark-muted">
                        <span className="text-white font-black italic">{filteredCourses.length}</span> Signals Detected
                    </span>
                </div>
                {(priceRange[0] !== 0 || priceRange[1] !== 1000 || minRating > 0 || selectedLevel !== 'all' || selectedInstructor !== 'all' || selectedCategory !== 'All' || searchTerm) && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-brand-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                        Reset Array
                    </button>
                )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="bg-dark-layer1/80 border border-white/10 rounded-[2.5rem] p-10 grid grid-cols-1 md:grid-cols-4 gap-10 backdrop-blur-xl animate-in slide-in-from-top-4 duration-500">
                    {/* Price Range */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Price Spectrum: <span className="text-white italic">${priceRange[0]} - ${priceRange[1]}</span></label>
                        <div className="space-y-4 pt-2">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                className="w-full h-1.5 bg-dark-layer2 rounded-full appearance-none cursor-pointer accent-brand-primary"
                            />
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full h-1.5 bg-dark-layer2 rounded-full appearance-none cursor-pointer accent-brand-primary"
                            />
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">User Rating</label>
                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(parseFloat(e.target.value))}
                            className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:border-brand-primary outline-none transition-all"
                        >
                            <option value="0">All Ratings</option>
                            <option value="4.5">4.5★ & Above</option>
                            <option value="4.0">4.0★ & Above</option>
                            <option value="3.5">3.5★ & Above</option>
                            <option value="3.0">3.0★ & Above</option>
                        </select>
                    </div>

                    {/* Level */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Difficulty Tier</label>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:border-brand-primary outline-none transition-all"
                        >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    {/* Instructor */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Curator</label>
                        <select
                            value={selectedInstructor}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                            className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:border-brand-primary outline-none transition-all"
                        >
                            <option value="all">All Instructors</option>
                            {instructors.map(instructor => (
                                <option key={instructor._id} value={instructor._id}>
                                    {instructor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Mission Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCourses.map(course => {
                    const isSponsored = course.sponsorship?.isSponsored;
                    const sponsorshipType = course.sponsorship?.sponsorshipType;
                    const discount = course.sponsorship?.sponsorshipDiscount || 0;
                    const originalPrice = course.price;
                    const finalPrice = isSponsored && sponsorshipType === 'free'
                        ? 0
                        : isSponsored
                            ? originalPrice * (1 - discount / 100)
                            : originalPrice;

                    const isWishlisted = wishlist.includes(course._id);

                    return (
                        <Link
                            key={course._id}
                            to={`/course/${course._id}`}
                            className="group bg-dark-layer1 border border-white/5 rounded-[3.5rem] overflow-hidden hover:border-brand-primary transition-all duration-500 flex flex-col h-full shadow-2xl relative"
                        >
                            <div className="aspect-[16/10] bg-dark-layer2 relative overflow-hidden">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />

                                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/90 via-transparent to-transparent flex flex-col justify-between p-8">
                                    <div className="flex justify-between items-start">
                                        {isSponsored && (
                                            <div className="bg-stellar-gold text-dark-bg px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                                                <Zap size={12} fill="currentColor" /> SPONSORED MISSION
                                            </div>
                                        )}
                                        <div className="flex gap-2 ml-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const userStr = localStorage.getItem('user');
                                                    if (!userStr) return alert('Login required');
                                                    const u = JSON.parse(userStr);
                                                    const refLink = `${window.location.origin}/course/${course._id}?ref=${u.referralCode || u.id}`;
                                                    navigator.clipboard.writeText(refLink);
                                                    alert('TRANSMISSION COPIED');
                                                }}
                                                className="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-brand-primary hover:text-dark-bg transition-all"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => toggleWishlist(e, course._id)}
                                                className="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-brand-primary hover:text-dark-bg transition-all"
                                            >
                                                <Heart size={16} className={isWishlisted ? "fill-current text-red-500" : ""} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <span className="bg-brand-primary/20 backdrop-blur-xl border border-brand-primary/30 text-brand-primary px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                            {course.category}
                                        </span>
                                        <div className="w-14 h-14 rounded-[2rem] bg-brand-primary text-dark-bg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-xl shadow-brand-primary/40">
                                            <Search size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 flex-1 flex flex-col space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-white italic leading-tight group-hover:text-brand-primary transition-colors tracking-tighter uppercase line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-dark-muted font-bold line-clamp-2 leading-relaxed opacity-70 italic">
                                        "{course.description}"
                                    </p>
                                </div>

                                <div className="flex justify-between items-center py-6 border-t border-white/5 mt-auto">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-stellar-gold font-black text-[10px] uppercase">
                                            <Star size={14} fill="currentColor" /> {course.rating || 4.9}
                                        </div>
                                        <div className="flex items-center gap-2 text-dark-muted font-black text-[10px] uppercase">
                                            <Users size={14} /> {course.enrollmentCount || 0}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {finalPrice === 0 ? (
                                            <span className="text-3xl font-black text-green-400 italic">FREE</span>
                                        ) : (
                                            <div className="flex items-baseline gap-2">
                                                {isSponsored && <span className="text-xs text-dark-muted line-through opacity-50">${originalPrice}</span>}
                                                <span className="text-3xl font-black text-white">${finalPrice}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-dark-muted">No courses found</p>
                </div>
            )}
        </div>
    );
};

export default CourseBrowse;
