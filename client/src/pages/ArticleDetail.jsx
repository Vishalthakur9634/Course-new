import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, User, Calendar, Folder } from 'lucide-react';

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

    if (loading) return <div className="text-center py-20 text-dark-muted">Loading article...</div>;
    if (!article) return <div className="text-center py-20 text-red-500">Article not found.</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link to="/blog" className="flex items-center gap-2 text-dark-muted hover:text-white mb-8 transition-colors">
                <ArrowLeft size={20} /> Back to Blog
            </Link>

            <article className="space-y-8">
                {article.coverImage && (
                    <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden">
                        <img src={article.coverImage} className="w-full h-full object-cover" alt={article.title} />
                    </div>
                )}

                <header className="space-y-6">
                    <div className="flex items-center gap-4 text-sm font-bold text-dark-muted uppercase tracking-widest">
                        <span className="flex items-center gap-2 text-brand-primary"><Folder size={14} /> {article.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{article.title}</h1>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            {article.authorId?.avatar ? (
                                <img src={article.authorId.avatar} className="w-10 h-10 rounded-full" alt="" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-dark-layer2 flex items-center justify-center font-bold text-white">
                                    <User size={20} />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-white">{article.authorId?.name}</p>
                                <p className="text-xs text-dark-muted">Author</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="prose prose-lg prose-invert max-w-none">
                    {/* Render content safely - for now just text, later markdown */}
                    <div className="whitespace-pre-wrap text-dark-text/90 leading-relaxed text-lg">
                        {article.content}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default ArticleDetail;
