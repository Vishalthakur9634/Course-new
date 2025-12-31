import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
    Flame, TrendingUp, Zap, Sparkles, Filter,
    MoreHorizontal, Eye, ThumbsUp, MessageCircle,
    PlayCircle, Clock, Trophy, Target, Award
} from 'lucide-react';

const TrendingHub = () => {
    const [courses, setCourses] = useState([]);
    const [articles, setArticles] = useState([]);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        fetchTrending();
    }, [activeCategory]);

    const fetchTrending = async () => {
        setLoading(true);
        try {
            const [coursesRes, articlesRes, reelsRes] = await Promise.all([
                api.get('/courses?sort=enrollmentCount&limit=6'),
                api.get('/articles?limit=4'),
                api.get('/reels/feed')
            ]);

            setCourses(coursesRes.data || []);
            setArticles(articlesRes.data || []);
            const reelsList = Array.isArray(reelsRes.data) ? reelsRes.data : [];
            setReels(reelsList.slice(0, 8));
        } catch (error) {
            console.error('Error fetching trending content:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-20 pb-32">
            {/* Massive Hero Section */}
            <div className="relative group p-1 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-hover/20 rounded-[4rem] overflow-hidden">
                <div className="absolute inset-0 bg-dark-layer1 rounded-[3.9rem] z-0"></div>
                <div className="relative z-10 p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-8 text-center md:text-left">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
                            <Flame size={20} className="text-brand-primary animate-pulse" />
                            <span className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">Live Pulse Monitoring</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none uppercase">
                            The Hub <br />
                            <span className="text-brand-primary">Trending Now</span>
                        </h1>
                        <p className="text-dark-muted font-medium text-lg md:text-xl max-w-xl leading-relaxed">
                            Monitoring the Stellar frequency to surface the most engaged curriculum, insights, and architectural developments.
                        </p>
                    </div>
                    <div className="shrink-0 relative group/stat">
                        <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full"></div>
                        <div className="relative w-64 h-64 bg-dark-layer2/50 backdrop-blur-3xl border border-white/5 rounded-[3rem] flex items-center justify-center p-8">
                            <div className="text-center space-y-2">
                                <Trophy size={48} className="text-yellow-500 mx-auto mb-4" />
                                <p className="text-4xl font-black italic text-white">#12,490</p>
                                <p className="text-[10px] font-black uppercase text-dark-muted tracking-[0.4em]">Active Orbiters</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending Reels Grid */}
            <section className="space-y-10">
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <PlayCircle className="text-brand-primary" size={32} />
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tight">Viral Highlights</h2>
                    </div>
                    <Link to="/reels" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Open Reels Feed</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {reels.map((reel, i) => (
                        <div key={i} className="group aspect-[9/16] bg-dark-layer1 rounded-3xl overflow-hidden border border-white/5 hover:border-brand-primary/50 transition-all cursor-pointer relative shadow-2xl">
                            <img src={reel.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                                <div className="flex items-center gap-1.5 text-[8px] font-black text-brand-primary uppercase tracking-widest mb-1">
                                    <Eye size={10} /> {reel.views || '12K'}
                                </div>
                                <p className="text-[9px] font-bold text-white uppercase italic truncate">{reel.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending Courses Section */}
            <section className="space-y-10">
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="text-brand-primary" size={32} />
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tight">Elite Curriculum</h2>
                    </div>
                    <Link to="/browse" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">All Departments</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {courses.map((course, i) => (
                        <Link to={`/course/${course._id}`} key={i} className="group bg-dark-layer1 rounded-[3.5rem] border border-white/5 overflow-hidden hover:border-brand-primary transition-all duration-700 flex flex-col h-full shadow-2xl">
                            <div className="aspect-[16/10] relative overflow-hidden">
                                <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                                    <div className="bg-brand-primary text-dark-bg px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit mb-4">
                                        {course.category}
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{course.title}</h3>
                                </div>
                            </div>
                            <div className="p-8 flex items-center justify-between border-t border-white/5 mt-auto">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-yellow-500 font-black">
                                        <Trophy size={14} fill="currentColor" />
                                        <span className="text-sm">{course.rating || 4.9}</span>
                                    </div>
                                    <div className="text-[10px] font-black text-dark-muted uppercase tracking-widest">
                                        {course.enrollmentCount || 0} Orbiters
                                    </div>
                                </div>
                                <span className="text-2xl font-black text-white italic italic">${course.price}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Strategic Insights (Articles) */}
            <section className="space-y-10">
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <Target className="text-brand-primary" size={32} />
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tight">Core Insights</h2>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {articles.map((article, i) => (
                        <Link to={`/blog/${article.slug}`} key={i} className="bg-dark-layer1 border border-white/5 rounded-[3rem] p-4 flex gap-8 hover:border-white/10 transition-all shadow-xl group">
                            <div className="w-48 h-48 rounded-[2.5rem] bg-dark-layer2 overflow-hidden shrink-0 relative">
                                <img src={article.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="py-4 pr-4 space-y-4 flex-1 min-w-0">
                                <div className="flex items-center gap-3 text-[10px] font-black text-dark-muted uppercase tracking-widest">
                                    <Clock size={14} /> {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'RECENT'}
                                </div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-brand-primary transition-colors leading-tight line-clamp-2">
                                    {article.title}
                                </h3>
                                <p className="text-xs text-dark-muted font-medium line-clamp-2 leading-relaxed">
                                    {article.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TrendingHub;
