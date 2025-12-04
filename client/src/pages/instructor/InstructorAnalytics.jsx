import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart3, TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';

const InstructorAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const { data } = await api.get('/instructor-admin/analytics');
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading analytics...</div>;
    }

    if (!analytics) {
        return <div className="text-center mt-10 text-white">Error loading analytics</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Analytics</h1>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-full">
                            <Users size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Enrollments</p>
                            <p className="text-2xl font-bold text-white">{analytics.totalEnrollments || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <TrendingUp size={24} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Avg. Rating</p>
                            <p className="text-2xl font-bold text-white">
                                {analytics.averageRating ? analytics.averageRating.toFixed(1) : 'N/A'} ⭐
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-full">
                            <BookOpen size={24} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Active Courses</p>
                            <p className="text-2xl font-bold text-white">{analytics.activeCourses || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrollment Trend */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand-primary" />
                    Enrollment Trend
                </h3>

                {analytics.enrollmentTrend && analytics.enrollmentTrend.length > 0 ? (
                    <div className="space-y-2">
                        {analytics.enrollmentTrend.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-dark-layer2 rounded">
                                <span className="text-dark-muted">{item.month}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-dark-layer1 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-primary"
                                            style={{ width: `${(item.enrollments / Math.max(...analytics.enrollmentTrend.map(t => t.enrollments))) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-white font-semibold w-8 text-right">{item.enrollments}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-dark-muted text-center py-4">No data available yet</p>
                )}
            </div>

            {/* Top Courses */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-brand-primary" />
                    Top Performing Courses
                </h3>

                <div className="grid gap-3">
                    {analytics.topCourses?.map((course, idx) => (
                        <div key={idx} className="p-4 bg-dark-layer2 rounded">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-medium">{course.title}</h4>
                                <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs rounded">
                                    #{idx + 1}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-dark-muted">
                                <div className="flex items-center gap-1">
                                    <Users size={14} />
                                    <span>{course.enrollments} students</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign size={14} />
                                    <span>${course.revenue?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    ⭐ <span>{course.rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {(!analytics.topCourses || analytics.topCourses.length === 0) && (
                    <p className="text-dark-muted text-center py-4">No courses yet</p>
                )}
            </div>
        </div>
    );
};

export default InstructorAnalytics;
