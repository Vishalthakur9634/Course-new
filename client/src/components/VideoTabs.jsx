import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, Info, Send, ThumbsUp, Reply, User, BookOpen, PenTool, Sparkles, X, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserLink from './UserLink';

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
            const { data } = await api.post('/notes', {
                videoId: video._id,
                courseId: course._id,
                content: newNoteContent,
                timestamp: currentTime || 0
            });
            setStudentNotes([...studentNotes, data].sort((a, b) => a.timestamp - b.timestamp));
            setNewNoteContent('');
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
                userId: currentUser.id,
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
                userId: currentUser.id,
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
                userId: currentUser.id
            });
            setComments(comments.map(c => c._id === commentId ? data : c));
        } catch (error) {
            console.error('Error liking comment', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-dark-layer1 border border-dark-layer2 rounded-lg overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-dark-layer2 overflow-x-auto scrollbar-hide">
                {/* Only show tabs if enabled by instructor */}
                {(course.instructorAdminSettings?.enableOverview !== false) && (
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'overview' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <Info size={16} /> Overview
                    </button>
                )}
                {(course.instructorAdminSettings?.enableQA !== false) && (
                    <button
                        onClick={() => setActiveTab('qa')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'qa' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <MessageSquare size={16} /> Q&A
                    </button>
                )}
                {(course.instructorAdminSettings?.enableSummary !== false) && (
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'notes' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <FileText size={16} /> Summary
                    </button>
                )}
                {(course.instructorAdminSettings?.enableNotes !== false) && (
                    <button
                        onClick={() => setActiveTab('studentNotes')}
                        className={`flex-1 min-w-[100px] py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'studentNotes' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <FileText size={16} /> Notes
                    </button>
                )}

                {/* New Tabs: Assignments & Articles */}
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex-1 min-w-[120px] py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'assignments' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                        }`}
                >
                    <BookOpen size={16} /> Assignments
                </button>

                <button
                    onClick={() => setActiveTab('articles')}
                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'articles' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                        }`}
                >
                    <PenTool size={16} /> Articles
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">{video.title}</h2>
                            <p className="text-dark-muted">{video.description || 'No description available for this video.'}</p>
                        </div>

                        {/* Instructor Info */}
                        {course.instructorId && (
                            <div className="border-t border-dark-layer2 pt-4">
                                <h3 className="font-semibold text-white mb-3">Instructor</h3>
                                <div className="flex items-start gap-4">
                                    <UserLink
                                        user={course.instructorId}
                                        avatarSize="w-16 h-16"
                                        nameClass="text-lg font-bold text-white"
                                    />
                                    <div className="flex-1">
                                        {course.instructorId.instructorProfile?.headline && (
                                            <p className="text-sm text-dark-muted mt-1">
                                                {course.instructorId.instructorProfile.headline}
                                            </p>
                                        )}
                                        {course.instructorId.instructorProfile?.bio && (
                                            <p className="text-sm text-dark-muted mt-2">
                                                {course.instructorId.instructorProfile.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-dark-layer2 pt-4">
                            <h3 className="font-semibold text-white mb-2">About this Course</h3>
                            <p className="text-sm text-dark-muted">{course.description}</p>
                        </div>

                        {/* Video Resources */}
                        {video.resources && video.resources.length > 0 && (
                            <div className="border-t border-dark-layer2 pt-4">
                                <h3 className="font-semibold text-white mb-3">Downloadable Resources</h3>
                                <div className="space-y-2">
                                    {video.resources.map((resource, idx) => (
                                        <a
                                            key={idx}
                                            href={resource.url}
                                            download
                                            className="flex items-center justify-between p-3 bg-dark-layer2 rounded hover:bg-dark-layer1 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={20} className="text-brand-primary" />
                                                <div>
                                                    <p className="text-white font-medium">{resource.title}</p>
                                                    <p className="text-xs text-dark-muted">
                                                        {resource.fileType} • {(resource.fileSize / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-brand-primary group-hover:text-brand-hover">
                                                Download
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'qa' && (
                    <div className="flex flex-col h-full">
                        {/* Comment Input */}
                        <form onSubmit={handlePostComment} className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded-lg py-3 pl-4 pr-12 text-white focus:border-brand-primary focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-brand-primary hover:text-brand-hover p-1"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        {loadingComments ? (
                            <div className="text-center text-dark-muted">Loading discussions...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-dark-muted mt-10">
                                <MessageSquare size={40} className="mx-auto mb-2 opacity-20" />
                                <p>No discussions yet. Be the first to ask!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-4">
                                        <UserLink
                                            user={comment.user}
                                            showAvatar={true}
                                            avatarSize="w-10 h-10"
                                            nameClass="hidden"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <UserLink
                                                    user={comment.user}
                                                    showAvatar={false}
                                                    nameClass="font-bold text-white text-sm"
                                                />
                                                <span className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-dark-text text-sm leading-relaxed mb-3">{comment.text}</p>

                                            <div className="flex items-center gap-6 text-xs text-dark-muted mb-4">
                                                <button
                                                    onClick={() => handleLike(comment._id)}
                                                    className={`flex items-center gap-1.5 hover:text-white transition-colors ${comment.likes?.includes(currentUser?.id) ? 'text-brand-primary' : ''}`}
                                                >
                                                    <ThumbsUp size={14} className={comment.likes?.includes(currentUser?.id) ? 'fill-current' : ''} />
                                                    <span className="font-black">{comment.likes?.length || 0}</span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                                                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                                                >
                                                    <Reply size={14} /> <span className="font-black">REPLY</span>
                                                </button>
                                            </div>

                                            {activeReplyId === comment._id && (
                                                <div className="flex gap-2 mb-6 animate-in slide-in-from-top-2 duration-300">
                                                    <input
                                                        type="text"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        className="flex-1 bg-dark-layer2 border border-dark-layer2 rounded-xl px-4 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleReply(comment._id)}
                                                        className="bg-brand-primary text-dark-bg px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-hover transition-all"
                                                    >
                                                        Post
                                                    </button>
                                                </div>
                                            )}

                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="space-y-4 mt-2 pl-4 border-l-2 border-dark-layer2">
                                                    {comment.replies.map((reply, idx) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <UserLink
                                                                user={reply.user}
                                                                avatarSize="w-8 h-8"
                                                                nameClass="hidden"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <UserLink
                                                                        user={reply.user}
                                                                        showAvatar={false}
                                                                        nameClass="font-bold text-white text-xs"
                                                                    />
                                                                    <span className="text-[9px] text-dark-muted font-bold uppercase tracking-widest">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-dark-text text-xs mt-1 leading-relaxed">{reply.text}</p>
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

                {
                    activeTab === 'studentNotes' && (
                        <div className="flex flex-col h-full space-y-6">
                            {/* Note Input */}
                            <div className="bg-dark-layer2 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-xs font-bold text-dark-muted flex items-center gap-2">
                                        <FileText size={14} className="text-brand-primary" />
                                        Note at {formatTime(currentTime)}
                                    </span>
                                    <span className="text-[10px] text-dark-muted uppercase font-black tracking-widest">Auto-timestamp</span>
                                </div>
                                <form onSubmit={handleAddNote} className="space-y-3">
                                    <textarea
                                        value={newNoteContent}
                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                        placeholder="Add a private note at this moment..."
                                        className="w-full bg-dark-layer1 border border-white/5 rounded-lg p-3 text-sm text-white focus:border-brand-primary focus:outline-none min-h-[100px] resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!newNoteContent.trim() || isSavingNote}
                                            className="bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-dark-bg px-6 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all"
                                        >
                                            {isSavingNote ? 'Saving...' : 'Save Note'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Notes List */}
                            <div className="space-y-4">
                                {studentNotes.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <FileText className="mx-auto text-dark-muted opacity-20 mb-3" size={48} />
                                        <p className="text-sm text-dark-muted">Your private notes will appear here.</p>
                                    </div>
                                ) : (
                                    studentNotes.map((note) => (
                                        <div key={note._id} className="group bg-dark-layer2/50 border border-white/5 rounded-xl p-4 hover:border-brand-primary/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <button
                                                    onClick={() => {
                                                        const player = document.querySelector('video');
                                                        if (player) player.currentTime = note.timestamp;
                                                    }}
                                                    className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all"
                                                >
                                                    {formatTime(note.timestamp)}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNote(note._id)}
                                                    className="text-dark-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={14} />
                                                    {/* X icon helper not imported, just using text for now if missing, but likely covered by handleDeleteNote usage elsewhere */}
                                                </button>
                                            </div>
                                            <p className="text-sm text-dark-text leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                            <div className="mt-3 text-[10px] text-dark-muted font-medium">
                                                Last edited: {new Date(note.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'notes' && (
                        <div className="space-y-4 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="text-brand-primary" size={24} />
                                <h2 className="text-xl font-bold">Video Summary</h2>
                            </div>

                            {/* PDF Note Download */}
                            {video.notePdf && (
                                <div className="bg-dark-layer2 p-4 rounded-lg border border-dark-layer2 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-500/20 p-2 rounded text-red-400">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">Lecture Notes</h3>
                                            <p className="text-xs text-dark-muted">PDF Document</p>
                                        </div>
                                    </div>
                                    <a
                                        href={video.notePdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-brand-primary text-white text-sm rounded hover:bg-brand-hover transition-colors"
                                    >
                                        View / Download
                                    </a>
                                </div>
                            )}

                            <div className="bg-dark-layer2 p-6 rounded-lg border border-dark-layer2">
                                {video.summary ? (
                                    <p className="text-dark-text leading-relaxed whitespace-pre-wrap">{video.summary}</p>
                                ) : (
                                    <p className="text-dark-muted italic">No text summary available for this video.</p>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Assignments Tab */}
                {
                    activeTab === 'assignments' && (
                        <div className="space-y-6 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen className="text-brand-primary" size={24} />
                                <h2 className="text-xl font-bold">Course Assignments & Quizzes</h2>
                            </div>

                            {assessment ? (
                                <div className="bg-dark-layer2 p-6 rounded-xl border border-dark-layer2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{assessment.title}</h3>
                                            <p className="text-dark-muted mb-4">
                                                Test your knowledge with this comprehensive assessment.
                                            </p>
                                            <div className="flex gap-4 text-sm text-dark-muted mb-6">
                                                <span className="bg-dark-layer1 px-3 py-1 rounded">Questions: {assessment.questions.length}</span>
                                                <span className="bg-dark-layer1 px-3 py-1 rounded">Passing Score: {assessment.passingScore}%</span>
                                                {assessment.durationLimit > 0 && (
                                                    <span className="bg-dark-layer1 px-3 py-1 rounded">Time Limit: {assessment.durationLimit} mins</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-brand-primary/10 p-4 rounded-full">
                                            <Award size={32} className="text-brand-primary" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/course/${course._id}/assessment`)}
                                        className="w-full bg-brand-primary hover:bg-brand-hover text-dark-bg font-black py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 group"
                                    >
                                        <Sparkles size={18} className="group-hover:animate-spin" /> START MASTERY TEST
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-dark-layer2 rounded-xl border border-dark-layer2 border-dashed">
                                    <BookOpen className="mx-auto text-dark-muted opacity-20 mb-3" size={48} />
                                    <p className="text-dark-muted">No assignments have been assigned for this course yet.</p>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Articles Tab */}
                {
                    activeTab === 'articles' && (
                        <div className="space-y-6 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <PenTool className="text-brand-primary" size={24} />
                                <h2 className="text-xl font-bold">From the Instructor's Blog</h2>
                            </div>

                            {instructorArticles.length > 0 ? (
                                <div className="grid gap-4">
                                    {instructorArticles.map(article => (
                                        <div
                                            key={article._id}
                                            onClick={() => navigate(`/blog/${article.slug}`)}
                                            className="bg-dark-layer2 p-4 rounded-xl border border-dark-layer2 hover:border-brand-primary transition-all cursor-pointer flex gap-4"
                                        >
                                            <div className="w-24 h-24 bg-dark-layer1 rounded-lg overflow-hidden flex-shrink-0">
                                                {article.coverImage ? (
                                                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-dark-muted bg-dark-layer1">
                                                        <FileText size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white mb-1 line-clamp-1">{article.title}</h3>
                                                <div className="text-xs text-brand-primary mb-2 uppercase font-bold tracking-wider">{article.category}</div>
                                                <p className="text-sm text-dark-muted line-clamp-2 mb-3">
                                                    {article.content.substring(0, 100).replace(/<[^>]*>/g, '')}...
                                                </p>
                                                <span className="text-xs text-dark-muted">{new Date(article.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-dark-layer2 rounded-xl border border-dark-layer2 border-dashed">
                                    <PenTool className="mx-auto text-dark-muted opacity-20 mb-3" size={48} />
                                    <p className="text-dark-muted">The instructor hasn't published any articles yet.</p>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default VideoTabs;
