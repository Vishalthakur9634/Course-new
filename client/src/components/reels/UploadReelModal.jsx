import React, { useState } from 'react';
import { X, Upload, Video, Loader } from 'lucide-react';
import api from '../../utils/api';

const UploadReelModal = ({ onClose, onUpload }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        setUploading(true);
        try {
            // 1. Upload Video
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Generate or use default thumbnail if none provided
            // For now, we'll use a placeholder or the video URL if the backend supports generating it
            // Ideally, we'd upload a selected thumbnail here too

            // 3. Create Reel
            await api.post('/reels/upload', {
                title,
                videoUrl: uploadRes.data.url,
                thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop', // Placeholder for now
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                duration: 60
            });

            onUpload();
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload reel.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-layer1 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-black text-white mb-6">Upload Reel</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Dropzone */}
                    <div className="relative group">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-brand-primary hover:bg-white/5 transition-all">
                            {preview ? (
                                <video src={preview} className="h-full object-contain rounded-lg" controls />
                            ) : (
                                <>
                                    <div className="p-4 rounded-full bg-white/5 text-brand-primary mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-white">Click to upload video</p>
                                    <p className="text-xs text-white/50 mt-1">MP4, WebM (Vertical 9:16 recommended)</p>
                                </>
                            )}
                            <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-white/60 mb-1 uppercase tracking-wider">Caption / Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Describe your reel..."
                                className="w-full bg-dark-layer2 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-primary"
                                maxLength={100}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-white/60 mb-1 uppercase tracking-wider">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-dark-layer2 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option>General</option>
                                    <option>Coding</option>
                                    <option>Design</option>
                                    <option>Business</option>
                                    <option>Tips</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/60 mb-1 uppercase tracking-wider">Tags</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="react, js, web"
                                    className="w-full bg-dark-layer2 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading || !file || !title}
                        className="w-full py-4 bg-brand-primary hover:bg-brand-hover text-black font-black rounded-xl text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? <Loader className="animate-spin" /> : <><Video size={20} /> Post Reel</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadReelModal;
