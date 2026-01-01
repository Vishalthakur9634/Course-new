import React, { useState, useEffect } from 'react';
import { Database, FileText, Download, Lock, Search, Filter, Shield, Info, HardDrive, Cpu, MoreVertical, GraduationCap, FileCode, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const ResourceVault = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await api.get('/content/vault');
                setResources(res.data);
            } catch (error) {
                console.error("Error fetching vault items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    const filteredResources = resources.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-32 px-4 md:px-8 font-inter text-white">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-10">
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight flex items-center gap-4">
                        Curriculum <span className="text-brand-primary">Resources</span>
                    </h1>
                    <p className="text-[10px] text-dark-muted font-bold tracking-[0.3em] uppercase opacity-70">Unified Repository for Course Materials and Documentation</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Filter Resources..."
                        className="w-full bg-[#141414] border border-white/5 rounded-xl py-3.5 pl-12 pr-5 text-white font-bold text-xs uppercase tracking-widest focus:border-brand-primary/40 outline-none transition-all shadow-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Stats Sidebar */}
                <aside className="space-y-8">
                    <div className="bg-[#141414] p-8 rounded-2xl border border-white/5 space-y-8 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-bold text-dark-muted uppercase tracking-widest opacity-60">Storage Utilization</h3>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(255,161,22,0.4)]" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-dark-muted">Current Load</span>
                                    <span className="text-white">74.2%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-primary" style={{ width: '74.2%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#141414] p-8 rounded-2xl border border-white/5 space-y-6 shadow-2xl">
                        <h3 className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em] opacity-60">Access Matrix</h3>
                        {[
                            { label: 'Public Access', count: 12, color: 'text-brand-primary' },
                            { label: 'Enrolled Only', count: 8, color: 'text-white' },
                            { label: 'Restricted', count: 3, color: 'text-dark-muted' }
                        ].map(zone => (
                            <div key={zone.label} className="flex justify-between items-center font-bold text-[11px] tracking-tight">
                                <span className="text-dark-muted uppercase opacity-70">{zone.label}</span>
                                <span className={`${zone.color} tracking-widest`}>{zone.count}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* File List */}
                <div className="lg:col-span-3">
                    <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/[0.01] text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em] border-b border-white/5">
                                        <th className="px-8 py-6">Asset Specification</th>
                                        <th className="px-8 py-6">Volume</th>
                                        <th className="px-8 py-6">Classification</th>
                                        <th className="px-8 py-6">Synchronized</th>
                                        <th className="px-8 py-6 text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredResources.length > 0 ? filteredResources.map(file => (
                                        <tr key={file.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-dark-bg group-hover:border-brand-primary transition-all shadow-lg">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight leading-none">{file.name}</div>
                                                        <div className="text-[9px] font-bold text-dark-muted uppercase tracking-widest opacity-40">{file.type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-[11px] font-bold text-dark-muted tracking-tight">{file.size}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${file.security === 'Unrestricted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    file.security === 'Restricted' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                                                    }`}>
                                                    {file.security}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-[11px] font-bold text-dark-muted opacity-60">{file.date}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2.5 bg-white/5 hover:bg-brand-primary/20 rounded-xl text-brand-primary border border-white/5 transition-all shadow-md">
                                                        <Download size={16} />
                                                    </button>
                                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-dark-muted border border-white/5 transition-all">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-40 text-center space-y-4">
                                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-dark-muted opacity-10">
                                                    <FileCode size={48} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-bold text-white uppercase tracking-tight">No Matches Detected</p>
                                                    <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest opacity-40">Refine search parameters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
                {[
                    { icon: <HardDrive size={22} />, title: "Curriculum Assets", subtitle: "Strategic documentation", color: "text-brand-primary" },
                    { icon: <FileCode size={22} />, title: "Project Source", subtitle: "Technical binaries & samples", color: "text-white" },
                    { icon: <CheckCircle size={22} />, title: "Verified Delivery", subtitle: "Encrypted material access", color: "text-white" }
                ].map((feature, i) => (
                    <div key={i} className="bg-[#141414] p-8 rounded-3xl border border-white/5 hover:border-brand-primary/20 transition-all cursor-pointer group shadow-xl">
                        <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${feature.color} group-hover:bg-brand-primary group-hover:text-dark-bg transition-all shadow-lg`}>
                                {feature.icon}
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-white uppercase tracking-tight">{feature.title}</h4>
                                <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest opacity-60">{feature.subtitle}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResourceVault;
