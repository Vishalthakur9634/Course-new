import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { BookOpen, Plus, Edit, Trash2, Eye, Users, Star } from 'lucide-react';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor-admin/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            await api.delete(`/admin/courses/${courseId}`);
            await fetchCourses();
            alert('Course deleted successfully!');
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course');
        }
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading your courses...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">My Courses</h1>
                <button
                    onClick={() => navigate('/instructor/upload')}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors"
                >
                    <Plus size={18} />
                    Create New Course
                </button>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course._id} className="bg-dark-layer1 rounded-lg border border-dark-layer2 overflow-hidden hover:border-brand-primary transition-colors">
                        {/* Course Thumbnail */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <BookOpen size={48} className="text-white/50" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.approvalStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                                        course.approvalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {course.approvalStatus}
                                </span>
                            </div>
                        </div>

                        {/* Course Info */}
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                            <p className="text-sm text-dark-muted mb-4 line-clamp-2">{course.description}</p>

                            <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                                <div className="flex items-center gap-1 text-dark-muted">
                                    <Users size={14} />
                                    <span>{course.enrollmentCount || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 text-dark-muted">
                                    <Star size={14} />
                                    <span>{course.rating ? course.rating.toFixed(1) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-dark-muted">
                                    <BookOpen size={14} />
                                    <span>{course.videos?.length || 0} videos</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors"
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                                <button
                                    onClick={() => handleDelete(course._id)}
                                    className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="text-center py-20">
                    <BookOpen size={64} className="mx-auto text-dark-muted mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                    <p className="text-dark-muted mb-6">Create your first course to start teaching!</p>
                    <button
                        onClick={() => navigate('/instructor/upload')}
                        className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors"
                    >
                        Create Your First Course
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
