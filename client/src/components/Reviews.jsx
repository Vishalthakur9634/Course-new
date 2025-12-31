import React, { useState, useEffect } from 'react';
import { Star, Send, User as UserIcon } from 'lucide-react';
import UserLink from './UserLink';
import api from '../utils/api';

const Reviews = ({ courseId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchReviews();
    }, [courseId]);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/reviews/${courseId}`);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!rating || !comment.trim()) return;

        setLoading(true);
        try {
            const { data } = await api.post('/reviews', {
                userId: currentUser.id,
                courseId,
                rating,
                comment
            });
            setReviews([data, ...reviews]);
            setRating(0);
            setComment('');
            alert('Review submitted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (count, interactive = false) => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <Star
                    key={index}
                    size={interactive ? 24 : 16}
                    className={`${interactive ? 'cursor-pointer' : ''} transition-colors ${starValue <= (interactive ? (hoverRating || rating) : count)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                        }`}
                    onClick={() => interactive && setRating(starValue)}
                    onMouseEnter={() => interactive && setHoverRating(starValue)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                />
            );
        });
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            {/* Reviews Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Reviews</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-1">{renderStars(Math.round(averageRating))}</div>
                        <span className="text-dark-muted text-sm">
                            {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                </div>
            </div>

            {/* Add Review Form */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Rating</label>
                        <div className="flex gap-1">
                            {renderStars(rating, true)}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this course..."
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded-lg p-3 text-white focus:border-brand-primary focus:outline-none min-h-[100px]"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !rating}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${loading || !rating
                            ? 'bg-dark-layer2 text-dark-muted cursor-not-allowed'
                            : 'bg-brand-primary hover:bg-brand-hover text-white'
                            }`}
                    >
                        <Send size={16} />
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="bg-dark-layer1 p-8 rounded-lg border border-dark-layer2 text-center">
                        <p className="text-dark-muted">No reviews yet. Be the first to review this course!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2 hover:border-dark-layer2/80 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar & Name */}
                                <UserLink
                                    user={review.user}
                                    avatarSize="w-10 h-10"
                                    nameClass="hidden"
                                />

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <UserLink
                                                user={review.user}
                                                showAvatar={false}
                                                nameClass="font-semibold text-white"
                                            />
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                                                <span className="text-xs text-dark-muted">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-dark-text leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;
