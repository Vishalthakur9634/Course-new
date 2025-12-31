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

            {/* Trend Charts */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-brand-primary" />
                        Enrollment Trend (Last 6 Months)
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {stats.enrollmentTrend?.length > 0 ? (
                            stats.enrollmentTrend.map((item, idx) => {
                                const maxVal = Math.max(...stats.enrollmentTrend.map(i => i.count)) || 1;
                                const height = (item.count / maxVal) * 100;
                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                        <div className="absolute -top-8 bg-brand-primary text-dark-bg px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">
                                            {item.count}
                                        </div>
                                        <div
                                            className="w-full bg-brand-primary/20 hover:bg-brand-primary/40 transition-all rounded-t-lg border-x border-t border-brand-primary/30"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                        <span className="text-[10px] text-dark-muted font-bold uppercase truncate w-full text-center">
                                            {monthNames[item._id.month - 1]}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-dark-muted italic">
                                No enrollment data available for the last 6 months
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-green-500" />
                        Revenue Trend ($)
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {stats.revenueTrend?.length > 0 ? (
                            stats.revenueTrend.map((item, idx) => {
                                const maxVal = Math.max(...stats.revenueTrend.map(i => i.revenue)) || 1;
                                const height = (item.revenue / maxVal) * 100;
                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                        <div className="absolute -top-8 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">
                                            ${item.revenue.toFixed(0)}
                                        </div>
                                        <div
                                            className="w-full bg-green-500/20 hover:bg-green-500/40 transition-all rounded-t-lg border-x border-t border-green-500/30"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                        <span className="text-[10px] text-dark-muted font-bold uppercase truncate w-full text-center">
                                            {monthNames[item._id.month - 1]}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-dark-muted italic">
                                No revenue data available for the last 6 months
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-6">Quick Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-dark-layer2 rounded-xl border border-white/5 text-center">
                        <p className="text-3xl font-black text-brand-primary font-mono">{stats.totalVideos}</p>
                        <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest mt-1">Total Videos</p>
                    </div>
                    <div className="p-4 bg-dark-layer2 rounded-xl border border-white/5 text-center">
                        <p className="text-3xl font-black text-green-500 font-mono">{stats.totalCourses}</p>
                        <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest mt-1">Total Courses</p>
                    </div>
                    <div className="p-4 bg-dark-layer2 rounded-xl border border-white/5 text-center">
                        <p className="text-3xl font-black text-purple-500 font-mono">{stats.totalUsers}</p>
                        <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest mt-1">Total Users</p>
                    </div>
                    <div className="p-4 bg-dark-layer2 rounded-xl border border-white/5 text-center">
                        <p className="text-3xl font-black text-orange-500 font-mono">{stats.totalStorageGB}</p>
                        <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest mt-1">Storage (GB)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformAnalytics;
