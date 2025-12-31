import React, { useState } from 'react';
import { Database, FileText, Download, Lock, Search, Filter, Shield, Info, HardDrive, Cpu, MoreVertical } from 'lucide-react';

const ResourceVault = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const resources = [
        { id: 1, name: 'Core_Logic_Module_01.pdf', size: '2.4 MB', type: 'PDF', security: 'Unrestricted', date: '2025.12.30' },
        { id: 2, name: 'Neural_Network_Draft.docx', size: '1.8 MB', type: 'DOCX', security: 'Level 2', date: '2025.12.28' },
        { id: 3, name: 'System_Architecture_Final.png', size: '15.2 MB', type: 'PNG', security: 'Level 4', date: '2025.12.25' },
        { id: 4, name: 'Database_Schema_Encrypted.sql', size: '4.1 MB', type: 'SQL', security: 'Unrestricted', date: '2025.12.20' },
        { id: 5, name: 'Secret_Project_Orbit.zip', size: '124 MB', type: 'ZIP', security: 'Restricted', date: '2025.12.15' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col h-full gap-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 uppercase italic">
                        <Database className="text-quantum-purple" size={36} />
                        RESOURCE <span className="text-quantum-purple">VAULT</span>
                    </h1>
                    <p className="text-dark-muted font-bold tracking-[0.2em] uppercase text-[10px] mt-2 opacity-60">Storage Area Network // Decrypted Storage Core</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative group min-w-[280px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-quantum-purple transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Scan storage nodes..."
                            className="w-full bg-dark-layer1 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white font-bold text-sm focus:border-quantum-purple outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-5 py-3 glass-panel rounded-2xl text-white font-bold text-sm hover:border-quantum-purple transition-all">
                        <Filter size={18} className="text-quantum-purple" />
                        <span>Filter Matrix</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Sidebar */}
                <aside className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border-quantum-purple/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest">Core Integrity</h3>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-white mb-2 uppercase tracking-tighter">
                                    <span>Sector Load</span>
                                    <span>74.2%</span>
                                </div>
                                <div className="h-2 bg-dark-layer2 rounded-full overflow-hidden">
                                    <div className="h-full bg-quantum-purple w-[74.2%] shadow-[0_0_10px_rgba(189,0,255,0.4)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border-white/5">
                        <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest mb-6">Security Zones</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Public Nodes', count: 12, color: 'text-brand-primary' },
                                { label: 'Level 2 Clearance', count: 8, color: 'text-stellar-gold' },
                                { label: 'Restricted Storage', count: 3, color: 'text-red-500' }
                            ].map(zone => (
                                <div key={zone.label} className="flex justify-between items-center font-bold text-sm">
                                    <span className="text-dark-muted">{zone.label}</span>
                                    <span className={`${zone.color}`}>{zone.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* File List */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="glass-panel rounded-3xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">
                                    <th className="px-6 py-5">Node Identity</th>
                                    <th className="px-6 py-5">Size</th>
                                    <th className="px-6 py-5">Clearance</th>
                                    <th className="px-6 py-5">Transmission</th>
                                    <th className="px-6 py-5 text-right px-8">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {resources.map(file => (
                                    <tr key={file.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-dark-layer2 border border-white/5 flex items-center justify-center text-quantum-purple group-hover:bg-quantum-purple/10 group-hover:border-quantum-purple/20 transition-all">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-quantum-purple transition-colors">{file.name}</div>
                                                    <div className="text-[10px] font-black text-dark-muted uppercase tracking-tighter">{file.type} DATAFORM</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-white opacity-60">{file.size}</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter border ${file.security === 'Unrestricted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    file.security === 'Restricted' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-stellar-gold/10 text-stellar-gold border-stellar-gold/20'
                                                }`}>
                                                {file.security}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-dark-muted">{file.date}</td>
                                        <td className="px-6 py-5 text-right px-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-quantum-purple/10 rounded-lg text-quantum-purple transition-colors" title="Download Transmission">
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-dark-muted transition-colors">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black text-dark-muted uppercase tracking-widest px-4">
                        <div className="flex gap-4">
                            <span>Matrix Ready</span>
                            <span>Latency: 4ms</span>
                        </div>
                        <div>Node ID: ORBIT-V-88</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-[32px] border-brand-primary/10 hover:border-brand-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                            <HardDrive size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Mainframe Storage</h4>
                            <p className="text-xs text-dark-muted font-bold">Cloud Sync Active</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-[32px] border-quantum-purple/10 hover:border-quantum-purple/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-quantum-purple/10 rounded-xl flex items-center justify-center text-quantum-purple group-hover:scale-110 transition-transform">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Processor Core</h4>
                            <p className="text-xs text-dark-muted font-bold">Encrypted Compute</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-[32px] border-stellar-gold/10 hover:border-stellar-gold/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stellar-gold/10 rounded-xl flex items-center justify-center text-stellar-gold group-hover:scale-110 transition-transform">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Security Buffer</h4>
                            <p className="text-xs text-dark-muted font-bold">Bypass Protection</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceVault;
