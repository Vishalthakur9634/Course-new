import React, { useState, useEffect } from 'react';
import { Compass, Globe, Zap, Users, Star, Box, ArrowUpRight, Search, Map as MapIcon, Hexagon, Database, Code, Cpu, Target, Layers } from 'lucide-react';
import api from '../utils/api';

const DiscoverSectors = () => {
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const res = await api.get('/content/sectors');
                setSectors(res.data);
            } catch (error) {
                console.error("Error fetching sectors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSectors();
    }, []);

    const getIcon = (iconName) => {
        const icons = { Zap, Hexagon, Box, Star, Database, Code, Cpu, Globe, Target, Layers };
        return icons[iconName] ? React.createElement(icons[iconName], { size: 28 }) : <Layers size={28} />;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-20 pb-40 px-4 md:px-8 font-inter text-white">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 py-12">
                <div className="space-y-3 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tight leading-none">
                        Strategic <span className="text-brand-primary">Domains</span>
                    </h1>
                    <p className="text-[10px] text-dark-muted font-bold tracking-[0.3em] uppercase opacity-70">Comprehensive Specialization Matrix and Skill Domains</p>
                </div>

                <div className="bg-[#141414] p-1.5 rounded-2xl border border-white/5 flex gap-1.5 shadow-xl">
                    <button className="px-8 py-3 rounded-xl bg-brand-primary text-dark-bg font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/10">Matrix View</button>
                    <button className="px-8 py-3 rounded-xl text-dark-muted hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all">Registry View</button>
                </div>
            </header>

            <section className="relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden group shadow-3xl border border-white/5">
                <div className="absolute inset-0 bg-[#0a0a0a]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-10000 group-hover:scale-110"
                />

                <div className="relative z-20 h-full flex flex-col items-start justify-center p-12 md:p-24 max-w-3xl space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase leading-none">
                            Curated <span className="text-brand-primary">Specializations</span>
                        </h2>
                        <p className="text-dark-muted font-medium text-lg leading-relaxed max-w-xl opacity-80">
                            Navigate through specialized technical frameworks and industry-leading skill paths. Find your core professional focus.
                        </p>
                    </div>
                    <div className="relative w-full max-w-xl">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary" size={24} />
                        <input
                            type="text"
                            placeholder="SEARCH SPECIALIZATION DOMAINS..."
                            className="w-full bg-[#141414]/90 backdrop-blur-md border border-white/10 rounded-2xl py-5 px-16 text-white text-base font-bold tracking-tight focus:border-brand-primary/50 outline-none transition-all shadow-2xl"
                        />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {sectors.map(sector => (
                    <div key={sector.id} className="bg-[#141414] group relative overflow-hidden p-10 rounded-3xl border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer shadow-2xl">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none">
                            {sector.icon || <Layers size={80} />}
                        </div>

                        <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary mb-10 group-hover:bg-brand-primary group-hover:text-dark-bg group-hover:border-brand-primary transition-all shadow-xl`}>
                            {sector.icon || <Layers size={28} />}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">{sector.title}</h3>
                            <p className="text-sm text-dark-muted font-medium leading-[1.6] opacity-70 group-hover:opacity-100 transition-opacity line-clamp-3">{sector.desc}</p>
                        </div>

                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                            <div className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em] opacity-50">{sector.count} Modules Indexed</div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-brand-primary group-hover:text-dark-bg group-hover:border-brand-primary transition-all shadow-lg">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10">
                <div className="lg:col-span-2 bg-[#141414] p-12 rounded-3xl border border-white/5 shadow-2xl space-y-12">
                    <div className="flex justify-between items-center bg-[#0a0a0a]/40 -mx-12 -mt-12 p-8 border-b border-white/5 px-12">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
                                <Target className="text-brand-primary" size={32} /> Strategic Frameworks
                            </h2>
                            <p className="text-[9px] font-bold text-dark-muted uppercase tracking-[0.3em] opacity-50">Recommended High-Fidelity Learning Paths</p>
                        </div>
                        <button className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] hover:underline">Access Catalog</button>
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-8 p-6 rounded-2xl bg-[#0a0a0a]/30 border border-white/5 hover:border-brand-primary/30 transition-all group cursor-pointer shadow-lg backdrop-blur-sm">
                                <div className="w-20 h-20 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-white/5 shadow-inner">
                                    <img src={`https://picsum.photos/seed/${i + 15}/300/300`} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h4 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">Strategic Curriculum {i}</h4>
                                    <div className="flex items-center gap-6">
                                        <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-lg border border-brand-primary/20">Technical Stream</span>
                                        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest opacity-60 flex items-center gap-2">
                                            <Users size={12} /> {120 * i} Professionals Active
                                        </span>
                                    </div>
                                </div>
                                <ArrowUpRight className="text-dark-muted group-hover:text-brand-primary transition-colors" size={24} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#141414] p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" />
                    <div className="w-24 h-24 bg-brand-primary/10 border border-brand-primary/20 rounded-3xl flex items-center justify-center text-brand-primary mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <Compass size={48} />
                    </div>
                    <div className="space-y-4 mb-12">
                        <h3 className="text-3xl font-bold text-white uppercase tracking-tight">AI Navigation</h3>
                        <p className="text-sm text-dark-muted font-medium leading-relaxed px-6 opacity-70">Secure personalized domain guidance based on professional performance metrics and career objectives.</p>
                    </div>
                    <button className="w-full py-5 bg-brand-primary text-dark-bg font-bold rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-brand-primary/20 uppercase tracking-[0.2em] text-[10px]">Initiate Evaluation</button>
                </div>
            </div>
        </div>
    );
};

export default DiscoverSectors;
