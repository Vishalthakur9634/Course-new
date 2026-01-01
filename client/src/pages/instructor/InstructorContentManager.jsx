import React, { useState, useEffect, useRef } from 'react';
import {
    Upload, Search, Grid, List, Filter, Download, Trash2, Edit,
    File, Image, Video, FileText, Code, Link as LinkIcon,
    FolderOpen, Clock, HardDrive, Plus, X, Check, Eye,
    MoreVertical, Copy, Share2, Tag, BookOpen, ChevronDown
} from 'lucide-react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const InstructorContentManager = () => {
    const [view, setView] = useState('grid'); // grid or list
    const [activeTab, setActiveTab] = useState('all');
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const tabs = [
        { id: 'all', label: 'All Resources', icon: FolderOpen },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'images', label: 'Images', icon: Image },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'code', label: 'Code', icon: Code },
        { id: 'links', label: 'Links', icon: LinkIcon },
    ];

    useEffect(() => {
        fetchResources();
    }, []);

    useEffect(() => {
        filterAndSortResources();
    }, [resources, activeTab, searchQuery, filterType, sortBy]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            // Fetch real resources from backend
            const { data } = await api.get('/instructor/resources');
            setResources(data.resources || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
            // Fallback to empty array if error
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortResources = () => {
        let filtered = [...resources];

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(r => r.category === activeTab);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.uploadDate) - new Date(a.uploadDate);
                case 'oldest':
                    return new Date(a.uploadDate) - new Date(b.uploadDate);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return parseFloat(b.size) - parseFloat(a.size);
                default:
                    return 0;
            }
        });

        setFilteredResources(filtered);
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                // Simulate upload progress
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => Math.min(prev + 10, 90));
                }, 200);

                await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                clearInterval(progressInterval);
                setUploadProgress(100);
            }

            setTimeout(() => {
                setShowUploadModal(false);
                setUploadProgress(0);
                fetchResources();
            }, 500);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resource?')) return;
        try {
            await api.delete(`/instructor/resources/${id}`);
            // Refresh the list after deletion
            fetchResources();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete resource');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedItems.length} resources?`)) return;
        try {
            await Promise.all(selectedItems.map(id => api.delete(`/instructor/resources/${id}`)));
            setSelectedItems([]);
            fetchResources();
        } catch (error) {
            console.error('Bulk delete error:', error);
            alert('Failed to delete some resources');
        }
    };

    const toggleSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf':
            case 'doc':
            case 'docx':
                return FileText;
            case 'jpg':
            case 'png':
            case 'image':
                return Image;
            case 'mp4':
            case 'video':
                return Video;
            case 'code':
            case 'zip':
                return Code;
            case 'link':
                return LinkIcon;
            default:
                return File;
        }
    };

    // Calculate real storage from resources
    const calculateStorage = () => {
        let totalBytes = 0;
        resources.forEach(resource => {
            // Parse size string (e.g., "2.4 MB", "156 KB") to bytes
            const sizeStr = resource.size || '0 KB';
            const parts = sizeStr.split(' ');
            const value = parseFloat(parts[0]);
            const unit = parts[1]?.toUpperCase();

            if (unit === 'GB') totalBytes += value * 1024 * 1024 * 1024;
            else if (unit === 'MB') totalBytes += value * 1024 * 1024;
            else if (unit === 'KB') totalBytes += value * 1024;
            else totalBytes += value;
        });

        return (totalBytes / (1024 * 1024 * 1024)).toFixed(2); // Convert to GB
    };

    const totalStorage = 10; // GB (could be fetched from user's plan)
    const usedStorage = parseFloat(calculateStorage());
    const storagePercent = (usedStorage / totalStorage) * 100;

    return (
        <div className="min-h-screen bg-dark-bg text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                            <FolderOpen className="text-brand-primary" />
                            Content <span className="text-brand-primary">Manager</span>
                        </h1>
                        <p className="text-dark-muted text-sm mt-1">Manage your course resources and materials</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Storage Indicator */}
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-dark-layer1 rounded-xl border border-white/5">
                            <HardDrive size={18} className="text-brand-primary" />
                            <div>
                                <p className="text-[10px] text-dark-muted uppercase tracking-wider">Storage</p>
                                <p className="text-xs font-bold">{usedStorage}GB / {totalStorage}GB</p>
                            </div>
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-6 py-3 bg-brand-primary text-dark-bg rounded-xl font-bold flex items-center gap-2 hover:bg-brand-hover transition-all shadow-lg"
                        >
                            <Upload size={20} />
                            <span>Upload</span>
                        </button>
                    </div>
                </div>

                {/* STORAGE BAR (Mobile) */}
                <div className="lg:hidden bg-dark-layer1 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-dark-muted uppercase tracking-wider">Storage Used</span>
                        <span className="text-sm font-bold">{storagePercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary transition-all"
                            style={{ width: `${storagePercent}%` }}
                        />
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const count = tab.id === 'all'
                            ? resources.length
                            : resources.filter(r => r.category === tab.id).length;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-brand-primary text-dark-bg'
                                    : 'text-dark-muted hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-dark-bg/20' : 'bg-white/5'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* TOOLBAR */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    {/* Search */}
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-dark-layer1 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-dark-layer1 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name (A-Z)</option>
                            <option value="size">Size (Large to Small)</option>
                        </select>

                        {/* View Toggle */}
                        <div className="flex bg-dark-layer1 rounded-xl border border-white/5 p-1">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-brand-primary text-dark-bg' : 'text-dark-muted hover:text-white'
                                    }`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-brand-primary text-dark-bg' : 'text-dark-muted hover:text-white'
                                    }`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                <AnimatePresence>
                    {selectedItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4 flex items-center justify-between"
                        >
                            <span className="text-sm font-bold">
                                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-bold hover:bg-red-500/30 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setSelectedItems([])}
                                    className="px-4 py-2 bg-white/5 text-white rounded-lg font-bold hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CONTENT */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                        <p className="text-dark-muted mt-4">Loading resources...</p>
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="text-center py-20 bg-dark-layer1 rounded-2xl border border-white/5">
                        <FolderOpen size={64} className="mx-auto text-dark-muted opacity-20 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No resources found</h3>
                        <p className="text-dark-muted mb-6">Upload your first resource to get started</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-6 py-3 bg-brand-primary text-dark-bg rounded-xl font-bold inline-flex items-center gap-2"
                        >
                            <Upload size={20} />
                            Upload Resource
                        </button>
                    </div>
                ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredResources.map(resource => {
                            const Icon = getFileIcon(resource.type);
                            const isSelected = selectedItems.includes(resource._id);

                            return (
                                <motion.div
                                    key={resource._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`bg-dark-layer1 rounded-2xl border p-4 cursor-pointer transition-all hover:border-brand-primary/50 ${isSelected ? 'border-brand-primary' : 'border-white/5'
                                        }`}
                                    onClick={() => toggleSelection(resource._id)}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-dark-layer2 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                                        {resource.type === 'image' ? (
                                            <img src={resource.url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon size={48} className="text-brand-primary/40" />
                                        )}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                                                <Check size={32} className="text-brand-primary" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <h3 className="font-bold text-sm text-white truncate mb-1">{resource.name}</h3>
                                    <div className="flex items-center justify-between text-xs text-dark-muted mb-2">
                                        <span>{resource.size}</span>
                                        <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
                                    </div>

                                    {/* Course */}
                                    {resource.course && (
                                        <div className="flex items-center gap-1 text-xs text-brand-primary mb-3">
                                            <BookOpen size={12} />
                                            <span className="truncate">{resource.course}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedResource(resource);
                                            }}
                                            className="flex-1 py-2 bg-white/5 rounded-lg text-xs font-bold hover:bg-white/10 transition-all"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(resource._id);
                                            }}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-dark-layer1 rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr className="text-left text-xs text-dark-muted uppercase font-bold">
                                    <th className="p-4 w-8">
                                        <input type="checkbox" className="rounded" />
                                    </th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Course</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredResources.map(resource => {
                                    const Icon = getFileIcon(resource.type);
                                    const isSelected = selectedItems.includes(resource._id);

                                    return (
                                        <tr key={resource._id} className="hover:bg-white/5 transition-all">
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(resource._id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Icon size={20} className="text-brand-primary" />
                                                    <span className="font-bold text-sm">{resource.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-dark-muted">{resource.course}</td>
                                            <td className="p-4 text-sm text-dark-muted">{resource.size}</td>
                                            <td className="p-4 text-sm text-dark-muted">
                                                {new Date(resource.uploadDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedResource(resource)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-brand-primary"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(resource._id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* UPLOAD MODAL */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !uploading && setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-dark-layer1 rounded-3xl border border-white/10 p-8 max-w-2xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black uppercase">Upload Resources</h2>
                                <button
                                    onClick={() => !uploading && setShowUploadModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                    disabled={uploading}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center cursor-pointer hover:border-brand-primary transition-all mb-6"
                            >
                                <Upload size={48} className="mx-auto text-brand-primary mb-4" />
                                <h3 className="text-lg font-bold mb-2">Drop files here or click to browse</h3>
                                <p className="text-sm text-dark-muted">Upload PDFs, images, videos, code files, and more</p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files)}
                                disabled={uploading}
                            />

                            {uploading && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-primary transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RESOURCE DETAIL MODAL */}
            <AnimatePresence>
                {selectedResource && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedResource(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-dark-layer1 rounded-3xl border border-white/10 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black mb-2">{selectedResource.name}</h2>
                                    <div className="flex items-center gap-4 text-sm text-dark-muted">
                                        <span>{selectedResource.size}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedResource.uploadDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedResource(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Preview */}
                            {selectedResource.type === 'image' && (
                                <img
                                    src={selectedResource.url}
                                    alt={selectedResource.name}
                                    className="w-full rounded-xl mb-6"
                                />
                            )}

                            {/* Metadata */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-dark-muted uppercase tracking-wider block mb-2">Course</label>
                                    <p className="font-bold">{selectedResource.course}</p>
                                </div>

                                {selectedResource.tags && selectedResource.tags.length > 0 && (
                                    <div>
                                        <label className="text-xs text-dark-muted uppercase tracking-wider block mb-2">Tags</label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedResource.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-bold"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button className="flex-1 py-3 bg-brand-primary text-dark-bg rounded-xl font-bold flex items-center justify-center gap-2">
                                        <Download size={20} />
                                        Download
                                    </button>
                                    <button className="px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                                        <Share2 size={20} />
                                    </button>
                                    <button className="px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                                        <Copy size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InstructorContentManager;
