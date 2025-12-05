import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { User, BookOpen, Star, Award, Globe, Github, Linkedin, Twitter, CheckCircle, Clock, MapPin } from 'lucide-react';

const InstructorProfile = () => {
    const { instructorId } = useParams();
    const [instructor, setInstructor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id === instructorId || user._id === instructorId) {
                setIsOwner(true);
            }
        }
        fetchInstructorProfile();
    }, [instructorId]);

    const fetchInstructorProfile = async () => {
        try {
            const { data: instructorData } = await api.get(`/users/profile/${instructorId}`);
            setInstructor(instructorData);

            const { data: coursesData } = await api.get(`/courses?instructorId=${instructorId}`);

            // If owner, show all. If visitor, show only published & approved.
            // We need to check isOwner state, but it might not be set yet inside this async function if we rely on state.
            // Better to check localStorage directly here or pass a flag.
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const isCurrentUserOwner = currentUser && (currentUser.id === instructorId || currentUser._id === instructorId);

            if (isCurrentUserOwner) {
                setCourses(coursesData);
            } else {
                setCourses(coursesData.filter(c => c.isPublished && c.approvalStatus === 'approved'));
            }

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
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Instructor Header */}
            <div className="bg-dark-layer1 rounded-2xl border border-dark-layer2 overflow-hidden shadow-2xl">
                <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-20 relative z-10">
                        <div className="w-40 h-40 rounded-full bg-dark-layer1 p-1">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden border-4 border-dark-layer1">
                                {instructor.avatar ? (
                                    <img src={instructor.avatar} alt={instructor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-5xl">{instructor.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold text-white">{instructor.name}</h1>
                                {instructor.isInstructorApproved && (
                                    <CheckCircle size={24} className="text-blue-400 fill-blue-400/20" />
                                )}
                            </div>
                            {instructor.instructorProfile?.headline && (
                                <p className="text-xl text-brand-primary mt-1 font-medium">{instructor.instructorProfile.headline}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-dark-muted text-sm">
                                {instructor.location && (
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {instructor.location}</span>
                                )}
                                <span className="flex items-center gap-1"><Clock size={14} /> Joined {new Date(instructor.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        {instructor.socialLinks && (
                            <div className="flex gap-3 mb-4">
                                {instructor.socialLinks.website && (
                                    <a href={instructor.socialLinks.website} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-dark-layer2 rounded-lg text-white hover:bg-brand-primary transition-colors">
                                        <Globe size={20} />
                                    </a>
                                )}
                                {instructor.socialLinks.twitter && (
                                    <a href={instructor.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-dark-layer2 rounded-lg text-white hover:bg-brand-primary transition-colors">
                                        <Twitter size={20} />
                                    </a>
                                )}
                                {instructor.socialLinks.linkedin && (
                                    <a href={instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-dark-layer2 rounded-lg text-white hover:bg-brand-primary transition-colors">
                                        <Linkedin size={20} />
                                    </a>
                                )}
                                {instructor.socialLinks.github && (
                                    <a href={instructor.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-dark-layer2 rounded-lg text-white hover:bg-brand-primary transition-colors">
                                        <Github size={20} />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-dark-layer2">
                        <div className="bg-dark-layer2/50 rounded-xl p-4 text-center hover:bg-dark-layer2 transition-colors">
                            <p className="text-3xl font-bold text-white">{courses.length}</p>
                            <p className="text-sm text-dark-muted font-medium uppercase tracking-wider mt-1">Courses</p>
                        </div>
                        <div className="bg-dark-layer2/50 rounded-xl p-4 text-center hover:bg-dark-layer2 transition-colors">
                            <p className="text-3xl font-bold text-white">{totalStudents}</p>
                            <p className="text-sm text-dark-muted font-medium uppercase tracking-wider mt-1">Students</p>
                        </div>
                        <div className="bg-dark-layer2/50 rounded-xl p-4 text-center hover:bg-dark-layer2 transition-colors">
                            <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                                {avgRating.toFixed(1)} <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            </p>
                            <p className="text-sm text-dark-muted font-medium uppercase tracking-wider mt-1">Avg Rating</p>
                        </div>
                        <div className="bg-dark-layer2/50 rounded-xl p-4 text-center hover:bg-dark-layer2 transition-colors">
                            <p className="text-3xl font-bold text-white">{courses.reduce((sum, c) => sum + (c.videos?.length || 0), 0)}</p>
                            <p className="text-sm text-dark-muted font-medium uppercase tracking-wider mt-1">Total Lessons</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-8 border-b border-dark-layer2 px-4">
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`pb-4 text-lg font-medium transition-colors relative ${activeTab === 'courses' ? 'text-brand-primary' : 'text-dark-muted hover:text-white'}`}
                >
                    Courses
                    {activeTab === 'courses' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('about')}
                    className={`pb-4 text-lg font-medium transition-colors relative ${activeTab === 'about' ? 'text-brand-primary' : 'text-dark-muted hover:text-white'}`}
                >
                    About
                    {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full"></div>}
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'courses' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">
                                {isOwner ? 'Your Courses' : `Courses by ${instructor.name}`}
                            </h2>
                            {isOwner && (
                                <Link to="/instructor/upload" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors">
                                    Create New Course
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <Link key={course._id} to={`/course/${course._id}`}
                                    className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden hover:border-brand-primary transition-all group flex flex-col h-full">
                                    <div className="aspect-video bg-dark-layer2 relative">
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                        {(!course.isPublished || course.approvalStatus !== 'approved') && (
                                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded border border-white/20">
                                                {course.isPublished ? course.approvalStatus : 'Draft'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
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
                                        <div className="mt-auto pt-4 flex justify-between items-center border-t border-dark-layer2">
                                            <span className="text-sm text-dark-muted">{course.enrollmentCount || 0} students</span>
                                            <span className="font-bold text-xl text-white">${course.price}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {courses.length === 0 && (
                            <div className="text-center text-dark-muted py-20 bg-dark-layer1 rounded-xl border border-dark-layer2">
                                <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
                                <p className="text-xl font-medium">No courses found</p>
                                {isOwner && <p className="mt-2">Start creating your first course!</p>}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="bg-dark-layer1 rounded-xl border border-dark-layer2 p-8">
                        <h3 className="text-2xl font-bold text-white mb-6">About {instructor.name}</h3>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-dark-muted text-lg leading-relaxed whitespace-pre-wrap">
                                {instructor.bio || "No biography available."}
                            </p>
                        </div>

                        {/* Additional Info could go here */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-dark-layer2">
                            <div>
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Award className="text-brand-primary" /> Credentials
                                </h4>
                                <ul className="space-y-2 text-dark-muted">
                                    <li>Verified Instructor</li>
                                    <li>{courses.length} Published Courses</li>
                                    <li>{totalStudents} Students Taught</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <CheckCircle className="text-brand-primary" /> Expertise
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {/* Extract unique categories from courses */}
                                    {[...new Set(courses.map(c => c.category))].map(cat => (
                                        <span key={cat} className="px-3 py-1 bg-dark-layer2 rounded-full text-sm text-white">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorProfile;
