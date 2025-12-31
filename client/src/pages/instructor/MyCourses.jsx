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

    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [sponsorReason, setSponsorReason] = useState('');

    const handleRequestSponsorship = (course) => {
        setSelectedCourse(course);
        setSponsorReason('');
        setShowSponsorModal(true);
    };

    const submitSponsorshipRequest = async () => {
        try {
            await api.post(`/courses/${selectedCourse._id}/sponsor-request`, { sponsorshipReason: sponsorReason });
            await fetchCourses();
            setShowSponsorModal(false);
            alert('Sponsorship requested successfully!');
        } catch (error) {
            console.error('Error requesting sponsorship:', error);
            alert('Failed to request sponsorship');
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
                            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.approvalStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                                    course.approvalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        course.approvalStatus === 'draft' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {course.approvalStatus}
                                </span>
                                {course.sponsorship?.isSponsored && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                                        Sponsored
                                    </span>
                                )}
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

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/course/${course._id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors"
                                    >
                                        <Eye size={16} />
                                        View
                                    </button>
                                    <button
                                        onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                                        className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course._id)}
                                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Sponsorship Button */}
                                {!course.sponsorship?.isSponsored && (
                                    <button
                                        onClick={() => handleRequestSponsorship(course)}
                                        disabled={course.sponsorship?.requestStatus === 'pending'}
                                        className={`w-full py-2 rounded text-sm font-medium transition-colors ${course.sponsorship?.requestStatus === 'pending'
                                            ? 'bg-yellow-500/10 text-yellow-500 cursor-not-allowed'
                                            : 'bg-dark-layer2 hover:bg-dark-layer1 text-white border border-dark-layer2'
                                            }`}
                                    >
                                        {course.sponsorship?.requestStatus === 'pending' ? 'Sponsorship Pending' : 'Request Sponsorship'}
                                    </button>
                                )}
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

            {/* Sponsorship Request Modal */}
            {showSponsorModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-layer1 rounded-lg border border-dark-layer2 p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Request Sponsorship</h2>
                        <p className="text-dark-muted mb-4">Course: {selectedCourse?.title}</p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white mb-2">Reason for Sponsorship</label>
                            <textarea
                                value={sponsorReason}
                                onChange={(e) => setSponsorReason(e.target.value)}
                                className="w-full bg-dark-layer2 border border-dark-layer2 rounded-lg p-3 text-white focus:border-brand-primary focus:outline-none"
                                rows={4}
                                placeholder="Why should this course be sponsored? (e.g., High quality content, popular topic)"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={submitSponsorshipRequest}
                                className="flex-1 bg-brand-primary hover:bg-brand-hover text-white py-2 rounded transition-colors"
                            >
                                Submit Request
                            </button>
                            <button
                                onClick={() => setShowSponsorModal(false)}
                                className="flex-1 bg-dark-layer2 hover:bg-dark-layer1 text-white py-2 rounded transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
