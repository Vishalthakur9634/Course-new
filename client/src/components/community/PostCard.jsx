import React from 'react';
import {
    Heart, MessageCircle, Eye, Pin, Trash2, Hash, Check
} from 'lucide-react';
import UserLink from '../UserLink';

const PostCard = ({
    post,
    currentUser,
    onVote,
    onLike,
    onDelete,
    onPin,
    onClick
}) => {

    const isModerator = currentUser && post.communityId?.moderators?.some(
        m => (typeof m === 'string' ? m : m._id) === currentUser.id
    );
    const canPin = currentUser?.role === 'superadmin' || isModerator;

    const getPostTypeColor = (type) => {
        const colors = {
            announcement: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
            question: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
            showcase: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
            discussion: 'bg-green-500/10 border-green-500/20 text-green-400',
            poll: 'bg-pink-500/10 border-pink-500/20 text-pink-400'
        };
        return colors[type] || 'bg-white/5 border-white/10 text-dark-muted';
    };

    return (
        <article
            className="bg-dark-layer1 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl hover:border-brand-primary/30 transition-all duration-300 group cursor-pointer"
            onClick={() => onClick(post)}
        >
            <div className="p-8 space-y-4">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1" onClick={(e) => e.stopPropagation()}>
                        <UserLink
                            user={post.authorId}
                            avatarSize="w-12 h-12"
                            nameClass="text-sm font-black text-white tracking-tight"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                {post.authorId?.role === 'instructor' && (
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded uppercase">Instructor</span>
                                )}
                                {post.isPinned && (
                                    <Pin size={12} className="text-brand-primary" />
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                                {post.communityId && (
                                    <span className="text-[10px] text-brand-primary font-black flex items-center gap-1">
                                        <Hash size={10} /> {post.communityId.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${getPostTypeColor(post.type)}`}>
                            {post.type}
                        </span>
                        {canPin && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPin(post._id);
                                }}
                                className={`p-2 rounded-xl transition-all ${post.isPinned ? 'bg-brand-primary/10 text-brand-primary' : 'bg-white/5 text-dark-muted hover:text-white'}`}
                                title={post.isPinned ? "Unpin Post" : "Pin Post"}
                            >
                                <Pin size={14} className={post.isPinned ? "fill-current" : ""} />
                            </button>
                        )}
                        {currentUser && (post.authorId?._id === currentUser.id || currentUser.role === 'superadmin') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(post._id);
                                }}
                                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white group-hover:text-brand-primary transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                    <p className="text-dark-muted leading-relaxed font-medium line-clamp-3">
                        {post.content}
                    </p>

                    {/* Image Display */}
                    {post.media && post.media.length > 0 && post.media[0].type === 'image' && (
                        <div className="mt-4 rounded-xl overflow-hidden max-h-96">
                            <img
                                src={post.media[0].url}
                                alt="Post content"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Poll Display */}
                    {post.type === 'poll' && post.poll && (
                        <div className="mt-4 bg-dark-layer2/50 rounded-xl p-4 border border-white/5 space-y-3" onClick={e => e.stopPropagation()}>
                            {post.poll.options.map((option, idx) => {
                                const totalVotes = post.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                                const percentage = totalVotes === 0 ? 0 : Math.round((option.votes.length / totalVotes) * 100);
                                const hasVoted = option.votes.includes(currentUser?.id);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => onVote(post._id, idx)}
                                        className={`relative w-full text-left p-3 rounded-lg text-sm font-bold border transition-all ${hasVoted
                                            ? 'border-brand-primary text-white bg-brand-primary/10'
                                            : 'border-white/10 text-dark-muted hover:bg-white/5'
                                            }`}
                                    >
                                        <div
                                            className={`absolute inset-0 opacity-20 transition-all duration-1000 ${hasVoted ? 'bg-brand-primary' : 'bg-white'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                        <div className="relative flex justify-between z-10">
                                            <span>{option.text}</span>
                                            <span>{percentage}%</span>
                                        </div>
                                    </button>
                                );
                            })}
                            <p className="text-xs text-dark-muted text-center mt-2">
                                {post.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0)} votes • Ends {new Date(post.poll.expiresAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {post.tags.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white/5 text-brand-primary text-xs font-bold rounded-xl border border-white/10">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Post Footer */}
            <div className="px-8 py-4 bg-dark-layer2/10 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike(post._id);
                        }}
                        className={`flex items-center gap-2 transition-colors ${post.likes?.includes(currentUser?.id) ? 'text-red-400' : 'text-dark-muted hover:text-red-400'}`}
                    >
                        <Heart size={20} className={post.likes?.includes(currentUser?.id) ? 'fill-current' : ''} />
                        <span className="text-sm font-black">{post.likeCount || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-dark-muted hover:text-brand-primary transition-colors">
                        <MessageCircle size={20} />
                        <span className="text-sm font-black">{post.commentCount || 0}</span>
                    </button>
                    <div className="flex items-center gap-2 text-dark-muted">
                        <Eye size={20} />
                        <span className="text-sm font-black">{post.viewCount || 0}</span>
                    </div>
                </div>
                <button className="px-5 py-2 rounded-xl bg-white/5 text-xs font-black text-white hover:bg-brand-primary hover:text-dark-bg transition-all uppercase tracking-widest border border-white/10">
                    View Discussion
                </button>
            </div>
        </article>
    );
};

export default PostCard;
