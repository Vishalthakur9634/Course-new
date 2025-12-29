import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { Upload, Save, X, FileVideo, Trash2 } from 'lucide-react';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        price: 0,
        thumbnail: null,
        isPublished: false
    });
    const [videos, setVideos] = useState([]);
    const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('');

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const { data } = await api.get(`/courses/${id}`);
            setCourseData({
                title: data.title,
                description: data.description,
                category: data.category,
                level: data.level,
                price: data.price,
                thumbnail: null,
                isPublished: data.isPublished
            });
            setCurrentThumbnailUrl(data.thumbnail);
            setVideos(data.videos.map(v => ({ ...v, file: null, notePdf: null })));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching course:', error);
            alert('Failed to load course details');
            navigate('/instructor/courses');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleThumbnailChange = (e) => {
        setCourseData(prev => ({ ...prev, thumbnail: e.target.files[0] }));
    };

    // Video management logic simplified for this editing view
    // For full edit capability including video re-upload, we'd need more complex logic.
    // Here we focus on Course Metadata + Publishing status.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('title', courseData.title);
            formData.append('description', courseData.description);
            formData.append('category', courseData.category);
            formData.append('level', courseData.level);
            formData.append('price', courseData.price);
            formData.append('isPublished', courseData.isPublished); // Toggle Publish
            // Always set approvalStatus to 'pending' if publishing, or keep as is?
            // If publishing, we might want to trigger a review. 
            // For now, let's assume we just update the fields. 
            // If the backend requires approval for publishing, it should handle that.

            if (courseData.thumbnail) {
                formData.append('thumbnail', courseData.thumbnail);
            }

            const { data } = await api.put(`/courses/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // Put requests with FormData might need this
            });

            // Note: This simple edit doesn't handle adding/removing extra videos yet.
            // That would require separate API calls or a more complex component.

            alert('Course updated successfully!');
            navigate('/instructor/courses');
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Failed to update course');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Edit Course</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <h3 className="text-xl font-bold text-white mb-4">Course Settings</h3>

                    {/* Publish Toggle */}
                    <div className="flex items-center gap-3 mb-6 bg-dark-layer2 p-4 rounded-lg border border-dark-layer2">
                        <input
                            type="checkbox"
                            name="isPublished"
                            id="isPublished"
                            checked={courseData.isPublished}
                            onChange={handleInputChange}
                            className="w-5 h-5 rounded border-dark-muted text-brand-primary focus:ring-brand-primary"
                        />
                        <div>
                            <label htmlFor="isPublished" className="font-bold text-white">Publish Course</label>
                            <p className="text-sm text-dark-muted">Check this to make the course visible to students (pending approval).</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Course Title</label>
                            <input
                                type="text"
                                name="title"
                                value={courseData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Description</label>
                            <textarea
                                name="description"
                                value={courseData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={courseData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">Level</label>
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
                                <label className="block text-sm font-medium text-dark-muted mb-2">Price ($)</label>
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
                            <label className="block text-sm font-medium text-dark-muted mb-2">Thumbnail</label>
                            {currentThumbnailUrl && (
                                <div className="mb-2 w-32 h-20 bg-dark-layer2 rounded overflow-hidden">
                                    <img src={currentThumbnailUrl} alt="Current" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-3 text-white"
                            />
                            <p className="text-xs text-dark-muted mt-1">Leave empty to keep current thumbnail</p>
                        </div>
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
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded transition-colors ${saving
                                ? 'bg-dark-layer2 text-dark-muted cursor-not-allowed'
                                : 'bg-brand-primary hover:bg-brand-hover text-white'
                            }`}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCourse;
