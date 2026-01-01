import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Heart, Trash2, DollarSign, Bookmark, ArrowRight, BookOpen } from 'lucide-react';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const userObj = JSON.parse(localStorage.getItem('user'));
            const userId = userObj.id || userObj._id;
            const { data } = await api.get(`/users/${userId}/wishlist`);
            setWishlist(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (courseId) => {
        try {
            const userObj = JSON.parse(localStorage.getItem('user'));
            const userId = userObj.id || userObj._id;
            await api.post(`/users/${userId}/wishlist/${courseId}`);
            setWishlist(wishlist.filter(course => course._id !== courseId));
        } catch (error) {
            alert('Failed to remove from wishlist');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 font-inter text-white pb-20">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary">
                        <Bookmark size={24} />
                    </div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight">Bookmarked Courses</h1>
                </div>
                <p className="text-dark-muted font-bold text-[10px] uppercase tracking-widest pl-1">Curated selection for your professional growth</p>
            </header>

            {wishlist.length === 0 ? (
                <div className="bg-[#1a1a1a] p-24 rounded-2xl border border-white/5 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-dark-muted opacity-30">
                        <Heart size={40} />
                    </div>
                    <div className="space-y-2">
                        <p className="text-white font-bold text-xl uppercase tracking-tight">No Bookmarks Found</p>
                        <p className="text-dark-muted text-sm font-medium">Start exploring our professional catalog to build your learning path.</p>
                    </div>
                    <Link to="/" className="inline-flex items-center gap-2 bg-brand-primary text-dark-bg px-8 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all">
                        Browse Courses <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlist.map(course => (
                        <div
                            key={course._id}
                            className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-primary/20 transition-all group flex flex-col h-full shadow-lg"
                        >
                            <div className="relative aspect-video bg-[#262626] overflow-hidden">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => removeFromWishlist(course._id)}
                                        className="bg-[#0a0a0a]/80 backdrop-blur-md text-white/50 hover:text-red-500 p-2.5 rounded-lg border border-white/5 transition-all shadow-xl"
                                        title="Remove from bookmarks"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a]/80 backdrop-blur-md text-brand-primary rounded-lg text-[9px] font-bold uppercase tracking-widest border border-brand-primary/20 shadow-lg">
                                        <BookOpen size={10} /> {course.category || 'Professional'}
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col space-y-4">
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight leading-tight group-hover:text-brand-primary transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-dark-muted text-xs font-medium line-clamp-2 leading-relaxed">
                                    {course.description}
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Enrollment Fee</p>
                                        <span className="text-2xl font-bold text-white tracking-tight">
                                            ${course.price}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/course/${course._id}`}
                                        className="bg-brand-primary hover:brightness-110 text-dark-bg px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
                                    >
                                        Begin Exploration
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
