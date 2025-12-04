import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { TrendingUp, Users, DollarSign, BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/superadmin/dashboard');
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
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
                <h1 className="text-4xl font-bold mb-3">Platform Overview</h1>
                <p className="text-lg opacity-90">Manage and monitor your entire platform</p>
            </div>

            {/* User Stats */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Users</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Total Users</span>
                            <Users className="text-blue-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.statistics?.users?.total || 0}</p>
                        <p className="text-sm text-dark-muted mt-2">+{stats?.statistics?.users?.newLast30Days || 0} this month</p>
                    </div>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Students</span>
                            <BookOpen className="text-green-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.statistics?.users?.students || 0}</p>
                    </div>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Instructors</span>
                            <Users className="text-purple-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.statistics?.users?.instructors || 0}</p>
                    </div>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Pending Instructors</span>
                            <Clock className="text-yellow-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.statistics?.users?.pendingInstructors || 0}</p>
                    </div>
                </div>
            </div>

            {/* Course Stats */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Total Courses</span>
                            <BookOpen className="text-blue-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.statistics?.courses?.total || 0}</p>
                        <p className="text-sm text-dark-muted mt-2">+{stats?.statistics?.courses?.newLast30Days || 0} this month</p>
                    </div>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Published</span>
                            <CheckCircle className="text-green-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.statistics?.courses?.published || 0}</p>
                    </div>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Pending Approval</span>
                            <Clock className="text-yellow-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.statistics?.courses?.pending || 0}</p>
                    </div>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Drafts</span>
                            <XCircle className="text-gray-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.statistics?.courses?.draft || 0}</p>
                    </div>
                </div>
            </div>

            {/* Revenue Stats */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Revenue</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Total Revenue</span>
                            <DollarSign className="text-green-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">${stats?.statistics?.revenue?.total?.toFixed(2) || 0}</p>
                    </div>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Platform Earnings</span>
                            <TrendingUp className="text-blue-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">${stats?.statistics?.revenue?.platformEarnings?.toFixed(2) || 0}</p>
                    </div>
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-dark-muted">Instructor Earnings</span>
                            <DollarSign className="text-purple-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">${stats?.statistics?.revenue?.instructorEarnings?.toFixed(2) || 0}</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Users</h3>
                    <div className="space-y-3">
                        {stats?.recentActivity?.users?.slice(0, 5).map(user => (
                            <div key={user._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-purple-500 flex items-center justify-center text-white font-bold">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{user.name}</p>
                                        <p className="text-dark-muted text-sm">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${user.role === 'student' ? 'bg-blue-500/20 text-blue-400' :
                                    user.role === 'instructor' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Courses */}
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Courses</h3>
                    <div className="space-y-3">
                        {stats?.recentActivity?.courses?.slice(0, 5).map(course => (
                            <div key={course._id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium line-clamp-1">{course.title}</p>
                                    <p className="text-dark-muted text-sm">by {course.instructorId?.name}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${course.approvalStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                                    course.approvalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {course.approvalStatus}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
