import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Book, Clock, Video, FileText, ArrowRight, Play, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const { data } = await api.get('/notes');
            setNotes(data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Book size={32} className="text-brand-primary" />
                    My Notes
                </h1>
                <p className="text-dark-muted mt-2">All your study notes in one place</p>
            </header>

            {loading ? (
                <div className="text-center py-20 text-dark-muted">Loading notes...</div>
            ) : notes.length === 0 ? (
                <div className="text-center py-20 bg-dark-layer1 border border-white/10 rounded-3xl">
                    <FileText size={48} className="mx-auto text-dark-muted opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Notes Yet</h3>
                    <p className="text-dark-muted mt-2">Take notes while watching videos to see them here.</p>
                    <Link to="/my-learning" className="inline-block mt-6 px-6 py-3 bg-brand-primary text-dark-bg font-black rounded-xl hover:bg-brand-hover transition-colors">
                        Go to My Courses
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {notes.map(note => (
                        <div key={note._id} className="bg-dark-layer1 border border-white/10 rounded-2xl p-6 hover:border-brand-primary/30 transition-all">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Thumbnail / Video Info */}
                                <div className="w-full md:w-64 flex-shrink-0">
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-layer2 mb-3 group">
                                        <img
                                            src={note.courseId?.thumbnail || 'https://via.placeholder.com/300x200'}
                                            alt={note.courseId?.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Play className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={40} fill="currentColor" />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white text-sm line-clamp-2">{note.videoId?.title}</h4>
                                    <p className="text-xs text-dark-muted mt-1">{note.courseId?.title}</p>
                                </div>

                                {/* Note Content */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2 text-brand-primary font-mono text-xs bg-brand-primary/10 px-2 py-1 rounded w-fit">
                                        <Clock size={12} />
                                        {formatTime(note.timestamp)}
                                    </div>
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-dark-text whitespace-pre-wrap">{note.content}</p>
                                    </div>

                                    {note.attachments && note.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {note.attachments.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs text-dark-muted bg-dark-layer2 px-3 py-2 rounded-lg hover:bg-dark-layer3 border border-white/5 transition-all group"
                                                >
                                                    <Paperclip size={14} className="text-brand-primary" />
                                                    <span className="group-hover:text-white transition-colors">{file.filename}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    <div className="pt-4 flex justify-end">
                                        <Link
                                            to={`/course/${note.courseId?._id}/learn/${note.videoId?._id}?t=${Math.floor(note.timestamp)}`}
                                            className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand-primary transition-colors"
                                        >
                                            Review Video <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyNotes;
