import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
    Search, Filter, Heart, Users, DollarSign, Star, Share2,
    Zap, ChevronDown, Check, X, SlidersHorizontal
} from 'lucide-react';

const CourseBrowse = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Data State
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);

    // Options State (Likely fetched from DB in real app, hardcoded fallback for now)
    const [categories, setCategories] = useState([]);
    const [instructors, setInstructors] = useState([]);

    // Filters State (Synced with URL)
    const initialFilters = {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || 'All',
        level: searchParams.get('level') || 'all',
        minPrice: searchParams.get('minPrice') || 0,
        maxPrice: searchParams.get('maxPrice') || 1000,
        rating: searchParams.get('rating') || 0,
        sort: searchParams.get('sort') || 'newest'
    };

    const [filters, setFilters] = useState(initialFilters);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Sync state when URL changes
    useEffect(() => {
        setFilters({
            search: searchParams.get('search') || '',
            category: searchParams.get('category') || 'All',
            level: searchParams.get('level') || 'all',
            minPrice: searchParams.get('minPrice') || 0,
            maxPrice: searchParams.get('maxPrice') || 1000,
            rating: searchParams.get('rating') || 0,
            sort: searchParams.get('sort') || 'newest'
        });
    }, [searchParams]);

    useEffect(() => {
        fetchCourses();
        fetchWishlist();
    }, [searchParams]); // Re-fetch when URL params change

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL
        const params = new URLSearchParams();
        if (newFilters.search) params.set('search', newFilters.search);
        if (newFilters.category !== 'All') params.set('category', newFilters.category);
        if (newFilters.level !== 'all') params.set('level', newFilters.level);
        if (newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice);
        if (newFilters.maxPrice < 1000) params.set('maxPrice', newFilters.maxPrice);
        if (newFilters.rating > 0) params.set('rating', newFilters.rating);
        if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);

        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({});
        setFilters({
            search: '', category: 'All', level: 'all',
            minPrice: 0, maxPrice: 1000, rating: 0, sort: 'newest'
        });
    };

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Build Query String from Filters
            const query = new URLSearchParams(searchParams).toString();
            const { data } = await api.get(`/courses?${query}`);

            // Client-side filtering for isPublished just in case, though backend should handle
            const published = data.filter(c => c.isPublished);
            setCourses(published);

            // Dynamic Categories & Instructors from ALL courses (better to have dedicated endpoints but this works)
            const allCats = ['All', ...new Set(published.map(c => c.category).filter(Boolean))];
            setCategories(allCats);

        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWishlist = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Fix: Handle both id and _id formats
                const userId = user.id || user._id;
                const { data } = await api.get(`/users/${userId}/wishlist`);
                setWishlist(data.map(c => c._id));
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const toggleWishlist = async (e, courseId) => {
        e.preventDefault();
        e.stopPropagation();
        const userStr = localStorage.getItem('user');
        if (!userStr) return alert('Please login first');

        const user = JSON.parse(userStr);
        try {
            // Fix: Handle both id and _id formats
            const userId = user.id || user._id;
            const { data } = await api.post(`/users/${userId}/wishlist/${courseId}`);
            if (data.action === 'added') setWishlist([...wishlist, courseId]);
            else setWishlist(wishlist.filter(id => id !== courseId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg pb-20 pt-24 px-4 md:px-8 max-w-[1600px] mx-auto">

            {/* Header & Search */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-2">
                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">Universe</span>
                    </h1>
                    <p className="text-dark-muted font-bold text-sm tracking-widest uppercase">
                        {courses.length} Signales Detected across filters
                    </p>
                </div>

                <div className="w-full xl:w-auto flex gap-4">
                    <div className="relative flex-1 xl:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH FREQUENCIES..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="w-full bg-dark-layer1 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-black text-white uppercase tracking-widest focus:border-brand-primary focus:outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="xl:hidden p-4 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20"
                    >
                        <SlidersHorizontal size={20} />
                    </button>

                    {/* Sort Dropdown (Desktop) */}
                    <div className="hidden xl:block relative group z-20">
                        <select
                            value={filters.sort}
                            onChange={(e) => updateFilter('sort', e.target.value)}
                            className="appearance-none bg-dark-layer1 border border-white/10 rounded-xl py-4 pl-6 pr-12 text-xs font-black text-white uppercase tracking-widest hover:border-brand-primary focus:outline-none cursor-pointer"
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="flex gap-8 items-start">

                {/* Desktop Sidebar Filters */}
                <aside className="hidden xl:block w-72 sticky top-24 space-y-8 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest">Sectors</h3>
                        <div className="flex flex-col gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => updateFilter('category', cat)}
                                    className={`text-left px-4 py-3 rounded-xl text-[11px] font-bold uppercase transition-all flex justify-between items-center ${filters.category === cat
                                        ? 'bg-brand-primary text-dark-bg shadow-lg shadow-brand-primary/20'
                                        : 'bg-dark-layer1 text-dark-muted hover:text-white hover:bg-white/5'}`}
                                >
                                    {cat}
                                    {filters.category === cat && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs font-black text-white uppercase">
                            <span>Credits</span>
                            <span>${filters.minPrice} - ${filters.maxPrice}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={filters.maxPrice}
                            onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-dark-layer2 rounded-full appearance-none cursor-pointer accent-brand-primary"
                        />
                    </div>

                    {/* Rating */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest">Quality</h3>
                        <div className="space-y-2">
                            {[4.5, 4.0, 3.5, 3.0].map(stars => (
                                <button
                                    key={stars}
                                    onClick={() => updateFilter('rating', stars === filters.rating ? 0 : stars)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${filters.rating === stars
                                        ? 'border-brand-primary bg-brand-primary/10'
                                        : 'border-transparent hover:bg-white/5'}`}
                                >
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < Math.floor(stars) ? "currentColor" : "none"} className={i >= Math.floor(stars) ? "text-dark-muted" : ""} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase">& Up</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={clearFilters}
                        className="w-full py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase text-dark-muted hover:text-white hover:border-white/30 transition-all"
                    >
                        Reset Coordinates
                    </button>
                </aside>

                {/* Main Content Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="h-96 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Scanning Deep Space...</p>
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <Link
                                    to={`/course/${course._id}`}
                                    key={course._id}
                                    className="group relative bg-dark-layer1 border border-white/5 rounded-[2rem] overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-dark-layer2 relative overflow-hidden">
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent opacity-60" />

                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            <button
                                                onClick={(e) => toggleWishlist(e, course._id)}
                                                className="p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-brand-primary hover:text-dark-bg text-white transition-all shadow-lg"
                                            >
                                                <Heart size={16} className={wishlist.includes(course._id) ? "fill-current text-white" : ""} />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-4 left-4">
                                            <span className="bg-brand-primary text-dark-bg text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                                {course.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex-1 space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-dark-muted uppercase tracking-wider mb-1">
                                                <Star size={12} className="text-yellow-500 fill-current" />
                                                <span className="text-white">{course.rating || 4.9}</span>
                                                <span className="w-1 h-1 bg-dark-muted rounded-full" />
                                                <span>{course.level}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-brand-primary transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs text-dark-muted line-clamp-2 leading-relaxed">
                                                {course.instructorId?.name || 'Unknown Instructor'}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-dark-muted uppercase">
                                                <Users size={12} /> {course.enrollmentCount || 0}
                                            </div>
                                            <div className="text-lg font-black text-white">
                                                ${course.price === 0 ? 'FREE' : course.price}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center border border-white/5 rounded-3xl bg-dark-layer1/50">
                            <Search size={48} className="text-dark-muted mb-4 opacity-20" />
                            <h3 className="text-xl font-black text-white uppercase italic">Zero Impact</h3>
                            <p className="text-dark-muted text-sm mt-2">No signals found matching your coordinates.</p>
                            <button
                                onClick={clearFilters}
                                className="mt-6 px-6 py-2 bg-white/5 hover:bg-brand-primary hover:text-dark-bg rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-[200] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                    <div className="relative w-full max-w-xs bg-dark-layer1 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-white uppercase italic">Filters</h2>
                            <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-white/10 rounded-full">
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        {/* Mobile Filter Logic (Reuse Desktop Logic) */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest mb-4">Sort By</h3>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => updateFilter('sort', e.target.value)}
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>

                            {/* Reuse Categories, Price, etc here... simplified for brevity */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest">Sectors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => updateFilter('category', cat)}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${filters.category === cat
                                                ? 'bg-brand-primary text-dark-bg'
                                                : 'bg-dark-layer2 text-dark-muted'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={clearFilters} className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-black uppercase mt-8">
                                Reset All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseBrowse;
