import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart3, TrendingUp, Users, BookOpen, DollarSign, Activity } from 'lucide-react';

const PlatformAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading analytics...</div>;
    }

    if (!stats) {
        return <div className="text-center mt-10 text-white">Error loading analytics</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-full">
                            <Users size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Users</p>
                            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-full">
                            <BookOpen size={24} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Courses</p>
                            <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <Activity size={24} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Videos</p>
                            <p className="text-2xl font-bold text-white">{stats.totalVideos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-full">
                            <DollarSign size={24} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Storage Used</p>
                            <p className="text-2xl font-bold text-white">{stats.totalStorageGB} GB</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Distribution */}
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Users size={20} className="text-brand-primary" />
                        User Distribution
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-dark-muted">Students</span>
                            <span className="text-white font-semibold">
                                {stats.usersByRole?.student || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-dark-muted">Instructors</span>
                            <span className="text-white font-semibold">
                                {stats.usersByRole?.instructor || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-dark-muted">Admins</span>
                            <span className="text-white font-semibold">
                                {(stats.usersByRole?.admin || 0) + (stats.usersByRole?.superadmin || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Platform Growth */}
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-brand-primary" />
                        Platform Health
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-dark-muted">Active Courses</span>
                            <span className="text-green-400 font-semibold">
                                {stats.activeCourses || stats.totalCourses}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-dark-muted">Pending Approvals</span>
                            <span className="text-yellow-400 font-semibold">
                                {stats.pendingCourses || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-dark-muted">Storage Capacity</span>
                            <span className="text-white font-semibold">
                                {stats.totalStorageGB}GB / 1000GB
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-brand-primary">{stats.totalVideos}</p>
                        <p className="text-sm text-dark-muted mt-1">Videos Uploaded</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">{stats.totalCourses}</p>
                        <p className="text-sm text-dark-muted mt-1">Courses Created</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-500">{stats.totalUsers}</p>
                        <p className="text-sm text-dark-muted mt-1">Registered Users</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-500">{stats.totalStorageGB}</p>
                        <p className="text-sm text-dark-muted mt-1">GB Storage Used</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformAnalytics;
