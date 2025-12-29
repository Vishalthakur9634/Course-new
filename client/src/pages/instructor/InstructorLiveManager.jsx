import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Video, Calendar, Clock, Plus, Trash2, Edit2, Link, Play, AlertCircle } from 'lucide-react';

const InstructorLiveManager = () => {
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduledAt: '',
        duration: 60,
        meetingLink: '',
        courseId: '',
        isPublic: false
    });

    useEffect(() => {
        fetchSessions();
        fetchCourses();
    }, []);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/live');
            setSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor/courses');
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                courseId: formData.courseId || null // Ensure empty string becomes null
            };
            await api.post('/live', dataToSubmit);
            fetchSessions();
            setShowModal(false);
            setFormData({
                title: '', description: '', scheduledAt: '', duration: 60, meetingLink: '', courseId: '', isPublic: false
            });
        } catch (error) {
            console.error('Session creation error:', error);
            alert(error.response?.data?.message || 'Error creating session');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this session?')) return;
        try {
            await api.delete(`/live/${id}`);
            setSessions(sessions.filter(s => s._id !== id));
        } catch (error) {
            alert('Error deleting session');
        }
    };

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Live Sessions</h1>
                    <p className="text-dark-muted mt-2">Schedule and manage your webinars</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-xl transition-all"
                >
                    <Plus size={20} /> Schedule Session
                </button>
            </header>

            {loading ? (
                <div className="text-center py-20 text-dark-muted">Loading...</div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-20 bg-dark-layer1 border border-white/10 rounded-3xl">
                    <Video size={48} className="mx-auto text-dark-muted opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Upcoming Sessions</h3>
                    <p className="text-dark-muted mt-2">Schedule your first live class now!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map(session => (
                        <div key={session._id} className="bg-dark-layer1 border border-white/10 rounded-2xl p-6 hover:border-brand-primary/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${session.isPublic ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {session.isPublic ? 'Public' : 'Course Only'}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(session._id)} className="p-2 hover:bg-white/5 rounded-lg text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">{session.title}</h3>
                            <div className="space-y-2 text-sm text-dark-muted mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-brand-primary" />
                                    {new Date(session.scheduledAt).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-brand-primary" />
                                    {session.duration} minutes
                                </div>
                                {session.courseId && (
                                    <div className="flex items-center gap-2">
                                        <Play size={14} className="text-brand-primary" />
                                        {session.courseId.title}
                                    </div>
                                )}
                            </div>
                            <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-brand-primary hover:text-dark-bg text-white font-bold rounded-xl border border-white/10 transition-all"
                            >
                                <Link size={16} /> Join Meeting
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-layer1 rounded-3xl border border-white/10 p-8 max-w-xl w-full">
                        <h2 className="text-2xl font-black text-white mb-6">Schedule Session</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-dark-muted mb-2">Title</label>
                                <input
                                    required
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-dark-muted mb-2">Description</label>
                                <textarea
                                    required
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white h-24 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-dark-muted mb-2">Date & Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                        value={formData.scheduledAt}
                                        onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark-muted mb-2">Duration (min)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-dark-muted mb-2">Meeting Link (Zoom/Jitsi)</label>
                                <input
                                    required
                                    type="url"
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                    value={formData.meetingLink}
                                    onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-dark-muted mb-2">Linked Course (Optional)</label>
                                <select
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                    value={formData.courseId}
                                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                >
                                    <option value="">None (Public Event)</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    className="w-5 h-5 rounded border-white/10 bg-dark-layer2"
                                    checked={formData.isPublic}
                                    onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                                />
                                <label htmlFor="isPublic" className="text-white font-bold">Make Public (Visible to all students)</label>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-brand-primary text-dark-bg font-black py-3 rounded-xl">Schedule</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-white font-black py-3 rounded-xl border border-white/10">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorLiveManager;
