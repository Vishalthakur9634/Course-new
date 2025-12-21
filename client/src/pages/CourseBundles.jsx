import React, { useState, useEffect } from 'react';
import { Package, ArrowRight, Star, Users, Clock, Flame, Tags, Sparkles, Loader2 } from 'lucide-react';
import api from '../utils/api';

const CourseBundles = () => {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fallbackBundles = [
        {
            title: 'Full-Stack Mastery Web Hub',
            courses: [{ title: 'React Deep Dive' }, { title: 'Node.js Backend Architecture' }, { title: 'Advanced CSS Orbit' }, { title: 'Database Scaling' }],
            price: 149,
            discountPercentage: 50,
            tag: 'BEST SELLER',
            bg: 'from-brand-primary to-orange-600',
            rating: 4.9,
            students: '1.2k',
            lessons: 145
        },
        {
            title: 'UI/UX Design Space Camp',
            courses: [{ title: 'Figma Fundamentals' }, { title: 'Prototyping Motion' }, { title: 'User Psychology' }, { title: 'Design Systems' }],
            price: 99,
            discountPercentage: 50,
            tag: 'TRENDING',
            bg: 'from-purple-500 to-indigo-600',
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

    return (
        <div className="max-w-7xl mx-auto space-y-20 py-12">
            <header className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/10 pb-16">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
                        <Package size={16} /> Course Bundles
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">Bundled Knowledge. <br /><span className="text-brand-primary italic">Massive Savings.</span></h1>
                        <p className="text-dark-muted max-w-xl text-lg font-medium leading-relaxed">Level up faster by mastering multiple related skills at once with our curated expert bundles at half the cost.</p>
                    </div>
                </div>
                <div className="hidden xl:block">
                    <div className="bg-dark-layer1 p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-10 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-center relative z-10">
                            <p className="text-5xl font-black text-white tracking-tighter">40+</p>
                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] mt-1">Curated Bundles</p>
                        </div>
                        <div className="h-16 w-px bg-white/10 relative z-10"></div>
                        <div className="text-center relative z-10">
                            <p className="text-5xl font-black text-brand-primary tracking-tighter">60%</p>
                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] mt-1">Avg. Savings</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                        <p className="text-dark-muted font-bold tracking-widest uppercase">Syncing Orbital Bundles...</p>
                    </div>
                ) : bundles.map((bundle, i) => {
                    const originalPrice = bundle.discountPercentage > 0
                        ? (bundle.price / (1 - bundle.discountPercentage / 100)).toFixed(0)
                        : bundle.price;

                    return (
                        <div key={i} className="group relative bg-dark-layer1 border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-brand-primary/10">
                            <div className="grid grid-cols-1 xl:grid-cols-12">
                                <div className={`xl:col-span-5 bg-gradient-to-br ${bundle.bg || 'from-brand-primary to-orange-600'} p-16 flex flex-col justify-between relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                                        <Package size={280} className="text-white" />
                                    </div>
                                    <div className="relative z-10 space-y-8">
                                        {bundle.tag && <span className="px-5 py-2 bg-white/15 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-white/10 shadow-lg">{bundle.tag}</span>}
                                        <h2 className="text-5xl font-black text-white leading-[1] tracking-tighter drop-shadow-lg">{bundle.title}</h2>
                                        <div className="flex items-center gap-6 text-white font-bold bg-black/10 w-fit px-6 py-2.5 rounded-2xl backdrop-blur-sm border border-white/5 shadow-inner">
                                            <div className="flex items-center gap-2"><Star size={18} fill="currentColor" strokeWidth={0} /> {bundle.rating || 4.9}</div>
                                            <div className="h-4 w-px bg-white/20"></div>
                                            <div className="flex items-center gap-2"><Users size={18} strokeWidth={3} /> {bundle.students || (Math.random() * 1000).toFixed(0)} Students</div>
                                        </div>
                                    </div>
                                    <div className="relative z-10 pt-16">
                                        {bundle.discountPercentage > 0 && <p className="text-white/60 text-sm font-black uppercase tracking-[0.3em] line-through decoration-white/40 decoration-2 mb-2">${originalPrice}</p>}
                                        <div className="flex items-center gap-5">
                                            <p className="text-7xl font-black text-white tracking-widest leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">${bundle.price}</p>
                                            {bundle.discountPercentage > 0 && <span className="px-5 py-2 bg-white text-dark-bg text-[10px] font-black rounded-[0.75rem] shadow-xl animate-bounce uppercase tracking-widest">{bundle.discountPercentage}% OFF</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="xl:col-span-7 p-12 lg:p-16 space-y-12 bg-dark-layer1/50 backdrop-blur-xl">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-dark-muted uppercase tracking-[0.5em] ml-1">Included in this Master-Bundle</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {bundle.courses.map((course, j) => (
                                                <div key={j} className="flex items-center gap-4 p-5 bg-dark-layer2/30 border border-white/5 rounded-3xl group/item hover:bg-dark-layer2 hover:border-brand-primary/30 transition-all duration-300">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-dark-muted group-hover/item:bg-brand-primary group-hover/item:text-dark-bg transition-all duration-300 shadow-inner">
                                                        <Flame size={24} />
                                                    </div>
                                                    <p className="text-base font-black text-white tracking-tight group-hover/item:text-brand-primary transition-colors">{course.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
                                        <div className="flex items-center gap-10 text-dark-muted font-bold text-sm">
                                            <div className="flex items-center gap-2.5"><Clock size={20} className="text-brand-primary" /> {bundle.lessons || 120} Dynamic Lessons</div>
                                            <div className="flex items-center gap-2.5"><Tags size={20} className="text-brand-primary" /> Lifetime Access</div>
                                        </div>
                                        <button className="w-full sm:w-auto px-12 py-5 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-primary/20 uppercase tracking-[0.2em] text-sm active:scale-95 group/btn">
                                            Unlock Bundle <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 rounded-[4rem] p-16 lg:p-24 relative overflow-hidden text-center space-y-10 shadow-2xl border border-white/10 group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 animate-pulse-slow"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-primary/20 blur-[150px] rounded-full"></div>
                <div className="relative z-10 space-y-8">
                    <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/10 group-hover:rotate-12 transition-transform duration-700 shadow-2xl">
                        <Sparkles size={48} className="text-white animate-pulse" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">Custom Bundle Creator</h2>
                    <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed italic">Want something unique? Pick any 5 courses and get a <span className="text-white font-black underline decoration-brand-primary decoration-4 underline-offset-8">personalized 40% discount</span> automatically applied at checkout.</p>
                    <button className="px-16 py-6 bg-white text-indigo-700 font-black rounded-[2rem] text-xl hover:scale-110 transition-all shadow-[0_20px_60px_rgba(255,161,22,0.3)] uppercase tracking-[0.3em] relative group/sub overflow-hidden hover:bg-brand-primary hover:text-dark-bg">
                        <span className="relative z-10">Start Building Bundle</span>
                        <div className="absolute inset-0 bg-white blur-3xl -z-10 opacity-0 group-hover/sub:opacity-100 transition-opacity"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseBundles;
