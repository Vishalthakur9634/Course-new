import React from 'react';
import {
    Heart, MessageCircle, Eye, Pin, Trash2, Hash, Check, Share2, MoreHorizontal,
    Zap, Star, Shield, Terminal, Globe, Award, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
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

    const getPostTypeDetails = (type) => {
        const types = {
            announcement: { icon: Award, color: '#ffa116', label: 'ANNOUNCEMENT' },
            question: { icon: Zap, color: '#3b82f6', label: 'QUERY' },
            showcase: { icon: Star, color: '#a855f7', label: 'INTEL' },
            discussion: { icon: Terminal, color: '#22c55e', label: 'DISCUSSION' },
            poll: { icon: Globe, color: '#ec4899', label: 'CONSENSUS' }
        };
        return types[type] || { icon: MessageCircle, color: '#64748b', label: type?.toUpperCase() };
    };

    const typeDetails = getPostTypeDetails(post.type);

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer hover:border-brand-primary/20"
            onClick={() => onClick(post)}
        >
            {/* Glossy Aura Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-8 md:p-10 space-y-10 relative z-10">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5 flex-1" onClick={(e) => e.stopPropagation()}>
                        <div className="relative group/avatar">
                            <UserLink
                                user={post.authorId}
                                avatarSize="w-14 h-14"
                                nameClass="hidden"
                            />
                            <div
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-[#141414] flex items-center justify-center shadow-xl"
                                style={{ backgroundColor: typeDetails.color }}
                            >
                                <typeDetails.icon size={12} className="text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <UserLink
                                    user={post.authorId}
                                    showAvatar={false}
                                    nameClass="text-sm font-black text-white tracking-tight uppercase hover:text-brand-primary transition-colors"
                                />
                                {post.authorId?.role === 'instructor' && (
                                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[8px] font-black rounded-lg border border-brand-primary/20 uppercase tracking-widest">Instructor</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 opacity-50">
                                <p className="text-[9px] text-dark-muted font-black uppercase tracking-widest">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                {post.communityId && (
                                    <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: post.communityId.color || '#ffa116' }}>
                                        <Hash size={10} /> {post.communityId.name.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {post.isPinned && (
                            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 shadow-lg">
                                <Pin size={14} className="fill-current" />
                            </div>
                        )}
                        <span
                            className="text-[8px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl border backdrop-blur-xl transition-all"
                            style={{
                                backgroundColor: `${typeDetails.color}11`,
                                borderColor: `${typeDetails.color}22`,
                                color: typeDetails.color
                            }}
                        >
                            {typeDetails.label}
                        </span>

                        <div className="relative group/menu" onClick={e => e.stopPropagation()}>
                            <button className="p-3 bg-white/5 border border-white/5 hover:border-white/20 rounded-xl text-dark-muted hover:text-white transition-all">
                                <MoreHorizontal size={18} />
                            </button>
                            <div className="absolute top-full right-0 mt-3 bg-[#111] border border-white/10 rounded-[1.5rem] p-3 opacity-0 scale-95 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:scale-100 group-hover/menu:pointer-events-auto transition-all duration-300 z-50 shadow-3xl min-w-[180px]">
                                {canPin && (
                                    <button
                                        onClick={() => onPin(post._id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-[9px] font-black text-white uppercase tracking-widest"
                                    >
                                        <Pin size={14} /> {post.isPinned ? "Unpin Node" : "Pin Node"}
                                    </button>
                                )}
                                {currentUser && (post.authorId?._id === currentUser.id || currentUser.role === 'superadmin') && (
                                    <button
                                        onClick={() => onDelete(post._id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-all text-[9px] font-black text-red-400 uppercase tracking-widest"
                                    >
                                        <Trash2 size={14} /> Decommission
                                    </button>
                                )}
                                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-[9px] font-black text-white uppercase tracking-widest">
                                    <Shield size={14} /> Report Anomaly
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Content */}
                <div className="space-y-6">
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight group-hover:text-brand-primary transition-colors duration-500 uppercase italic">
                        {post.title}
                    </h3>
                    <p className="text-dark-muted leading-relaxed font-medium text-sm line-clamp-4 opacity-80 group-hover:opacity-100 transition-opacity">
                        {post.content}
                    </p>

                    {/* Media Display */}
                    {post.media && post.media.length > 0 && post.media[0].type === 'image' && (
                        <div className="mt-8 rounded-[2rem] overflow-hidden border border-white/5 relative group/img aspect-video shadow-2xl">
                            <img
                                src={post.media[0].url}
                                alt="Signal Content"
                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                        </div>
                    )}

                    {/* Poll Display */}
                    {post.type === 'poll' && post.poll && (
                        <div className="mt-8 p-10 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-6" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em]">CONSENSUS POLLING</h4>
                                <div className="text-[9px] font-black text-dark-muted uppercase tracking-widest">{post.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0)} SIGNALS</div>
                            </div>

                            {post.poll.options.map((option, idx) => {
                                const totalVotes = post.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                                const percentage = totalVotes === 0 ? 0 : Math.round((option.votes.length / totalVotes) * 100);
                                const hasVoted = option.votes.includes(currentUser?.id);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => onVote(post._id, idx)}
                                        className="relative w-full text-left p-6 rounded-2xl border overflow-hidden transition-all duration-700 group/option"
                                        style={{
                                            borderColor: hasVoted ? typeDetails.color : 'rgba(255,255,255,0.05)',
                                            backgroundColor: hasVoted ? `${typeDetails.color}11` : 'transparent'
                                        }}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className="absolute inset-y-0 left-0 opacity-20 transition-all duration-1000"
                                            style={{ backgroundColor: typeDetails.color }}
                                        />
                                        <div className="relative flex justify-between z-10">
                                            <span className={`text-xs font-black uppercase tracking-widest ${hasVoted ? 'text-white' : 'text-dark-muted group-hover/option:text-white transition-colors'}`}>{option.text}</span>
                                            <span className="text-[10px] font-black text-brand-primary">{percentage}%</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-4">
                            {post.tags.map((tag, idx) => (
                                <span key={idx} className="px-5 py-2.5 bg-white/5 text-[8px] font-black text-brand-primary rounded-xl border border-white/5 uppercase tracking-widest hover:bg-brand-primary hover:text-dark-bg transition-all cursor-crosshair">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Post Footer - Engagement Metrics */}
            <div className="px-10 py-8 bg-white/[0.01] border-t border-white/5 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent"></div>

                <div className="flex items-center gap-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike(post._id);
                        }}
                        className={`flex items-center gap-3 transition-all duration-500 group/btn ${post.likes?.includes(currentUser?.id) ? 'text-red-400' : 'text-dark-muted hover:text-red-400'}`}
                    >
                        <div className={`p-3.5 rounded-2xl border transition-all ${post.likes?.includes(currentUser?.id) ? 'bg-red-400/10 border-red-400/20' : 'bg-white/5 border-white/5 group-hover/btn:border-red-400/30'}`}>
                            <Heart size={18} className={post.likes?.includes(currentUser?.id) ? 'fill-current scale-110' : 'group-hover/btn:scale-110 trasition-transform'} />
                        </div>
                        <span className="text-[10px] font-black tracking-widest">{post.likeCount || 0}</span>
                    </button>

                    <button className="flex items-center gap-3 text-dark-muted hover:text-blue-400 transition-all group/btn">
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 group-hover/btn:border-blue-400/30">
                            <MessageCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black tracking-widest">{post.commentCount || 0}</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-3 text-dark-muted opacity-50">
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                            <Eye size={18} />
                        </div>
                        <span className="text-[10px] font-black tracking-widest">{post.viewCount || 0}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-3.5 bg-white/5 border border-white/5 hover:border-brand-primary/20 rounded-2xl text-dark-muted hover:text-brand-primary transition-all shadow-xl">
                        <Share2 size={18} />
                    </button>
                    <button className="px-8 py-3.5 rounded-2xl bg-brand-primary/10 text-[9px] font-black text-brand-primary hover:bg-brand-primary hover:text-dark-bg transition-all uppercase tracking-[0.2em] border border-brand-primary/20 hover:scale-105 active:scale-95 shadow-xl shadow-brand-primary/10 flex items-center gap-3">
                        Join Discussion <ExternalLink size={14} />
                    </button>
                </div>
            </div>
        </motion.article>
    );
};

export default PostCard;
