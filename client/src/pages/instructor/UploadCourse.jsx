import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Upload, Plus, X, FileVideo, FileText } from 'lucide-react';

const UploadCourse = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        price: 0,
        thumbnail: null
    });
    const [videos, setVideos] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    const handleThumbnailChange = (e) => {
        setCourseData(prev => ({ ...prev, thumbnail: e.target.files[0] }));
    };

    const addVideoSlot = () => {
        setVideos([...videos, { title: '', description: '', file: null, notePdf: null, order: videos.length + 1 }]);
    };

    const removeVideoSlot = (index) => {
        setVideos(videos.filter((_, i) => i !== index));
    };

    const handleVideoChange = (index, field, value) => {
        const updated = [...videos];
        updated[index][field] = value;
        setVideos(updated);
    };

    const handleVideoFileChange = (index, field, file) => {
        const updated = [...videos];
        updated[index][field] = file;
        setVideos(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create course first
            const formData = new FormData();
            formData.append('title', courseData.title);
            formData.append('description', courseData.description);
            formData.append('category', courseData.category);
            formData.append('level', courseData.level);
            formData.append('price', courseData.price);
            if (courseData.thumbnail) {
                formData.append('thumbnail', courseData.thumbnail);
            }

            const { data: course } = await api.post('/instructor/courses', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Upload videos one by one
            for (const video of videos) {
                if (video.file) {
                    const videoFormData = new FormData();
                    videoFormData.append('video', video.file);
                    if (video.notePdf) {
                        videoFormData.append('notePdf', video.notePdf);
                    }
                    videoFormData.append('title', video.title);
                    videoFormData.append('description', video.description);
                    videoFormData.append('order', video.order);

                    await api.post(`/instructor/courses/${course._id}/videos`, videoFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            alert('Course created successfully! Pending admin approval.');
            navigate('/instructor/courses');
        } catch (error) {
            console.error('Error creating course:', error);
            alert(error.response?.data?.error || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Upload New Course</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Details */}
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h3 className="text-xl font-bold text-white mb-4">Course Details</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Course Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={courseData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                                placeholder="e.g., Complete Web Development Bootcamp"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Description *</label>
                            <textarea
                                name="description"
                                value={courseData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                                placeholder="Describe what students will learn..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Category *</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={courseData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                                    placeholder="e.g., Programming"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Level *</label>
                                <select
                                    name="level"
                                    value={courseData.level}
                                    onChange={handleInputChange}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Price ($) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={courseData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Course Thumbnail</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Videos */}
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Course Videos</h3>
                        <button
                            type="button"
                            onClick={addVideoSlot}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors"
                        >
                            <Plus size={18} />
                            Add Video
                        </button>
                    </div>

                    <div className="space-y-4">
                        {videos.map((video, index) => (
                            <div key={index} className="bg-dark-layer2 p-4 rounded border border-dark-layer2">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileVideo size={20} className="text-brand-primary" />
                                        <span className="text-white font-medium">Video {index + 1}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeVideoSlot(index)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={video.title}
                                        onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                                        placeholder="Video title"
                                        className="w-full bg-dark-layer1 border border-dark-layer2 rounded p-2 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={video.description}
                                        onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                                        placeholder="Video description"
                                        className="w-full bg-dark-layer1 border border-dark-layer2 rounded p-2 text-white text-sm"
                                    />
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleVideoFileChange(index, 'file', e.target.files[0])}
                                        className="w-full bg-dark-layer1 border border-dark-layer2 rounded p-2 text-white text-sm"
                                    />
                                    {video.file && (
                                        <p className="text-xs text-dark-muted">
                                            Video: {video.file.name} ({(video.file.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}

                                    {/* PDF Note Upload */}
                                    <div className="pt-2 border-t border-dark-layer2">
                                        <label className="block text-xs font-medium text-dark-muted mb-1">Lecture Notes (PDF) - Optional</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleVideoFileChange(index, 'notePdf', e.target.files[0])}
                                            className="w-full bg-dark-layer1 border border-dark-layer2 rounded p-2 text-white text-sm"
                                        />
                                        {video.notePdf && (
                                            <p className="text-xs text-dark-muted mt-1">
                                                Note: {video.notePdf.name} ({(video.notePdf.size / 1024).toFixed(2)} KB)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {videos.length === 0 && (
                            <div className="text-center text-dark-muted py-10">
                                <FileVideo size={48} className="mx-auto mb-3 opacity-50" />
                                <p>No videos added yet. Click "Add Video" to start.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/instructor/courses')}
                        className="px-6 py-3 bg-dark-layer2 text-white rounded hover:bg-dark-layer1 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded transition-colors ${loading
                            ? 'bg-dark-layer2 text-dark-muted cursor-not-allowed'
                            : 'bg-brand-primary hover:bg-brand-hover text-white'
                            }`}
                    >
                        <Upload size={18} />
                        {loading ? 'Uploading...' : 'Create Course'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadCourse;
