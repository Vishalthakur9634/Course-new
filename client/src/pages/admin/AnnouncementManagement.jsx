import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bell, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        priority: 'medium',
        courseId: ''
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get('/admin/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/announcements', formData);
            await fetchAnnouncements();
            setShowModal(false);
            setFormData({ title: '', message: '', priority: 'medium', courseId: '' });
            alert('Announcement created successfully!');
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Failed to create announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;

        try {
            await api.delete(`/admin/announcements/${id}`);
            await fetchAnnouncements();
            alert('Announcement deleted successfully!');
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Failed to delete announcement');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500/20 text-red-400';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400';
            case 'low': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading announcements...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Announcements</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors"
                >
                    <Plus size={18} />
                    New Announcement
                </button>
            </div>

            {/* Announcements List */}
            <div className="grid gap-4">
                {announcements.map(announcement => (
                    <div key={announcement._id} className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Bell size={20} className="text-brand-primary" />
                                    <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                                        {announcement.priority}
                                    </span>
                                </div>

                                <p className="text-dark-muted mb-3">{announcement.message}</p>

                                <div className="flex items-center gap-4 text-sm text-dark-muted">
                                    {announcement.courseId && (
                                        <span>Course: {announcement.courseId.title}</span>
                                    )}
                                    <span>Posted: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                                    {announcement.createdBy && (
                                        <span>By: {announcement.createdBy.name}</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(announcement._id)}
                                className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {announcements.length === 0 && (
                <div className="text-center text-dark-muted py-10">
                    No announcements yet. Create your first announcement!
                </div>
            )}

            {/* Create Announcement Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-layer1 rounded-lg border border-dark-layer2 p-6 max-w-lg w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Create Announcement</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                                    placeholder="Announcement title..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    rows={4}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                                    placeholder="Announcement message..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded transition-colors"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({ title: '', message: '', priority: 'medium', courseId: '' });
                                    }}
                                    className="flex-1 bg-dark-layer2 hover:bg-dark-layer1 text-white px-4 py-2 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManagement;
