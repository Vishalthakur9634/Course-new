import React, { useState, useEffect } from 'react';
import {
    Info, MessageSquare, FileText, BookOpen, PenTool, Share2, Send, ThumbsUp,
    Reply, Save, Paperclip, Award, Target, Activity, ShieldCheck, Sparkles, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import UserLink from './UserLink';
import Reviews from './Reviews';

const VideoTabs = ({ video, course, currentTime }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyText, setReplyText] = useState('');
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [studentNotes, setStudentNotes] = useState([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [noteAttachment, setNoteAttachment] = useState(null);
    const [isSavingNote, setIsSavingNote] = useState(false);

    // New State for Assignments & Articles
    const [assessment, setAssessment] = useState(null);
    const [instructorArticles, setInstructorArticles] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        if (activeTab === 'qa' && video) fetchComments();
        if (activeTab === 'studentNotes' && video) fetchNotes();
        if (activeTab === 'assignments') fetchAssessment();
        if (activeTab === 'articles') fetchInstructorArticles();
    }, [activeTab, video, course._id]);

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const { data } = await api.get(`/comments/${video._id}`);
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const fetchNotes = async () => {
        try {
            const { data } = await api.get(`/notes/video/${video._id}`);
            setStudentNotes(data);
        } catch (error) {
            console.error('Error fetching notes', error);
        }
    };

    const fetchAssessment = async () => {
        try {
            const { data } = await api.get(`/mega/assessments/${course._id}`);
            setAssessment(data);
        } catch (error) {
            console.error('Error fetching assessment', error);
        }
    };

    const fetchInstructorArticles = async () => {
        if (!course.instructorId) return;
        try {
            const { data } = await api.get(`/articles?authorId=${course.instructorId._id || course.instructorId}`);
            setInstructorArticles(data);
        } catch (error) {
            console.error('Error fetching articles', error);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNoteContent.trim() || isSavingNote) return;

        setIsSavingNote(true);
        try {
            const formData = new FormData();
            formData.append('videoId', video._id);
            formData.append('courseId', course._id);
            formData.append('content', newNoteContent);
            formData.append('timestamp', currentTime || 0);
            if (noteAttachment) {
                formData.append('attachment', noteAttachment);
            }

            const { data } = await api.post('/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStudentNotes([...studentNotes, data].sort((a, b) => a.timestamp - b.timestamp));
            setNewNoteContent('');
            setNoteAttachment(null);
        } catch (error) {
            console.error('Error adding note', error);
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await api.delete(`/notes/${noteId}`);
            setStudentNotes(studentNotes.filter(n => n._id !== noteId));
        } catch (error) {
            console.error('Error deleting note', error);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const { data } = await api.post('/comments', {
                userId: currentUser._id || currentUser.id,
                videoId: video._id,
                text: newComment
            });
            setComments([data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment', error);
        }
    };

    const handleReply = async (commentId) => {
        if (!replyText.trim()) return;

        try {
            const { data } = await api.post(`/comments/${commentId}/reply`, {
                userId: currentUser._id || currentUser.id,
                text: replyText
            });

            // Update local state
            setComments(comments.map(c => c._id === commentId ? data : c));
            setReplyText('');
            setActiveReplyId(null);
        } catch (error) {
            console.error('Error posting reply', error);
        }
    };

    const handleLike = async (commentId) => {
        try {
            const { data } = await api.put(`/comments/${commentId}/like`, {
                userId: currentUser._id || currentUser.id
            });
            setComments(comments.map(c => c._id === commentId ? data : c));
        } catch (error) {
            console.error('Error liking comment', error);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info, enabledKey: 'enableOverview' },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'qa', label: 'Q&A', icon: MessageSquare, enabledKey: 'enableQA' },
        { id: 'notes', label: 'Notes', icon: FileText, enabledKey: 'enableSummary' },
        { id: 'studentNotes', label: 'My Notes', icon: PenTool, enabledKey: 'enableNotes' },
        { id: 'assignments', label: 'Assignments', icon: BookOpen },
        { id: 'articles', label: 'Articles', icon: FileText }
    ];

    return (
        <div className="w-full bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden shadow-3xl">
            {/* TAB REGISTRY */}
            <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar bg-[#0a0a0a]/50 p-1">
                {tabs.map(tab => {
                    const isEnabled = tab.enabledKey ? course.instructorAdminSettings?.[tab.enabledKey] !== false : true;
                    if (!isEnabled) return null;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[140px] py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative ${activeTab === tab.id ? 'text-brand-primary' : 'text-dark-muted hover:text-white'
                                }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary shadow-[0_0_15px_rgba(255,161,22,0.6)]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* DOMAIN CONTENT */}
            <div className="overflow-y-auto p-10 custom-scrollbar max-h-[600px]">
                {activeTab === 'overview' && (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-8">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-white line-clamp-2">{video.title}</h2>
                                    </div>
                                    <p className="text-dark-muted text-sm leading-relaxed">{video.description || 'No description available.'}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const shareLink = `${window.location.origin}/course/${course._id}${currentUser?.referralCode ? `?ref=${currentUser.referralCode}` : ''}`;
                                        navigator.clipboard.writeText(shareLink);
                                        alert('Course link copied!');
                                    }}
                                    className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 text-dark-muted hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-xl"
                                >
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>

                        {course.instructorId && (
                            <div className="bg-[#0a0a0a]/50 p-6 rounded-2xl border border-white/5 space-y-4">
                                <h3 className="text-xs font-bold text-dark-muted uppercase tracking-wider opacity-40">Instructor</h3>
                                <div className="flex items-center gap-6">
                                    <UserLink
                                        user={course.instructorId}
                                        avatarSize="w-16 h-16"
                                        nameClass="text-lg font-bold text-white"
                                    />
                                    <div className="flex-1 space-y-1">
                                        {course.instructorId.instructorProfile?.bio && (
                                            <p className="text-sm text-dark-muted leading-relaxed">
                                                {course.instructorId.instructorProfile.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-dark-muted uppercase tracking-wider opacity-40">About this Course</h3>
                            <p className="text-sm text-dark-muted leading-relaxed opacity-70 border-l border-white/10 pl-4">{course.description}</p>
                        </div>

                        {video.resources && video.resources.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-dark-muted uppercase tracking-wider opacity-40">Resources</h3>
                                <div className="grid gap-4">
                                    {video.resources.map((resource, idx) => (
                                        <a
                                            key={idx}
                                            href={resource.url}
                                            download
                                            className="flex items-center justify-between p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-brand-primary/40 transition-all group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary border border-brand-primary/20">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm uppercase tracking-tight group-hover:text-brand-primary transition-colors">{resource.title}</p>
                                                    <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest opacity-50 mt-1">
                                                        {resource.fileType} • {(resource.fileSize / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-4 py-2 bg-brand-primary/5 border border-brand-primary/20 rounded-xl group-hover:bg-brand-primary group-hover:text-dark-bg transition-all">
                                                Download Artifact
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'qa' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-bottom-5 duration-700">
                        {/* Discussion Input */}
                        <form onSubmit={handlePostComment} className="mb-12">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <MessageSquare size={20} className="text-dark-muted group-focus-within:text-brand-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-14 pr-16 text-white text-sm focus:border-brand-primary outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-brand-primary text-dark-bg p-3 rounded-xl hover:scale-110 transition-transform shadow-lg shadow-brand-primary/20"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>

                        {/* Discussions List */}
                        {loadingComments ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Synchronizing Discussions...</p>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-20 bg-[#0a0a0a]/30 rounded-3xl border border-white/5 border-dashed">
                                <MessageSquare size={48} className="mx-auto mb-6 opacity-20 text-brand-primary" />
                                <p className="text-dark-muted font-bold text-[11px] uppercase tracking-widest opacity-50">No discussions indexed within this module registry.</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-6 group">
                                        <div className="relative">
                                            <UserLink
                                                user={comment.user}
                                                showAvatar={true}
                                                avatarSize="w-14 h-14"
                                                nameClass="hidden"
                                            />
                                            {comment.user?.role === 'instructor' && (
                                                <div className="absolute -bottom-1 -right-1 bg-brand-primary text-dark-bg p-1 rounded-full border-2 border-[#111]">
                                                    <ShieldCheck size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <UserLink
                                                    user={comment.user}
                                                    showAvatar={false}
                                                    nameClass={`font-bold uppercase tracking-tight text-sm ${comment.user?.role === 'instructor' ? 'text-brand-primary' : 'text-white'}`}
                                                />
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                                <span className="text-[9px] text-dark-muted font-black uppercase tracking-[0.2em] opacity-40">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-dark-muted text-[14px] leading-loose font-medium opacity-90 pre-wrap">{comment.text}</p>

                                            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
                                                <button
                                                    onClick={() => handleLike(comment._id)}
                                                    className={`flex items-center gap-2 hover:text-brand-primary transition-all ${comment.likes?.includes(currentUser?._id || currentUser?.id) ? 'text-brand-primary scale-110' : 'text-dark-muted'}`}
                                                >
                                                    <ThumbsUp size={16} className={comment.likes?.includes(currentUser?._id || currentUser?.id) ? 'fill-current' : ''} />
                                                    <span>{comment.likes?.length || 0}</span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                                                    className={`flex items-center gap-2 transition-all ${activeReplyId === comment._id ? 'text-brand-primary' : 'text-dark-muted hover:text-white'}`}
                                                >
                                                    <Reply size={16} /> REPLY
                                                </button>
                                            </div>

                                            {activeReplyId === comment._id && (
                                                <div className="flex gap-3 pt-6 animate-in slide-in-from-left-5 duration-500">
                                                    <input
                                                        type="text"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Draft your reply..."
                                                        className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-5 py-3 text-sm text-white focus:border-brand-primary focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleReply(comment._id)}
                                                        className="bg-brand-primary text-dark-bg px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-brand-primary/20"
                                                    >
                                                        Post Response
                                                    </button>
                                                </div>
                                            )}

                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="space-y-6 mt-8 pl-8 border-l-2 border-white/5">
                                                    {comment.replies.map((reply, idx) => (
                                                        <div key={idx} className="flex gap-4">
                                                            <UserLink
                                                                user={reply.user}
                                                                avatarSize="w-10 h-10"
                                                                nameClass="hidden"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <UserLink
                                                                        user={reply.user}
                                                                        showAvatar={false}
                                                                        nameClass={`font-bold uppercase tracking-tight text-xs ${reply.user?.role === 'instructor' ? 'text-brand-primary' : 'text-white'}`}
                                                                    />
                                                                    <span className="text-[8px] text-dark-muted font-black uppercase tracking-[0.2em] opacity-40">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-dark-muted text-xs leading-relaxed opacity-80">{reply.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'studentNotes' && (
                    <div className="flex flex-col h-full space-y-12 animate-in fade-in duration-700">
                        {/* Research Note Input */}
                        <div className="bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[50px] rounded-full" />
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20">
                                        <PenTool size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">Add a Note</h3>
                                        <p className="text-[10px] text-dark-muted uppercase tracking-wider mt-1">Timestamp: {formatTime(currentTime)}</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleAddNote} className="space-y-6">
                                <textarea
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    placeholder="Document critical observations at this curriculum node..."
                                    className="w-full bg-[#111] border border-white/10 rounded-2xl p-6 text-sm text-white font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:outline-none min-h-[160px] resize-none transition-all placeholder:opacity-30"
                                />
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="note-attachment"
                                            className="hidden"
                                            onChange={(e) => setNoteAttachment(e.target.files[0])}
                                        />
                                        <label
                                            htmlFor="note-attachment"
                                            className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center h-full border ${noteAttachment ? 'bg-brand-primary text-dark-bg border-brand-primary shadow-xl shadow-brand-primary/20' : 'bg-[#111] text-dark-muted hover:text-white hover:border-brand-primary/40 border-white/10 shadow-lg'}`}
                                            title={noteAttachment ? noteAttachment.name : "Attach Artifact"}
                                        >
                                            <Paperclip size={24} />
                                            {noteAttachment && <span className="ml-3 text-[10px] font-black uppercase tracking-widest">{noteAttachment.name.slice(0, 10)}...</span>}
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newNoteContent.trim() || isSavingNote}
                                        className="flex-1 bg-brand-primary hover:brightness-110 disabled:opacity-30 text-dark-bg px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-primary/20 group/btn"
                                    >
                                        <Save size={18} className="group-hover:scale-110 transition-transform" />
                                        {isSavingNote ? 'INDEXING...' : 'ARCHIVE RESEARCH'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Notes Registry */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-dark-muted uppercase tracking-[0.4em] opacity-40 flex items-center gap-4">
                                Indexed Research Archive <div className="flex-1 h-px bg-white/5" />
                            </h3>
                            {studentNotes.length === 0 ? (
                                <div className="py-20 text-center opacity-30">
                                    <FileText className="mx-auto mb-6" size={56} />
                                    <p className="text-[11px] font-bold uppercase tracking-[0.4em]">No research artifacts archived.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {studentNotes.map((note) => (
                                        <div key={note._id} className="group bg-[#111] border border-white/5 rounded-3xl p-8 hover:border-brand-primary/30 transition-all shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/0 group-hover:bg-brand-primary transition-all duration-500" />
                                            <div className="flex justify-between items-start mb-6">
                                                <button
                                                    onClick={() => {
                                                        const player = document.querySelector('video');
                                                        if (player) player.currentTime = note.timestamp;
                                                    }}
                                                    className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-brand-primary/20 hover:bg-brand-primary hover:text-dark-bg transition-all shadow-lg"
                                                >
                                                    MATRIX OFFSET: {formatTime(note.timestamp)}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNote(note._id)}
                                                    className="p-3 text-dark-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <p className="text-dark-muted text-[15px] leading-relaxed font-medium opacity-90 whitespace-pre-wrap">{note.content}</p>

                                            {note.attachments && note.attachments.length > 0 && (
                                                <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4">
                                                    {note.attachments.map((file, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 text-[10px] font-bold text-dark-muted bg-[#0a0a0a] px-4 py-3 rounded-xl border border-white/10 hover:border-brand-primary/40 hover:text-brand-primary transition-all shadow-md group/artifact"
                                                        >
                                                            <Package size={16} className="opacity-40" />
                                                            <span className="uppercase tracking-widest">{file.filename}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-8 flex items-center justify-between text-[9px] font-black text-dark-muted uppercase tracking-[0.3em] opacity-30">
                                                <span>Registry Date: {new Date(note.updatedAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-2"><Check size={12} /> Verified Artifact</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <div className="flex items-center gap-5 border-b border-white/5 pb-8">
                            <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20">
                                <FileText size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Knowledge Summary</h2>
                                <p className="text-[11px] font-bold text-dark-muted uppercase tracking-[0.4em] mt-1">Official Module Documentation</p>
                            </div>
                        </div>

                        {video.notePdf && (
                            <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-brand-primary/30 transition-all shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full" />
                                <div className="flex items-center gap-6">
                                    <div className="bg-red-500/10 p-4 rounded-2xl text-red-500 border border-red-500/20 shadow-xl">
                                        <FileText size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-white font-bold uppercase tracking-tight text-lg">Detailed Lecture Notes</h3>
                                        <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest opacity-50">High-Resolution PDF Artifact</p>
                                    </div>
                                </div>
                                <a
                                    href={video.notePdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-[#111] text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl border border-white/10 hover:bg-brand-primary hover:text-dark-bg hover:border-brand-primary transition-all shadow-xl"
                                >
                                    Download Matrix
                                </a>
                            </div>
                        )}

                        <div className="bg-[#0a0a0a] p-12 rounded-[2.5rem] border border-white/5 shadow-inner">
                            {video.summary ? (
                                <p className="text-dark-muted text-[16px] leading-loose font-medium opacity-80 whitespace-pre-wrap">{video.summary}</p>
                            ) : (
                                <div className="py-20 text-center opacity-30 italic">
                                    <Info className="mx-auto mb-6" size={48} />
                                    <p className="text-[11px] font-bold uppercase tracking-[0.4em]">No technical summary indexed for this coordinate.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'assignments' && (
                    <div className="space-y-12 animate-in slide-in-from-right-5 duration-700">
                        <div className="flex items-center gap-5 border-b border-white/5 pb-8">
                            <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20">
                                <Target size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Course Assessments</h2>
                                <p className="text-sm text-dark-muted mt-1">Test your knowledge</p>
                            </div>
                        </div>

                        {assessment ? (
                            <div className="bg-[#0a0a0a] p-12 rounded-[3rem] border border-white/5 shadow-3xl space-y-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full group-hover:bg-brand-primary/10 transition-colors" />
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{assessment.title}</h3>
                                        <p className="text-dark-muted text-sm font-medium leading-relaxed opacity-70 max-w-xl">
                                            Execute this high-fidelity assessment to validate your mastery over the curriculum nodes. Verifies strategic and tactical comprehension.
                                        </p>
                                    </div>
                                    <div className="bg-brand-primary/10 p-6 rounded-[2rem] border border-brand-primary/20 shadow-2xl shadow-brand-primary/10">
                                        <Award size={48} className="text-brand-primary" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
                                        <span className="text-[9px] font-black text-dark-muted uppercase tracking-[0.4em]">Question Nodes</span>
                                        <span className="text-2xl font-bold text-white">{assessment.questions.length || 0}</span>
                                    </div>
                                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
                                        <span className="text-[9px] font-black text-dark-muted uppercase tracking-[0.4em]">Threshold</span>
                                        <span className="text-2xl font-bold text-brand-primary">{assessment.passingScore}%</span>
                                    </div>
                                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
                                        <span className="text-[9px] font-black text-dark-muted uppercase tracking-[0.4em]">Chronometer</span>
                                        <span className="text-2xl font-bold text-white">{assessment.durationLimit > 0 ? `${assessment.durationLimit} MIN` : 'UNLIMITED'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/course/${course._id}/assessment`)}
                                    className="w-full bg-brand-primary hover:brightness-110 text-dark-bg font-black py-6 rounded-[1.5rem] transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.4em] group/start"
                                >
                                    <Sparkles size={20} className="group-hover:animate-spin" /> INITIATE MASTERY VALIDATION
                                </button>
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-[#0a0a0a]/30 rounded-[3rem] border border-white/5 border-dashed">
                                <Target className="mx-auto text-dark-muted opacity-20 mb-8" size={64} />
                                <p className="text-dark-muted font-bold text-sm uppercase tracking-[0.4em] opacity-40">No validation tests have been indexed for this curriculum matrix.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'articles' && (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        <div className="flex items-center gap-5 border-b border-white/5 pb-8">
                            <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20">
                                <PenTool size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Instructor Articles</h2>
                                <p className="text-sm text-dark-muted mt-1">Additional reading from your instructor</p>
                            </div>
                        </div>

                        {instructorArticles.length > 0 ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {instructorArticles.map(article => (
                                    <div
                                        key={article._id}
                                        onClick={() => navigate(`/blog/${article.slug}`)}
                                        className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 hover:border-brand-primary/40 transition-all cursor-pointer flex gap-8 p-6 group shadow-xl"
                                    >
                                        <div className="w-32 h-32 bg-[#111] rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-white/5">
                                            {article.coverImage ? (
                                                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-dark-muted bg-[#111]">
                                                    <FileText size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3 py-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/10 px-2 py-1 rounded border border-brand-primary/20">{article.category}</span>
                                                <span className="text-[8px] text-dark-muted font-bold uppercase tracking-widest opacity-40">{new Date(article.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors line-clamp-1">{article.title}</h3>
                                            <p className="text-[12px] text-dark-muted line-clamp-2 leading-relaxed opacity-70">
                                                {article.content.substring(0, 100).replace(/<[^>]*>/g, '')}...
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-[#0a0a0a]/30 rounded-[3rem] border border-white/5 border-dashed">
                                <PenTool className="mx-auto text-dark-muted opacity-20 mb-8" size={64} />
                                <p className="text-dark-muted text-sm">No articles published yet</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="animate-in fade-in duration-700">
                        <div className="flex items-center gap-5 border-b border-white/5 pb-8 mb-8">
                            <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20">
                                <Star size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Course Reviews</h2>
                                <p className="text-[11px] font-bold text-dark-muted uppercase tracking-[0.4em] mt-1">Student Feedback Matrix</p>
                            </div>
                        </div>
                        <Reviews courseId={course._id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoTabs;
