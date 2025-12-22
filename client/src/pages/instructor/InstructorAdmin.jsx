import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    BarChart3, Users, DollarSign, BookOpen, Settings as SettingsIcon,
    TrendingUp, Eye, EyeOff, FileText, Download, Calendar, Award
} from 'lucide-react';

const InstructorAdmin = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [tabSettings, setTabSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await api.get('/instructor-admin/dashboard');
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabSettingsUpdate = async (courseId) => {
        try {
            await api.put(`/instructor-admin/courses/${courseId}/settings`, tabSettings[courseId]);
            alert('Course settings updated successfully!');
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Failed to update settings');
        }
    };

    const handleTabToggle = (courseId, tabName, value) => {
        setTabSettings(prev => ({
            ...prev,
            [courseId]: {
                ...(prev[courseId] || {}),
                [tabName]: value
            }
        }));
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading admin dashboard...</div>;
    }

    if (!dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center mt-20 text-white">
                <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/20 text-center max-w-md">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Dashboard Unavailable</h3>
                    <p className="text-dark-muted mb-4">
                        We couldn't load your instructor stats. This might be because your account is pending approval or there's a connection issue.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-dark-layer2 hover:bg-dark-layer1 px-4 py-2 rounded text-sm transition-colors"
                    >
                        Retry Connection
                    </button>
                    <p className="text-xs text-dark-muted mt-4">
                        If this persists, please contact support.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Course Launcher Admin Panel</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-full">
                            <BookOpen size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Courses</p>
                            <p className="text-2xl font-bold text-white">{dashboardData.totalCourses}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <Users size={24} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Students</p>
                            <p className="text-2xl font-bold text-white">{dashboardData.totalStudents}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-full">
                            <DollarSign size={24} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-white">${dashboardData.totalRevenue}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-full">
                            <FileText size={24} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Videos</p>
                            <p className="text-2xl font-bold text-white">{dashboardData.totalVideos}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-layer2">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'overview'
                        ? 'text-brand-primary border-b-2 border-brand-primary'
                        : 'text-dark-muted hover:text-white'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'courses'
                        ? 'text-brand-primary border-b-2 border-brand-primary'
                        : 'text-dark-muted hover:text-white'
                        }`}
                >
                    Course Management
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'students'
                        ? 'text-brand-primary border-b-2 border-brand-primary'
                        : 'text-dark-muted hover:text-white'
                        }`}
                >
                    Students
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dashboardData.courses.map(course => (
                        <div key={course._id} className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                            <h3 className="text-xl font-bold text-white mb-4">{course.title}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-dark-muted">Enrollments:</span>
                                    <span className="text-white font-semibold">{course.enrollmentCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-dark-muted">Revenue:</span>
                                    <span className="text-white font-semibold">${course.revenue}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-dark-muted">Rating:</span>
                                    <span className="text-white font-semibold">{course.rating.toFixed(1)} ⭐</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-dark-muted">Videos:</span>
                                    <span className="text-white font-semibold">{course.videoCount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'courses' && (
                <div className="space-y-6">
                    {dashboardData.courses.map(course => {
                        const settings = tabSettings[course._id] || course.instructorAdminSettings || {};

                        return (
                            <div key={course._id} className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                                <h3 className="text-xl font-bold text-white mb-4">{course.title}</h3>

                                <div className="space-y-4">
                                    <h4 className="text-md font-semibold text-white">Video Player Tab Controls</h4>
                                    <p className="text-sm text-dark-muted">Enable or disable tabs in the video player for this course:</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.enableOverview !== false}
                                                onChange={(e) => handleTabToggle(course._id, 'enableOverview', e.target.checked)}
                                                className="w-5 h-5"
                                            />
                                            <span className="text-white">Overview Tab</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.enableQA !== false}
                                                onChange={(e) => handleTabToggle(course._id, 'enableQA', e.target.checked)}
                                                className="w-5 h-5"
                                            />
                                            <span className="text-white">Q&A Tab</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.enableSummary !== false}
                                                onChange={(e) => handleTabToggle(course._id, 'enableSummary', e.target.checked)}
                                                className="w-5 h-5"
                                            />
                                            <span className="text-white">Summary Tab</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.enableNotes !== false}
                                                onChange={(e) => handleTabToggle(course._id, 'enableNotes', e.target.checked)}
                                                className="w-5 h-5"
                                            />
                                            <span className="text-white">Notes Tab</span>
                                        </label>
                                    </div>

                                    <button
                                        onClick={() => handleTabSettingsUpdate(course._id)}
                                        className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded transition-colors"
                                    >
                                        Save Settings
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'students' && (
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Enrollments</h3>
                    <div className="space-y-3">
                        {dashboardData.recentEnrollments?.slice(0, 10).map(enrollment => (
                            <div key={enrollment._id} className="flex items-center justify-between p-3 bg-dark-layer2 rounded">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <span className="text-white font-bold">{enrollment.userId?.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{enrollment.userId?.name}</p>
                                        <p className="text-sm text-dark-muted">{enrollment.userId?.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-dark-muted">
                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorAdmin;
