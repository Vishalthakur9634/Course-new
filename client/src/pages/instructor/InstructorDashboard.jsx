import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { TrendingUp, Users, DollarSign, BookOpen, Plus, Upload, BarChart2, Calendar, Video, FileText } from 'lucide-react';

const InstructorDashboard = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const [dashboardRes, analyticsRes] = await Promise.all([
                api.get('/instructor/dashboard'),
                api.get('/instructor/analytics')
            ]);
            setStats(dashboardRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    // Helper to get max value for chart scaling
    const getMaxRevenue = () => {
        if (!analytics?.revenueTrend?.length) return 100;
        return Math.max(...analytics.revenueTrend.map(d => d.revenue)) * 1.2;
    };

    const getMaxEnrollments = () => {
        if (!analytics?.enrollmentTrend?.length) return 10;
        return Math.max(...analytics.enrollmentTrend.map(d => d.enrollments)) * 1.2;
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Hero */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-3">Instructor Dashboard</h1>
                    <p className="text-lg opacity-90">Manage your courses, track revenue, and grow your audience.</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                    <TrendingUp size={300} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6 hover:border-blue-500 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-dark-muted font-medium">Total Courses</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <BookOpen size={24} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.totalCourses || 0}</p>
                </div>
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6 hover:border-green-500 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-dark-muted font-medium">Total Students</span>
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <Users size={24} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.totalStudents || 0}</p>
                </div>
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6 hover:border-yellow-500 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-dark-muted font-medium">Total Revenue</span>
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">${stats?.totalRevenue?.toFixed(2) || 0}</p>
                </div>
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6 hover:border-purple-500 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-dark-muted font-medium">Avg Rating</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {stats?.courses?.length > 0
                            ? (stats.courses.reduce((acc, curr) => acc + (curr.rating || 0), 0) / stats.courses.length).toFixed(1)
                            : '0.0'}
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart2 className="text-brand-primary" /> Revenue Trend
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {analytics?.revenueTrend?.length > 0 ? analytics.revenueTrend.map((item, idx) => {
                            const height = (item.revenue / getMaxRevenue()) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-dark-layer2 rounded-t-lg relative h-full flex items-end overflow-hidden">
                                        <div
                                            className="w-full bg-brand-primary opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-t-lg"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-dark-muted">{item.month.split('-')[1]}</span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        ${item.revenue}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="w-full h-full flex items-center justify-center text-dark-muted">No revenue data yet</div>
                        )}
                    </div>
                </div>

                {/* Enrollment Chart */}
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Users className="text-green-400" /> Enrollment Trend
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {analytics?.enrollmentTrend?.length > 0 ? analytics.enrollmentTrend.map((item, idx) => {
                            const height = (item.enrollments / getMaxEnrollments()) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-dark-layer2 rounded-t-lg relative h-full flex items-end overflow-hidden">
                                        <div
                                            className="w-full bg-green-500 opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-t-lg"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-dark-muted">{item.month.split('-')[1]}</span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {item.enrollments} Students
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="w-full h-full flex items-center justify-center text-dark-muted">No enrollment data yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 flex-wrap">
                <Link to="/instructor/courses" className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center gap-2 shadow-lg shadow-brand-primary/20">
                    <Plus size={20} />
                    Create New Course
                </Link>
                <Link to="/instructor/upload" className="bg-dark-layer1 border border-dark-layer2 text-white px-6 py-3 rounded-lg font-bold hover:bg-dark-layer2 flex items-center gap-2">
                    <Upload size={20} />
                    Upload Content
                </Link>
                <Link to="/instructor/live" className="bg-dark-layer1 border border-dark-layer2 text-white px-6 py-3 rounded-lg font-bold hover:bg-dark-layer2 flex items-center gap-2">
                    <Video size={20} />
                    Live Session
                </Link>
                <Link to="/instructor/practice" className="bg-dark-layer1 border border-dark-layer2 text-white px-6 py-3 rounded-lg font-bold hover:bg-dark-layer2 flex items-center gap-2">
                    <FileText size={20} />
                    Daily Practice
                </Link>
            </div>

            {/* My Courses */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Top Performing Courses</h2>
                    <Link to="/instructor/courses" className="text-brand-primary hover:underline">View All</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats?.courses?.slice(0, 3).map(course => (
                        <div key={course._id} className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden hover:border-brand-primary transition-colors group">
                            <div className="aspect-video bg-dark-layer2 relative">
                                <img src={course.thumbnail || "/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <span className={`text-xs px-2 py-1 rounded font-bold backdrop-blur-md ${course.approvalStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                                        course.approvalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {course.approvalStatus}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-white mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">{course.title}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-dark-layer2">
                                    <div>
                                        <p className="text-dark-muted text-xs uppercase tracking-wider">Students</p>
                                        <p className="text-white font-bold text-lg">{course.enrollmentCount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-dark-muted text-xs uppercase tracking-wider">Revenue</p>
                                        <p className="text-white font-bold text-lg">${course.revenue?.toFixed(2) || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Enrollments */}
            {stats?.recentEnrollments && stats.recentEnrollments.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Enrollments</h2>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-layer2">
                                <tr>
                                    <th className="text-left p-4 text-dark-muted font-semibold">Student</th>
                                    <th className="text-left p-4 text-dark-muted font-semibold">Course</th>
                                    <th className="text-left p-4 text-dark-muted font-semibold">Date</th>
                                    <th className="text-left p-4 text-dark-muted font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentEnrollments.slice(0, 5).map((enrollment, idx) => (
                                    <tr key={idx} className="border-t border-dark-layer2 hover:bg-dark-layer2/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {enrollment.userId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-white font-medium">{enrollment.userId?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-white">{enrollment.courseId?.title || "Unknown Course"}</td>
                                        <td className="p-4 text-dark-muted">{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <Link to={`/u/${enrollment.userId?._id}`} className="text-brand-primary hover:text-brand-hover text-sm font-medium">View Details</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorDashboard;
