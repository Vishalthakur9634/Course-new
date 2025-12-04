import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { User, BookOpen, Star, Award, Globe, Github, Linkedin, Twitter } from 'lucide-react';

const InstructorProfile = () => {
    const { instructorId } = useParams();
    const [instructor, setInstructor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInstructorProfile();
    }, [instructorId]);

    const fetchInstructorProfile = async () => {
        try {
            const { data: instructorData } = await api.get(`/users/profile/${instructorId}`);
            setInstructor(instructorData);

            const { data: coursesData } = await api.get(`/courses?instructorId=${instructorId}`);
            setCourses(coursesData.filter(c => c.isPublished && c.approvalStatus === 'approved'));
        } catch (error) {
            console.error('Error fetching instructor:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;
    if (!instructor) return <div className="text-center mt-10 text-white">Instructor not found</div>;

    const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
    const avgRating = courses.length > 0
        ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length
        : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Instructor Header */}
            <div className="bg-dark-layer1 rounded-lg border border-dark-layer2 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                <div className="px-8 pb-8 -mt-16">
                    <div className="flex items-end gap-6">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-dark-layer1 overflow-hidden">
                            {instructor.avatar ? (
                                <img src={instructor.avatar} alt={instructor.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-4xl">{instructor.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1 mt-4">
                            <h1 className="text-3xl font-bold text-white">{instructor.name}</h1>
                            {instructor.instructorProfile?.headline && (
                                <p className="text-lg text-dark-muted mt-1">{instructor.instructorProfile.headline}</p>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mt-8">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">{courses.length}</p>
                            <p className="text-sm text-dark-muted">Courses</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">{totalStudents}</p>
                            <p className="text-sm text-dark-muted">Students</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">{avgRating.toFixed(1)} ⭐</p>
                            <p className="text-sm text-dark-muted">Avg Rating</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">{courses.reduce((sum, c) => sum + (c.videos?.length || 0), 0)}</p>
                            <p className="text-sm text-dark-muted">Total Videos</p>
                        </div>
                    </div>

                    {/* Bio */}
                    {instructor.bio && (
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-white mb-3">About</h3>
                            <p className="text-dark-muted">{instructor.bio}</p>
                        </div>
                    )}

                    {/* Social Links */}
                    {instructor.socialLinks && (
                        <div className="flex gap-4 mt-6">
                            {instructor.socialLinks.website && (
                                <a href={instructor.socialLinks.website} target="_blank" rel="noopener noreferrer"
                                    className="p-3 bg-dark-layer2 rounded-full text-white hover:bg-brand-primary transition-colors">
                                    <Globe size={20} />
                                </a>
                            )}
                            {instructor.socialLinks.twitter && (
                                <a href={instructor.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                    className="p-3 bg-dark-layer2 rounded-full text-white hover:bg-brand-primary transition-colors">
                                    <Twitter size={20} />
                                </a>
                            )}
                            {instructor.socialLinks.linkedin && (
                                <a href={instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                    className="p-3 bg-dark-layer2 rounded-full text-white hover:bg-brand-primary transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {instructor.socialLinks.github && (
                                <a href={instructor.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                    className="p-3 bg-dark-layer2 rounded-full text-white hover:bg-brand-primary transition-colors">
                                    <Github size={20} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Courses */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Courses by {instructor.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <a key={course._id} href={`/course/${course._id}`}
                            className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden hover:border-brand-primary transition-all group">
                            <div className="aspect-video bg-dark-layer2">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-brand-primary/10 text-brand-primary text-xs px-2 py-1 rounded font-bold uppercase">
                                        {course.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                        <Star size={14} fill="currentColor" />
                                        <span>{course.rating || 4.5}</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-sm text-dark-muted">{course.enrollmentCount || 0} students</span>
                                    <span className="font-bold text-xl text-white">${course.price}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {courses.length === 0 && (
                    <div className="text-center text-dark-muted py-20">
                        <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
                        <p>No courses published yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorProfile;
