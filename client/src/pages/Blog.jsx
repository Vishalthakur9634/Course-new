import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, User, Tag, Calendar, ArrowRight } from 'lucide-react';
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

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <header className="text-center space-y-4 py-12">
                <span className="px-4 py-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-sm font-bold uppercase tracking-widest">
                    Course Launcher Blog
                </span>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                    Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">Updates</span>
                </h1>
                <p className="text-xl text-dark-muted max-w-2xl mx-auto">
                    The latest news, tutorials, and success stories from our community.
                </p>
            </header>

            {loading ? (
                <div className="text-center py-20 text-dark-muted">Loading articles...</div>
            ) : articles.length === 0 ? (
                <div className="text-center py-20 bg-dark-layer1 border border-white/10 rounded-3xl">
                    <BookOpen size={48} className="mx-auto text-dark-muted opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Articles Yet</h3>
                    <p className="text-dark-muted mt-2">Check back soon for new content.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article, idx) => (
                        <Link
                            to={`/blog/${article.slug}`}
                            key={article._id}
                            className="group bg-dark-layer1 border border-white/10 rounded-[2rem] overflow-hidden hover:border-brand-primary/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="aspect-[4/3] bg-dark-layer2 overflow-hidden relative">
                                {article.coverImage ? (
                                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                        <BookOpen size={40} className="text-white/20" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10">
                                        {article.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1 space-y-4">
                                <div className="flex items-center gap-3 text-xs font-bold text-dark-muted uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{article.views} Views</span>
                                </div>

                                <h2 className="text-2xl font-black text-white group-hover:text-brand-primary transition-colors leading-tight flex-1">
                                    {article.title}
                                </h2>

                                <div className="pt-6 mt-auto border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {article.authorId?.avatar ? (
                                            <img src={article.authorId.avatar} className="w-8 h-8 rounded-full ring-2 ring-dark-bg" alt="" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-dark-bg font-bold text-xs ring-2 ring-dark-bg">
                                                {article.authorId?.name?.[0]}
                                            </div>
                                        )}
                                        <span className="text-sm font-bold text-white">{article.authorId?.name}</span>
                                    </div>
                                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-brand-primary group-hover:text-dark-bg transition-all">
                                        <ArrowRight size={14} />
                                    </span>
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
