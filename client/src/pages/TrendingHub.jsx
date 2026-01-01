import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
    Flame, TrendingUp, Zap, Sparkles, Filter,
    MoreHorizontal, Eye, ThumbsUp, MessageCircle,
    PlayCircle, Clock, Trophy, Target, Award, Star, Activity
} from 'lucide-react';

const TrendingHub = () => {
    const [courses, setCourses] = useState([]);
    const [articles, setArticles] = useState([]);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrending();
    }, []);

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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 space-y-24 pb-32 font-inter text-white">
            {/* Strategic Header */}
            <div className="bg-[#141414] rounded-3xl relative overflow-hidden border border-white/5 shadow-3xl">
                <div className="absolute top-0 right-0 w-[600px] h-full bg-brand-primary/[0.02] rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 p-12 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-16">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
                            <Activity size={18} className="text-brand-primary" />
                            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em]">Strategic Performance Monitor</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase leading-none">
                                Community <span className="text-brand-primary">Trends</span>
                            </h1>
                            <p className="text-lg text-dark-muted font-medium max-w-2xl leading-relaxed opacity-80">
                                Real-time analysis of the most influential curriculum paths, professional insights, and community engagement metrics.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <div className="w-64 h-64 bg-[#0a0a0a] border border-white/5 rounded-3xl flex items-center justify-center p-10 shadow-inner group transition-all hover:border-brand-primary/20">
                            <div className="text-center space-y-3">
                                <Trophy size={56} className="text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <p className="text-4xl font-bold text-white tracking-tight">12.5K</p>
                                <p className="text-[10px] font-bold uppercase text-dark-muted tracking-[0.3em] opacity-50">Peer Network</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Reels */}
            <section className="space-y-10">
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <PlayCircle className="text-brand-primary" size={32} />
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold uppercase tracking-tight">Technical Semantics</h2>
                            <p className="text-[10px] text-dark-muted font-bold uppercase tracking-[0.2em] opacity-50">Brief Technical Overviews</p>
                        </div>
                    </div>
                    <Link to="/reels" className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline">Access Feed</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                    {reels.map((reel, i) => (
                        <div key={i} className="group aspect-[9/16] bg-[#141414] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer relative shadow-xl">
                            <img
                                src={reel.thumbnailUrl}
                                alt={reel.title}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 flex flex-col justify-end">
                                <div className="flex items-center gap-2 text-[9px] font-bold text-brand-primary uppercase tracking-widest mb-2">
                                    <Eye size={12} /> {reel.views || '1.2K'} Synchronized
                                </div>
                                <p className="text-[10px] font-bold text-white uppercase truncate tracking-tight">{reel.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tier 1 Curriculum (Courses) */}
            <section className="space-y-10">
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="text-brand-primary" size={32} />
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold uppercase tracking-tight">Strategic Paths</h2>
                            <p className="text-[10px] text-dark-muted font-bold uppercase tracking-[0.2em] opacity-50">High-Performance Course Selection</p>
                        </div>
                    </div>
                    <Link to="/browse" className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline">Review All Paths</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {courses.map((course, i) => (
                        <Link to={`/course/${course._id}`} key={i} className="group bg-[#141414] rounded-3xl border border-white/5 overflow-hidden hover:border-brand-primary/30 transition-all flex flex-col h-full shadow-2xl">
                            <div className="aspect-[16/9] relative overflow-hidden bg-[#262626]">
                                <img
                                    src={course.thumbnail}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 opacity-70 group-hover:opacity-100"
                                    alt={course.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                                    <div className="bg-brand-primary/10 backdrop-blur-md text-brand-primary border border-brand-primary/20 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest w-fit mb-4">
                                        {course.category}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">{course.title}</h3>
                                </div>
                            </div>
                            <div className="p-8 flex items-center justify-between border-t border-white/5 mt-auto bg-[#0a0a0a]/40">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-yellow-500 font-bold">
                                        <Star size={16} fill="currentColor" />
                                        <span className="text-sm tracking-tight">{course.rating || 4.9}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em] opacity-60">
                                        {course.enrollmentCount || 0} Learners Synced
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-white tracking-tight">${course.price}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Technical Briefings (Articles) */}
            <section className="space-y-10">
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <Target className="text-brand-primary" size={32} />
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold uppercase tracking-tight">Core Curriculum</h2>
                            <p className="text-[10px] text-dark-muted font-bold uppercase tracking-[0.2em] opacity-50">Expert Professional Insights</p>
                        </div>
                    </div>
                    <Link to="/blog" className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline">Access Repository</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {articles.map((article, i) => (
                        <Link to={`/blog/${article.slug}`} key={i} className="bg-[#141414] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row gap-8 hover:border-brand-primary/30 hover:bg-[#1a1a1a] transition-all group shadow-xl">
                            <div className="w-full sm:w-48 h-48 rounded-2xl bg-[#0a0a0a] overflow-hidden shrink-0 relative border border-white/5 shadow-inner">
                                <img src={article.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" alt={article.title} />
                            </div>
                            <div className="py-2 space-y-4 flex-1 min-w-0">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest opacity-50">
                                    <Clock size={14} className="text-brand-primary" /> {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Trending'}
                                </div>
                                <h3 className="text-2xl font-bold text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors leading-tight line-clamp-2">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-dark-muted font-medium line-clamp-2 leading-relaxed opacity-70">
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
