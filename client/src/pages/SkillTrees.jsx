import React from 'react';
import { GitBranch, Box, Lock, Unlock, Database, Zap, ArrowRight, Shield } from 'lucide-react';

const SkillTrees = () => {
    const trees = [
        {
            id: 'frontend',
            title: 'Frontend Dominance',
            icon: <Zap size={24} />,
            color: 'brand-primary',
            nodes: [
                { id: 1, title: 'HTML/CSS Mastery', status: 'completed', level: 1 },
                { id: 2, title: 'JS Runtime Logic', status: 'completed', level: 2 },
                { id: 3, title: 'React Core Engine', status: 'in-progress', level: 3 },
                { id: 4, title: 'Quantum UI Design', status: 'locked', level: 4 },
                { id: 5, title: 'Neural Frontend', status: 'locked', level: 5 }
            ]
        },
        {
            id: 'backend',
            title: 'Storage Core Architect',
            icon: <Database size={24} />,
            color: 'quantum-purple',
            nodes: [
                { id: 1, title: 'NodeJS Protocols', status: 'completed', level: 1 },
                { id: 2, title: 'Auth Security Layers', status: 'in-progress', level: 2 },
                { id: 3, title: 'NoSQL Clusters', status: 'locked', level: 3 },
                { id: 4, title: 'Micro-Engine Mesh', status: 'locked', level: 4 }
            ]
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-12">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        SKILL <span className="text-brand-primary">TREES</span>
                    </h1>
                    <p className="text-dark-muted font-bold tracking-widest uppercase text-xs mt-2 opacity-60">Architectural Learning Progression</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="p-4 glass-panel rounded-2xl text-center min-w-[120px]">
                        <div className="text-xs text-dark-muted font-black uppercase mb-1">Rank</div>
                        <div className="text-2xl font-black text-brand-primary">Master</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {trees.map(tree => (
                    <div key={tree.id} className="glass-panel rounded-[40px] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                            {tree.icon}
                        </div>

                        <div className="flex items-center gap-4 mb-10">
                            <div className={`w-14 h-14 rounded-2xl bg-${tree.color}/20 border border-${tree.color}/30 flex items-center justify-center text-${tree.color} shadow-lg shadow-${tree.color}/10`}>
                                {tree.icon}
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{tree.title}</h2>
                        </div>

                        <div className="relative space-y-8">
                            <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-white/5 z-0" />

                            {tree.nodes.map((node, idx) => (
                                <div key={node.id} className="flex items-center gap-8 relative z-10 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${node.status === 'completed' ? 'bg-brand-primary border-brand-primary/50 text-dark-bg' :
                                            node.status === 'in-progress' ? 'bg-dark-layer2 border-brand-primary animate-pulse' :
                                                'bg-dark-layer2 border-white/5 text-dark-muted'
                                        }`}>
                                        {node.status === 'completed' ? <Shield size={20} /> : <Box size={20} />}
                                    </div>

                                    <div className="flex-1 glass-panel p-5 rounded-2xl border-white/5 hover:border-white/20 transition-all cursor-pointer group/node">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1">Level {node.level}</div>
                                                <h3 className={`text-lg font-black transition-colors ${node.status === 'locked' ? 'text-dark-muted' : 'text-white'}`}>
                                                    {node.title}
                                                </h3>
                                            </div>
                                            {node.status !== 'locked' && (
                                                <ArrowRight size={20} className="text-brand-primary opacity-0 group-hover/node:opacity-100 group-hover/node:translate-x-1 transition-all" />
                                            )}
                                            {node.status === 'locked' && <Lock size={18} className="text-dark-muted" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel p-8 rounded-[40px] border-brand-primary/10 bg-gradient-to-br from-brand-primary/5 to-transparent">
                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    <div className="w-20 h-20 bg-brand-primary/20 rounded-3xl flex items-center justify-center text-brand-primary shadow-2xl shadow-brand-primary/20">
                        <Sparkles size={40} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Transmission Sync Complete</h3>
                        <p className="text-dark-muted mt-2 font-bold max-w-xl">Your neural learning paths are optimized. Continue your progression to unlock advanced quantum specializations.</p>
                    </div>
                    <button className="px-10 py-5 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/30 uppercase tracking-widest">
                        Initialize Mission
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillTrees;
