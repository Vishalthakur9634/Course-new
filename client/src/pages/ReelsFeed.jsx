import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, ArrowLeft, Plus, Play, Pause, Volume2, VolumeX, MoreVertical } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import UploadReelModal from '../components/reels/UploadReelModal';

const ReelsFeed = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReelId, setActiveReelId] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Initial Category Selection (optional)
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Observer for auto-play
    const observer = useRef();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchReels();
    }, [selectedCategory]);

    const fetchReels = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/reels/feed', {
                params: { category: selectedCategory }
            });
            setReels(data);
            if (data.length > 0) setActiveReelId(data[0]._id);
        } catch (error) {
            console.error('Error fetching reels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (reelId) => {
        try {
            const { data } = await api.post(`/reels/${reelId}/like`);
            setReels(reels.map(r => r._id === reelId ? { ...r, likes: data } : r));
        } catch (error) {
            console.error('Error liking reel:', error);
        }
    };

    const handleView = async (reelId) => {
        try {
            await api.post(`/reels/${reelId}/view`);
        } catch (error) {
            console.error('Error viewing reel:', error);
        }
    };

    // Intersection Observer callback
    const lastReelRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        // Setup new observer for all reel elements to handle auto-play
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6 // 60% visibility required to play
        };

        const callback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-id');
                    setActiveReelId(id);
                    handleView(id); // Increment view count
                }
            });
        };

        observer.current = new IntersectionObserver(callback, options);

        // Observe all reel containers
        document.querySelectorAll('.reel-container').forEach(el => observer.current.observe(el));

    }, [loading, reels]);


    return (
        <div className="bg-black min-h-screen text-white overflow-hidden flex flex-col">
            {/* Header / Nav Overlay */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex gap-4 font-bold text-shadow">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`text-lg transition-all ${selectedCategory === 'All' ? 'text-white border-b-2 border-brand-primary' : 'text-white/60'}`}
                    >
                        For You
                    </button>
                    <button
                        onClick={() => setSelectedCategory('Following')} // Placeholder logic
                        className={`text-lg transition-all ${selectedCategory === 'Following' ? 'text-white border-b-2 border-brand-primary' : 'text-white/60'}`}
                    >
                        Following
                    </button>
                </div>
                {currentUser?.role === 'instructor' ? (
                    <button onClick={() => setShowUploadModal(true)} className="p-2 rounded-full bg-brand-primary text-black font-bold">
                        <Plus size={24} />
                    </button>
                ) : (
                    <div className="w-10" /> // Spacer
                )}
            </div>

            {/* Feed Container */}
            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory h-screen no-scrollbar">
                {reels.map((reel, index) => (
                    <ReelItem
                        key={reel._id}
                        reel={reel}
                        isActive={activeReelId === reel._id}
                        isMuted={isMuted}
                        toggleMute={() => setIsMuted(!isMuted)}
                        onLike={() => handleLike(reel._id)}
                        currentUser={currentUser}
                        ref={index === reels.length - 1 ? lastReelRef : null} // Can use for infinite scroll fetch
                    />
                ))}

                {reels.length === 0 && !loading && (
                    <div className="h-screen flex flex-col items-center justify-center snap-center">
                        <p className="text-xl font-bold text-gray-400">No reels found in this category.</p>
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className="mt-4 px-6 py-2 bg-brand-primary text-black rounded-full font-bold"
                        >
                            Browse All
                        </button>
                    </div>
                )}
            </div>

            {showUploadModal && <UploadReelModal onClose={() => setShowUploadModal(false)} onUpload={() => { fetchReels(); setShowUploadModal(false); }} />}
        </div>
    );
};

// Sub-component for individual reel
const ReelItem = React.forwardRef(({ reel, isActive, isMuted, toggleMute, onLike, currentUser }, ref) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Autoplay blocked', e));
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div
            ref={ref}
            data-id={reel._id}
            className="reel-container w-full h-screen snap-center relative flex items-center justify-center bg-dark-bg"
        >
            {/* Video Player */}
            <video
                ref={videoRef}
                src={reel.videoUrl} // Already starts with /uploads
                className="w-full h-full object-cover md:max-w-[450px]" // Desktop keeps it phone-sized centered
                loop
                muted={isMuted}
                playsInline
                onClick={togglePlay}
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 md:max-w-[450px] mx-auto pointer-events-none flex flex-col justify-end pb-20 p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent">

                {/* Right Side Actions */}
                <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 pointer-events-auto">
                    <button onClick={onLike} className="flex flex-col items-center gap-1 group">
                        <div className={`p-3 rounded-full bg-white/10 backdrop-blur-md transition-all group-active:scale-90 ${reel.likes.includes(currentUser?.id) ? 'bg-red-500/20' : ''}`}>
                            <Heart size={28} className={reel.likes.includes(currentUser?.id) ? 'fill-red-500 text-red-500' : 'text-white'} />
                        </div>
                        <span className="text-xs font-bold">{reel.likes.length}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-white/10 backdrop-blur-md transition-all group-active:scale-90">
                            <MessageCircle size={28} className="text-white" />
                        </div>
                        <span className="text-xs font-bold">0</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-white/10 backdrop-blur-md transition-all group-active:scale-90">
                            <Share2 size={28} className="text-white" />
                        </div>
                        <span className="text-xs font-bold">Share</span>
                    </button>

                    <button onClick={toggleMute} className="p-3 rounded-full bg-white/10 backdrop-blur-md">
                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                </div>

                {/* Bottom Info */}
                <div className="pr-16 pointer-events-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full border border-white overflow-hidden">
                            {reel.instructorId?.avatar ? (
                                <img src={reel.instructorId.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-brand-primary flex items-center justify-center font-bold text-black">
                                    {reel.instructorId?.name?.[0] || 'I'}
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-base text-white">{reel.instructorId?.name}</h3>
                        <button className="px-3 py-1 rounded-full border border-white/30 text-xs font-bold backdrop-blur-sm hover:bg-white/20">
                            Follow
                        </button>
                    </div>

                    <p className="text-sm text-white/90 mb-2 line-clamp-2">{reel.title}</p>

                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/20 text-xs font-medium backdrop-blur-sm">
                            #{reel.category}
                        </span>
                        {reel.tags?.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-xs text-brand-primary font-medium backdrop-blur-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

            </div>

            {/* Play/Pause Icon Animation */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/30 p-4 rounded-full backdrop-blur-sm">
                        <Play size={48} className="fill-white text-white ml-2" />
                    </div>
                </div>
            )}
        </div>
    );
});


export default ReelsFeed;
