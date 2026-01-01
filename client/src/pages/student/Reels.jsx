import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
    Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX,
    User, ArrowLeft, ChevronUp, ChevronDown, Sparkles, Zap, Trophy,
    Plus, Send, MessageSquare, X, ChevronRight, MoreVertical, Music, Filter
} from 'lucide-react';
import UserLink from '../../components/UserLink';
import UploadReelModal from '../../components/reels/UploadReelModal';

const Reels = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const instructorId = searchParams.get('instructorId');
    const specificReelId = searchParams.get('id');
    const [reels, setReels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
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
        fetchCategories();
        fetchReels();

        // Keyboard Navigation
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                scrollToIndex(activeIndex + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                scrollToIndex(activeIndex - 1);
            } else if (e.key === 'm') {
                setIsMuted(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [instructorId, activeCategory]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/reels/categories');
            setCategories(['All', ...data]);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories(['All']);
        }
    };

    const fetchReels = async () => {
        setLoading(true);
        try {
            let url = `/reels/feed?page=1&limit=50`; // Increased limit for smoother infinite-like feel
            if (instructorId) url += `&instructorId=${instructorId}`;
            if (activeCategory !== 'All') url += `&category=${activeCategory}`;

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
            setActiveIndex(0); // Reset to top on refill
            if (containerRef.current) containerRef.current.scrollTop = 0;
        } catch (error) {
            console.error('Error fetching reels:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToIndex = (index) => {
        if (index >= 0 && index < reels.length) {
            setActiveIndex(index);
            containerRef.current.scrollTo({
                top: index * containerRef.current.clientHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollTop / e.target.clientHeight);
        if (index !== activeIndex && index >= 0 && index < reels.length) {
            setActiveIndex(index);
        }
    };

    if (loading && reels.length === 0) return (
        <div className="h-[100dvh] bg-black flex flex-col items-center justify-center space-y-4">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-t-2 border-brand-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-spin-slow"></div>
                <div className="absolute inset-4 rounded-full border-b-2 border-purple-500 animate-spin-reverse"></div>
            </div>
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Vertical Feed...</p>
        </div>
    );

    if (reels.length === 0 && !loading) return (
        <div className="h-[100dvh] bg-black flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20 pointer-events-none"></div>

            {/* Filter Pills even in empty state */}
            <div className="fixed top-20 left-0 right-0 z-50 px-4 flex justify-center overflow-x-auto no-scrollbar pb-2 pointer-events-auto">
                <div className="flex gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-brand-primary text-dark-bg shadow-[0_0_15px_rgba(255,161,22,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-dark-muted backdrop-blur-sm border border-white/5 relative z-10">
                <Play size={40} className="opacity-20" />
            </div>
            <div className="text-center space-y-2 relative z-10">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Frequency Detected</h2>
                <p className="text-dark-muted font-medium text-xs tracking-widest uppercase">Sector: {activeCategory}</p>
            </div>
            <div className="flex gap-3 relative z-10">
                <Link to="/dashboard" className="text-white/50 font-black uppercase text-[10px] tracking-widest border border-white/10 px-6 py-3 rounded-xl hover:bg-white/5 transition-all">
                    Back to Base
                </Link>
                {activeCategory !== 'All' && (
                    <button onClick={() => setActiveCategory('All')} className="text-brand-primary font-black uppercase text-[10px] tracking-widest border border-brand-primary/20 px-6 py-3 rounded-xl hover:bg-brand-primary hover:text-dark-bg transition-all">
                        Clear Filter
                    </button>
                )}
            </div>
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
        <div className="h-[100dvh] bg-black overflow-hidden relative font-orbit overscroll-none touch-pan-y">
            {/* Header / Back */}
            <div className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between pointer-events-none">
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5 pointer-events-auto">
                    <ArrowLeft size={20} />
                </button>

                {/* Categories / Filter Pills */}
                <div className="absolute left-1/2 -translate-x-1/2 top-6 pointer-events-auto max-w-[200px] md:max-w-md overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/5 shadow-2xl">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-brand-primary text-dark-bg shadow-[0_0_10px_rgba(255,161,22,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5 pointer-events-auto"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Main Feed */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth w-full"
                style={{ scrollBehavior: 'smooth' }}
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

            {/* Upload Button Overlay (All Users) */}
            {user && (
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="fixed bottom-24 md:bottom-10 right-6 w-14 h-14 rounded-[2rem] bg-brand-primary text-dark-bg flex items-center justify-center shadow-[0_8px_30px_rgba(255,161,22,0.4)] hover:scale-110 active:scale-90 transition-all z-50 pointer-events-auto"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            )}

            {showUploadModal && <UploadReelModal onClose={() => setShowUploadModal(false)} onUpload={() => { fetchReels(); setShowUploadModal(false); }} />}

            {/* Share Toast Notification */}
            {shareToast.show && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300 pointer-events-none">
                    <div className="bg-dark-layer1 border border-white/10 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                        <span className="text-white font-black uppercase text-[10px] tracking-widest">{shareToast.message}</span>
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
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        incrementView();
                        checkFollowing();
                    })
                    .catch(error => {
                        console.log('Autoplay prevented:', error);
                        setIsPlaying(false);
                    });
            }
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
        // Simple double tap logic can be implemented via generic onClick with timing
        // But for better mobile support, we might rely on UI libraries. 
        // Here we simulate with click for desktop compatibility mostly.
        // NOTE: React's onClick detail returns click count in short timespan
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
        <div className="h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black overflow-hidden group/reel">
            {/* Background Video */}
            <video
                ref={videoRef}
                src={reel.videoUrl}
                poster={reel.thumbnailUrl}
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover md:max-w-[480px] md:rounded-2xl transition-all"
                onClick={togglePlay}
            />

            {/* Click/Tap Layer for double tap */}
            <div
                className="absolute inset-0 md:max-w-[480px] mx-auto z-10"
                onClick={handleDoubleTap}
            />

            {/* Double Tap Heart Animation */}
            {doubleTapHeart && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <Heart size={120} fill="red" className="text-red-500 animate-ping opacity-75 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
                </div>
            )}

            {/* Play/Pause Overlay Animation */}
            {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/20">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 animate-in zoom-in-50 duration-300 shadow-2xl">
                        <Play size={40} className="text-white fill-current ml-2" />
                    </div>
                </div>
            )}

            {/* Right Action Sidebar (IG Style) - Fixed on right for mobile, relative for desktop */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-30 md:right-[calc(50%-260px)] pointer-events-none">
                <div className="flex flex-col items-center gap-1 pointer-events-auto">
                    <button
                        onClick={handleLike}
                        className={`p-3 rounded-full transition-all duration-300 md:hover:bg-white/10 ${hasLiked ? 'text-red-500 transform scale-125' : 'text-white'}`}
                    >
                        <Heart size={32} fill={hasLiked ? 'currentColor' : 'none'} strokeWidth={2.5} className="drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-black text-white drop-shadow-xl tracking-widest">{likes}</span>
                </div>

                <div className="flex flex-col items-center gap-1 pointer-events-auto">
                    <button
                        onClick={() => setShowComments(true)}
                        className="p-3 text-white md:hover:bg-white/10 rounded-full transition-all"
                    >
                        <MessageCircle size={32} strokeWidth={2.5} className="drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-black text-white drop-shadow-xl tracking-widest">{comments.length}</span>
                </div>

                <div className="pointer-events-auto">
                    <button
                        onClick={() => onShare(reel)}
                        className="p-3 text-white md:hover:bg-white/10 rounded-full transition-all"
                    >
                        <Share2 size={32} strokeWidth={2.5} className="drop-shadow-lg" />
                    </button>
                </div>

                <div className="w-10 h-10 rounded-full border-2 border-brand-primary p-0.5 mt-2 animate-spin-slow pointer-events-auto cursor-pointer overflow-hidden shadow-[0_0_15px_rgba(255,161,22,0.5)] bg-black/50 backdrop-blur-sm">

                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand-primary to-orange-400 flex items-center justify-center text-[6px] font-black text-dark-bg tracking-tighter uppercase leading-none text-center">
                        AUDIO
                    </div>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute left-0 right-0 bottom-0 p-6 pb-8 bg-gradient-to-t from-black via-black/60 to-transparent z-30 md:max-w-[480px] md:mx-auto md:rounded-b-2xl pointer-events-none">
                <div className="space-y-4 pointer-events-auto max-w-[80%]">
                    {/* User Profile Hook */}
                    <div className="flex items-center gap-3">
                        <div
                            className="relative cursor-pointer group/avatar"
                            onClick={() => navigate(`/profile/${reel.instructorId?._id || reel.instructorId}`)}
                        >
                            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl relative z-10">
                                {reel.instructorId?.avatar ? (
                                    <img src={reel.instructorId.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xs uppercase italic">
                                        {reel.instructorId?.name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3
                                    className="text-white font-black text-sm italic tracking-tighter truncate hover:text-brand-primary cursor-pointer transition-colors shadow-black drop-shadow-md"
                                    onClick={() => navigate(`/profile/${reel.instructorId?._id || reel.instructorId}`)}
                                >
                                    {reel.instructorId?.name || 'Orbit User'}
                                </h3>
                                {(reel.instructorId?.role === 'instructor' || reel.instructorId?.role === 'superadmin') && (
                                    <div className="bg-brand-primary p-0.5 rounded-full ring-1 ring-brand-primary/20">
                                        <Sparkles size={8} className="text-dark-bg" fill="currentColor" />
                                    </div>
                                )}
                            </div>
                            {user && user.id !== (reel.instructorId?._id || reel.instructorId) && (
                                <button
                                    onClick={toggleFollow}
                                    className={`mt-1 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/10 text-white border border-white/20' : 'bg-brand-primary text-dark-bg border border-brand-primary'}`}
                                >
                                    {isFollowing ? 'Tracking' : 'Follow'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Reel Intel */}
                    <div className="space-y-1.5">
                        <h4 className="text-white font-bold text-sm leading-tight pr-10 drop-shadow-xl line-clamp-2">{reel.title}</h4>
                        <div className="flex flex-wrap gap-2">
                            <div className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-md border border-white/5 text-[9px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1">
                                <Zap size={10} className="text-brand-primary" fill="currentColor" />
                                {reel.category}
                            </div>
                            {reel.tags?.map(tag => (
                                <span key={tag} className="text-brand-primary text-[10px] font-black uppercase tracking-wider italic drop-shadow-lg">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Music/Audio Ticker */}
                    <div className="flex items-center gap-2 opacity-80">
                        <Music size={12} className="text-white animate-bounce" />
                        <div className="overflow-hidden relative h-4 w-40 mask-image-linear-gradient-to-r-from-black-to-transparent">
                            <div className="absolute whitespace-nowrap animate-scroll-text text-[10px] font-black text-white/90 tracking-widest uppercase italic flex items-center gap-8">
                                <span>{reel.instructorId?.name || 'Orbit'} Original Audio</span>
                                <span>{reel.instructorId?.name || 'Orbit'} Original Audio</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide-out Discussions */}
            <div className={`absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-dark-layer1/95 backdrop-blur-2xl z-[60] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-l border-white/10 shadow-[-50px_0_100px_rgba(0,0,0,0.8)] ${showComments ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full bg-dark-bg/40">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                <MessageSquare size={16} className="text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs">Frequency Thread</h3>
                                <p className="text-[8px] text-dark-muted font-black uppercase tracking-widest">{comments.length} Signals</p>
                            </div>
                        </div>
                        <button onClick={() => setShowComments(false)} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-white/50 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                <MessageCircle size={48} strokeWidth={1} />
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">Quiet Sector</p>
                                    <p className="text-[9px] font-medium opacity-60">Initiate transmission below</p>
                                </div>
                            </div>
                        ) : (
                            comments.map((c, i) => (
                                <div key={i} className="flex gap-3 group/comment animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                        {c.user?.avatar ? <img src={c.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5 flex items-center justify-center font-black text-white/20 text-[10px]">{c.user?.name?.[0]}</div>}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-end justify-between">
                                            <span className="text-[10px] font-black text-brand-primary uppercase italic">{c.user?.name}</span>
                                            <span className="text-[8px] font-medium text-white/20 uppercase">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-xs text-white/80 leading-relaxed font-medium">{c.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <form onSubmit={postComment} className="flex items-center gap-2 bg-dark-layer2 p-1.5 rounded-xl border border-white/5 ring-1 ring-white/10 focus-within:ring-brand-primary/50 transition-all shadow-inner">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Transmit a thought..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-white text-xs px-3 py-1.5 placeholder:text-white/20 font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-dark-bg shadow-lg shadow-brand-primary/20 transition-transform active:scale-90 disabled:opacity-30"
                            >
                                <Send size={14} strokeWidth={2.5} />
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
  
  .animate-spin-reverse {
     animation: spin-slow 12s linear infinite reverse;
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
