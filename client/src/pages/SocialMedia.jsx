import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
    Plus, Search, Bell, Mic, Upload, Video, Film, Image as ImageIcon,
    MoreVertical, ThumbsUp, ThumbsDown, Share2, MessageSquare, Play, X,
    ChevronLeft, ChevronRight, Clock, Eye, Globe, Zap, Flame, Award,
    Home, Compass, PlaySquare, History, Music2, Gamepad2, Trophy, Settings, HelpCircle,
    CheckCircle2, Loader, Send, Newspaper, Layers, Activity, Shield, Target
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { motion, AnimatePresence } from 'framer-motion';

const SocialMedia = () => {
    const { addToast } = useToast();
    const [activeFilter, setActiveFilter] = useState('All');
    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const fileInputRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Upload Form State
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        type: 'video',
        file: null,
        thumbnailFile: null,
        previewUrl: '',
        thumbnailPreviewUrl: '',
        category: 'Tech'
    });

    const [communities, setCommunities] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchContent();
        fetchCommunities();
    }, [activeFilter]);

    const fetchCommunities = async () => {
        try {
            const { data } = await api.get('/community/communities');
            setCommunities(data || []);
        } catch (error) {
            console.error('Error fetching communities:', error);
        }
    };

    const fetchContent = async () => {
        setLoading(true);
        try {
            const [postsRes, reelsRes] = await Promise.all([
                api.get('/community/posts?limit=50'),
                api.get('/reels/feed')
            ]);

            const allPosts = postsRes.data.posts || [];
            const feedContent = allPosts.filter(p =>
                (!activeFilter || activeFilter === 'All' || p.category === activeFilter)
            );

            setVideos(feedContent);
            setShorts(Array.isArray(reelsRes.data) ? reelsRes.data : []);
        } catch (error) {
            console.error("Error fetching social content:", error);
            addToast("Failed to load content.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e, type = 'main') => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'main') {
                setUploadData(prev => ({
                    ...prev,
                    file: file,
                    previewUrl: reader.result
                }));
            } else {
                setUploadData(prev => ({
                    ...prev,
                    thumbnailFile: file,
                    thumbnailPreviewUrl: reader.result
                }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.file && uploadData.type !== 'post') {
            addToast("Select a file to upload.", "warning");
            return;
        }

        setUploadProgress(5);
        try {
            let mediaUrl = '';
            let thumbnailUrl = '';

            // 1. Upload Main Media
            if (uploadData.file) {
                const formData = new FormData();
                formData.append('file', uploadData.file);

                const uploadRes = await api.post('/upload', formData, {
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                });
                mediaUrl = uploadRes.data.url;
            }

            // 2. Upload Thumbnail if exists
            if (uploadData.thumbnailFile) {
                const thumbFormData = new FormData();
                thumbFormData.append('file', uploadData.thumbnailFile);

                const thumbRes = await api.post('/upload', thumbFormData, {
                    onUploadProgress: (progressEvent) => {
                        const progress = 50 + Math.round((progressEvent.loaded * 40) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                });
                thumbnailUrl = thumbRes.data.url;
            }

            setUploadProgress(95);

            if (uploadData.type === 'short') {
                const reelPayload = {
                    title: uploadData.title,
                    videoUrl: mediaUrl,
                    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1622353123309-844cd0a78625?w=400&h=600&fit=crop', // Fallback
                    category: uploadData.category,
                    tags: [],
                    duration: 15
                };
                await api.post('/reels/upload', reelPayload);
                addToast('Short video uploaded.', 'success');
            } else {
                const payload = {
                    title: uploadData.title,
                    content: uploadData.description,
                    type: uploadData.type,
                    media: mediaUrl ? [{ type: uploadData.file.type.startsWith('image') ? 'image' : 'video', url: mediaUrl }] : [],
                    thumbnailUrl: thumbnailUrl,
                    category: uploadData.category,
                    communityId: uploadData.communityId
                };
                await api.post('/community/posts', payload);
                addToast('Post published.', 'success');
            }

            setIsUploadOpen(false);
            setUploadData({ title: '', description: '', type: 'video', file: null, thumbnailFile: null, previewUrl: '', thumbnailPreviewUrl: '', category: 'Tech' });
            setUploadProgress(0);
            fetchContent();
        } catch (error) {
            console.error("Upload failed", error);
            addToast(error.response?.data?.message || "Upload error.", 'error');
            setUploadProgress(0);
        }
    };

    const handleCommentSubmit = async (e, content) => {
        if (e) e.preventDefault();
        if (!content.trim()) return;

        try {
            await api.post(`/community/posts/${selectedVideo._id}/comment`, { content });
            const { data } = await api.get(`/community/posts/${selectedVideo._id}`);
            setSelectedVideo(data);
            addToast("Comment posted.", "success");
        } catch (error) {
            console.error("Comment failed", error);
            addToast("Failed to post comment.", "error");
        }
    };

    const handleLike = async (postId, type = 'post') => {
        try {
            if (type === 'post') {
                await api.post(`/community/posts/${postId}/like`);
            } else {
                await api.post(`/reels/${postId}/like`);
            }
            fetchContent();
        } catch (error) {
            console.error("Interaction failed", error);
        }
    };

    const categories = ['All', 'Systems', 'Architecture', 'Design', 'Performance', 'Database', 'Logic', 'Strategy'];

    const sidebarItems = [
        { icon: Home, label: 'Feed', path: '#', active: true },
        { icon: Compass, label: 'Explore', path: '#' },
        { icon: Film, label: 'Shorts', path: '#' },
        { icon: PlaySquare, label: 'My Videos', path: '#' },
        { type: 'divider' },
        { icon: History, label: 'History', path: '#' },
        { icon: Video, label: 'Saved', path: '#' },
        { icon: Clock, label: 'Watch Later', path: '#' },
        { icon: ThumbsUp, label: 'Liked', path: '#' },
        { type: 'divider', label: 'Community' },
        { icon: Flame, label: 'Trending', path: '#' },
        { icon: Target, label: 'Goals', path: '#' },
        { icon: Award, label: 'Achievements', path: '#' },
        { type: 'divider' },
        { icon: Settings, label: 'Settings', path: '#' },
        { icon: HelpCircle, label: 'Help', path: '#' },
    ];

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden font-inter">

            {/* HIGH-FIDELITY NAVIGATION */}
            <header className="h-20 bg-[#141414] border-b border-white/5 px-8 flex items-center justify-between gap-10 z-50 shadow-2xl">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-dark-muted hover:text-white"
                    >
                        <MoreVertical size={20} className="rotate-90" />
                    </button>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                            <Video size={24} className="text-dark-bg" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Social<span className="text-brand-primary">Hub</span></span>
                    </div>
                </div>

                <div className="flex-1 max-w-3xl flex items-center gap-5">
                    <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4 focus-within:border-brand-primary/40 focus-within:bg-[#141414] transition-all duration-500 group shadow-inner">
                        <Search size={20} className="text-dark-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none focus:outline-none flex-1 text-sm text-white placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="p-3.5 bg-[#0a0a0a] hover:bg-brand-primary hover:text-dark-bg border border-white/10 rounded-2xl transition-all group shadow-xl"
                        title="Contribution Center"
                    >
                        <Upload size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="p-3.5 bg-[#0a0a0a] hover:bg-white/5 border border-white/10 rounded-2xl transition-all relative shadow-xl">
                        <Bell size={22} />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-primary rounded-full shadow-lg shadow-brand-primary/50"></span>
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 p-1 cursor-pointer hover:border-brand-primary/50 border border-transparent transition-all shadow-xl">
                        <div className="w-full h-full rounded-[14px] overflow-hidden">
                            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* STRATEGIC SIDEBAR */}
                <aside
                    className={`${isSidebarCollapsed ? 'w-24' : 'w-80'} bg-[#0a0a0a]/50 border-r border-white/5 flex flex-col transition-all duration-700 overflow-y-auto no-scrollbar py-10`}
                >
                    {sidebarItems.map((item, idx) => {
                        if (item.type === 'divider') {
                            return (
                                <div key={idx} className="my-8 px-10">
                                    <div className="h-px bg-white/5 mb-6 opacity-30"></div>
                                    {!isSidebarCollapsed && item.label && <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-dark-muted opacity-40">{item.label}</p>}
                                </div>
                            );
                        }
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                className={`flex items-center gap-6 px-10 py-4 mx-3 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-brand-primary/10 text-brand-primary shadow-lg shadow-brand-primary/5' : 'hover:bg-white/5 text-dark-muted hover:text-white'}`}
                            >
                                <Icon size={20} className={item.active ? 'text-brand-primary' : 'group-hover:scale-105 transition-all opacity-70 group-hover:opacity-100'} />
                                {!isSidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </aside>

                {/* HUB CONTENT MATRIX */}
                <main className="flex-1 flex flex-col bg-[#0a0a0a] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-brand-primary/[0.03] blur-[180px] pointer-events-none"></div>

                    {/* Taxonomy Selectors */}
                    <div className="p-8 pb-4 overflow-x-auto no-scrollbar flex gap-4 z-10">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${activeFilter === cat
                                    ? 'bg-brand-primary text-dark-bg border-brand-primary'
                                    : 'bg-[#141414] text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-20 z-10 mb-20">
                        {/* STRATEGIC SHORTS PERFORMANCE */}
                        <section className="space-y-10">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 shadow-xl">
                                        <Film size={24} className="text-brand-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Shorts</h2>
                                        <p className="text-xs text-gray-500 mt-1">Quick bites of knowledge</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar snap-x">
                                {shorts.map((short, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedVideo({ ...short, media: [{ url: short.videoUrl, type: 'video' }] })}
                                        className="min-w-[240px] md:min-w-[280px] aspect-[9/16] bg-[#141414] rounded-[2.5rem] overflow-hidden group relative snap-center cursor-pointer border-2 border-white/5 hover:border-brand-primary/40 transition-all duration-700 shadow-3xl"
                                    >
                                        <img src={short.thumbnailUrl || `https://images.unsplash.com/photo-1622353123309-844cd0a78625?w=400&h=600&fit=crop`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-[4s]" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="absolute bottom-8 left-8 right-8 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                            <h4 className="text-base font-bold text-white line-clamp-2 leading-tight uppercase tracking-tight mb-3">{short.title}</h4>
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-brand-primary/20 rounded-lg">
                                                    <Activity size={14} className="text-brand-primary" />
                                                </div>
                                                <p className="text-xs font-bold text-brand-primary">{short.views || 0}K views</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* GLOBAL COMMUNITY NETWORK */}
                        <section className="space-y-12">
                            <div className="flex items-center gap-4 px-2">
                                <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 shadow-xl">
                                    <Globe size={24} className="text-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Community</h2>
                                    <p className="text-xs text-gray-500 mt-1">Connect with fellow learners</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="space-y-6 animate-pulse bg-[#141414]/30 p-6 rounded-[2.5rem] border border-white/5">
                                            <div className="aspect-video bg-white/5 rounded-3xl"></div>
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5"></div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-4 bg-white/5 rounded-lg w-3/4"></div>
                                                    <div className="h-3 bg-white/5 rounded-lg w-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                    {videos.map((vid, idx) => (
                                        <motion.div
                                            key={vid._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05, duration: 0.6 }}
                                            className="group flex flex-col gap-6 cursor-pointer bg-[#141414] p-6 rounded-[2.5rem] border border-white/5 hover:border-brand-primary/30 transition-all duration-500 shadow-2xl hover:shadow-brand-primary/5"
                                            onClick={() => setSelectedVideo(vid)}
                                        >
                                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-inner group-hover:border-brand-primary/40 transition-all duration-700">
                                                <img
                                                    src={vid.thumbnailUrl || (vid.media?.[0]?.type === 'image' ? vid.media[0].url : null) || `https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop`}
                                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[3s]"
                                                />
                                                <div className="absolute inset-0 bg-[#0a0a0a]/20 group-hover:bg-transparent transition-colors duration-500"></div>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-[2px]">
                                                    <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center shadow-2xl shadow-brand-primary/40 translate-y-6 group-hover:translate-y-0 transition-all duration-500">
                                                        <Play size={28} className="text-dark-bg fill-current ml-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-5 right-5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] text-brand-primary border border-brand-primary/20 shadow-2xl">
                                                    {vid.type === 'video' ? 'MODULE' : vid.type.toUpperCase()}
                                                </div>
                                            </div>

                                            <div className="flex gap-5 px-2">
                                                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#0a0a0a] overflow-hidden border border-white/10 group-hover:border-brand-primary/40 transition-all shadow-xl p-0.5">
                                                    <img src={vid.authorId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${vid.authorId?.name}`} className="w-full h-full object-cover rounded-[14px]" />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <h3 className="text-[15px] font-bold text-white line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors duration-300 uppercase tracking-tight">
                                                        {vid.title}
                                                    </h3>
                                                    <div className="flex flex-col gap-1.5 opacity-60">
                                                        <p className="text-[10px] font-bold text-dark-muted flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest">
                                                            {vid.authorId?.name} {vid.authorId?.role === 'instructor' && <Shield size={12} className="text-brand-primary" />}
                                                        </p>
                                                        <div className="flex justify-between items-center text-xs font-medium text-gray-500 px-2">
                                                            <span>{vid.viewCount || 0} views</span>
                                                            <span>{new Date(vid.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>

            {/* CONTRIBUTION CENTER (Upload Modal) */}
            <AnimatePresence>
                {isUploadOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#0a0a0a]/90 backdrop-blur-xl flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 30 }}
                            className="bg-[#141414] border border-white/10 w-full max-w-6xl rounded-[3.5rem] overflow-hidden shadow-3xl flex h-[80vh] relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent" />

                            {/* Left: Metadata Matrix */}
                            <div className="flex-1 flex flex-col p-16 overflow-y-auto no-scrollbar border-r border-white/5">
                                <header className="flex items-center justify-between mb-16">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-bold uppercase tracking-tight">Contribution <span className="text-brand-primary">Center</span></h2>
                                        <p className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.5em] opacity-40">Architecting Content Synchronization</p>
                                    </div>
                                    <button onClick={() => setIsUploadOpen(false)} className="p-4 bg-[#0a0a0a] hover:bg-red-500/10 rounded-2xl hover:text-red-500 transition-all border border-white/10 shadow-xl group">
                                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </header>

                                <form onSubmit={handleUpload} className="space-y-12">
                                    <div className="flex gap-4 p-2 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-inner">
                                        {[
                                            { id: 'video', label: 'Module', icon: Layers },
                                            { id: 'short', label: 'Insight', icon: Film },
                                            { id: 'post', label: 'Briefing', icon: Newspaper }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setUploadData({ ...uploadData, type: t.id })}
                                                className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase text-[10px] tracking-[0.2em] transition-all duration-500 ${uploadData.type === t.id ? 'bg-brand-primary text-dark-bg shadow-xl' : 'text-dark-muted hover:text-white'}`}
                                            >
                                                <t.icon size={16} /> {t.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.4em] ml-4">Registry Title</label>
                                            <input
                                                type="text"
                                                placeholder="Architecture Title..."
                                                value={uploadData.title}
                                                onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-xl font-bold border-transparent focus:border-brand-primary outline-none transition-all placeholder:text-dark-muted/20 uppercase tracking-tight shadow-inner"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.4em] ml-4">Briefing Overview</label>
                                            <textarea
                                                placeholder="Document the technical objectives of this contribution..."
                                                value={uploadData.description}
                                                onChange={e => setUploadData({ ...uploadData, description: e.target.value })}
                                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 text-[13px] font-medium opacity-80 focus:opacity-100 focus:border-brand-primary outline-none h-48 resize-none transition-all placeholder:text-dark-muted/20 leading-relaxed shadow-inner"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.4em] ml-4">Domain Category</label>
                                                <select
                                                    value={uploadData.category}
                                                    onChange={e => setUploadData({ ...uploadData, category: e.target.value })}
                                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-[11px] font-bold uppercase tracking-[0.2em] outline-none focus:border-brand-primary appearance-none hover:bg-white/5 transition-colors cursor-pointer shadow-inner"
                                                >
                                                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} className="bg-[#141414]">{c.toUpperCase()}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.4em] ml-4">Network Target</label>
                                                <select
                                                    value={uploadData.communityId || ''}
                                                    onChange={e => setUploadData({ ...uploadData, communityId: e.target.value })}
                                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-[11px] font-bold uppercase tracking-[0.2em] outline-none focus:border-brand-primary appearance-none hover:bg-white/5 transition-colors cursor-pointer shadow-inner"
                                                >
                                                    <option value="" className="bg-[#141414]">CORE FEED</option>
                                                    {communities.map(c => <option key={c._id} value={c._id} className="bg-[#141414]">{c.name.toUpperCase()}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploadProgress > 0}
                                        className="w-full py-8 bg-brand-primary text-dark-bg font-bold rounded-[2.5rem] flex items-center justify-center gap-5 uppercase text-[11px] tracking-[0.5em] hover:scale-[1.01] active:scale-95 transition-all shadow-3xl shadow-brand-primary/20 border border-brand-primary"
                                    >
                                        {uploadProgress > 0 ? <Loader className="animate-spin" /> : <Send size={28} className="rotate-[-10deg]" />}
                                        Commit to Matrix
                                    </button>
                                </form>
                            </div>

                            {/* Right: Asset Synchronization Area */}
                            <div className="w-[500px] bg-[#0a0a0a]/50 flex flex-col p-16 overflow-hidden relative">
                                <h3 className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.6em] mb-12 text-center opacity-70">Asset Synchronization</h3>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 border-2 border-dashed border-white/10 rounded-[3.5rem] group hover:border-brand-primary/40 transition-all duration-1000 cursor-pointer flex flex-col items-center justify-center p-10 text-center relative overflow-hidden bg-[#0a0a0a]/30 shadow-inner"
                                >
                                    {uploadData.previewUrl ? (
                                        <div className="absolute inset-0 group/preview animate-in zoom-in-95 duration-700">
                                            {uploadData.file?.type.startsWith('video') ? (
                                                <video src={uploadData.previewUrl} className="w-full h-full object-cover opacity-60" autoPlay muted loop />
                                            ) : (
                                                <img src={uploadData.previewUrl} className="w-full h-full object-cover opacity-60" />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all duration-500 backdrop-blur-sm">
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); setUploadData(prev => ({ ...prev, file: null, previewUrl: '' })) }}
                                                    className="p-5 bg-red-500 rounded-3xl text-white shadow-2xl shadow-red-500/30"
                                                >
                                                    <X size={40} />
                                                </div>
                                                <p className="mt-6 font-bold uppercase text-[10px] tracking-[0.4em]">Purge Asset</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-10">
                                            <div className="w-28 h-28 bg-[#141414] rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 group-hover:border-brand-primary/40 group-hover:bg-brand-primary/5 transition-all duration-700 shadow-2xl">
                                                <Upload size={48} className="text-dark-muted group-hover:text-brand-primary transition-colors" />
                                            </div>
                                            <div className="space-y-4">
                                                <p className="font-bold text-white uppercase tracking-[0.3em] text-sm">Synchronize File</p>
                                                <p className="text-[10px] text-dark-muted font-bold uppercase tracking-[0.3em] leading-loose opacity-50">HEVC • MP4 • WEBM • JPG<br />Max Payload: 500MB</p>
                                            </div>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'main')} className="hidden" accept="video/*,image/*" />
                                </div>

                                {/* Thumbnail Selection */}
                                <div className="mt-10 space-y-6">
                                    <h4 className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.4em] ml-4 text-center">Static Preview (Thumbnail)</h4>
                                    <div
                                        onClick={() => document.getElementById('thumb-input').click()}
                                        className="h-48 border-2 border-dashed border-white/10 rounded-[2rem] group hover:border-brand-primary/40 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a]/30 shadow-inner"
                                    >
                                        {uploadData.thumbnailPreviewUrl ? (
                                            <div className="absolute inset-0 group/thumb-preview">
                                                <img src={uploadData.thumbnailPreviewUrl} className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/thumb-preview:opacity-100 transition-all">
                                                    <X className="text-red-500" size={32} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <ImageIcon size={32} className="text-dark-muted group-hover:text-brand-primary transition-colors" />
                                                <p className="text-[9px] font-bold text-dark-muted uppercase tracking-widest opacity-40">Select Image</p>
                                            </div>
                                        )}
                                        <input id="thumb-input" type="file" onChange={(e) => handleFileSelect(e, 'thumb')} className="hidden" accept="image/*" />
                                    </div>
                                </div>

                                {uploadProgress > 0 && (
                                    <div className="mt-16 space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase text-brand-primary tracking-[0.4em]">Synchronizing...</p>
                                                <p className="text-xs font-bold text-dark-muted uppercase tracking-widest opacity-50">{uploadData.file?.name || 'Metadata'}</p>
                                            </div>
                                            <p className="text-4xl font-bold tracking-tighter text-white">{uploadProgress}%</p>
                                        </div>
                                        <div className="h-3 bg-[#141414] rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                                            <motion.div
                                                className="h-full bg-brand-primary rounded-full shadow-2xl shadow-brand-primary/50"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HIGH-FIDELITY HUB PLAYER */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-[#0a0a0a] flex flex-col font-inter"
                    >
                        <header className="h-20 bg-[#141414] px-10 flex items-center justify-between border-b border-white/5 shadow-2xl relative z-20">
                            <div className="flex items-center gap-10">
                                <button onClick={() => setSelectedVideo(null)} className="p-3 bg-[#0a0a0a] hover:bg-white/5 rounded-2xl transition-all border border-white/10 text-dark-muted hover:text-white shadow-xl">
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold uppercase tracking-tight truncate max-w-2xl">{selectedVideo.title}</h2>
                                    <p className="text-xs font-medium text-brand-primary opacity-60">Now Watching</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <button className="p-3.5 bg-[#0a0a0a] hover:bg-white/5 rounded-2xl transition-all border border-white/10 text-dark-muted hover:text-white shadow-xl"><Share2 size={24} /></button>
                                <button onClick={() => setSelectedVideo(null)} className="p-3.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20 shadow-xl group">
                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-12 p-8 lg:p-12">
                            {/* Strategic Media Information */}
                            <div className="flex-1 flex flex-col gap-12 overflow-y-auto no-scrollbar pb-20">
                                <div className="aspect-video bg-[#0a0a0a] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-3xl sticky top-0 z-10 p-0.5">
                                    <div className="w-full h-full rounded-[3.4rem] overflow-hidden relative">
                                        {(selectedVideo.media?.[0]?.url || selectedVideo.videoUrl) ? (
                                            <VideoPlayer
                                                src={selectedVideo.media?.[0]?.url || selectedVideo.videoUrl}
                                                poster={selectedVideo.media?.[0]?.type === 'image' ? selectedVideo.media[0].url : ''}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-black/50">
                                                <p className="text-dark-muted font-bold tracking-widest uppercase text-xs">No Signal Detected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-12 px-6">
                                    <div className="space-y-4">
                                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight uppercase">{selectedVideo.title}</h1>
                                        <div className="flex flex-wrap items-center justify-between gap-10 py-10 border-y border-white/5">
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 rounded-3xl bg-brand-primary p-0.5 shadow-2xl shadow-brand-primary/20">
                                                    <div className="w-full h-full bg-[#0a0a0a] rounded-[22px] overflow-hidden border border-white/10">
                                                        <img src={selectedVideo.authorId?.avatar} className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xl font-bold uppercase text-white tracking-widest leading-none flex items-center gap-3">
                                                        {selectedVideo.authorId?.name} <Shield size={18} className="text-brand-primary" />
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-medium">Verified Creator</p>
                                                </div>
                                                <button className="ml-10 px-8 py-3 bg-white text-dark-bg rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-brand-primary transition-all shadow-xl active:scale-95">Subscribe</button>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex bg-[#0a0a0a] border border-white/10 rounded-2xl p-1.5 shadow-xl">
                                                    <button
                                                        onClick={() => handleLike(selectedVideo._id)}
                                                        className="flex items-center gap-4 px-10 py-4 hover:bg-white/5 rounded-xl transition-all text-dark-muted hover:text-brand-primary group"
                                                    >
                                                        <ThumbsUp size={24} className="group-hover:scale-110 transition-transform" />
                                                        <span className="text-base font-bold text-white">{selectedVideo.likes?.length || 0}</span>
                                                    </button>
                                                    <div className="w-px h-10 bg-white/5 my-auto"></div>
                                                    <button className="flex items-center gap-4 px-10 py-4 hover:bg-white/5 rounded-xl transition-all text-dark-muted hover:text-red-500 group">
                                                        <ThumbsDown size={24} className="group-hover:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#141414] border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden group shadow-2xl">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary/10 group-hover:bg-brand-primary/60 transition-all duration-700"></div>
                                        <div className="flex items-center gap-8 mb-8">
                                            <div className="flex items-center gap-3">
                                                <Activity size={16} className="text-brand-primary" />
                                                <span className="text-xs font-bold uppercase tracking-widest">{selectedVideo.viewCount || 0} views</span>
                                            </div>
                                            <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                                            <div className="flex items-center gap-3">
                                                <Clock size={16} className="text-brand-primary" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{new Date(selectedVideo.createdAt).toDateString()}</span>
                                            </div>
                                        </div>
                                        <p className="text-base font-medium text-white/80 leading-relaxed whitespace-pre-wrap">{selectedVideo.content || "No description provided."}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Signal Feedback Matrix (Comments) */}
                            <div className="w-full lg:w-[480px] flex flex-col gap-8 h-full overflow-hidden">
                                <div className="flex-1 bg-[#141414] border border-white/5 rounded-[3.5rem] flex flex-col overflow-hidden shadow-3xl">
                                    <header className="p-10 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]/30">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-brand-primary flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-brand-primary" /> Live
                                            </p>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest opacity-60">Comments</p>
                                        </div>
                                        <span className="px-3 py-1 bg-[#0a0a0a] border border-white/10 rounded-lg text-[10px] font-bold text-dark-muted uppercase tracking-widest">{selectedVideo.comments?.length || 0} Comments</span>
                                    </header>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                                        {selectedVideo.comments?.length > 0 ? selectedVideo.comments?.map((comment, i) => (
                                            <div key={i} className="flex gap-6 group">
                                                <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] shrink-0 overflow-hidden border border-white/10 p-0.5 group-hover:border-brand-primary/30 transition-all shadow-xl">
                                                    <img src={comment.authorId?.avatar} className="w-full h-full object-cover rounded-[14px]" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-white">{comment.authorId?.name}</span>
                                                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-xs text-brand-primary mt-0.5">Just now</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="h-full flex flex-col items-center justify-center text-dark-muted opacity-20 space-y-4">
                                                <MessageSquare size={64} />
                                                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No Comments Yet</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-10 border-t border-white/5 bg-[#0a0a0a]/50">
                                        <form
                                            onSubmit={(e) => {
                                                const val = e.target.comment.value;
                                                handleCommentSubmit(e, val);
                                                e.target.comment.value = '';
                                            }}
                                            className="relative group"
                                        >
                                            <input
                                                type="text"
                                                name="comment"
                                                placeholder="Add a comment..."
                                                className="w-full bg-[#141414] border border-white/10 rounded-2xl py-5 pl-8 pr-16 text-sm font-medium outline-none focus:border-brand-primary/50 focus:bg-[#0a0a0a] transition-all placeholder:text-gray-600 shadow-inner text-white"
                                            />
                                            <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-primary hover:scale-125 transition-all p-2 bg-brand-primary/10 rounded-xl hover:bg-brand-primary hover:text-dark-bg shadow-xl">
                                                <Send size={20} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialMedia;
