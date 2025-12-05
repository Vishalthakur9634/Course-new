import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Users, Search, Star, BookOpen, ExternalLink } from 'lucide-react';

const MyInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMyInstructors();
    }, []);

    const fetchMyInstructors = async () => {
        try {
            // Fetch enrolled courses to get instructors
            const { data: enrollments } = await api.get('/enrollment/my-courses');

            // Extract unique instructors from enrollments
            const uniqueInstructorsMap = new Map();

            enrollments.forEach(enrollment => {
                const instructor = enrollment.courseId?.instructorId;
                if (instructor && !uniqueInstructorsMap.has(instructor._id)) {
                    uniqueInstructorsMap.set(instructor._id, {
                        ...instructor,
                        // Add some course info context if needed, e.g., count of courses by this instructor enrolled in
                        enrolledCoursesCount: 1
                    });
                } else if (instructor) {
                    const existing = uniqueInstructorsMap.get(instructor._id);
                    existing.enrolledCoursesCount += 1;
                }
            });

            setInstructors(Array.from(uniqueInstructorsMap.values()));
        } catch (error) {
            console.error('Error fetching my instructors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInstructors = instructors.filter(instructor =>
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.instructorProfile?.headline?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Instructors</h1>
                    <p className="text-dark-muted">Instructors from your enrolled courses</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search your instructors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-layer2 border border-dark-layer2 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInstructors.map(instructor => (
                    <Link
                        key={instructor._id}
                        to={`/instructor/profile/${instructor._id}`}
                        className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6 hover:border-brand-primary/50 transition-all group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-dark-layer2 mb-4 overflow-hidden border-2 border-transparent group-hover:border-brand-primary transition-colors">
                                {instructor.avatar ? (
                                    <img src={instructor.avatar} alt={instructor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-dark-muted">
                                        {instructor.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">
                                {instructor.name}
                            </h3>

                            <p className="text-sm text-brand-secondary mb-3 line-clamp-1">
                                {instructor.instructorProfile?.headline || 'Instructor'}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-dark-muted mb-4">
                                <div className="flex items-center gap-1">
                                    <BookOpen size={14} />
                                    <span>{instructor.enrolledCoursesCount} Course{instructor.enrolledCoursesCount !== 1 ? 's' : ''} Enrolled</span>
                                </div>
                            </div>

                            <div className="w-full pt-4 border-t border-dark-layer2 flex justify-between items-center">
                                <span className="text-sm font-medium text-brand-primary group-hover:underline">
                                    View Profile
                                </span>
                                <ExternalLink size={16} className="text-dark-muted group-hover:text-brand-primary transition-colors" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredInstructors.length === 0 && (
                <div className="text-center py-12 text-dark-muted">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>You haven't enrolled in any courses with instructors yet.</p>
                    <Link to="/browse" className="text-brand-primary hover:underline mt-2 inline-block">
                        Browse Courses
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyInstructors;
