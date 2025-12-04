import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { PlayCircle, Clock, Award, TrendingUp, BookOpen } from 'lucide-react';

const StudentDashboard = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/enrollment/my-courses');
            setEnrollments(response.data);

            const completed = response.data.filter(e => e.isCompleted).length;
            const inProgress = response.data.filter(e => !e.isCompleted && e.progress > 0).length;

            setStats({
                total: response.data.length,
                inProgress,
                completed
            });
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-96"><div className="text-white">Loading...</div></div>;

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-primary to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-4xl font-bold mb-3">Welcome back! 👋</h1>
                <p className="text-lg opacity-90">Continue your learning journey</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-muted">Total Courses</span>
                        <BookOpen className="text-blue-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-muted">In Progress</span>
                        <Clock className="text-yellow-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
                </div>
                <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-muted">Completed</span>
                        <Award className="text-green-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.completed}</p>
                </div>
            </div>

            {/* Continue Learning */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Continue Learning</h2>
                    <Link to="/student/learning" className="text-brand-primary hover:underline">View All</Link>
                </div>

                {enrollments.filter(e => !e.isCompleted).length === 0 ? (
                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-12 text-center">
                        <p className="text-dark-muted mb-4">No courses in progress</p>
                        <Link to="/student/browse" className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 inline-block">
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.filter(e => !e.isCompleted).slice(0, 3).map((enrollment) => (
                            <Link
                                key={enrollment._id}
                                to={`/course/${enrollment.courseId._id}`}
                                className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden hover:border-brand-primary transition-all group"
                            >
                                <div className="aspect-video bg-dark-layer2 relative">
                                    <img src={enrollment.courseId.thumbnail} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle size={48} className="text-brand-primary" />
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-white mb-2 line-clamp-2">{enrollment.courseId.title}</h3>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm text-dark-muted mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round(enrollment.progress)}%</span>
                                        </div>
                                        <div className="w-full bg-dark-layer2 rounded-full h-2">
                                            <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-brand-primary">Continue Learning →</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
