import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Heart, Trash2, DollarSign } from 'lucide-react';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            const { data } = await api.get(`/wishlist/${userId}`);
            setWishlist(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (courseId) => {
        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            await api.post('/wishlist/remove', { userId, courseId });
            setWishlist(wishlist.filter(course => course._id !== courseId));
        } catch (error) {
            alert('Failed to remove from wishlist');
        }
    };

    if (loading) return <div className="text-white text-center">Loading wishlist...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Heart size={32} className="text-brand-primary" />
                <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
            </div>

            {wishlist.length === 0 ? (
                <div className="bg-dark-layer1 p-12 rounded-lg border border-dark-layer2 text-center">
                    <Heart size={48} className="text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">Your wishlist is empty</p>
                    <Link to="/" className="text-brand-primary hover:underline mt-2 inline-block">
                        Browse courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map(course => (
                        <div
                            key={course._id}
                            className="bg-dark-layer1 rounded-lg overflow-hidden border border-dark-layer2 hover:border-brand-primary/50 transition-all group"
                        >
                            <div className="relative">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-48 object-cover"
                                />
                                <button
                                    onClick={() => removeFromWishlist(course._id)}
                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-dark-muted text-sm mb-3 line-clamp-2">
                                    {course.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-brand-primary font-bold text-xl flex items-center gap-1">
                                        <DollarSign size={20} />
                                        {course.price}
                                    </span>
                                    <Link
                                        to={`/course/${course._id}`}
                                        className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        View Course
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
