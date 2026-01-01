import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { PenTool, Plus, Trash2, Eye, Layout, Image as ImageIcon, Video, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstructorArticleManager = () => {
    const { addToast } = useToast();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
        tags: '',
        coverImage: '',
        videoUrl: '',
        isPublished: true
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const { data } = await api.get(`/articles?authorId=${user._id || user.id}`);
            setArticles(data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
            };
            await api.post('/articles', payload);
            fetchArticles();
            setShowModal(false);
            setFormData({
                title: '', content: '', category: 'general', tags: '', coverImage: '', videoUrl: '', isPublished: true
            });
            addToast('Article published successfully!', 'success');
        } catch (error) {
            console.error('Article creation error:', error);
            addToast(error.response?.data?.message || 'Error creating article', 'error');
        }
    };

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Blog Articles</h1>
                    <p className="text-dark-muted mt-2">Share your knowledge with the community</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-xl transition-all"
                >
                    <Plus size={20} /> Write Article
                </button>
            </header>

            {loading ? (
                <div className="text-center py-20 text-dark-muted">Loading articles...</div>
            ) : articles.length === 0 ? (
                <div className="text-center py-20 bg-dark-layer1 border border-white/10 rounded-3xl">
                    <PenTool size={48} className="mx-auto text-dark-muted opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Articles Yet</h3>
                    <p className="text-dark-muted mt-2">Start writing to build your personal brand!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {articles.map(article => (
                        <div key={article._id} className="bg-dark-layer1 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-brand-primary/30 transition-all">
                            <div className="w-full md:w-48 aspect-video bg-dark-layer2 rounded-xl overflow-hidden flex-shrink-0">
                                {article.coverImage ? (
                                    <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-dark-muted"><ImageIcon size={24} /></div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded-lg bg-white/5 text-xs font-bold text-dark-muted uppercase tracking-wider border border-white/5">
                                        {article.category}
                                    </span>
                                    {article.isPublished ? (
                                        <span className="text-green-400 text-xs font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Published</span>
                                    ) : (
                                        <span className="text-yellow-400 text-xs font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Draft</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white truncate">{article.title}</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-dark-muted">
                                    <span className="flex items-center gap-1.5"><Eye size={14} /> {article.views} views</span>
                                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-center">
                                <Link to={`/blog/${article.slug}`} className="p-2 hover:bg-white/5 rounded-lg text-brand-primary transition-colors" title="View">
                                    <Eye size={18} />
                                </Link>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-red-400 transition-colors" title="Delete (Only Admin for now)">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-layer1 rounded-3xl border border-white/10 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white">Write Article</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-dark-muted hover:text-white transition-all whitespace-nowrap">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-dark-muted mb-2">Title</label>
                                <input
                                    required
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white text-lg font-bold focus:border-brand-primary outline-none transition-colors"
                                    placeholder="Enter a catchy title..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-dark-muted mb-2">Category</label>
                                    <select
                                        className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="general">General</option>
                                        <option value="tutorial">Tutorial</option>
                                        <option value="news">News</option>
                                        <option value="career">Career</option>
                                        <option value="tech">Tech</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark-muted mb-2">Cover Image</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="articleCover"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const upData = new FormData();
                                                    upData.append('file', file);
                                                    try {
                                                        const { data } = await api.post('/upload', upData);
                                                        setFormData({ ...formData, coverImage: data.url });
                                                        addToast('Cover image uploaded', 'success');
                                                    } catch (err) {
                                                        addToast('Failed to upload image', 'error');
                                                    }
                                                }
                                            }}
                                        />
                                        <label htmlFor="articleCover" className="flex-1 bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white cursor-pointer hover:border-brand-primary truncate">
                                            {formData.coverImage ? 'Change Image' : 'Upload Image'}
                                        </label>
                                        {formData.coverImage && (
                                            <img src={formData.coverImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-dark-muted mb-2">Video Transmission (Optional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        id="articleVideo"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const upData = new FormData();
                                                upData.append('file', file);
                                                try {
                                                    const { data } = await api.post('/upload', upData);
                                                    setFormData({ ...formData, videoUrl: data.url });
                                                    addToast('Video transmission uploaded', 'success');
                                                } catch (err) {
                                                    addToast('Failed to upload video: ' + (err.response?.data?.message || err.message), 'error');
                                                }
                                            }
                                        }}
                                    />
                                    <label htmlFor="articleVideo" className="flex-1 bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white cursor-pointer hover:border-brand-primary truncate">
                                        {formData.videoUrl ? 'Change Video' : 'Upload Video'}
                                    </label>
                                    {formData.videoUrl && (
                                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                            <Video size={18} className="text-green-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-dark-muted mb-2">Content</label>
                                <textarea
                                    required
                                    className="w-full h-64 bg-dark-layer2 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-brand-primary outline-none resize-none"
                                    placeholder="Write your article content here..."
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                                <p className="text-xs text-dark-muted mt-2 text-right font-bold uppercase tracking-widest text-[10px]">Markdown Encrypted</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-dark-muted mb-2">Tags (comma separated)</label>
                                <input
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none"
                                    placeholder="react, javascript, webdev"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <button type="submit" className="flex-1 bg-brand-primary text-dark-bg font-black py-4 rounded-2xl hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20">Publish Transmission</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-white font-black py-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">Abort</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorArticleManager;
