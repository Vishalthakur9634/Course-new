import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, User, Calendar, Folder, Clock } from 'lucide-react';

const ArticleDetail = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        try {
            const { data } = await api.get(`/articles/${slug}`);
            setArticle(data);
        } catch (error) {
            console.error('Error fetching article:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-dark-muted font-bold uppercase tracking-widest text-xs">Loading Article...</div>;
    if (!article) return <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-red-500 font-bold uppercase tracking-widest text-xs transition-opacity duration-300">Article Not Found</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 font-inter text-white">
            <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-bold text-dark-muted hover:text-brand-primary uppercase tracking-widest mb-12 transition-colors">
                <ArrowLeft size={16} /> Back to Blog
            </Link>

            <article className="space-y-12 animate-fade-in">
                {article.coverImage && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#1a1a1a]">
                        <img src={article.coverImage} className="w-full h-full object-cover opacity-80" alt={article.title} />
                    </div>
                )}

                <header className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-dark-muted uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg">
                            <Folder size={12} /> {article.category}
                        </span>
                        <span className="hidden sm:inline opacity-30">•</span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                        <span className="hidden sm:inline opacity-30">•</span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} /> 6 min read
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tight leading-none leading-[0.9]">
                        {article.title}
                    </h1>

                    <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                {article.authorId?.avatar ? (
                                    <img src={article.authorId.avatar} className="w-12 h-12 rounded-full border border-white/10 group-hover:border-brand-primary/50 transition-all shadow-lg" alt="" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center font-bold text-white uppercase">
                                        <User size={20} className="text-brand-primary" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-white uppercase tracking-tight text-sm leading-none">{article.authorId?.name}</p>
                                <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">Contributor</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="pt-8 border-t border-white/5">
                    <div className="whitespace-pre-wrap text-dark-muted leading-[1.8] text-lg font-medium selection:bg-brand-primary selection:text-dark-bg">
                        {article.content}
                    </div>
                </div>

                <footer className="pt-16 border-t border-white/5">
                    <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 text-center space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Ready to dive deeper?</h4>
                        <p className="text-dark-muted text-sm font-medium">Explore our curated selection of professional courses and master your next skill.</p>
                        <Link
                            to="/browse"
                            className="inline-flex items-center px-8 py-3 bg-brand-primary text-dark-bg font-bold rounded-lg text-[10px] uppercase tracking-widest hover:brightness-110 transition-all"
                        >
                            Browse All Courses
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
};

export default ArticleDetail;
