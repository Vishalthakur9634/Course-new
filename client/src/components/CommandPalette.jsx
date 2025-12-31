import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, X, Book, User, Settings, ArrowRight, Zap, Sparkles, Globe, Cpu, GitBranch, Database } from 'lucide-react';
import api from '../utils/api';

const CommandPalette = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // Default Quick Commands
    const quickCommands = [
        { id: 'sectors', title: 'Scan Sectors', icon: <Globe size={18} />, path: '/discover-sectors', category: 'Mission' },
        { id: 'tutor', title: 'Consult Neural Tutor', icon: <Cpu size={18} />, path: '/intelligent-tutor', category: 'Intelligence' },
        { id: 'skills', title: 'View Skill Trees', icon: <GitBranch size={18} />, path: '/skill-paths', category: 'Progression' },
        { id: 'vault', title: 'Access Resource Vault', icon: <Database size={18} />, path: '/storage-vault', category: 'Storage' },
        { id: 'profile', title: 'Account Settings', icon: <Settings size={18} />, path: '/profile', category: 'System' },
    ];

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                isOpen ? onClose() : null; // Parent will handle opening
            }
            if (!isOpen) return;

            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (results.length + quickCommands.length));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + (results.length + quickCommands.length)) % (results.length + quickCommands.length));
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const allItems = [...quickCommands, ...results];
                if (allItems[selectedIndex]) {
                    handleNavigate(allItems[selectedIndex].path);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const { data } = await api.get('/courses');
                const filtered = data.filter(c =>
                    c.title.toLowerCase().includes(query.toLowerCase()) ||
                    c.category.toLowerCase().includes(query.toLowerCase())
                ).map(c => ({
                    id: c._id,
                    title: c.title,
                    category: 'Curriculum',
                    path: `/course/${c._id}`,
                    icon: <Book size={18} />
                })).slice(0, 5);
                setResults(filtered);
            } catch (err) {
                console.error('Command search error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 200);
        return () => clearTimeout(timer);
    }, [query]);

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
        setQuery('');
    };

    if (!isOpen) return null;

    const allItems = [...quickCommands, ...results];

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-dark-bg/60 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Palette Container */}
            <div className="relative w-full max-w-2xl glass-panel rounded-[2rem] border-brand-primary/20 shadow-[0_0_80px_rgba(0,242,255,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Search Input */}
                <div className="flex items-center gap-4 p-6 border-b border-white/5 bg-white/5">
                    <Command className="text-brand-primary animate-pulse" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="INPUT MISSION COMMAND OR SCAN SECTORS..."
                        className="flex-1 bg-transparent border-none text-xl font-black text-white uppercase tracking-widest placeholder:text-dark-muted/30 outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-dark-muted">
                        ESC
                    </div>
                </div>

                {/* Results Section */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.3em]">Neural Processing...</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Categories logic could go here, for now unified list */}
                            {allItems.map((item, index) => (
                                <button
                                    key={item.id + index}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${selectedIndex === index ? 'bg-brand-primary text-dark-bg shadow-lg shadow-brand-primary/20' : 'hover:bg-white/5 text-dark-muted hover:text-white'
                                        }`}
                                    onClick={() => handleNavigate(item.path)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedIndex === index ? 'bg-dark-bg/20 border-dark-bg/20' : 'bg-dark-layer2 border-white/5'
                                            }`}>
                                            {item.icon}
                                        </div>
                                        <div className="text-left">
                                            <div className={`text-sm font-black uppercase tracking-tight ${selectedIndex === index ? 'text-dark-bg' : 'text-white'}`}>
                                                {item.title}
                                            </div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>
                                                {item.category}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedIndex === index && <Zap size={18} className="animate-bounce" />}
                                </button>
                            ))}

                            {query.length > 0 && results.length === 0 && !isLoading && (
                                <div className="p-12 text-center">
                                    <Sparkles className="mx-auto mb-4 text-dark-muted opacity-20" size={48} />
                                    <p className="text-sm font-bold text-dark-muted">NO SECTORS MATCHING "{query.toUpperCase()}"</p>
                                    <p className="text-[10px] font-black text-dark-muted/50 uppercase tracking-widest mt-2">Adjust your neural coordinates</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><ArrowRight size={12} /> Navigate</span>
                        <span className="flex items-center gap-1"><Zap size={12} /> Execute</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe size={12} className="text-brand-primary" /> SITE-WIDE SCANNER v1.0
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
