import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Database, Brain, Globe, Layers, Plus,
    Trash2, Edit, Save, X, Check, Search, Upload, FileText
} from 'lucide-react';
import api from '../../utils/api';

const ContentManager = () => {
    const [activeTab, setActiveTab] = useState('sectors'); // sectors, skills, vault, tutor
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'sectors': endpoint = '/content/sectors'; break;
                case 'skills': endpoint = '/content/skilltrees'; break;
                case 'vault': endpoint = '/content/vault'; break;
                // case 'tutor': endpoint = '/content/tutor/responses'; break; // Need to implement this route if not exists
                default: endpoint = '/content/sectors';
            }
            if (endpoint) {
                const res = await api.get(endpoint);
                setData(res.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'sectors': endpoint = `/content/sectors/${id}`; break;
                case 'skills': endpoint = `/content/skilltrees/${id}`; break;
                case 'vault': endpoint = `/content/vault/${id}`; break;
            }
            await api.delete(endpoint);
            fetchData();
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '';
            let method = isEditing ? 'put' : 'post';
            let url = '';

            switch (activeTab) {
                case 'sectors':
                    endpoint = '/content/sectors';
                    break;
                case 'skills':
                    endpoint = '/content/skilltrees';
                    break;
                case 'vault':
                    endpoint = '/content/vault';
                    break;
            }

            url = isEditing ? `${endpoint}/${isEditing}` : endpoint;

            await api[method](url, formData);
            setIsEditing(null);
            setFormData({});
            fetchData();
        } catch (error) {
            console.error("Error saving item:", error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Database className="text-brand-primary" /> Content <span className="text-brand-primary">Manager</span>
                </h1>
                <p className="text-dark-muted font-bold text-sm mt-2">Super Admin Control Center</p>
            </header>

            <div className="flex gap-4 border-b border-white/10 pb-4">
                {[
                    { id: 'sectors', icon: Globe, label: 'Sectors' },
                    { id: 'skills', icon: Layers, label: 'Skill Trees' },
                    { id: 'vault', icon: FileText, label: 'Vault' },
                    { id: 'tutor', icon: Brain, label: 'Neural Tutor' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-brand-primary text-dark-bg' : 'text-dark-muted hover:text-white'
                            }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white uppercase">{activeTab} Management</h2>
                    <button
                        onClick={() => { setIsEditing(null); setFormData({}); }}
                        className="px-4 py-2 bg-brand-primary text-dark-bg rounded-lg font-bold flex items-center gap-2 hover:bg-brand-hover"
                    >
                        <Plus size={18} /> Add New
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-white animate-pulse">Scanning Database...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-dark-muted uppercase text-xs font-black">
                                <tr>
                                    <th className="p-4 rounded-tl-xl">ID / Title</th>
                                    <th className="p-4">Details</th>
                                    <th className="p-4 rounded-tr-xl text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.map(item => (
                                    <tr key={item._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{item.title || item.name}</div>
                                            <div className="text-xs text-dark-muted opacity-60 uppercase">{item._id}</div>
                                        </td>
                                        <td className="p-4 text-sm text-dark-muted">
                                            {activeTab === 'sectors' && <span>{item.count} Nodes | {item.icon}</span>}
                                            {activeTab === 'skills' && <span>{item.nodes?.length || 0} Levels | {item.color}</span>}
                                            {activeTab === 'vault' && <span>{item.type} | {item.size} | {item.security}</span>}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => { setIsEditing(item._id); setFormData(item); }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Simple Edit Form Modal (inline for now) */}
            {(isEditing !== null || Object.keys(formData).length > 0) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="bg-dark-layer2 p-8 rounded-3xl border border-white/10 w-full max-w-lg space-y-6">
                        <h3 className="text-2xl font-black text-white uppercase">{isEditing ? 'Edit Item' : 'New Item'}</h3>

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Dynamic Fields based on activeTab */}
                            {activeTab === 'sectors' && (
                                <>
                                    <input type="text" placeholder="ID (e.g., dev)" value={formData.id || ''} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" required />
                                    <input type="text" placeholder="Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" required />
                                    <input type="text" placeholder="Icon Name (Lucide)" value={formData.icon || ''} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" />
                                    <input type="text" placeholder="Color Tag" value={formData.color || ''} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" />
                                    <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" />
                                </>
                            )}
                            {activeTab === 'vault' && (
                                <>
                                    <input type="text" placeholder="File Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" required />
                                    <input type="text" placeholder="Size (e.g. 2.4 MB)" value={formData.size || ''} onChange={e => setFormData({ ...formData, size: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" />
                                    <input type="text" placeholder="Type (PDF, DOCX)" value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" required />
                                    <select value={formData.security || 'Unrestricted'} onChange={e => setFormData({ ...formData, security: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white">
                                        <option value="Unrestricted">Unrestricted</option>
                                        <option value="Level 2">Level 2</option>
                                        <option value="Level 3">Level 3</option>
                                        <option value="Level 4">Level 4</option>
                                        <option value="Restricted">Restricted</option>
                                    </select>
                                    <input type="text" placeholder="File URL" value={formData.url || ''} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full p-3 bg-dark-layer1 rounded-xl border border-white/10 text-white" />
                                </>
                            )}
                            {/* Fallback for others */}
                            {activeTab === 'skills' && (
                                <div className="text-yellow-500 text-sm">Complex object editing (nodes) requires generic JSON editor for now.</div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => { setIsEditing(null); setFormData({}); }} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-brand-primary text-dark-bg font-bold hover:bg-brand-hover">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentManager;
