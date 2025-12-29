import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Search, MoreVertical, Bell, CheckCheck } from 'lucide-react';

const StudentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('all');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCourseId === 'all') {
            setFilteredAnnouncements(announcements);
        } else {
            setFilteredAnnouncements(announcements.filter(a => a.courseId._id === selectedCourseId));
        }
    }, [selectedCourseId, announcements]);

    useEffect(() => {
        scrollToBottom();
    }, [filteredAnnouncements]);

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    };

    const fetchData = async () => {
        try {
            const { data } = await api.get('/announcements/student');
            // Sort by createdAt ascending for chat view
            const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setAnnouncements(sorted);

            // Extract unique courses
            const uniqueCourses = [];
            const courseMap = new Map();

            data.forEach(a => {
                if (a.courseId && !courseMap.has(a.courseId._id)) {
                    courseMap.set(a.courseId._id, true);
                    uniqueCourses.push(a.courseId);
                }
            });
            setCourses(uniqueCourses);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

    return (
        <div className="flex h-full bg-dark-bg overflow-hidden rounded-xl border border-dark-layer2 shadow-2xl">
            {/* Sidebar - Course List */}
            <div className="w-80 bg-dark-layer1 border-r border-dark-layer2 flex flex-col">
                <div className="p-4 border-b border-dark-layer2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-dark-layer2 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                        <Search className="absolute left-3 top-2.5 text-dark-muted" size={18} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div
                        onClick={() => setSelectedCourseId('all')}
                        className={`p-4 cursor-pointer hover:bg-dark-layer2 transition-colors border-b border-dark-layer2/50 ${selectedCourseId === 'all' ? 'bg-dark-layer2 border-l-4 border-l-brand-primary' : ''
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">All Chats</h3>
                                <p className="text-sm text-dark-muted">Combined feed</p>
                            </div>
                        </div>
                    </div>

                    {courses.map(course => (
                        <div
                            key={course._id}
                            onClick={() => setSelectedCourseId(course._id)}
                            className={`p-4 cursor-pointer hover:bg-dark-layer2 transition-colors border-b border-dark-layer2/50 ${selectedCourseId === course._id ? 'bg-dark-layer2 border-l-4 border-l-brand-primary' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                    {course.title.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium truncate">{course.title}</h3>
                                    <p className="text-sm text-dark-muted truncate">
                                        Instructor Update
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0e1621] relative">
                {/* Chat Header */}
                <div className="p-4 bg-dark-layer1 border-b border-dark-layer2 flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-3">
                        {selectedCourseId !== 'all' && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                {courses.find(c => c._id === selectedCourseId)?.title.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-white font-bold text-lg">
                                {selectedCourseId === 'all' ? 'All Chats' : courses.find(c => c._id === selectedCourseId)?.title}
                            </h2>
                            <p className="text-sm text-dark-muted">
                                {selectedCourseId === 'all' ? 'Updates from all your instructors' : 'Official Course Channel'}
                            </p>
                        </div>
                    </div>
                    <button className="text-dark-muted hover:text-white">
                        <MoreVertical size={24} />
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50 scroll-smooth"
                    style={{ backgroundImage: 'url("https://web.telegram.org/img/bg_0.png")', backgroundBlendMode: 'overlay', backgroundColor: '#0e1621' }}>

                    {filteredAnnouncements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-dark-muted opacity-70">
                            <div className="bg-dark-layer1/50 p-4 rounded-full mb-4">
                                <Bell size={48} />
                            </div>
                            <p>No announcements yet.</p>
                        </div>
                    ) : (
                        filteredAnnouncements.map((announcement) => (
                            <div key={announcement._id} className="flex flex-col items-start max-w-[80%]">
                                {/* Sender Info (only if 'all' view or changed sender) */}
                                <div className="flex items-center gap-2 mb-1 ml-2">
                                    <span className="text-brand-primary font-bold text-sm">
                                        {announcement.createdBy?.name || 'Instructor'}
                                    </span>
                                    <span className="text-dark-muted text-xs">
                                        via {announcement.courseId?.title}
                                    </span>
                                </div>

                                <div className="bg-[#182533] text-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-3 shadow-sm relative hover:shadow-md transition-shadow">
                                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{announcement.message}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[11px] text-gray-400">
                                            {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Read Only Footer */}
                <div className="p-4 bg-dark-layer1 border-t border-dark-layer2 text-center text-dark-muted text-sm">
                    Only instructors can send messages in this channel.
                </div>
            </div>
        </div>
    );
};

export default StudentAnnouncements;
