import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    MessageSquare, Users, Zap, Hash, MessageCircle, ArrowUpCircle, Filter, Search,
    Sparkles, Globe, Lock, Crown, Star, BookOpen, Code, Palette, Briefcase,
    BarChart2, Image as ImageIcon, Loader, Plus, Trash2, Check, X, Heart, Eye, TrendingUp, Flame, Clock, Pin, Send
} from 'lucide-react';
import CommunitySidebar from '../components/community/CommunitySidebar';
import PostCard from '../components/community/PostCard';
import UserLink from '../components/UserLink';

const CommunityHub = () => {
    const [communities, setCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]); // [NEW] Enrolled instructor communities
    const [posts, setPosts] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [activeTab, setActiveTab] = useState('feed'); // feed, communities, trending
    const [sortBy, setSortBy] = useState('recent'); // recent, popular, trending
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateCommunity, setShowCreateCommunity] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Form states
    const [newPost, setNewPost] = useState({ title: '', content: '', type: 'discussion', tags: '' });
    const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: 'general', color: '#6366f1' });
    const [newComment, setNewComment] = useState('');

    // Poll State
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollDuration, setPollDuration] = useState(1); // days

    // Image State
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const categoryIcons = {
        announcements: Crown,
        general: MessageSquare,
        help: Zap,
        showcase: Star,
        offtopic: Globe,
        custom: Hash
    };

    const categoryColors = {
        announcements: 'from-yellow-500 to-orange-500',
        general: 'from-blue-500 to-indigo-500',
        help: 'from-green-500 to-teal-500',
        showcase: 'from-purple-500 to-pink-500',
        offtopic: 'from-gray-500 to-slate-500',
        custom: 'from-brand-primary to-purple-500'
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchCommunities();
        fetchMyCommunities(); // [NEW]
        fetchPosts();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [selectedCommunity, sortBy]);

    const fetchCommunities = async () => {
        try {
            const { data } = await api.get('/community/communities');
            setCommunities(data);
        } catch (error) {
            console.error('Error fetching communities:', error);
        }
    };

    const fetchMyCommunities = async () => {
        try {
            const { data } = await api.get('/community/communities/enrolled');
            setMyCommunities(data);
        } catch (error) {
            console.error('Error fetching my communities:', error);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = {
                communityId: selectedCommunity?._id,
                sort: sortBy
            };
            const { data } = await api.get('/community/posts', { params });
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCommunity = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/community/communities', newCommunity);
            setCommunities([data, ...communities]);
            setShowCreateCommunity(false);
            setNewCommunity({ name: '', description: '', category: 'general', color: '#6366f1' });
        } catch (error) {
            console.error('Error creating community:', error);
            alert('Failed to create community');
        }
    };

    const handleJoinCommunity = async (communityId) => {
        try {
            const { data } = await api.post(`/community/communities/${communityId}/join`);
            fetchCommunities();
        } catch (error) {
            console.error('Error joining community:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!selectedCommunity) {
            alert('Please select a community first');
            return;
        }

        setIsUploading(true);
        try {
            let media = [];

            // Upload Image if exists
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                media.push({
                    type: 'image',
                    url: uploadRes.data.url
                });
            }

            const postData = {
                ...newPost,
                communityId: selectedCommunity._id,
                tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
                media
            };

            // Add Poll Data
            if (newPost.type === 'poll') {
                const validOptions = pollOptions.filter(o => o.trim());
                if (validOptions.length < 2) {
                    throw new Error('Poll must have at least 2 options');
                }
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + parseInt(pollDuration));

                postData.poll = {
                    question: newPost.title,
                    options: validOptions.map(text => ({ text })),
                    expiresAt
                };
            }

            const { data } = await api.post('/community/posts', postData);
            setPosts([data, ...posts]);
            setShowCreatePost(false);
            setSelectedCommunity(null);
            setNewPost({ title: '', content: '', type: 'discussion', tags: '' });
            setImageFile(null);
            setImagePreview(null);
            setPollOptions(['', '']);
        } catch (error) {
            console.error('Error creating post:', error);
            alert(error.response?.data?.message || 'Failed to create post');
        } finally {
            setIsUploading(false);
        }
    };

    const handleVote = async (postId, optionIndex) => {
        try {
            const { data } = await api.post(`/community/posts/${postId}/vote`, { optionIndex });
            // Update local state
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    return { ...p, poll: data };
                }
                return p;
            }));
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to record vote');
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const { data } = await api.post(`/community/posts/${postId}/like`);
            setPosts(posts.map(p => p._id === postId ? { ...p, likeCount: data.likeCount, likes: data.liked ? [...(p.likes || []), currentUser.id] : (p.likes || []).filter(id => id !== currentUser.id) } : p));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleAddComment = async (postId) => {
        if (!newComment.trim()) return;
        try {
            const { data } = await api.post(`/community/posts/${postId}/comment`, { content: newComment });
            setPosts(posts.map(p => p._id === postId ? data : p));
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.delete(`/community/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            setSelectedPost(null);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handlePinPost = async (postId) => {
        try {
            const { data } = await api.post(`/community/posts/${postId}/pin`);
            setPosts(posts.map(p => p._id === postId ? { ...p, isPinned: data.isPinned } : p));
        } catch (error) {
            console.error('Error pinning post:', error);
            alert('Failed to pin post');
        }
    };

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
        <div className="max-w-[1600px] mx-auto">
            {/* Top Navigation Bar */}
            <div className="bg-dark-layer1 border border-white/10 rounded-3xl p-6 mb-6 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <Sparkles className="text-brand-primary" size={36} />
                            Community <span className="text-brand-primary italic">Hub</span>
                        </h1>
                        <p className="text-dark-muted text-sm mt-2 font-medium">Connect, share, and learn with fellow orbiters</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowCreatePost(true)}
                            className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-2xl text-sm transition-all transform hover:scale-105 shadow-xl shadow-brand-primary/30 flex items-center gap-2"
                        >
                            <Plus size={18} /> Create Post
                        </button>
                        {currentUser?.role === 'instructor' && (
                            <button
                                onClick={() => setShowCreateCommunity(true)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl text-sm transition-all border border-white/10 flex items-center gap-2"
                            >
                                <Users size={18} /> New Community
                            </button>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 mt-6 border-t border-white/5 pt-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'feed' ? 'bg-brand-primary text-dark-bg' : 'bg-white/5 text-dark-muted hover:text-white'}`}
                        >
                            <MessageSquare className="inline mr-2" size={16} /> Feed
                        </button>
                        <button
                            onClick={() => setActiveTab('my_instructors')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'my_instructors' ? 'bg-brand-primary text-dark-bg' : 'bg-white/5 text-dark-muted hover:text-white'}`}
                        >
                            <Crown className="inline mr-2" size={16} /> My Instructors
                        </button>
                        <button
                            onClick={() => setActiveTab('communities')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'communities' ? 'bg-brand-primary text-dark-bg' : 'bg-white/5 text-dark-muted hover:text-white'}`}
                        >
                            <Users className="inline mr-2" size={16} /> All Communities
                        </button>
                        <button
                            onClick={() => setActiveTab('trending')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'trending' ? 'bg-brand-primary text-dark-bg' : 'bg-white/5 text-dark-muted hover:text-white'}`}
                        >
                            <Flame className="inline mr-2" size={16} /> Trending
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 relative">
                    {/* Sidebar - Desktop Only */}
                    <div className="hidden lg:block">
                        <CommunitySidebar
                            activeTab={activeTab}
                            communities={communities}
                            myCommunities={myCommunities}
                            selectedCommunity={selectedCommunity}
                            setSelectedCommunity={setSelectedCommunity}
                            posts={posts}
                        />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 space-y-6 pb-20 lg:pb-0">
                        {/* Mobile: Show Community List if activeTab is communities/my_instructors */}
                        <div className="lg:hidden">
                            {(activeTab === 'communities' || activeTab === 'my_instructors') && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => { setSelectedCommunity(null); setActiveTab('feed'); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${!selectedCommunity
                                            ? 'bg-brand-primary/10 text-brand-primary border-2 border-brand-primary'
                                            : 'bg-dark-layer1 text-dark-muted hover:text-white border-2 border-transparent'
                                            }`}
                                    >
                                        <Globe size={18} /> All Posts
                                    </button>
                                    {(activeTab === 'my_instructors' ? myCommunities : communities).map((community) => {
                                        const Icon = categoryIcons[community.category] || Hash;
                                        return (
                                            <button
                                                key={community._id}
                                                onClick={() => { setSelectedCommunity(community); setActiveTab('feed'); }}
                                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all bg-dark-layer1 border border-white/5 ${selectedCommunity?._id === community._id
                                                    ? 'bg-brand-primary/10 text-brand-primary border-brand-primary'
                                                    : 'text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${categoryColors[community.category]} flex items-center justify-center`}>
                                                        <Icon size={14} className="text-white" />
                                                    </div>
                                                    <span className="truncate">{community.name}</span>
                                                </div>
                                                {community.isOfficial && <Crown size={14} className="text-yellow-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Feed Content (Show if Feed/Trending OR Desktop) */}
                        {/* On Mobile: Hide feed if viewing communities tab */}
                        <div className={`${(activeTab === 'communities' || activeTab === 'my_instructors') ? 'hidden lg:block' : 'block'}`}>
                            {/* Filters & Search */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="relative w-full md:w-96">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search posts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-dark-layer1 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-primary transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                                    <button
                                        onClick={() => setSortBy('recent')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'recent' ? 'bg-brand-primary text-dark-bg' : 'bg-white/5 text-dark-muted hover:text-white'}`}
                                    >
                                        <Clock size={14} className="inline mr-1" /> Recent
                                    </button>
                                    <button
                                        onClick={() => setSortBy('popular')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'popular' ? 'bg-brand-primary text-dark-bg' : 'bg-white/5 text-dark-muted hover:text-white'}`}
                                    >
                                        <TrendingUp size={14} className="inline mr-1" /> Popular
                                    </button>
                                    <button
                                        onClick={() => setSortBy('trending')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${sortBy === 'trending' ? 'bg-brand-primary text-dark-bg' : 'bg-white/5 text-dark-muted hover:text-white'}`}
                                    >
                                        <Flame size={14} className="inline mr-1" /> Trending
                                    </button>
                                </div>
                            </div>

                            {/* Posts Feed */}
                            {loading ? (
                                <div className="text-center py-20">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                                    <p className="text-dark-muted mt-4">Loading posts...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-20 bg-dark-layer1 border border-white/10 rounded-3xl">
                                    <MessageSquare className="mx-auto text-dark-muted opacity-20 mb-4" size={64} />
                                    <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                                    <p className="text-dark-muted mb-6">Be the first to start a conversation!</p>
                                    <button
                                        onClick={() => setShowCreatePost(true)}
                                        className="hidden lg:inline-block px-6 py-3 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-2xl"
                                    >
                                        Create First Post
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
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
                                            onPin={handlePinPost}
                                            onClick={setSelectedPost}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                    </main>

                    {/* Floating Action Button for Mobile */}
                    <button
                        onClick={() => setShowCreatePost(true)}
                        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-brand-primary text-dark-bg rounded-full shadow-2xl shadow-brand-primary/40 flex items-center justify-center z-40 hover:scale-110 transition-transform active:scale-95 border-2 border-white/20"
                    >
                        <Plus size={28} />
                    </button>
                </div>

                {/* Create Post Modal */}
                {
                    showCreatePost && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-dark-layer1 rounded-3xl border border-white/10 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-white">Create New Post</h2>
                                    <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <X size={24} className="text-dark-muted" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreatePost} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Community</label>
                                        {communities.length === 0 ? (
                                            <div className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-dark-muted text-sm">
                                                No communities available. {currentUser?.role === 'instructor' ? 'Create one first!' : 'Ask an instructor to create a community.'}
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedCommunity?._id || ''}
                                                onChange={(e) => setSelectedCommunity(communities.find(c => c._id === e.target.value))}
                                                className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                                required
                                            >
                                                <option value="">Select a community</option>
                                                {communities.map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Type</label>
                                        <select
                                            value={newPost.type}
                                            onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                                            className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                        >
                                            <option value="discussion">Discussion</option>
                                            <option value="question">Question</option>
                                            <option value="showcase">Showcase</option>
                                            <option value="poll">Poll</option>
                                        </select>
                                    </div>

                                    {/* Poll Inputs */}
                                    {newPost.type === 'poll' && (
                                        <div className="space-y-3 bg-dark-layer2/50 p-4 rounded-xl border border-white/5">
                                            <label className="block text-sm font-bold text-brand-primary">Poll Options</label>
                                            {pollOptions.map((option, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...pollOptions];
                                                            newOptions[idx] = e.target.value;
                                                            setPollOptions(newOptions);
                                                        }}
                                                        placeholder={`Option ${idx + 1}`}
                                                        className="flex-1 bg-dark-layer1 border border-white/10 rounded-lg p-2 text-white text-sm"
                                                        required
                                                    />
                                                    {pollOptions.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                                                            className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {pollOptions.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setPollOptions([...pollOptions, ''])}
                                                    className="text-sm text-brand-primary font-bold hover:underline flex items-center gap-1"
                                                >
                                                    <Plus size={14} /> Add Option
                                                </button>
                                            )}
                                            <div>
                                                <label className="block text-sm font-bold text-dark-muted mb-1">Duration (Days)</label>
                                                <select
                                                    value={pollDuration}
                                                    onChange={(e) => setPollDuration(e.target.value)}
                                                    className="w-full bg-dark-layer1 border border-white/10 rounded-lg p-2 text-white text-sm"
                                                >
                                                    <option value="1">1 Day</option>
                                                    <option value="3">3 Days</option>
                                                    <option value="7">7 Days</option>
                                                    <option value="30">30 Days</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Upload Input */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-dark-muted">Attachment</label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('post-image').click()}
                                                className="px-4 py-2 bg-dark-layer2 hover:bg-white/5 text-white rounded-xl border border-white/10 transition-colors flex items-center gap-2 text-sm font-bold"
                                            >
                                                <ImageIcon size={16} /> {imageFile ? 'Change Image' : 'Add Image'}
                                            </button>
                                            <input
                                                type="file"
                                                id="post-image"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            {imageFile && (
                                                <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-xs font-bold border border-green-500/20">
                                                    <Check size={12} /> {imageFile.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                        className="ml-2 hover:text-red-400"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {imagePreview && (
                                            <div className="mt-2 text-center bg-dark-layer2 rounded-xl p-2 border border-white/10">
                                                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={newPost.title}
                                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                            placeholder="What's on your mind?"
                                            className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Content</label>
                                        <textarea
                                            value={newPost.content}
                                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                            placeholder="Share your thoughts with the community..."
                                            rows={6}
                                            className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white resize-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            value={newPost.tags}
                                            onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                            placeholder="react, javascript, web-dev"
                                            className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-brand-primary hover:bg-brand-hover text-dark-bg px-6 py-3 rounded-2xl font-black transition-all"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Publish Post'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreatePost(false)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-black transition-all border border-white/10"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Create Community Modal */}
                {
                    showCreateCommunity && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-dark-layer1 rounded-3xl border border-white/10 p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-white">Create Community</h2>
                                    <button onClick={() => setShowCreateCommunity(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <X size={24} className="text-dark-muted" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateCommunity} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Community Name</label>
                                        <input
                                            type="text"
                                            value={newCommunity.name}
                                            onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                                            placeholder="Awesome Community"
                                            className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Description</label>
                                        <textarea
                                            value={newCommunity.description}
                                            onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                                            placeholder="What is your community about?"
                                            rows={4}
                                            className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white resize-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Category</label>
                                        <select
                                            value={newCommunity.category}
                                            onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                                            className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                        >
                                            <option value="general">General</option>
                                            <option value="help">Help & Support</option>
                                            <option value="showcase">Showcase</option>
                                            <option value="offtopic">Off-Topic</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-dark-muted mb-2">Color Theme</label>
                                        <input
                                            type="color"
                                            value={newCommunity.color}
                                            onChange={(e) => setNewCommunity({ ...newCommunity, color: e.target.value })}
                                            className="w-full h-12 bg-dark-layer2 border border-white/10 rounded-xl cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-brand-primary hover:bg-brand-hover text-dark-bg px-6 py-3 rounded-2xl font-black transition-all"
                                        >
                                            Create Community
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateCommunity(false)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-black transition-all border border-white/10"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Post Detail Modal */}
                {
                    selectedPost && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <div className="bg-dark-layer1 rounded-3xl border border-white/10 p-8 max-w-4xl w-full shadow-2xl my-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-6">
                                            <UserLink
                                                user={selectedPost.authorId}
                                                avatarSize="w-12 h-12"
                                                nameClass="text-lg font-black text-white"
                                            />
                                            <p className="text-xs text-dark-muted font-bold uppercase tracking-widest">{new Date(selectedPost.createdAt).toLocaleString()}</p>
                                        </div>
                                        <h2 className="text-3xl font-black text-white mb-4">{selectedPost.title}</h2>
                                        <p className="text-dark-text leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
                                    </div>
                                    <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors ml-4">
                                        <X size={24} className="text-dark-muted" />
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <div className="border-t border-white/5 pt-6 mt-6">
                                    <h3 className="text-xl font-black text-white mb-4">Comments ({selectedPost.comments?.length || 0})</h3>

                                    {/* Add Comment */}
                                    <div className="flex gap-3 mb-6">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="flex-1 bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPost._id)}
                                        />
                                        <button
                                            onClick={() => handleAddComment(selectedPost._id)}
                                            className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-xl transition-all"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {selectedPost.comments?.map((comment, idx) => (
                                            <div key={idx} className="bg-dark-layer2/50 rounded-2xl p-4 border border-white/5">
                                                <div className="flex items-start gap-3">
                                                    <UserLink
                                                        user={comment.authorId}
                                                        avatarSize="w-10 h-10"
                                                        nameClass="hidden"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <UserLink
                                                                user={comment.authorId}
                                                                showAvatar={false}
                                                                nameClass="text-sm font-bold text-white"
                                                            />
                                                            <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <p className="text-sm text-dark-text">{comment.content}</p>
                                                        <button className="mt-2 text-xs text-dark-muted hover:text-brand-primary flex items-center gap-1">
                                                            <Heart size={12} />
                                                            {comment.likes?.length || 0}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default CommunityHub;
