import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Search, Filter, Heart, Users, DollarSign, Star } from 'lucide-react';

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
        try {
            const { data } = await api.post(`/users/${user.id}/wishlist/${courseId}`);
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

            const cats = ['All', ...new Set(published.map(c => c.category))];
            setCategories(cats);

            // Get unique instructors
            const uniqueInstructors = [...new Map(published
                .filter(c => c.instructorId)
                .map(c => [c.instructorId._id, c.instructorId])
            ).values()];
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Browse Courses</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-layer1 border border-dark-layer2 rounded-lg py-2 pl-10 pr-4 text-white focus:border-brand-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                            ? 'bg-brand-primary text-white'
                            : 'bg-dark-layer1 text-dark-muted hover:bg-dark-layer2'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-layer1 border border-dark-layer2 rounded-lg text-white hover:border-brand-primary transition-colors"
                >
                    <Filter size={18} />
                    {showFilters ? 'Hide' : 'Show'} Filters
                </button>
                <span className="text-dark-muted text-sm">{filteredCourses.length} courses found</span>
                {(priceRange[0] !== 0 || priceRange[1] !== 1000 || minRating > 0 || selectedLevel !== 'all' || selectedInstructor !== 'all') && (
                    <button
                        onClick={clearFilters}
                        className="text-brand-primary hover:text-brand-hover text-sm"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Price Range: ${priceRange[0]} - ${priceRange[1]}
                        </label>
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                className="w-full"
                            />
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Minimum Rating</label>
                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(parseFloat(e.target.value))}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="0">All Ratings</option>
                            <option value="4.5">4.5★ & above</option>
                            <option value="4.0">4.0★ & above</option>
                            <option value="3.5">3.5★ & above</option>
                            <option value="3.0">3.0★ & above</option>
                        </select>
                    </div>

                    {/* Level */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Level</label>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    {/* Instructor */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Instructor</label>
                        <select
                            value={selectedInstructor}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded-lg px-3 py-2 text-white"
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

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => {
                    // Calculate sponsored price
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
                            className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden hover:border-brand-primary transition-all group"
                        >
                            <div className="aspect-video bg-dark-layer2 relative">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-white">
                                    {course.videos?.length || 0} Videos
                                </div>
                                {/* Sponsorship Badge */}
                                {isSponsored && (
                                    <div className="absolute top-2 left-2 bg-yellow-500/90 px-3 py-1 rounded flex items-center gap-1">
                                        <span className="text-xs font-bold text-black">🎁 Sponsored</span>
                                    </div>
                                )}
                                {/* Wishlist Button */}
                                <button
                                    onClick={(e) => toggleWishlist(e, course._id)}
                                    className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 hover:bg-brand-primary/80 transition-colors z-10"
                                >
                                    <Heart
                                        size={18}
                                        className={isWishlisted ? "text-red-500 fill-red-500" : "text-white"}
                                    />
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-brand-primary/10 text-brand-primary text-xs px-2 py-1 rounded font-bold uppercase">
                                        {course.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                        <Star size={14} fill="currentColor" />
                                        <span>{course.rating || 4.5}</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-dark-muted text-sm line-clamp-2 mb-3">{course.description}</p>

                                {/* Instructor Info */}
                                {course.instructorId && (
                                    <Link
                                        to={`/instructor/profile/${course.instructorId._id}`}
                                        className="flex items-center gap-2 mb-4 hover:bg-dark-layer2 p-2 rounded transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                            {course.instructorId.name?.charAt(0).toUpperCase() || 'I'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-dark-muted">Course Provider</p>
                                            <p className="text-sm text-white font-medium truncate hover:text-brand-primary">
                                                {course.instructorId.name}
                                            </p>
                                        </div>
                                    </Link>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-dark-layer2">
                                    <div className="flex items-center gap-1 text-sm text-dark-muted">
                                        <Users size={14} />
                                        <span>{course.enrollmentCount || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {isSponsored && sponsorshipType === 'free' ? (
                                            <span className="font-bold text-xl text-green-400">FREE</span>
                                        ) : isSponsored ? (
                                            <>
                                                <span className="font-bold text-xl text-white">${finalPrice.toFixed(2)}</span>
                                                <span className="text-xs text-dark-muted line-through">${originalPrice}</span>
                                            </>
                                        ) : (
                                            <span className="font-bold text-xl text-white">${originalPrice}</span>
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
