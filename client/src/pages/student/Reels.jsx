import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
    Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX,
    User, ArrowLeft, ChevronUp, ChevronDown, Sparkles, Zap, Trophy,
    Plus, Send, MessageSquare, X, ChevronRight, MoreVertical, Music
} from 'lucide-react';
import UserLink from '../../components/UserLink';
import UploadReelModal from '../../components/reels/UploadReelModal';

const Reels = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const instructorId = searchParams.get('instructorId');
    const specificReelId = searchParams.get('id');
    const [reels, setReels] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [user, setUser] = useState(null);
    const [shareToast, setShareToast] = useState({ show: false, message: '' });
    const containerRef = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
        fetchReels();
    }, [instructorId]);

    const fetchReels = async () => {
        setLoading(true);
        try {
            const url = instructorId ? `/reels/feed?instructorId=${instructorId}` : '/reels/feed';
            const { data } = await api.get(url);

            // If a specific ID is provided, move it to the front
            let sortedData = data;
            if (specificReelId) {
                const targetIndex = data.findIndex(r => r._id === specificReelId);
                if (targetIndex > -1) {
                    const target = data.splice(targetIndex, 1)[0];
                    sortedData = [target, ...data];
                }
            }
            setReels(sortedData);
        } catch (error) {
            console.error('Error fetching reels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollTop / e.target.clientHeight);
        if (index !== activeIndex && index >= 0 && index < reels.length) {
            setActiveIndex(index);
        }
    };

    if (loading) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-t-4 border-brand-primary rounded-full animate-spin"></div>
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Syncing Vertical Feed...</p>
        </div>
    );

    if (reels.length === 0) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-dark-muted">
                <Play size={40} className="opacity-20" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Frequency Detected</h2>
                <p className="text-dark-muted font-medium">This sector of the Orbit is currently quiet.</p>
            </div>
            <Link to="/dashboard" className="text-brand-primary font-black uppercase text-xs tracking-widest border border-brand-primary/20 px-8 py-3 rounded-2xl hover:bg-brand-primary hover:text-dark-bg transition-all">
                Return to Base
            </Link>
        </div>
    );

    const handleShare = async (reel) => {
        const shareUrl = `${window.location.origin}/reels?id=${reel._id}`;
        const shareData = {
            title: reel.title || 'Check out this reel!',
            text: `Check out "${reel.title}" by ${reel.instructorId?.name}`,
            url: shareUrl
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                setShareToast({ show: true, message: 'Shared successfully!' });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                setShareToast({ show: true, message: 'Link copied to clipboard!' });
            }
            setTimeout(() => setShareToast({ show: false, message: '' }), 3000);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                setShareToast({ show: true, message: 'Failed to share' });
                setTimeout(() => setShareToast({ show: false, message: '' }), 3000);
            }
        }
    };

    return (
        <div className="h-screen bg-black overflow-hidden relative font-orbit">
            {/* Header / Back */}
            <div className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between pointer-events-none">
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5 pointer-events-auto">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                    <span className="text-white font-black uppercase text-[10px] tracking-[0.4em] italic drop-shadow-2xl">LIVE STREAM</span>
                </div>
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5 pointer-events-auto"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Main Feed */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
            >
                {reels.map((reel, index) => (
                    <ReelItem
                        key={reel._id}
                        reel={reel}
                        isActive={index === activeIndex}
                        isMuted={isMuted}
                        user={user}
                        navigate={navigate}
                        onShare={handleShare}
                    />
                ))}
            </div>

            {/* Upload Button Overlay (Mobile/Instructor) */}
            {user?.role === 'instructor' && (
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="fixed bottom-32 left-6 w-14 h-14 rounded-[2rem] bg-brand-primary text-dark-bg flex items-center justify-center shadow-[0_8px_30px_rgba(255,161,22,0.4)] hover:scale-110 active:scale-90 transition-all z-50"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            )}

            {showUploadModal && <UploadReelModal onClose={() => setShowUploadModal(false)} onUpload={() => { fetchReels(); setShowUploadModal(false); }} />}

            {/* Share Toast Notification */}
            {shareToast.show && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-dark-layer1 border border-white/10 px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                        <span className="text-white font-black uppercase text-sm tracking-widest">{shareToast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReelItem = ({ reel, isActive, isMuted, user, navigate, onShare }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [likes, setLikes] = useState(reel.likes?.length || 0);
    const [hasLiked, setHasLiked] = useState(user ? reel.likes?.includes(user.id || user._id) : false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(reel.comments || []);
    const [viewCount, setViewCount] = useState(reel.views || 0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [doubleTapHeart, setDoubleTapHeart] = useState(false);

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.play().catch(err => console.log('Autoplay blocked'));
            setIsPlaying(true);
            incrementView();
            checkFollowing();
        } else if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isActive]);

    const checkFollowing = async () => {
        if (!user || !reel.instructorId) return;
        try {
            const { data } = await api.get(`/users/profile/${reel.instructorId._id || reel.instructorId}`);
            setIsFollowing(data.isFollowing);
        } catch (e) { /* ignore */ }
    };

    const incrementView = async () => {
        try {
            await api.post(`/reels/${reel._id}/view`);
            setViewCount(prev => prev + 1);
        } catch (e) { /* ignore */ }
    };

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleDoubleTap = (e) => {
        if (e.detail === 2) {
            setDoubleTapHeart(true);
            if (!hasLiked) handleLike();
            setTimeout(() => setDoubleTapHeart(false), 1000);
        }
    };

    const handleLike = async () => {
        if (!user) return alert('Please login to like');
        try {
            const { data } = await api.post(`/reels/${reel._id}/like`);
            setLikes(data.length);
            setHasLiked(data.includes(user.id || user._id));
        } catch (e) { console.error(e); }
    };

    const toggleFollow = async () => {
        if (!user) return alert('Login to follow');
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            await api.post(`/users/${endpoint}/${reel.instructorId._id || reel.instructorId}`);
            setIsFollowing(!isFollowing);
        } catch (e) { console.error(e); }
    };

    const postComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const { data } = await api.post(`/reels/${reel._id}/comment`, { text: commentText });
            setComments(data);
            setCommentText('');
        } catch (e) { console.error(e); }
    };

    return (
        <div className="h-full w-full snap-start relative flex items-center justify-center bg-black overflow-hidden group/reel">
            {/* Background Video */}
            <video
                ref={videoRef}
                src={reel.videoUrl}
                poster={reel.thumbnailUrl}
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover lg:max-w-[450px] lg:border-x lg:border-white/10"
                onClick={togglePlay}
            />

            {/* Click/Tap Layer for double tap */}
            <div
                className="absolute inset-0 lg:max-w-[450px] mx-auto z-10"
                onClick={handleDoubleTap}
            />

            {/* Double Tap Heart Animation */}
            {doubleTapHeart && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <Heart size={120} fill="red" className="text-red-500 animate-ping opacity-75" />
                </div>
            )}

            {/* Play/Pause Overlay Animation */}
            {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/20">
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 animate-in zoom-in-50 duration-300">
                        <Play size={48} className="text-white fill-current ml-2" />
                    </div>
                </div>
            )}

            {/* Right Action Sidebar (IG Style) */}
            <div className="absolute right-6 bottom-32 flex flex-col items-center gap-6 z-30 lg:right-[calc(50%-200px)] pointer-events-none">
                <div className="flex flex-col items-center gap-1 pointer-events-auto">
                    <button
                        onClick={handleLike}
                        className={`p-3 rounded-full transition-all duration-300 ${hasLiked ? 'text-red-500 transform scale-125' : 'text-white hover:bg-white/10'}`}
                    >
                        <Heart size={36} fill={hasLiked ? 'currentColor' : 'none'} strokeWidth={2.5} />
                    </button>
                    <span className="text-xs font-black text-white drop-shadow-lg">{likes}</span>
                </div>

                <div className="flex flex-col items-center gap-1 pointer-events-auto">
                    <button
                        onClick={() => setShowComments(true)}
                        className="p-3 text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <MessageCircle size={36} strokeWidth={2.5} />
                    </button>
                    <span className="text-xs font-black text-white drop-shadow-lg">{comments.length}</span>
                </div>

                <div className="pointer-events-auto">
                    <button
                        onClick={() => onShare(reel)}
                        className="p-3 text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <Share2 size={36} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="w-12 h-12 rounded-full border-2 border-brand-primary p-0.5 mt-2 animate-spin-slow pointer-events-auto cursor-pointer overflow-hidden shadow-[0_0_15px_rgba(255,161,22,0.5)]">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand-primary to-orange-400 flex items-center justify-center text-[8px] font-black text-dark-bg tracking-tighter uppercase leading-none text-center">
                        ORBIT
                    </div>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute left-0 right-0 bottom-0 p-8 pb-10 bg-gradient-to-t from-black via-black/60 to-transparent z-30 lg:max-w-[450px] lg:left-1/2 lg:-translate-x-1/2 pointer-events-none">
                <div className="space-y-6 pointer-events-auto max-w-sm">
                    {/* User Profile Hook */}
                    <div className="flex items-center gap-4">
                        <div
                            className="relative cursor-pointer group/avatar"
                            onClick={() => navigate(`/profile/${reel.instructorId?._id || reel.instructorId}`)}
                        >
                            <div className="absolute inset-0 bg-brand-primary rounded-2xl blur opacity-0 group-hover/avatar:opacity-40 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl group/prof relative">
                                {reel.instructorId?.avatar ? (
                                    <img src={reel.instructorId.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xl uppercase italic">
                                        {reel.instructorId?.name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3
                                    className="text-white font-black text-lg italic tracking-tighter truncate hover:text-brand-primary cursor-pointer transition-colors"
                                    onClick={() => navigate(`/profile/${reel.instructorId?._id || reel.instructorId}`)}
                                >
                                    {reel.instructorId?.name || 'Orbit User'}
                                </h3>
                                {(reel.instructorId?.role === 'instructor' || reel.instructorId?.role === 'superadmin') && (
                                    <div className="bg-brand-primary p-0.5 rounded-full ring-2 ring-brand-primary/20">
                                        <Sparkles size={10} className="text-dark-bg" fill="currentColor" />
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{reel.category} Specialist</p>
                        </div>
                        {user && user.id !== (reel.instructorId?._id || reel.instructorId) && (
                            <button
                                onClick={toggleFollow}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-brand-primary text-dark-bg hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(255,161,22,0.4)]'}`}
                            >
                                {isFollowing ? 'Tracking' : 'Follow'}
                            </button>
                        )}
                    </div>

                    {/* Reel Intel */}
                    <div className="space-y-2">
                        <h4 className="text-white font-bold text-base leading-tight pr-10 drop-shadow-xl">{reel.title}</h4>
                        <div className="flex flex-wrap gap-2">
                            {reel.tags?.map(tag => (
                                <span key={tag} className="text-brand-primary text-[10px] font-black uppercase tracking-[0.15em] italic drop-shadow-lg">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Meta Stats Bar */}
                    <div className="flex items-center gap-6 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] italic">
                        <div className="flex items-center gap-2">
                            <Play size={10} fill="currentColor" />
                            {viewCount} Encodings
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap size={10} fill="currentColor" className="text-brand-primary" />
                            Orbit Origin
                        </div>
                    </div>

                    {/* Music/Audio Ticker */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 w-fit overflow-hidden">
                        <Music size={14} className="text-white/60 animate-bounce" />
                        <div className="overflow-hidden relative h-4 w-32">
                            <div className="absolute whitespace-nowrap animate-scroll-text text-[10px] font-black text-white/80 tracking-widest uppercase italic flex items-center gap-8">
                                <span>{reel.instructorId?.name || 'Orbit'} Original Audio</span>
                                <span>{reel.instructorId?.name || 'Orbit'} Original Audio</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide-out Discussions */}
            <div className={`absolute right-0 top-0 bottom-0 w-full lg:w-[450px] bg-dark-layer1/95 backdrop-blur-2xl z-[60] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-l border-white/10 shadow-[-50px_0_100px_rgba(0,0,0,0.8)] ${showComments ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full bg-dark-bg/40">
                    <div className="p-8 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                <MessageSquare size={20} className="text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm">Frequency Thread</h3>
                                <p className="text-[9px] text-dark-muted font-black uppercase tracking-widest">{comments.length} Signals Detected</p>
                            </div>
                        </div>
                        <button onClick={() => setShowComments(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/50 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                                <MessageCircle size={64} strokeWidth={1} />
                                <div className="space-y-2">
                                    <p className="text-sm font-black uppercase tracking-[0.3em]">No Transmissions Found</p>
                                    <p className="text-[10px] font-medium opacity-60">Initiate the first thread below</p>
                                </div>
                            </div>
                        ) : (
                            comments.map((c, i) => (
                                <div key={i} className="flex gap-4 group/comment">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                        {c.user?.avatar ? <img src={c.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5 flex items-center justify-center font-black text-white/20 text-xs">{c.user?.name?.[0]}</div>}
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-end justify-between">
                                            <span className="text-[11px] font-black text-brand-primary uppercase italic">{c.user?.name}</span>
                                            <span className="text-[8px] font-medium text-white/20 uppercase">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm text-white/80 leading-relaxed font-medium">{c.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-8 border-t border-white/10 bg-black/40">
                        <form onSubmit={postComment} className="flex items-center gap-3 bg-dark-layer2 p-2 rounded-2xl border border-white/5 ring-1 ring-white/10 focus-within:ring-brand-primary/50 transition-all shadow-inner">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Transmit a thought..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm px-4 py-2 placeholder:text-white/20 font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-dark-bg shadow-lg shadow-brand-primary/20 transition-transform active:scale-90 disabled:opacity-30"
                            >
                                <Send size={18} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reels;

/** @crazy-level-styles */
const style = document.createElement('style');
style.textContent = `
  @keyframes scroll-text {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .animate-scroll-text {
    animation: scroll-text 10s linear infinite;
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);
