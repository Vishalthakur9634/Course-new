import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { MessageSquare, FileText, Info, Send, ThumbsUp, Reply, User } from 'lucide-react';

const VideoTabs = ({ video, course }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyText, setReplyText] = useState('');
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        if (activeTab === 'qa' && video) {
            fetchComments();
        }
    }, [activeTab, video]);

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
            <div className="flex border-b border-dark-layer2">
                {/* Only show tabs if enabled by instructor */}
                {(course.instructorAdminSettings?.enableOverview !== false) && (
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'overview' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <Info size={16} /> Overview
                    </button>
                )}
                {(course.instructorAdminSettings?.enableQA !== false) && (
                    <button
                        onClick={() => setActiveTab('qa')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'qa' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <MessageSquare size={16} /> Q&A
                    </button>
                )}
                {(course.instructorAdminSettings?.enableSummary !== false) && (
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'notes' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <FileText size={16} /> Summary
                    </button>
                )}
                {(course.instructorAdminSettings?.enableNotes !== false) && (
                    <button
                        onClick={() => setActiveTab('studentNotes')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'studentNotes' ? 'bg-dark-layer2 text-white border-b-2 border-brand-primary' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <FileText size={16} /> Notes
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
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
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-xl">
                                            {course.instructorId.name?.charAt(0).toUpperCase() || 'I'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-lg font-bold text-white">{course.instructorId.name}</p>
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
                                    <div key={comment._id} className="flex gap-3">
                                        {/* Avatar */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {comment.user.avatar ? (
                                                <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-white">{comment.user.name.charAt(0)}</span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            {/* Comment Header */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white text-sm">{comment.user.name}</span>
                                                <span className="text-xs text-dark-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {/* Comment Text */}
                                            <p className="text-dark-text text-sm mb-2">{comment.text}</p>

                                            {/* Actions */}
                                            <div className="flex items-center gap-4 text-xs text-dark-muted mb-2">
                                                <button
                                                    onClick={() => handleLike(comment._id)}
                                                    className={`flex items-center gap-1 hover:text-white transition-colors ${comment.likes.includes(currentUser?.id) ? 'text-brand-primary' : ''}`}
                                                >
                                                    <ThumbsUp size={14} /> {comment.likes.length || 0}
                                                </button>
                                                <button
                                                    onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                                                    className="flex items-center gap-1 hover:text-white transition-colors"
                                                >
                                                    <Reply size={14} /> Reply
                                                </button>
                                            </div>

                                            {/* Reply Input */}
                                            {activeReplyId === comment._id && (
                                                <div className="flex gap-2 mb-4 mt-2">
                                                    <input
                                                        type="text"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        className="flex-1 bg-dark-layer2 border border-dark-layer2 rounded px-3 py-1 text-sm text-white focus:border-brand-primary focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleReply(comment._id)}
                                                        className="bg-brand-primary text-white px-3 py-1 rounded text-xs font-bold hover:bg-brand-hover"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            )}

                                            {/* Replies List */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="space-y-3 mt-2 pl-4 border-l-2 border-dark-layer2">
                                                    {comment.replies.map((reply, idx) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                                {reply.user?.avatar ? (
                                                                    <img src={reply.user.avatar} alt={reply.user.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-white">{reply.user?.name?.charAt(0) || 'U'}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-white text-xs">{reply.user?.name || 'Unknown User'}</span>
                                                                    <span className="text-[10px] text-dark-muted">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-dark-text text-xs mt-0.5">{reply.text}</p>
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

                {activeTab === 'notes' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="text-brand-primary" size={24} />
                            <h2 className="text-xl font-bold text-white">Video Summary</h2>
                        </div>
                        <div className="bg-dark-layer2 p-6 rounded-lg border border-dark-layer2">
                            {video.summary ? (
                                <p className="text-dark-text leading-relaxed whitespace-pre-wrap">{video.summary}</p>
                            ) : (
                                <p className="text-dark-muted italic">No summary available for this video.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoTabs;
