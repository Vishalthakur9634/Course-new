import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Upload, Video, Trash2, Users, BookOpen, HardDrive, Edit, Search, TrendingUp, Star, Calendar, AlertCircle, Award, DollarSign, MessageSquare, Bell } from 'lucide-react';

const AdminDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    const [payments, setPayments] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [certificates, setCertificates] = useState([]);

    // Create Course State
    const [courseForm, setCourseForm] = useState({
        title: '', description: '', price: '', category: '', thumbnail: ''
    });

    // Upload Video State
    const [videoForm, setVideoForm] = useState({
        title: '', description: '', video: null
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchCourses();
        fetchUsers();
        fetchPayments();
        fetchReviews();
        fetchAnnouncements();
        fetchCertificates();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            console.log('Stats fetched:', data);
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            console.error('Error response:', error.response?.data);
            // Set default stats if fetch fails
            setStats({
                totalCourses: 0,
                totalVideos: 0,
                totalUsers: 0,
                totalStorageGB: 0
            });
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses');
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users');
        }
    };

    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/admin/payments');
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/admin/reviews');
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get('/admin/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const fetchCertificates = async () => {
        try {
            const { data } = await api.get('/admin/certificates');
            setCertificates(data);
        } catch (error) {
            console.error('Error fetching certificates:', error);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', courseForm);
            setCourseForm({ title: '', description: '', price: '', category: '', thumbnail: '' });
            fetchCourses();
            fetchStats();
            alert('Course created successfully');
        } catch (error) {
            alert('Failed to create course');
        }
    };

    const handleUploadVideo = async (e) => {
        e.preventDefault();
        if (!selectedCourse || !videoForm.video) return;

        const formData = new FormData();
        formData.append('title', videoForm.title);
        formData.append('description', videoForm.description);
        formData.append('video', videoForm.video);

        setUploading(true);
        try {
            await api.post(`/courses/${selectedCourse}/videos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setVideoForm({ title: '', description: '', video: null });
            fetchCourses();
            fetchStats();
            alert('Video uploaded successfully! Processing complete.');
        } catch (error) {
            console.error(error);
            alert('Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVideo = async (courseId, videoId) => {
        if (!confirm('Are you sure you want to delete this video? This will permanently remove all video files.')) return;

        try {
            await api.delete(`/admin/courses/${courseId}/videos/${videoId}`);
            fetchCourses();
            fetchStats();
            alert('Video deleted successfully');
        } catch (error) {
            alert('Failed to delete video');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!confirm('Are you sure you want to delete this course? This will permanently remove the course and ALL its videos.')) return;

        try {
            await api.delete(`/admin/courses/${courseId}`);
            fetchCourses();
            fetchStats();
            alert('Course and all videos deleted successfully');
        } catch (error) {
            alert('Failed to delete course');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
            fetchStats();
            alert('User deleted successfully');
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-text'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-4 py-2 rounded ${activeTab === 'courses' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-text'}`}
                    >
                        Courses
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-text'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-2 rounded ${activeTab === 'payments' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-text'}`}
                    >
                        Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-2 rounded ${activeTab === 'reviews' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-text'}`}
                    >
                        Reviews
                    </button>
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`px-4 py-2 rounded ${activeTab === 'announcements' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-text'}`}
                    >
                        Announcements
                    </button>
                    <button
                        onClick={() => setActiveTab('certificates')}
                        className={`px-4 py-2 rounded ${activeTab === 'certificates' ? 'bg-brand-primary text-white' : 'bg-dark-layer2 text-dark-text'}`}
                    >
                        Certificates
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Courses</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalCourses || 0}</p>
                                </div>
                                <BookOpen size={40} className="opacity-50" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Total Videos</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalVideos || 0}</p>
                                </div>
                                <Video size={40} className="opacity-50" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Total Users</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalUsers || 0}</p>
                                </div>
                                <Users size={40} className="opacity-50" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">Storage Used</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalStorageGB || 0} GB</p>
                                </div>
                                <HardDrive size={40} className="opacity-50" />
                            </div>
                        </div>
                    </div>

                    {/* Create Course Section */}
                    <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-brand-primary" /> Create New Course
                        </h2>
                        <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Course Title"
                                value={courseForm.title}
                                onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                className="bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Category (e.g., Web Dev, AI/ML)"
                                value={courseForm.category}
                                onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                                className="bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={courseForm.price}
                                onChange={e => setCourseForm({ ...courseForm, price: e.target.value })}
                                className="bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                required
                            />
                            <input
                                type="url"
                                placeholder="Thumbnail URL"
                                value={courseForm.thumbnail}
                                onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                                className="bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={courseForm.description}
                                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                className="bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text md:col-span-2"
                                rows="3"
                                required
                            />
                            <button type="submit" className="bg-brand-primary hover:bg-brand-hover text-white py-2 rounded md:col-span-2 font-medium transition-colors">
                                Create Course
                            </button>
                        </form>
                    </div>

                    {/* Upload Video Section */}
                    <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-brand-primary" /> Upload Video Content
                        </h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-dark-muted mb-2">Select Course</label>
                            <select
                                className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                value={selectedCourse || ''}
                            >
                                <option value="">-- Select a Course --</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        {selectedCourse && (
                            <form onSubmit={handleUploadVideo} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Video Title"
                                    value={videoForm.title}
                                    onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                    required
                                />
                                <textarea
                                    placeholder="Video Description"
                                    value={videoForm.description}
                                    onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                    rows="2"
                                />
                                <div className="border-2 border-dashed border-dark-layer2 rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={e => setVideoForm({ ...videoForm, video: e.target.files[0] })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <Video className="mx-auto text-dark-muted mb-2" size={32} />
                                    <p className="text-dark-muted">{videoForm.video ? videoForm.video.name : 'Drag & drop or click to select video'}</p>
                                    <p className="text-xs text-dark-muted mt-2">Will be converted to HLS with 5 quality levels (144p-1080p)</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={`w-full py-2 rounded font-medium transition-colors ${uploading ? 'bg-dark-layer2 text-dark-muted cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-hover text-white'}`}
                                >
                                    {uploading ? 'Processing Video (This may take a while)...' : 'Upload Video'}
                                </button>
                            </form>
                        )}
                    </div>
                </>
            )}

            {/* Courses Management */}
            {activeTab === 'courses' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-dark-layer2 border border-dark-layer2 p-2 pl-10 rounded text-dark-text"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredCourses.map(course => (
                            <div key={course._id} className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{course.title}</h3>
                                        <p className="text-dark-muted text-sm">{course.category} • ${course.price}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCourse(course._id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete Course
                                    </button>
                                </div>

                                <p className="text-dark-muted mb-4">{course.description}</p>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Videos ({course.videos?.length || 0})</h4>
                                    {course.videos && course.videos.length > 0 ? (
                                        course.videos.map((video, index) => (
                                            <div key={video._id} className="flex items-center justify-between bg-dark-layer2 p-3 rounded">
                                                <div className="flex items-center gap-3">
                                                    <Video size={16} className="text-brand-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium">{index + 1}. {video.title}</p>
                                                        <p className="text-xs text-dark-muted">{video.qualities?.join(', ')}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteVideo(course._id, video._id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-dark-muted text-sm">No videos uploaded yet</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Users Management */}
            {activeTab === 'users' && (
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h2 className="text-xl font-bold mb-4">User Management</h2>
                    <div className="space-y-2">
                        {users.map(user => (
                            <div key={user._id} className="flex items-center justify-between bg-dark-layer2 p-4 rounded">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-dark-muted">{user.email} • {user.role}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payments Management */}
            {activeTab === 'payments' && (
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <DollarSign size={24} className="text-green-500" />
                        Payment History
                    </h2>

                    {payments.length === 0 ? (
                        <div className="text-center py-12 text-dark-muted">
                            <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No payments recorded yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-layer2 text-left">
                                        <th className="pb-3 font-semibold">User</th>
                                        <th className="pb-3 font-semibold">Course</th>
                                        <th className="pb-3 font-semibold">Amount</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                        <th className="pb-3 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(payment => (
                                        <tr key={payment._id} className="border-b border-dark-layer2/50">
                                            <td className="py-4">
                                                <p className="font-medium">{payment.userId?.name || 'Unknown'}</p>
                                                <p className="text-xs text-dark-muted">{payment.userId?.email}</p>
                                            </td>
                                            <td className="py-4 text-dark-muted">
                                                {payment.courseId?.title || 'N/A'}
                                            </td>
                                            <td className="py-4 font-semibold text-green-500">
                                                ${payment.amount}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${payment.status === 'success' ? 'bg-green-500/20 text-green-500' :
                                                        payment.status === 'refunded' ? 'bg-yellow-500/20 text-yellow-500' :
                                                            'bg-red-500/20 text-red-500'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-dark-muted text-sm">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Reviews Management */}
            {activeTab === 'reviews' && (
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Star size={24} className="text-yellow-500" />
                        Course Reviews
                    </h2>

                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-dark-muted">
                            <Star size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No reviews yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <div key={review._id} className="bg-dark-layer2 p-4 rounded-lg">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={16}
                                                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-dark-muted'}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold">{review.rating}/5</span>
                                            </div>
                                            <p className="text-dark-text mb-2">{review.comment}</p>
                                            <div className="flex items-center gap-4 text-xs text-dark-muted">
                                                <span>👤 {review.user?.name || 'Unknown User'}</span>
                                                <span>📚 {review.course?.title || 'Unknown Course'}</span>
                                                <span>📅 {new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Delete this review?')) {
                                                    try {
                                                        await api.delete(`/admin/reviews/${review._id}`);
                                                        fetchReviews();
                                                        alert('Review deleted successfully');
                                                    } catch (error) {
                                                        alert('Failed to delete review');
                                                    }
                                                }
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ml-4"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Announcements Management */}
            {activeTab === 'announcements' && (
                <div className="space-y-6">
                    {/* Create Announcement Form */}
                    <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Bell size={24} className="text-blue-500" />
                            Create Announcement
                        </h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            try {
                                await api.post('/admin/announcements', {
                                    courseId: formData.get('courseId'),
                                    title: formData.get('title'),
                                    message: formData.get('message'),
                                    priority: formData.get('priority')
                                });
                                e.target.reset();
                                fetchAnnouncements();
                                alert('Announcement created successfully');
                            } catch (error) {
                                alert('Failed to create announcement');
                            }
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-2">Course</label>
                                    <select
                                        name="courseId"
                                        required
                                        className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                    >
                                        <option value="">-- Select Course --</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-2">Priority</label>
                                    <select
                                        name="priority"
                                        className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="Announcement title"
                                    className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Message</label>
                                <textarea
                                    name="message"
                                    required
                                    rows="4"
                                    placeholder="Announcement message..."
                                    className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-dark-text"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2 rounded font-medium transition-colors"
                            >
                                Create Announcement
                            </button>
                        </form>
                    </div>

                    {/* Announcements List */}
                    <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                        <h2 className="text-xl font-bold mb-4">All Announcements</h2>
                        {announcements.length === 0 ? (
                            <div className="text-center py-12 text-dark-muted">
                                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No announcements yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map(announcement => (
                                    <div key={announcement._id} className="bg-dark-layer2 p-4 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-lg">{announcement.title}</h3>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${announcement.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                                                            announcement.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                                                'bg-blue-500/20 text-blue-500'
                                                        }`}>
                                                        {announcement.priority}
                                                    </span>
                                                </div>
                                                <p className="text-dark-text mb-2">{announcement.message}</p>
                                                <div className="flex items-center gap-4 text-xs text-dark-muted">
                                                    <span>📚 {announcement.courseId?.title || 'N/A'}</span>
                                                    <span>📅 {new Date(announcement.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Delete this announcement?')) {
                                                        try {
                                                            await api.delete(`/admin/announcements/${announcement._id}`);
                                                            fetchAnnouncements();
                                                            alert('Announcement deleted successfully');
                                                        } catch (error) {
                                                            alert('Failed to delete announcement');
                                                        }
                                                    }
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ml-4"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Certificates Management */}
            {activeTab === 'certificates' && (
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Award size={24} className="text-purple-500" />
                        Issued Certificates
                    </h2>

                    {certificates.length === 0 ? (
                        <div className="text-center py-12 text-dark-muted">
                            <Award size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No certificates issued yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-layer2 text-left">
                                        <th className="pb-3 font-semibold">User</th>
                                        <th className="pb-3 font-semibold">Course</th>
                                        <th className="pb-3 font-semibold">Certificate Code</th>
                                        <th className="pb-3 font-semibold">Issue Date</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificates.map(cert => (
                                        <tr key={cert._id} className="border-b border-dark-layer2/50">
                                            <td className="py-4">
                                                <p className="font-medium">{cert.userId?.name || 'Unknown'}</p>
                                                <p className="text-xs text-dark-muted">{cert.userId?.email}</p>
                                            </td>
                                            <td className="py-4 text-dark-muted">
                                                {cert.courseId?.title || 'N/A'}
                                            </td>
                                            <td className="py-4">
                                                <code className="bg-dark-layer2 px-2 py-1 rounded text-sm font-mono text-brand-primary">
                                                    {cert.certificateCode}
                                                </code>
                                            </td>
                                            <td className="py-4 text-dark-muted text-sm">
                                                {new Date(cert.issueDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                                                    {cert.completed ? 'Issued' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
