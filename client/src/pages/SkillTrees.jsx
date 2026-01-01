import React, { useState, useEffect } from 'react';
import { GitBranch, Box, Lock, Unlock, Database, Zap, ArrowRight, Shield, Sparkles, GraduationCap, CheckCircle, BarChart, Target } from 'lucide-react';
import api from '../utils/api';

const SkillTrees = () => {
    const [trees, setTrees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrees = async () => {
            try {
                const res = await api.get('/content/skilltrees');
                setTrees(res.data);
            } catch (error) {
                console.error("Error fetching skill trees:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrees();
    }, []);

    const getIcon = (iconName) => {
        const icons = { GitBranch, Box, Lock, Unlock, Database, Zap, ArrowRight, Shield, Sparkles, GraduationCap, CheckCircle, BarChart, Target };
        return icons[iconName] ? React.createElement(icons[iconName], { size: 24 }) : <BookOpen size={24} />;
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-16 pb-32 px-4 md:px-8 font-inter">
            <header className="flex flex-col md:flex-row items-end justify-between gap-8 py-10">
                <div className="space-y-3 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
                        Curriculum <span className="text-brand-primary">Framework</span>
                    </h1>
                    <p className="text-[10px] text-dark-muted font-bold tracking-[0.3em] uppercase opacity-70">Strategic Learning Paths and Performance Progression</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 text-center min-w-[160px] shadow-xl">
                        <div className="text-[9px] text-dark-muted font-bold uppercase tracking-widest mb-2 opacity-50">Expertise Level</div>
                        <div className="text-2xl font-bold text-brand-primary uppercase tracking-tight">Senior Tier</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {loading ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest animate-pulse">Initializing Path Matrix...</p>
                    </div>
                ) : (
                    trees.map(tree => (
                        <div key={tree._id} className="bg-[#141414] border border-white/5 rounded-3xl p-10 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-700">
                                {getIcon(tree.icon)}
                            </div>

                            <div className="flex items-center gap-6 mb-12">
                                <div className={`w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary transition-all group-hover:bg-brand-primary group-hover:text-dark-bg group-hover:border-brand-primary shadow-xl`}>
                                    {getIcon(tree.icon)}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">{tree.title}</h2>
                                    <p className="text-[9px] font-bold text-dark-muted uppercase tracking-[0.2em] opacity-50">Career Specialization Path</p>
                                </div>
                            </div>

                            <div className="relative space-y-10">
                                <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-white/5 z-0" />

                                {tree.nodes.map((node, idx) => (
                                    <div key={node._id || idx} className="flex items-center gap-10 relative z-10">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${node.status === 'completed' ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary' :
                                            node.status === 'in-progress' ? 'bg-[#0a0a0a] border-brand-primary shadow-brand-primary/20' :
                                                'bg-[#0a0a0a] border-white/5 text-dark-muted'
                                            }`}>
                                            {node.status === 'completed' ? <CheckCircle size={24} /> : node.status === 'locked' ? <Lock size={20} /> : <Zap size={24} />}
                                        </div>

                                        <div className="flex-1 bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-brand-primary/30 transition-all cursor-pointer group/node shadow-lg">
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <div className="text-[9px] font-bold text-dark-muted uppercase tracking-widest opacity-50">Module {node.level}</div>
                                                    <h3 className={`text-xl font-bold uppercase tracking-tight transition-colors ${node.status === 'locked' ? 'text-dark-muted' : 'text-white group-hover/node:text-brand-primary'}`}>
                                                        {node.title}
                                                    </h3>
                                                </div>
                                                {node.status !== 'locked' && (
                                                    <ArrowRight size={20} className="text-brand-primary opacity-0 group-hover/node:opacity-100 group-hover/node:translate-x-1 transition-all" />
                                                )}
                                                {node.status === 'locked' && <Lock size={20} className="text-dark-muted/40" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )))}
            </div>

            <div className="bg-[#141414] border border-white/5 p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10 text-center md:text-left">
                    <div className="w-24 h-24 bg-brand-primary/10 border border-brand-primary/20 rounded-3xl flex items-center justify-center text-brand-primary shadow-xl">
                        <BarChart size={48} />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-white uppercase tracking-tight leading-none">Progression <span className="text-brand-primary">Synchronized</span></h3>
                            <p className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.3em] opacity-50">Strategic learning paths mapped and updated</p>
                        </div>
                        <p className="text-lg text-dark-muted font-medium max-w-2xl opacity-80 leading-relaxed">Your professional journey is being tracked in real-time. Complete modules to unlock advanced specializations and industry certifications.</p>
                    </div>
                    <button className="px-12 py-5 bg-brand-primary text-dark-bg font-bold rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/10 uppercase text-[11px] tracking-widest">
                        Resume Curriculum
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillTrees;
