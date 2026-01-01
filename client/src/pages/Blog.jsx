import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, User, Tag, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const { data } = await api.get('/articles');
            setArticles(data || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
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
        <div className="max-w-[1400px] mx-auto space-y-16 pb-32 px-4 md:px-8 font-inter">
            <header className="text-center space-y-6 py-20 bg-[#141414] rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 space-y-4">
                    <span className="px-6 py-2 rounded-lg bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-[0.3em] border border-brand-primary/20">
                        Professional Insights
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight uppercase leading-none">
                        Education <span className="text-brand-primary">& News</span>
                    </h1>
                    <p className="text-lg text-dark-muted max-w-2xl mx-auto font-medium opacity-80">
                        Strategic updates, technical tutorials, and industry insights for the professional developer.
                    </p>
                </div>
            </header>

            {articles.length === 0 ? (
                <div className="text-center py-32 bg-[#141414] border border-white/5 rounded-3xl space-y-6 shadow-xl">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-dark-muted opacity-20">
                        <BookOpen size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Catalog Empty</h3>
                        <p className="text-dark-muted text-[10px] font-bold uppercase tracking-widest opacity-60">No articles currently indexed in the system.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {articles.map((article, idx) => (
                        <Link
                            to={`/blog/${article.slug}`}
                            key={article._id}
                            className="group bg-[#141414] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all duration-500 flex flex-col h-full shadow-xl"
                        >
                            <div className="aspect-[16/10] bg-[#262626] overflow-hidden relative">
                                {article.coverImage ? (
                                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/5">
                                        <BookOpen size={64} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 bg-[#0a0a0a]/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded-lg border border-white/10 shadow-lg">
                                        {article.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1 space-y-6">
                                <div className="flex items-center gap-4 text-[9px] font-bold text-dark-muted uppercase tracking-widest opacity-60">
                                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-primary" /> {new Date(article.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5"><TrendingUp size={12} /> {article.views} Views</span>
                                </div>

                                <h2 className="text-2xl font-bold text-white group-hover:text-brand-primary transition-colors leading-tight tracking-tight uppercase flex-1">
                                    {article.title}
                                </h2>

                                <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-0.5 overflow-hidden shadow-lg group-hover:border-brand-primary/40 transition-all">
                                            {article.authorId?.avatar ? (
                                                <img src={article.authorId.avatar} className="w-full h-full rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                            ) : (
                                                <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                                                    {article.authorId?.name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">{article.authorId?.name}</p>
                                            <p className="text-[8px] font-bold text-dark-muted uppercase tracking-widest opacity-50">Verified Educator</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-brand-primary group-hover:text-dark-bg group-hover:border-brand-primary transition-all shadow-xl">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Blog;
