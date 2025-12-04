import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { TrendingUp, Users, DollarSign, BookOpen, Plus, Upload } from 'lucide-react';

const InstructorDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/instructor/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                <h1 className="text-4xl font-bold mb-3">Instructor Dashboard</h1>
                <p className="text-lg opacity-90">Manage your courses and track your success</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-muted">Total Courses</span>
                        <BookOpen className="text-blue-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.summary?.totalCourses || 0}</p>
                </div>
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-muted">Total Students</span>
                        <Users className="text-green-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.summary?.totalStudents || 0}</p>
                </div>
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-muted">Total Revenue</span>
                        <DollarSign className="text-yellow-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-white">${stats?.summary?.totalRevenue?.toFixed(2) || 0}</p>
                </div>
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-muted">Pending Payout</span>
                        <TrendingUp className="text-purple-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-white">${stats?.summary?.pendingPayout?.toFixed(2) || 0}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <Link to="/instructor/courses" className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center gap-2">
                    <Plus size={20} />
                    Create New Course
                </Link>
                <Link to="/instructor/upload" className="bg-dark-layer1 border border-dark-layer2 text-white px-6 py-3 rounded-lg font-bold hover:bg-dark-layer2 flex items-center gap-2">
                    <Upload size={20} />
                    Upload Content
                </Link>
            </div>

            {/* My Courses */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">My Courses</h2>
                    <Link to="/instructor/courses" className="text-brand-primary hover:underline">View All</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats?.courses?.slice(0, 3).map(course => (
                        <div key={course._id} className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden">
                            <div className="aspect-video bg-dark-layer2">
                                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${course.approvalStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                                        course.approvalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {course.approvalStatus}
                                    </span>
                                    {course.isPublished && (
                                        <span className="text-xs px-2 py-1 rounded font-bold bg-blue-500/20 text-blue-400">
                                            Published
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-white mb-3 line-clamp-2">{course.title}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-dark-muted">Students</p>
                                        <p className="text-white font-bold">{course.enrollmentCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-dark-muted">Revenue</p>
                                        <p className="text-white font-bold">${course.revenue?.toFixed(2) || 0}</p>
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
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-dark-layer2">
                                <tr>
                                    <th className="text-left p-4 text-dark-muted font-semibold">Student</th>
                                    <th className="text-left p-4 text-dark-muted font-semibold">Course</th>
                                    <th className="text-left p-4 text-dark-muted font-semibold">Date</th>
                                    <th className="text-left p-4 text-dark-muted font-semibold">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentEnrollments.slice(0, 5).map((enrollment, idx) => (
                                    <tr key={idx} className="border-t border-dark-layer2">
                                        <td className="p-4 text-white">{enrollment.studentId?.name}</td>
                                        <td className="p-4 text-white">{enrollment.courseId?.title}</td>
                                        <td className="p-4 text-dark-muted">{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="w-24 bg-dark-layer2 rounded-full h-2">
                                                <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                                            </div>
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
