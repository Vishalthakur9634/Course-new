import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Send, Search, MoreVertical, Paperclip, Smile, Trash2, Check, CheckCheck, X, File } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const InstructorAnnouncements = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

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
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
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
            setAnnouncements(data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
        setShowEmoji(false); // Optional: keep open or close
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Upload immediately to get URL
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAttachment({
                url: data.url,
                name: data.filename,
                type: data.type
            });
        } catch (error) {
            console.error('File upload error:', error);
            alert('Error uploading file');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!message.trim() && !attachment) || !selectedCourse) return;

        setSending(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const newAnnouncement = {
                courseId: selectedCourse._id,
                title: 'Chat Message',
                message: message,
                priority: 'medium',
                createdBy: user.id,
                attachments: attachment ? [attachment.url] : []
            };

            const { data } = await api.post('/announcements', newAnnouncement);
            setAnnouncements([...announcements, data]);
            setMessage('');
            setAttachment(null);
            setShowEmoji(false);
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
        <div className="flex h-full bg-dark-bg overflow-hidden rounded-xl border border-dark-layer2 shadow-2xl">
            {/* Sidebar - Course List */}
            <div className="hidden lg:flex w-80 bg-dark-layer1 border-r border-dark-layer2 flex-col">
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
                </div>

                {/* Messages Area */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50 scroll-smooth"
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

                                    {/* Attachments */}
                                    {announcement.attachments && announcement.attachments.map((url, i) => (
                                        <div key={i} className="mt-2 bg-black/20 p-2 rounded flex items-center gap-2">
                                            <File size={16} className="text-blue-300" />
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-300 hover:underline truncate max-w-[200px]">
                                                View Attachment
                                            </a>
                                        </div>
                                    ))}

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
                <div className="p-4 bg-dark-layer1 border-t border-dark-layer2 relative">
                    {/* Emoji Picker Popover */}
                    {showEmoji && (
                        <div className="absolute bottom-20 right-4 z-50">
                            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                        </div>
                    )}

                    {/* Attachment Preview */}
                    {attachment && (
                        <div className="absolute bottom-20 left-4 bg-dark-layer2 border border-white/10 p-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <File size={16} className="text-brand-primary" />
                            <span className="text-xs text-white truncate max-w-[200px]">{attachment.name}</span>
                            <button onClick={() => setAttachment(null)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-dark-muted hover:text-white transition-colors"
                        >
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
                            <button
                                type="button"
                                onClick={() => setShowEmoji(!showEmoji)}
                                className="p-3 text-dark-muted hover:text-white transition-colors"
                            >
                                <Smile size={24} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={(!message.trim() && !attachment) || sending}
                            className={`p-3 rounded-full transition-all transform hover:scale-105 ${message.trim() || attachment
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
