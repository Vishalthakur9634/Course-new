import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
    MessageSquare, ThumbsUp, Share2, MoreHorizontal,
    Play, Calendar, Users, Hash, TrendingUp, Sparkles,
    Image as ImageIcon, Video, ClipboardList as Poll, Send, Heart,
    Globe, MessageCircle
} from 'lucide-react';

const UnifiedFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [trending, setTrending] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchFeed();
        fetchTrending();
    }, [activeFilter]);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            // Fetch posts from multiple sources (Community, Articles, Reels)
            const [communityRes, reelsRes] = await Promise.all([
                api.get('/community/posts?limit=20'),
                api.get('/reels/feed')
            ]);

            // Transform and combine
            const communityPosts = Array.isArray(communityRes.data.posts) ? communityRes.data.posts : [];
            const reelsList = Array.isArray(reelsRes.data) ? reelsRes.data : [];

            const combined = [
                ...communityPosts.map(p => ({ ...p, feedType: 'post' })),
                ...reelsList.map(r => ({ ...r, feedType: 'reel', title: r.title, content: r.description }))
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setPosts(combined);
        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrending = async () => {
        try {
            const { data } = await api.get('/courses');
            setTrending(data.slice(0, 5));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-8 pb-24">
            {/* Left Sidebar - Navigation & Discover */}
            <div className="hidden lg:flex flex-col w-64 gap-6 sticky top-24 h-fit">
                <div className="bg-dark-layer1 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest">Discovery Hub</h3>
                    <nav className="space-y-1">
                        {[
                            { label: 'Global Feed', icon: Globe, id: 'all' },
                            { label: 'Following', icon: Users, id: 'following' },
                            { label: 'Trending', icon: TrendingUp, id: 'trending' },
                            { label: 'Polls', icon: MessageCircle, id: 'polls' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveFilter(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeFilter === item.id ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-white/5 text-dark-muted hover:text-white'}`}
                            >
                                <item.icon size={18} />
                                <span className="text-sm font-bold">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="bg-dark-layer1 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest mb-4">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {['#OrbitUI', '#ReactDaily', '#BlockChain', '#Web3', '#AI', '#DesignSystem'].map(tag => (
                            <span key={tag} className="text-[10px] font-bold text-dark-muted hover:text-brand-primary cursor-pointer transition-colors px-2 py-1 bg-white/5 rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Feed Area */}
            <div className="flex-1 flex flex-col gap-8">
                {/* Create Post Widget */}
                <div className="bg-dark-layer1 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-dark-layer2 overflow-hidden border border-white/10 shrink-0">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black">{currentUser?.name?.[0]}</div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder={`What's on your mind, ${currentUser?.name?.split(' ')[0]}?`}
                            className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:border-brand-primary transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center justify-between mt-4 pl-16">
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-dark-muted hover:text-blue-400 transition-colors">
                                <ImageIcon size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Media</span>
                            </button>
                            <button className="flex items-center gap-2 text-dark-muted hover:text-indigo-400 transition-colors">
                                <Poll size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Poll</span>
                            </button>
                            <button className="flex items-center gap-2 text-dark-muted hover:text-green-400 transition-colors">
                                <Hash size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Tag</span>
                            </button>
                        </div>
                        <button className="bg-brand-primary hover:bg-brand-hover text-dark-bg px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all">
                            Post Now
                        </button>
                    </div>
                </div>

                {/* Feed Items */}
                <div className="space-y-8">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-dark-layer1 h-64 rounded-[2.5rem] animate-pulse"></div>
                        ))
                    ) : (
                        posts.map((post, idx) => (
                            <article key={idx} className="bg-dark-layer1 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl hover:border-white/10 transition-all group overflow-hidden relative">
                                {post.feedType === 'reel' && (
                                    <div className="absolute top-0 right-0 p-6">
                                        <div className="px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles size={12} /> Featured Reel
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-dark-layer2 overflow-hidden border border-white/10 shrink-0">
                                        <img src={post.authorId?.avatar || post.creatorId?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-white hover:text-brand-primary cursor-pointer transition-colors leading-none">{post.authorId?.name || "Expert Explorer"}</h4>
                                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                            <span className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'JUST NOW'}</span>
                                        </div>
                                        <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest mt-1">
                                            {post.communityId?.name ? `In ${post.communityId.name}` : 'Latest Update'}
                                        </p>
                                    </div>
                                    <button className="p-2 text-dark-muted hover:text-white transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-tight group-hover:text-brand-primary transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-dark-muted leading-relaxed line-clamp-3">
                                        {post.content}
                                    </p>
                                    {post.type === 'poll' && (
                                        <div className="space-y-3 p-4 bg-white/5 rounded-2xl mt-4">
                                            {post.poll?.options.map((opt, i) => (
                                                <button key={i} className="w-full p-4 bg-dark-layer2 border border-white/5 rounded-xl text-left text-xs font-bold hover:border-brand-primary/30 transition-all flex items-center justify-between group/opt">
                                                    <span>{opt.text}</span>
                                                    <span className="opacity-0 group-hover/opt:opacity-100 text-brand-primary transition-opacity">{Math.floor(Math.random() * 100)}%</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {post.feedType === 'reel' && post.videoUrl && (
                                        <div className="aspect-[9/16] max-w-[300px] h-[500px] mx-auto bg-black rounded-3xl overflow-hidden mt-6 relative shadow-2xl">
                                            <video src={post.videoUrl} className="w-full h-full object-cover" muted loop autoPlay />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                                <button className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-dark-bg mx-auto">
                                                    <Play size={24} fill="currentColor" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-2 group/btn">
                                            <div className="p-2.5 rounded-xl group-hover/btn:bg-red-500/10 transition-all">
                                                <Heart size={20} className="text-dark-muted group-hover/btn:text-red-500 transition-colors" />
                                            </div>
                                            <span className="text-xs font-black text-dark-muted group-hover/btn:text-white">{post.likes?.length || 0}</span>
                                        </button>
                                        <button className="flex items-center gap-2 group/btn">
                                            <div className="p-2.5 rounded-xl group-hover/btn:bg-blue-500/10 transition-all">
                                                <MessageSquare size={20} className="text-dark-muted group-hover/btn:text-blue-500 transition-colors" />
                                            </div>
                                            <span className="text-xs font-black text-dark-muted group-hover/btn:text-white">{post.comments?.length || 0}</span>
                                        </button>
                                    </div>
                                    <button className="p-2.5 rounded-xl hover:bg-white/10 transition-all">
                                        <Share2 size={20} className="text-dark-muted hover:text-brand-primary transition-colors" />
                                    </button>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>

            {/* Right Sidebar - Trending & Suggestions */}
            <div className="hidden xl:flex flex-col w-72 gap-6 sticky top-24 h-fit">
                <div className="bg-dark-layer1 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={16} /> Trending Courses
                    </h3>
                    <div className="space-y-4">
                        {trending.map((course, i) => (
                            <Link to={`/course/${course._id}`} key={i} className="flex gap-3 group">
                                <div className="w-12 h-12 rounded-xl bg-dark-layer2 overflow-hidden border border-white/10 shrink-0">
                                    <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[11px] font-black text-white group-hover:text-brand-primary truncate transition-colors uppercase tracking-tight">{course.title}</h4>
                                    <p className="text-[9px] text-dark-muted font-bold mt-0.5">{course.enrollmentCount || 0} enrolled</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Link to="/browse" className="block text-center pt-2 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline transition-all">
                        View All Frontiers
                    </Link>
                </div>

                <div className="bg-dark-layer1 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest mb-4">Top Instructors</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-indigo-500 p-0.5">
                                        <div className="w-full h-full bg-dark-layer1 rounded-full overflow-hidden border-2 border-dark-layer1">
                                            <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[11px] font-black text-white truncate uppercase tracking-tight">Sensei_{i}</h4>
                                        <p className="text-[9px] text-dark-muted font-bold">12 Courses</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1 bg-white/10 hover:bg-white text-white hover:text-dark-bg text-[9px] font-black uppercase tracking-widest rounded-full transition-all">
                                    Follow
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="px-6 text-[9px] font-bold text-dark-muted/50 uppercase tracking-widest text-center leading-relaxed">
                    Orbit v2.4.0 &bull; DeepMind Advanced Learning &bull; © 2025
                </footer>
            </div>
        </div>
    );
};

// Mock Icons removed as they are now imported correctly
export default UnifiedFeed;
