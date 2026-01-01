import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
    MessageSquare, Hash, Search, Globe, Crown, Star, Plus, X, Heart, Eye,
    Activity, Shield, Target, Layers, Radio, Terminal, ChevronRight, Loader, Bell
} from 'lucide-react';
import PostCard from '../components/community/PostCard';
import { motion, AnimatePresence } from 'framer-motion';

const CommunityHub = () => {
    const [communities, setCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]);
    const [posts, setPosts] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [sortBy, setSortBy] = useState('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [pulseActivities, setPulseActivities] = useState([
        { id: 1, type: 'join', user: 'James_Miller', target: 'Backend Systems', time: '2m ago' },
        { id: 2, type: 'post', user: 'Sarah_Chen', target: 'Frontend Architecture', time: '5m ago' },
        { id: 3, type: 'like', user: 'Mark_Stevens', target: 'Career Growth', time: '8m ago' },
        { id: 4, type: 'level', user: 'Robert_Expert', target: 'Lead Engineer', time: '12m ago' },
    ]);

    const [newPost, setNewPost] = useState({ title: '', content: '', type: 'discussion', tags: '' });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchCommunities();
        fetchMyCommunities();
        fetchPosts();

        const interval = setInterval(() => {
            const types = ['join', 'post', 'like', 'level'];
            const users = ['Michael_Fullstack', 'Emily_Dev', 'David_Architect', 'Chris_Mentor'];
            const labels = ['Engineering', 'Design', 'Product', 'Culture'];
            const newActivity = {
                id: Date.now(),
                type: types[Math.floor(Math.random() * types.length)],
                user: users[Math.floor(Math.random() * users.length)],
                target: labels[Math.floor(Math.random() * labels.length)],
                time: 'Just now'
            };
            setPulseActivities(prev => [newActivity, ...prev.slice(0, 10)]);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [selectedCommunity, sortBy]);

    const fetchCommunities = async () => {
        try {
            const { data } = await api.get('/community/communities');
            setCommunities(data);
        } catch (error) { console.error('Fetch error'); }
    };

    const fetchMyCommunities = async () => {
        try {
            const { data } = await api.get('/community/communities/enrolled');
            setMyCommunities(data);
        } catch (error) { console.error('Fetch error'); }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = { communityId: selectedCommunity?._id, sort: sortBy };
            const { data } = await api.get('/community/posts', { params });
            setPosts(data.posts || []);
        } catch (error) { console.error('Fetch error'); }
        finally { setLoading(false); }
    };

    const handleVote = async (postId, optionIndex) => {
        try {
            const { data } = await api.post(`/community/posts/${postId}/vote`, { optionIndex });
            setPosts(posts.map(p => p._id === postId ? { ...p, poll: data } : p));
        } catch (error) { console.error('Vote error'); }
    };

    const handleLikePost = async (postId) => {
        try {
            const { data } = await api.post(`/community/posts/${postId}/like`);
            setPosts(posts.map(p => p._id === postId ? { ...p, likeCount: data.likeCount, likes: data.liked ? [...(p.likes || []), currentUser.id] : (p.likes || []).filter(id => id !== currentUser.id) } : p));
        } catch (error) { console.error('Like error'); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this signal permanently?')) return;
        try {
            await api.delete(`/community/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (error) { console.error('Delete error'); }
    };

    const categoryIcons = {
        announcements: Bell,
        general: MessageSquare,
        help: Shield,
        showcase: Star,
        offtopic: Globe,
        custom: Hash
    };

    return (
        <div className="fixed inset-0 top-[64px] bg-[#0a0a0a] font-inter overflow-hidden flex flex-col text-gray-300">
            {/* Ambient Lighting */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex-1 max-w-[1600px] mx-auto w-full px-6 lg:px-12 flex gap-10 py-8 relative z-10 overflow-hidden">

                {/* Left Sidebar: Global Signal Feed */}
                <aside className="hidden xl:flex flex-col w-80 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 bg-[#141414] border border-white/5 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl"
                    >
                        <header className="p-8 border-b border-white/5 bg-white/[0.01]">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                                <Activity size={14} className="text-brand-primary" /> Global Pulse
                            </h3>
                            <p className="text-[8px] text-dark-muted font-bold uppercase tracking-widest mt-1 opacity-40">Live Network Activity</p>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar no-scrollbar">
                            <AnimatePresence initial={false}>
                                {pulseActivities.map(activity => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative pl-5 border-l border-white/10 group"
                                    >
                                        <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-brand-primary transition-all duration-300 shadow-[0_0_10px_rgba(255,161,22,0.5)]"></div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight truncate flex-1">{activity.user}</span>
                                            <span className="text-[8px] text-dark-muted font-bold uppercase opacity-30">{activity.time}</span>
                                        </div>
                                        <p className="text-[12px] text-dark-muted leading-tight font-medium">
                                            {activity.type === 'join' && <span className="text-blue-400 italic">connected</span>}
                                            {activity.type === 'post' && <span className="text-green-500 italic">broadcasted</span>}
                                            {activity.type === 'like' && <span className="text-brand-primary italic">amplified</span>}
                                            {activity.type === 'level' && <span className="text-purple-400 italic">evolved</span>}
                                            {' in '}
                                            <span className="text-white font-bold opacity-80">{activity.target}</span>
                                        </p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <Link to="/support" className="bg-[#141414] border border-white/5 rounded-2xl p-6 group hover:border-brand-primary/20 transition-all flex items-center gap-5 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-dark-bg transition-all">
                            <Shield size={20} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Support Core</p>
                            <p className="text-[8px] text-dark-muted font-bold uppercase opacity-40">Direct Anomaly Log</p>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-dark-muted group-hover:text-brand-primary transition-all group-hover:translate-x-1" />
                    </Link>
                </aside>

                {/* Main Content: Post Feed */}
                <main className="flex-1 flex flex-col min-w-0">
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">
                                {selectedCommunity?.name || 'Global'} <span className="text-brand-primary">Archive</span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
                                <span className="text-[10px] font-black text-dark-muted uppercase tracking-[0.3em] opacity-40">Intelligence Retrieval Matrix Feed</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
                                <input
                                    type="text"
                                    placeholder="SEARCH ARCHIVE..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-[#111] border border-white/5 rounded-xl py-3.5 pl-14 pr-6 text-[10px] font-black text-white placeholder:text-dark-muted uppercase tracking-widest focus:outline-none focus:border-brand-primary/30 transition-all w-full md:w-80 shadow-2xl"
                                />
                            </div>
                            <button
                                onClick={() => setShowCreatePost(true)}
                                className="bg-brand-primary text-dark-bg p-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/10 border border-brand-primary/20"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    </motion.header>

                    {/* Filter Tabs */}
                    <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
                        {['recent', 'popular', 'trending'].map(type => (
                            <button
                                key={type}
                                onClick={() => setSortBy(type)}
                                className={`px-8 py-3 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap ${sortBy === type
                                    ? 'bg-brand-primary text-dark-bg border-brand-primary shadow-lg shadow-brand-primary/10'
                                    : 'bg-[#111] text-dark-muted border-white/5 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar pr-2 pb-12 space-y-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-6">
                                <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] animate-pulse">Retrieving Signal...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="py-40 bg-[#141414]/40 rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center px-12 space-y-8">
                                <Radio size={64} className="text-dark-muted opacity-10" />
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic">Void Detected</h3>
                                    <p className="text-dark-muted text-[10px] font-black uppercase tracking-widest opacity-40">Initiate archival transmission for this domain.</p>
                                </div>
                                <button onClick={() => setShowCreatePost(true)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-brand-primary tracking-widest hover:bg-brand-primary hover:text-dark-bg transition-all">Start Transmission</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-10">
                                {posts.filter(post =>
                                    !searchQuery ||
                                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    post.content.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((post) => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        currentUser={currentUser}
                                        onVote={handleVote}
                                        onLike={handleLikePost}
                                        onDelete={handleDeletePost}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Sidebar: Hub & Leaders */}
                <aside className="hidden lg:flex flex-col w-96 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#141414] border border-white/5 rounded-[2rem] p-8 shadow-2xl space-y-8 relative overflow-hidden"
                    >
                        <header className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-primary border border-white/5">
                                <Layers size={22} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Domain Matrix</h3>
                                <p className="text-[8px] font-bold text-dark-muted uppercase opacity-40">Architectural Specialization</p>
                            </div>
                        </header>

                        <div className="space-y-3 max-h-[340px] overflow-y-auto no-scrollbar pr-1">
                            <button
                                onClick={() => setSelectedCommunity(null)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${!selectedCommunity
                                    ? 'bg-brand-primary text-dark-bg border-brand-primary shadow-xl'
                                    : 'bg-[#111] border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <Globe size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Global Archive</span>
                            </button>

                            {communities.map((community) => {
                                const Icon = categoryIcons[community.category] || Hash;
                                const isSelected = selectedCommunity?._id === community._id;
                                return (
                                    <button
                                        key={community._id}
                                        onClick={() => setSelectedCommunity(community)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${isSelected
                                            ? 'bg-white/10 border-brand-primary/40 shadow-lg'
                                            : 'bg-[#111] border-transparent hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 truncate">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: `${community.color}15` }}>
                                                <Icon size={18} style={{ color: community.color }} />
                                            </div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">{community.name}</span>
                                        </div>
                                        {community.isOfficial && <Crown size={12} className="text-brand-primary shrink-0 opacity-60" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl flex-1 overflow-hidden flex flex-col relative">
                        <header className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5">
                                <Target size={22} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Leader Board</h3>
                                <p className="text-[8px] font-bold text-dark-muted uppercase opacity-40">Entity Signal Intensity</p>
                            </div>
                        </header>

                        <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                            {[1, 2, 3, 4, 5].map((idx) => (
                                <div key={idx} className="flex items-center gap-5 py-1 group">
                                    <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center text-[10px] font-black text-dark-muted group-hover:text-brand-primary transition-colors border border-white/5">
                                        {idx}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate group-hover:text-brand-primary transition-all">Protocol_Exp_{idx}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${100 - (idx * 15)}%` }}
                                                    className="h-full bg-brand-primary/30"
                                                />
                                            </div>
                                            <span className="text-[8px] font-black text-brand-primary italic">{1200 - (idx * 120)} XP</span>
                                        </div>
                                    </div>
                                    {idx === 1 && <Crown size={14} className="text-brand-primary shadow-glow" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreatePost && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl"
                            onClick={() => !isUploading && setShowCreatePost(false)}
                        />
                        <motion.form
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!selectedCommunity) { alert('Archival target required.'); return; }
                                setIsUploading(true);
                                try {
                                    const { data } = await api.post('/community/posts', { ...newPost, communityId: selectedCommunity._id, tags: newPost.tags.split(',').filter(Boolean) });
                                    setPosts([data, ...posts]);
                                    setShowCreatePost(false);
                                    setNewPost({ title: '', content: '', type: 'discussion', tags: '' });
                                } catch (error) { console.error('Transmission fail'); }
                                finally { setIsUploading(false); }
                            }}
                            className="relative w-full max-w-2xl bg-[#141414] border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-3xl space-y-10 max-h-[90vh] overflow-y-auto no-scrollbar"
                        >
                            <header className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Signal <span className="text-brand-primary">Transmission</span></h2>
                                    <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.4em] opacity-40">Broadcast intelligence to matrix core</p>
                                </div>
                                <button type="button" onClick={() => setShowCreatePost(false)} className="p-2 text-dark-muted hover:text-white transition-colors">
                                    <X size={28} />
                                </button>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-dark-muted uppercase tracking-widest ml-1">Target Core</label>
                                    <select
                                        value={selectedCommunity?._id || ''}
                                        onChange={(e) => setSelectedCommunity(communities.find(c => c._id === e.target.value))}
                                        className="w-full bg-[#111] border border-white/5 rounded-xl px-5 py-4 text-white font-black text-[10px] focus:border-brand-primary/40 outline-none transition-all shadow-xl appearance-none"
                                        required
                                    >
                                        <option value="">CHOOSE DOMAIN...</option>
                                        {communities.map(c => <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-dark-muted uppercase tracking-widest ml-1">Focus Type</label>
                                    <select
                                        value={newPost.type}
                                        onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                                        className="w-full bg-[#111] border border-white/5 rounded-xl px-5 py-4 text-white font-black text-[10px] focus:border-brand-primary/40 outline-none transition-all shadow-xl appearance-none"
                                    >
                                        <option value="discussion">GENERAL_DISCOURSE</option>
                                        <option value="question">TECHNICAL_QA</option>
                                        <option value="showcase">INTEL_SHOWCASE</option>
                                        <option value="poll">CONSENSUS_POLLING</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-dark-muted uppercase tracking-widest ml-1">Signal Protocol</label>
                                <input
                                    type="text"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    placeholder="ENTER TRANSMISSION SUBJECT..."
                                    className="w-full bg-[#111] border border-white/5 rounded-xl px-6 py-4 text-white font-black text-xs focus:border-brand-primary/40 outline-none transition-all shadow-xl"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-dark-muted uppercase tracking-widest ml-1">Neural Content</label>
                                <textarea
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    placeholder="TRANSMIT DATA PACKETS..."
                                    className="w-full bg-[#111] border border-white/5 rounded-[1.5rem] px-6 py-6 text-white font-medium h-48 resize-none focus:border-brand-primary/40 outline-none text-sm leading-relaxed shadow-xl"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full py-6 bg-brand-primary text-dark-bg font-black rounded-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-4 uppercase text-[11px] tracking-[0.4em] shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                            >
                                {isUploading ? <Loader className="animate-spin" size={20} /> : <Terminal size={20} />}
                                {isUploading ? "TRANSMITTING..." : "INITIATE TRANSMISSION"}
                            </button>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommunityHub;
