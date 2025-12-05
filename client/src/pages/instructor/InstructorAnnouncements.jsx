import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Send, Search, MoreVertical, Paperclip, Smile, Trash2, Check, CheckCheck } from 'lucide-react';

const InstructorAnnouncements = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAnnouncements(selectedCourse._id);
        }
    }, [selectedCourse]);

    useEffect(() => {
        scrollToBottom();
    }, [announcements]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor/courses');
            setCourses(data);
            if (data.length > 0) {
                setSelectedCourse(data[0]);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnnouncements = async (courseId) => {
        try {
            const { data } = await api.get(`/announcements/course/${courseId}`);
            // Sort by createdAt ascending for chat view
            setAnnouncements(data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedCourse) return;

        setSending(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const newAnnouncement = {
                courseId: selectedCourse._id,
                title: 'Announcement', // Default title for chat-style
                message: message,
                priority: 'medium',
                createdBy: user.id
            };

            const { data } = await api.post('/announcements', newAnnouncement);
            setAnnouncements([...announcements, data]);
            setMessage('');
        } catch (error) {
            console.error('Error sending announcement:', error);
            alert('Failed to send announcement');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-dark-bg overflow-hidden rounded-xl border border-dark-layer2 shadow-2xl">
            {/* Sidebar - Course List */}
            <div className="w-80 bg-dark-layer1 border-r border-dark-layer2 flex flex-col">
                <div className="p-4 border-b border-dark-layer2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="w-full bg-dark-layer2 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                        <Search className="absolute left-3 top-2.5 text-dark-muted" size={18} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {courses.map(course => (
                        <div
                            key={course._id}
                            onClick={() => setSelectedCourse(course)}
                            className={`p-4 cursor-pointer hover:bg-dark-layer2 transition-colors border-b border-dark-layer2/50 ${selectedCourse?._id === course._id ? 'bg-dark-layer2 border-l-4 border-l-brand-primary' : ''
                                }`}
                        >
                            <h3 className="text-white font-medium truncate">{course.title}</h3>
                            <p className="text-sm text-dark-muted truncate">
                                {course.enrollmentCount || 0} subscribers
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0e1621] relative">
                {/* Chat Header */}
                <div className="p-4 bg-dark-layer1 border-b border-dark-layer2 flex justify-between items-center shadow-md z-10">
                    <div>
                        <h2 className="text-white font-bold text-lg">{selectedCourse?.title}</h2>
                        <p className="text-sm text-brand-primary">
                            {courses.find(c => c._id === selectedCourse?._id)?.enrollmentCount || 0} subscribers
                        </p>
                    </div>
                    <button className="text-dark-muted hover:text-white">
                        <MoreVertical size={24} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50"
                    style={{ backgroundImage: 'url("https://web.telegram.org/img/bg_0.png")', backgroundBlendMode: 'overlay', backgroundColor: '#0e1621' }}>

                    {announcements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-dark-muted opacity-70">
                            <div className="bg-dark-layer1/50 p-4 rounded-full mb-4">
                                <Send size={48} />
                            </div>
                            <p>No announcements yet.</p>
                            <p className="text-sm">Send your first message to subscribers!</p>
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div key={announcement._id} className="flex flex-col items-end group">
                                <div className="max-w-[70%] bg-[#2b5278] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl p-3 shadow-sm relative group-hover:shadow-md transition-shadow">
                                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{announcement.message}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[11px] text-blue-200/70">
                                            {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <CheckCheck size={14} className="text-brand-primary" />
                                    </div>

                                    {/* Delete Action (Hidden by default, shown on hover) */}
                                    <button
                                        onClick={() => handleDelete(announcement._id)}
                                        className="absolute -left-8 top-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-dark-layer1 rounded"
                                        title="Delete for everyone"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-dark-layer1 border-t border-dark-layer2">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                        <button type="button" className="p-3 text-dark-muted hover:text-white transition-colors">
                            <Paperclip size={24} />
                        </button>

                        <div className="flex-1 bg-dark-layer2 rounded-2xl flex items-center">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Broadcast a message..."
                                className="w-full bg-transparent text-white p-3 max-h-32 focus:outline-none resize-none"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            <button type="button" className="p-3 text-dark-muted hover:text-white transition-colors">
                                <Smile size={24} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={!message.trim() || sending}
                            className={`p-3 rounded-full transition-all transform hover:scale-105 ${message.trim()
                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                                    : 'bg-dark-layer2 text-dark-muted'
                                }`}
                        >
                            <Send size={24} className={message.trim() ? 'ml-1' : ''} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InstructorAnnouncements;
