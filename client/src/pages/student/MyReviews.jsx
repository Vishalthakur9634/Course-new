import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Star, MessageSquare, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyReviews();
    }, []);

    const fetchMyReviews = async () => {
        try {
            const { data } = await api.get('/reviews/my/all');
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`); // Assuming delete endpoint exists or will exist
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
            // If delete route not ready, alert user
            alert('Unable to delete review at this time.');
        }
    };

    if (loading) {
        return <div className="text-center text-white mt-10">Loading your reviews...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Star className="text-brand-primary" size={32} />
                <h1 className="text-3xl font-black text-white">My Reviews & Ratings</h1>
            </div>

            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-dark-layer1 border border-white/10 rounded-3xl">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare size={40} className="text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Reviews Yet</h2>
                    <p className="text-dark-muted max-w-md mb-6">
                        You haven't rated any courses yet. Go to your courses and share your feedback!
                    </p>
                    <Link to="/my-learning" className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-bold transition-all">
                        Go to My Learning
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map(review => (
                        <div key={review._id} className="bg-dark-layer1 border border-white/5 rounded-2xl p-6 hover:border-brand-primary/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-layer2">
                                        {review.course?.thumbnail ? (
                                            <img src={review.course.thumbnail} alt={review.course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-dark-muted">
                                                <Star size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {review.course?.title || 'Unknown Course'}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-dark-muted"}
                                                />
                                            ))}
                                            <span className="text-sm text-dark-muted ml-2">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/course/${review.course?._id}`}
                                        className="p-2 hover:bg-dark-layer2 rounded-lg text-dark-muted hover:text-white transition-colors"
                                        title="View Course"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-dark-layer2/50 rounded-xl p-4 text-dark-text text-sm leading-relaxed">
                                {review.comment || (
                                    <span className="italic text-dark-muted">No written comment provided.</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReviews;
