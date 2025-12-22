import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Video, Calendar, Clock, Play, Link, User } from 'lucide-react';

const StudentLiveSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
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

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <header className="text-center md:text-left">
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 justify-center md:justify-start">
                    <Video size={40} className="text-red-500" />
                    Live <span className="text-brand-primary">Sessions</span>
                </h1>
                <p className="text-dark-muted mt-2 text-lg">Join interactive webinars and classes from your instructors.</p>
            </header>

            {loading ? (
                <div className="text-center py-20 text-dark-muted">Loading schedule...</div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-20 bg-dark-layer1 border border-white/10 rounded-3xl">
                    <Calendar size={64} className="mx-auto text-dark-muted opacity-30 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">No Live Sessions Scheduled</h3>
                    <p className="text-dark-muted">Your instructors haven't scheduled any live classes yet. Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sessions.map(session => (
                        <div key={session._id} className="bg-dark-layer1 border border-white/10 rounded-[2rem] overflow-hidden hover:border-brand-primary/40 transition-all duration-300 group shadow-2xl relative">
                            {/* Status Badge */}
                            <div className="absolute top-6 right-6 z-10">
                                {new Date(session.scheduledAt) <= new Date() && new Date(session.scheduledAt).getTime() + session.duration * 60000 > new Date().getTime() ? (
                                    <span className="px-4 py-1.5 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                                        Live Now
                                    </span>
                                ) : (
                                    <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-sm">
                                        Upcoming
                                    </span>
                                )}
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        {session.instructorId?.avatar ? (
                                            <img src={session.instructorId.avatar} className="w-10 h-10 rounded-xl" alt="Instructor" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                                                {session.instructorId?.name?.[0] || 'I'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-white">{session.instructorId?.name}</p>
                                            <p className="text-xs text-dark-muted">Instructor</p>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white group-hover:text-brand-primary transition-colors leading-tight">
                                        {session.title}
                                    </h3>
                                    {session.courseId && (
                                        <div className="flex items-center gap-2 mt-2 text-dark-muted text-sm font-medium">
                                            <Play size={14} className="text-brand-primary" />
                                            {session.courseId.title}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-dark-muted">
                                        <Calendar size={18} className="text-brand-primary" />
                                        <span className="font-medium">{new Date(session.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-dark-muted">
                                        <Clock size={18} className="text-brand-primary" />
                                        <span className="font-medium">{new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration} mins</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 border-t border-white/5">
                                <a
                                    href={session.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-2xl transition-all shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95"
                                >
                                    <Link size={18} />
                                    {new Date(session.scheduledAt) <= new Date() ? 'Join Now' : 'Join Session'}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentLiveSessions;
