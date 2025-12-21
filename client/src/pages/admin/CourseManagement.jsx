import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    BookOpen, Edit, Trash2, Check, X, DollarSign, Star, Users,
    Gift, Calendar, Filter, Search
} from 'lucide-react';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [sponsorshipData, setSponsorshipData] = useState({
        sponsorshipType: 'free',
        sponsorshipDiscount: 100,
        sponsorshipReason: '',
        sponsorshipEndDate: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (courseId, status) => {
        try {
            await api.put(`/admin/courses/${courseId}/approve`, { approvalStatus: status });
            await fetchCourses();
            alert(`Course ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
        } catch (error) {
            console.error('Error approving course:', error);
            alert('Failed to update course status');
        }
    };

    const handleSponsor = (course) => {
        setSelectedCourse(course);
        setShowSponsorModal(true);

        // Pre-fill if already sponsored
        if (course.sponsorship?.isSponsored) {
            setSponsorshipData({
                sponsorshipType: course.sponsorship.sponsorshipType,
                sponsorshipDiscount: course.sponsorship.sponsorshipDiscount,
                sponsorshipReason: course.sponsorship.sponsorshipReason,
                sponsorshipEndDate: course.sponsorship.sponsorshipEndDate?.split('T')[0] || ''
            });
        }
    };

    const submitSponsorship = async () => {
        try {
            await api.post(`/admin/courses/${selectedCourse._id}/sponsor`, sponsorshipData);
            await fetchCourses();
            setShowSponsorModal(false);
            setSponsorshipData({
                sponsorshipType: 'free',
                sponsorshipDiscount: 100,
                sponsorshipReason: '',
                sponsorshipEndDate: ''
            });
            alert('Course sponsored successfully!');
        } catch (error) {
            console.error('Error sponsoring course:', error);
            alert('Failed to sponsor course');
        }
    };

    const handleRemoveSponsorship = async (courseId) => {
        if (!window.confirm('Are you sure you want to remove sponsorship from this course?')) return;

        try {
            await api.delete(`/admin/courses/${courseId}/sponsor`);
            await fetchCourses();
            alert('Sponsorship removed successfully!');
        } catch (error) {
            console.error('Error removing sponsorship:', error);
            alert('Failed to remove sponsorship');
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) return;

        try {
            await api.delete(`/admin/courses/${courseId}`);
            await fetchCourses();
            alert('Course deleted successfully!');
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course');
        }
    };

    const handleApproveSponsorship = async (courseId, status) => {
        try {
            await api.put(`/admin/courses/${courseId}/sponsor-status`, {
                status,
                // Default values for approval
                sponsorshipType: 'discounted',
                sponsorshipDiscount: 50,
                sponsorshipStartDate: new Date(),
                sponsorshipEndDate: null
            });
            await fetchCourses();
            alert(`Sponsorship ${status} successfully!`);
        } catch (error) {
            console.error('Error updating sponsorship status:', error);
            alert('Failed to update sponsorship status');
        }
    };

    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, sponsored, sponsorship-pending

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterStatus === 'all') return true;
        if (filterStatus === 'pending') return course.approvalStatus === 'pending';
        if (filterStatus === 'sponsored') return course.sponsorship?.isSponsored;
        if (filterStatus === 'sponsorship-pending') return course.sponsorship?.requestStatus === 'pending';

        return true;
    });

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading courses...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Course Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1 rounded text-sm ${filterStatus === 'all' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-muted'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-3 py-1 rounded text-sm ${filterStatus === 'pending' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-muted'}`}
                    >
                        Pending Approval
                    </button>
                    <button
                        onClick={() => setFilterStatus('sponsorship-pending')}
                        className={`px-3 py-1 rounded text-sm ${filterStatus === 'sponsorship-pending' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-muted'}`}
                    >
                        Sponsorship Requests
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-layer1 border border-dark-layer2 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-primary focus:outline-none"
                />
            </div>

            {/* Courses Table */}
            <div className="bg-dark-layer1 rounded-lg border border-dark-layer2 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-dark-layer2">
                        <tr>
                            <th className="text-left p-4 text-dark-muted font-medium">Course</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Instructor</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Price</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Status</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Enrollment</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map(course => (
                            <tr key={course._id} className="border-t border-dark-layer2 hover:bg-dark-layer2 transition-colors">
                                <td className="p-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium">{course.title}</p>
                                            {course.sponsorship?.isSponsored && (
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded flex items-center gap-1">
                                                    <Gift size={12} /> Sponsored
                                                </span>
                                            )}
                                            {course.sponsorship?.requestStatus === 'pending' && (
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded flex items-center gap-1">
                                                    <Gift size={12} /> Request Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-dark-muted">{course.category}</p>
                                        {course.sponsorship?.requestStatus === 'pending' && (
                                            <p className="text-xs text-purple-300 mt-1">Reason: {course.sponsorship.sponsorshipReason}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-white">{course.instructorId?.name || 'Unknown'}</p>
                                </td>
                                <td className="p-4">
                                    <div>
                                        {course.sponsorship?.isSponsored ? (
                                            <div className="flex flex-col">
                                                {course.sponsorship.sponsorshipType === 'free' ? (
                                                    <span className="text-green-400 font-bold">FREE</span>
                                                ) : (
                                                    <>
                                                        <span className="text-white font-bold">
                                                            ${(course.price * (1 - course.sponsorship.sponsorshipDiscount / 100)).toFixed(2)}
                                                        </span>
                                                        <span className="text-sm text-dark-muted line-through">${course.price}</span>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-white">${course.price}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${course.isPublished ? 'bg-green-500/20 text-green-400' :
                                                course.approvalStatus === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                                                    course.approvalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        course.approvalStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {course.isPublished ? 'Published' : course.approvalStatus}
                                        </span>
                                        {course.isPublished && course.publishedAt && (
                                            <span className="text-[10px] text-dark-muted">
                                                {new Date(course.publishedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-dark-muted" />
                                        <span className="text-white">{course.enrollmentCount || 0}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {course.approvalStatus === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(course._id, 'approved')}
                                                    className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                                    title="Approve Course"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(course._id, 'rejected')}
                                                    className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                                    title="Reject Course"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}

                                        {/* Sponsorship Approval Actions */}
                                        {course.sponsorship?.requestStatus === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleSponsor(course)} // Open modal to approve with details
                                                    className="p-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                                                    title="Approve Sponsorship"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleApproveSponsorship(course._id, 'rejected')}
                                                    className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                                    title="Reject Sponsorship"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}

                                        {course.sponsorship?.isSponsored ? (
                                            <button
                                                onClick={() => handleRemoveSponsorship(course._id)}
                                                className="p-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
                                                title="Remove Sponsorship"
                                            >
                                                <Gift size={16} />
                                            </button>
                                        ) : (
                                            !course.sponsorship?.requestStatus && (
                                                <button
                                                    onClick={() => handleSponsor(course)}
                                                    className="p-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                                                    title="Sponsor Course"
                                                >
                                                    <Gift size={16} />
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={() => window.location.href = `/instructor/edit-course/${course._id}`}
                                            className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                                            title="Edit Course"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sponsorship Modal */}
            {showSponsorModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-layer1 rounded-lg border border-dark-layer2 p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Sponsor Course</h2>
                        <p className="text-dark-muted mb-4">Course: {selectedCourse?.title}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Sponsorship Type</label>
                                <select
                                    value={sponsorshipData.sponsorshipType}
                                    onChange={(e) => {
                                        const type = e.target.value;
                                        setSponsorshipData({
                                            ...sponsorshipData,
                                            sponsorshipType: type,
                                            sponsorshipDiscount: type === 'free' ? 100 : 50
                                        });
                                    }}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                                >
                                    <option value="free">100% Free</option>
                                    <option value="discounted">Discounted</option>
                                </select>
                            </div>

                            {sponsorshipData.sponsorshipType === 'discounted' && (
                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-2">Discount Percentage</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={sponsorshipData.sponsorshipDiscount}
                                        onChange={(e) => setSponsorshipData({ ...sponsorshipData, sponsorshipDiscount: parseInt(e.target.value) })}
                                        className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">End Date (Optional)</label>
                                <input
                                    type="date"
                                    value={sponsorshipData.sponsorshipEndDate}
                                    onChange={(e) => setSponsorshipData({ ...sponsorshipData, sponsorshipEndDate: e.target.value })}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Reason (Optional)</label>
                                <textarea
                                    value={sponsorshipData.sponsorshipReason}
                                    onChange={(e) => setSponsorshipData({ ...sponsorshipData, sponsorshipReason: e.target.value })}
                                    rows={3}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                                    placeholder="Why is this course being sponsored?"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={submitSponsorship}
                                className="flex-1 bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded transition-colors"
                            >
                                Sponsor Course
                            </button>
                            <button
                                onClick={() => {
                                    setShowSponsorModal(false);
                                    setSponsorshipData({
                                        sponsorshipType: 'free',
                                        sponsorshipDiscount: 100,
                                        sponsorshipReason: '',
                                        sponsorshipEndDate: ''
                                    });
                                }}
                                className="flex-1 bg-dark-layer2 hover:bg-dark-layer1 text-white px-4 py-2 rounded transition-colors"
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

export default CourseManagement;
