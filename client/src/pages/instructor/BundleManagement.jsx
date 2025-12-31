import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, Search, Flame, Loader2, Sparkles, Check, X } from 'lucide-react';
import api from '../../utils/api';

const BundleManagement = () => {
    const [bundles, setBundles] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        discountPercentage: '10',
        tag: 'NEW BUNDLE',
        bg: 'from-brand-primary to-orange-600'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bundleRes, courseRes] = await Promise.all([
                api.get('/mega/bundles/my-bundles'),
                api.get('/instructor/courses')
            ]);
            setBundles(bundleRes.data || []);
            setCourses(courseRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCourse = (courseId) => {
        if (selectedCourses.includes(courseId)) {
            setSelectedCourses(selectedCourses.filter(id => id !== courseId));
        } else {
            setSelectedCourses([...selectedCourses, courseId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedCourses.length < 2) {
            return alert('Select at least 2 courses to create a bundle');
        }

        const data = {
            ...formData,
            courses: selectedCourses,
            price: Number(formData.price),
            discountPercentage: Number(formData.discountPercentage)
        };

        try {
            await api.post('/mega/bundles', data);
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Bundle creation error:', error);
            alert(error.response?.data?.message || 'Error creating bundle: ' + error.message);
        }
    };

    const handleDelete = async (bundleId) => {
        if (!window.confirm('Are you sure you want to delete this bundle?')) return;
        try {
            await api.delete(`/mega/bundles/${bundleId}`);
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting bundle');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            discountPercentage: '10',
            tag: 'NEW BUNDLE',
            bg: 'from-brand-primary to-orange-600'
        });
        setSelectedCourses([]);
    };

    if (loading) return <div className="flex items-center justify-center h-96 text-white"><Loader2 className="animate-spin mr-2" /> Loading Bundles...</div>;

    return (
        <div className="space-y-8 p-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white">Bundle Creator</h1>
                    <p className="text-dark-muted">Package your courses together and offer exclusive deals</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-dark-bg font-bold rounded-xl hover:bg-brand-hover transition-all"
                >
                    <Plus size={20} /> Create New Bundle
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bundles.map((bundle) => (
                    <div key={bundle._id} className="bg-dark-layer1 border border-white/10 rounded-[2.5rem] p-8 flex flex-col group hover:border-brand-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-3xl bg-gradient-to-br ${bundle.bg} text-white shadow-lg`}>
                                <Package size={32} />
                            </div>
                            <button
                                onClick={() => handleDelete(bundle._id)}
                                className="p-2 hover:bg-red-500/10 rounded-xl text-red-400 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        <div className="space-y-4 flex-1">
                            <h3 className="text-2xl font-black text-white leading-tight">{bundle.title}</h3>
                            <div className="flex flex-wrap gap-2">
                                {bundle.courses.map(c => (
                                    <span key={c._id} className="text-[10px] font-bold bg-dark-layer2 px-2 py-1 rounded-lg text-dark-muted border border-white/5">{c.title}</span>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <span className="text-3xl font-black text-white">${bundle.price}</span>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-black rounded-lg">-{bundle.discountPercentage}%</span>
                            </div>
                        </div>
                    </div>
                ))}
                {bundles.length === 0 && (
                    <div className="col-span-2 py-20 bg-dark-layer2/10 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center space-y-4">
                        <div className="p-6 bg-white/5 rounded-full text-dark-muted"><Package size={48} /></div>
                        <p className="text-dark-muted font-black uppercase tracking-widest text-sm">No Bundles Created Yet</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-dark-layer1 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] flex flex-col">
                        <div className="p-10 pb-0 flex justify-between items-center">
                            <h2 className="text-3xl font-black text-white">Create Mastery Bundle</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-dark-muted"><X size={24} /></button>
                        </div>

                        <div className="p-10 flex-1 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Bundle Title</label>
                                        <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Full-Stack Web Mastery" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Description</label>
                                        <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none h-32" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Bundle Price ($)</label>
                                            <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Discount (%)</label>
                                            <input type="number" required value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Select Courses ({selectedCourses.length})</label>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {courses.map(course => (
                                            <div
                                                key={course._id}
                                                onClick={() => toggleCourse(course._id)}
                                                className={`p-4 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${selectedCourses.includes(course._id) ? 'border-brand-primary bg-brand-primary/5' : 'border-white/5 bg-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCourses.includes(course._id) ? 'bg-brand-primary text-dark-bg' : 'bg-dark-layer1 text-dark-muted'}`}>
                                                    {selectedCourses.includes(course._id) ? <Check size={18} strokeWidth={4} /> : <Plus size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-white line-clamp-1">{course.title}</p>
                                                    <p className="text-[10px] text-dark-muted">${course.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6">
                                        <button type="submit" className="w-full py-5 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover shadow-xl shadow-brand-primary/20 transition-all uppercase tracking-[0.2em]">Publish Bundle</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BundleManagement;
