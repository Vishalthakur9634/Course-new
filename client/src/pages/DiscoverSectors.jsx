import React, { useState } from 'react';
import { Compass, Globe, Zap, Users, Star, Box, ArrowUpRight, Search, Map as MapIcon, Hexagon } from 'lucide-react';

const DiscoverSectors = () => {
    const sectors = [
        { id: 'dev', title: 'Engineering Sector', count: 124, icon: <Zap size={24} />, color: 'brand-primary', desc: 'Code architecture and neural logic systems.' },
        { id: 'design', title: 'Visual Matrix', count: 86, icon: <Hexagon size={24} />, color: 'quantum-purple', desc: 'Quantum aesthetics and interface design.' },
        { id: 'data', title: 'Intelligence Node', count: 53, icon: <Box size={24} />, color: 'stellar-gold', desc: 'Big data analytics and predictive patterns.' },
        { id: 'crypto', title: 'Vault Protocols', count: 42, icon: <Star size={24} />, color: 'red-500', desc: 'Blockchain security and encrypted finance.' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        QUANTUM <span className="text-brand-primary">DISCOVERY</span>
                    </h1>
                    <p className="text-dark-muted font-bold tracking-[0.3em] uppercase text-xs mt-2 opacity-60">Scanning Outer Rim Sectors for New Intel</p>
                </div>

                <div className="glass-panel p-2 rounded-2xl flex gap-1">
                    <button className="px-6 py-2 rounded-xl bg-brand-primary text-dark-bg font-black text-xs uppercase tracking-widest transition-all">Grid Map</button>
                    <button className="px-6 py-2 rounded-xl text-dark-muted hover:text-white font-black text-xs uppercase tracking-widest transition-all">List View</button>
                </div>
            </header>

            <section className="relative h-[300px] md:h-[400px] rounded-[40px] overflow-hidden group">
                {/* Hero Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-quantum-purple/10 to-transparent z-0" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30 grayscale group-hover:scale-105 transition-transform duration-10000" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-sm">
                    <h2 className="text-3xl md:text-6xl font-black text-white tracking-tight mb-6 animate-pulse">
                        EXPLORE THE <span className="text-gradient">UNKNOWN</span>
                    </h2>
                    <div className="max-w-xl mx-auto mb-8 relative group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary" size={20} />
                        <input
                            type="text"
                            placeholder="Initialize sector scan..."
                            className="w-full bg-black/60 border-2 border-brand-primary/30 rounded-[30px] py-6 px-16 text-white text-xl font-bold focus:border-brand-primary focus:shadow-[0_0_30px_rgba(0,242,255,0.2)] outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-6 animate-slide-up">
                        <div className="flex items-center gap-2 text-dark-muted font-black text-[10px] uppercase tracking-widest">
                            <Users size={14} className="text-brand-primary" /> 12K Actives
                        </div>
                        <div className="flex items-center gap-2 text-dark-muted font-black text-[10px] uppercase tracking-widest">
                            <Globe size={14} className="text-quantum-purple" /> 4 Sector Clusters
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sectors.map(sector => (
                    <div key={sector.id} className="glass-panel group relative overflow-hidden p-8 rounded-[40px] border-white/5 hover:border-brand-primary/30 transition-all duration-500 cursor-pointer">
                        {/* Hover Background Pattern */}
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <Hexagon size={160} />
                        </div>

                        <div className={`w-16 h-16 rounded-2xl bg-${sector.color}/10 border border-${sector.color}/20 flex items-center justify-center text-${sector.color} mb-8 group-hover:scale-110 group-hover:bg-${sector.color}/20 transition-all duration-500`}>
                            {sector.icon}
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-brand-primary transition-colors">{sector.title}</h3>
                        <p className="text-sm text-dark-muted font-bold mb-8 leading-relaxed">{sector.desc}</p>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">{sector.count} Intel Nodes</div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-brand-primary group-hover:text-dark-bg transition-all duration-500">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 glass-panel p-8 rounded-[40px] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <MapIcon className="text-brand-primary" size={24} /> Regional Hot Zones
                        </h2>
                        <button className="text-xs font-black text-brand-primary uppercase tracking-widest hover:underline">Scan All</button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-6 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-primary/20 transition-all group cursor-pointer">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                                    <img src={`https://picsum.photos/seed/${i + 10}/200/200`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Quantum React Patterns {i}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Sector Engineering</span>
                                        <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">340 Actives</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="text-dark-muted group-hover:text-brand-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[40px] flex flex-col items-center justify-center text-center bg-gradient-to-b from-quantum-purple/10 to-transparent">
                    <div className="w-24 h-24 bg-quantum-purple/20 rounded-[30px] flex items-center justify-center text-quantum-purple mb-8 relative">
                        <Hexagon size={48} className="animate-spin-slow" />
                        <Compass className="absolute text-white" size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Neural Guidance</h3>
                    <p className="text-dark-muted font-bold text-sm mb-10 leading-relaxed px-4">Initialize your neural sync to receive personalized sector recommendations based on your current mission parameters.</p>
                    <button className="w-full py-5 bg-quantum-purple text-white font-black rounded-2xl hover:bg-quantum-purple/80 transition-all shadow-xl shadow-quantum-purple/20 uppercase tracking-widest">Initialize Sync</button>
                </div>
            </div>
        </div>
    );
};

export default DiscoverSectors;
