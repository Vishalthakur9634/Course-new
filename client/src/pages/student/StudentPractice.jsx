import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, CheckCircle, Clock } from 'lucide-react';

const StudentPractice = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchProblems(selectedCourse._id);
        }
    }, [selectedCourse]);

    const fetchEnrolledCourses = async () => {
        try {
            const { data } = await api.get('/courses/my-learning');
            // Extract courses from enrollments if the endpoint returns enrollments
            // Or if it returns courses directly, just use data
            // Assuming /courses/my-learning returns a list of courses directly or enrollments
            // Let's assume it returns courses for now, if not we adapt
            setCourses(data);
            if (data.length > 0) setSelectedCourse(data[0]);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProblems = async (courseId) => {
        try {
            const { data } = await api.get(`/practice/course/${courseId}`);
            setProblems(data);
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Daily Practice</h1>
                <p className="opacity-90 text-lg">Sharpen your skills with daily challenges from your instructors.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar / Course Selector */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                    <h3 className="text-dark-muted font-medium px-2 mb-2">Your Courses</h3>
                    {courses.map(course => (
                        <button
                            key={course._id}
                            onClick={() => setSelectedCourse(course)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors border border-transparent ${selectedCourse?._id === course._id
                                    ? 'bg-brand-primary text-white shadow-md'
                                    : 'bg-dark-layer1 text-dark-muted hover:bg-dark-layer2 hover:text-white border-dark-layer2'
                                }`}
                        >
                            <span className="line-clamp-1">{course.title}</span>
                        </button>
                    ))}

                    {courses.length === 0 && (
                        <div className="text-dark-muted px-4 text-sm">No active courses found.</div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-4">
                    {problems.map(problem => (
                        <div key={problem._id} className="bg-dark-layer1 rounded-xl border border-dark-layer2 p-6 hover:border-brand-primary/30 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{problem.title}</h3>
                                    <div className="flex items-center gap-2 text-dark-muted text-sm">
                                        <Clock size={14} />
                                        <span>Posted {new Date(problem.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-300 whitespace-pre-wrap mb-6 leading-relaxed bg-[#151f2e] p-4 rounded-lg border border-dark-layer2/50">
                                {problem.description}
                            </p>

                            {problem.attachments && problem.attachments.length > 0 && (
                                <div className="border-t border-dark-layer2 pt-4">
                                    <h4 className="text-sm font-medium text-dark-muted mb-3 uppercase tracking-wider">Resources</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {problem.attachments.map((att, i) => (
                                            <a
                                                key={i}
                                                href={att.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 bg-dark-layer2 hover:bg-[#2a3b55] px-4 py-2 rounded-lg text-brand-primary transition-colors border border-dark-layer2 hover:border-brand-primary/50 group"
                                            >
                                                <div className="bg-brand-primary/10 p-2 rounded group-hover:bg-brand-primary/20">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="font-medium">{att.name || 'Attachment'}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {problems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 bg-dark-layer1 rounded-xl border border-dashed border-dark-layer2 text-dark-muted">
                            <CheckCircle size={48} className="mb-4 text-dark-muted/50" />
                            <p className="text-lg">No practice problems available yet.</p>
                            <p className="text-sm">Check back later for new challenges!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPractice;
