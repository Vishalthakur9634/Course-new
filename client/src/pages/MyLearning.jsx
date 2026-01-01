import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { PlayCircle, BookOpen } from 'lucide-react';

const MyLearning = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            // Use the dedicated endpoint for enrolled courses which returns a cleaner structure
            // Or use the profile endpoint and map it. 
            // The enrollment.js has /my-courses endpoint which returns exactly what we need!
            const { data } = await api.get('/enrollment/my-courses');
            // The endpoint returns enrollments with populated courseId
            setCourses(data.filter(e => e && e.courseId).map(enrollment => ({
                ...enrollment.courseId,
                progress: enrollment.progress // Keep progress from enrollment
            })) || []);
        } catch (error) {
            console.error('Error fetching courses', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading your courses...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BookOpen className="text-brand-primary" /> My Learning
            </h1>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-dark-layer1 rounded-lg border border-dark-layer2">
                    <p className="text-dark-muted text-lg mb-4">You haven't enrolled in any courses yet.</p>
                    <Link to="/" className="bg-brand-primary text-white px-6 py-2 rounded hover:bg-brand-hover transition-colors">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <Link to={`/course/${course._id || ''}/watch`} key={`course-${index}`} className="bg-dark-layer1 border border-dark-layer2 rounded-lg overflow-hidden hover:border-brand-primary transition-all group">
                            <div className="aspect-video bg-dark-layer2 relative">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircle size={48} className="text-brand-primary" />
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-semibold line-clamp-1 text-white mb-2">{course.title}</h3>
                                <div className="w-full bg-dark-layer2 h-2 rounded-full overflow-hidden">
                                    <div className="bg-brand-primary h-full" style={{ width: `${course.progress || 0}%` }}></div>
                                </div>
                                <p className="text-xs text-dark-muted mt-2">{Math.round(course.progress || 0)}% Completed</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLearning;
