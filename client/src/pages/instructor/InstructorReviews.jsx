import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Star, ThumbsUp, MessageCircle, Clock, User } from 'lucide-react';

const InstructorReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterRating, setFilterRating] = useState('all');
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchReviews();
        fetchCourses();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/instructor-admin/courses');
            // Get all reviews from all courses
            const allReviews = [];
            data.forEach(course => {
                if (course.reviews && course.reviews.length > 0) {
                    course.reviews.forEach(review => {
                        allReviews.push({
                            ...review,
                            courseTitle: course.title,
                            courseId: course._id
                        });
                    });
                }
            });
            setReviews(allReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor-admin/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesCourse = filterCourse === 'all' || review.courseId === filterCourse;
        const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
        return matchesCourse && matchesRating;
    });

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading reviews...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Course Reviews</h1>
                <div className="flex items-center gap-2">
                    <Star size={24} className="text-yellow-500" fill="currentColor" />
                    <span className="text-2xl font-bold text-white">{averageRating}</span>
                    <span className="text-dark-muted">({reviews.length} reviews)</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
                {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviews.filter(r => r.rating === rating).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                        <div key={rating} className="bg-dark-layer1 p-4 rounded-lg border border-dark-layer2">
                            <div className="flex items-center gap-2 mb-2">
                                <Star size={16} className="text-yellow-500" fill="currentColor" />
                                <span className="text-white font-bold">{rating}</span>
                            </div>
                            <div className="w-full h-2 bg-dark-layer2 rounded-full overflow-hidden mb-1">
                                <div
                                    className="h-full bg-yellow-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-dark-muted">{count} reviews</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="bg-dark-layer1 border border-dark-layer2 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
                >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                </select>

                <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="bg-dark-layer1 border border-dark-layer2 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
                >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.map((review, idx) => (
                    <div key={idx} className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <User size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">{review.user?.name || 'Anonymous'}</p>
                                    <p className="text-sm text-dark-muted">{review.courseTitle}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < review.rating ? 'text-yellow-500' : 'text-dark-muted'}
                                                    fill={i < review.rating ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-dark-muted flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-white mb-3">{review.comment}</p>

                        {review.helpful && (
                            <div className="flex items-center gap-4 text-sm text-dark-muted">
                                <button className="flex items-center gap-1 hover:text-white transition-colors">
                                    <ThumbsUp size={16} />
                                    <span>Helpful ({review.helpful})</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-white transition-colors">
                                    <MessageCircle size={16} />
                                    <span>Reply</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredReviews.length === 0 && (
                <div className="text-center text-dark-muted py-10">
                    No reviews found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default InstructorReviews;
