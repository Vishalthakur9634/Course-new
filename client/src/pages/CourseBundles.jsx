import React, { useState, useEffect } from 'react';
import { Package, ArrowRight, Star, Users, Clock, Flame, Tags, Sparkles, Loader2, Target, Shield, Activity, Layers } from 'lucide-react';
import api from '../utils/api';

const CourseBundles = () => {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fallbackBundles = [
        {
            title: 'Full-Stack Technical Architecture',
            courses: [{ title: 'Engine Performance' }, { title: 'Node.js Systems' }, { title: 'Advanced CSS Structures' }, { title: 'Schema Design' }],
            price: 149,
            discountPercentage: 50,
            tag: 'CORE CURRICULUM',
            bg: 'from-[#141414] to-[#0a0a0a]',
            rating: 4.9,
            students: '1.2k',
            lessons: 145
        },
        {
            title: 'Strategic UI/UX Design',
            courses: [{ title: 'Design Axioms' }, { title: 'System Prototyping' }, { title: 'User Analysis' }, { title: 'Interface Assets' }],
            price: 99,
            discountPercentage: 50,
            tag: 'RECOGNIZED',
            bg: 'from-[#141414] to-[#0a0a0a]',
            rating: 4.8,
            students: '800',
            lessons: 92
        }
    ];

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const response = await api.get('/mega/bundles');
                if (response.data && response.data.length > 0) {
                    setBundles(response.data);
                } else {
                    setBundles(fallbackBundles);
                }
            } catch (error) {
                console.error('Error fetching bundles:', error);
                setBundles(fallbackBundles);
            } finally {
                setLoading(false);
            }
        };
        fetchBundles();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-24 py-16 px-4 md:px-8 font-inter text-white pb-40">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-16">
                <div className="space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-[0.3em]">
                        <Package size={16} /> Strategic Bundles
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-7xl font-bold tracking-tight uppercase leading-none">
                            Curated <span className="text-brand-primary">Tracks</span>
                        </h1>
                        <p className="text-lg text-dark-muted max-w-2xl font-medium leading-relaxed opacity-80">
                            Master high-performance technical domains with our expert-architected curriculum tracks. Optimized for professional advancement.
                        </p>
                    </div>
                </div>
                <div className="hidden xl:block">
                    <div className="bg-[#141414] p-10 rounded-3xl border border-white/5 flex items-center gap-12 shadow-3xl group hover:border-brand-primary/20 transition-all">
                        <div className="text-center space-y-1">
                            <p className="text-4xl font-bold text-white tracking-tighter">40+</p>
                            <p className="text-[9px] font-bold text-dark-muted uppercase tracking-[0.3em] opacity-50">Paths Active</p>
                        </div>
                        <div className="h-12 w-px bg-white/5"></div>
                        <div className="text-center space-y-1">
                            <p className="text-4xl font-bold text-brand-primary tracking-tighter">60%</p>
                            <p className="text-[9px] font-bold text-dark-muted uppercase tracking-[0.3em] opacity-50">Max Delta</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-20">
                {bundles.map((bundle, i) => {
                    const originalPrice = bundle.discountPercentage > 0
                        ? (bundle.price / (1 - bundle.discountPercentage / 100)).toFixed(0)
                        : bundle.price;

                    return (
                        <div key={i} className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl transition-all hover:border-brand-primary/30 group">
                            <div className="grid grid-cols-1 lg:grid-cols-12">
                                <div className="lg:col-span-4 bg-[#0a0a0a]/40 p-12 md:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="space-y-8 relative z-10">
                                        {bundle.tag && <span className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-lg">{bundle.tag}</span>}
                                        <h2 className="text-4xl font-bold text-white tracking-tight uppercase leading-tight group-hover:text-brand-primary transition-colors">{bundle.title}</h2>
                                        <div className="flex items-center gap-6 text-dark-muted font-bold text-[11px] uppercase tracking-widest opacity-60">
                                            <div className="flex items-center gap-2"><Star size={16} className="text-yellow-500" fill="currentColor" /> {bundle.rating || 4.9}</div>
                                            <div className="flex items-center gap-2"><Users size={16} /> {bundle.students || '1.1K'} Synchronized</div>
                                        </div>
                                    </div>
                                    <div className="pt-16 relative z-10">
                                        {bundle.discountPercentage > 0 && <p className="text-dark-muted text-sm font-bold uppercase tracking-[0.2em] line-through mb-2 opacity-50">${originalPrice}</p>}
                                        <div className="flex items-end gap-5">
                                            <p className="text-7xl font-bold text-white tracking-tighter leading-none">${bundle.price}</p>
                                            {bundle.discountPercentage > 0 && <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold rounded-lg mb-2 uppercase tracking-widest shadow-md">{bundle.discountPercentage}% Optimization</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-8 p-12 md:p-16 space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                            <Layers size={18} className="text-brand-primary" />
                                            <h3 className="text-[11px] font-bold text-dark-muted uppercase tracking-[0.3em]">Syllabus Matrix Components</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {bundle.courses.map((course, j) => (
                                                <div key={j} className="flex items-center gap-5 p-5 bg-[#0a0a0a]/30 border border-white/5 rounded-2xl group/item hover:border-brand-primary/40 transition-all shadow-lg backdrop-blur-sm">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-dark-muted group-hover/item:text-brand-primary group-hover/item:bg-brand-primary/10 transition-all">
                                                        <Activity size={24} />
                                                    </div>
                                                    <p className="text-[13px] font-bold text-white tracking-tight group-hover/item:text-brand-primary transition-colors uppercase leading-tight line-clamp-2">{course.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
                                        <div className="flex items-center gap-10 text-dark-muted font-bold text-[11px] uppercase tracking-widest opacity-60">
                                            <div className="flex items-center gap-3"><Clock size={18} className="text-brand-primary" /> {bundle.lessons || 120} Duration Units</div>
                                            <div className="flex items-center gap-3"><Shield size={18} className="text-brand-primary" /> Verified Access</div>
                                        </div>
                                        <button className="w-full sm:w-auto px-12 py-4 bg-brand-primary text-dark-bg font-bold rounded-xl transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-brand-primary/20 hover:brightness-110 active:scale-95 group/btn">
                                            Initiate Enrollment <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Strategic Track Composer */}
            <div className="bg-[#141414] rounded-[3rem] p-16 md:p-24 relative overflow-hidden text-center space-y-10 border border-white/5 shadow-3xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/[0.05] to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-10">
                    <div className="w-24 h-24 bg-brand-primary/10 border border-brand-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                        <Sparkles size={48} className="text-brand-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase leading-none">Track <span className="text-brand-primary">Composer</span></h2>
                        <p className="text-xl text-dark-muted max-w-3xl mx-auto font-medium leading-relaxed opacity-80">
                            Customize your professional progression. Select any 5 modules to architect a personalized track and receive an <span className="text-white font-bold border-b-2 border-brand-primary/40 text-2xl px-2">Automatic 40% Delta</span>.
                        </p>
                    </div>
                    <button className="px-16 py-5 bg-white text-dark-bg font-bold rounded-2xl text-[11px] hover:bg-brand-primary transition-all shadow-3xl uppercase tracking-[0.3em] shadow-white/5 hover:shadow-brand-primary/20 active:scale-95">
                        Initiate Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseBundles;
