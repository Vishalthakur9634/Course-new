import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Upload, Plus, X, FileVideo, FileText, Layout, Info } from 'lucide-react';

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
    const [existingCourses, setExistingCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    useEffect(() => {
        const fetchExistingCourses = async () => {
            try {
                const { data } = await api.get('/instructor/courses');
                setExistingCourses(data);
            } catch (error) {
                console.error('Error fetching existing courses:', error);
            }
        };
        fetchExistingCourses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    const handleThumbnailChange = (e) => {
        setCourseData(prev => ({ ...prev, thumbnail: e.target.files[0] }));
    };

    const addVideoSlot = () => {
        setVideos([...videos, { title: '', description: '', summary: '', file: null, notePdf: null, order: videos.length + 1 }]);
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

    const handleSubmit = async (e, shouldSubmit = false) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            let courseId = selectedCourseId;

            if (!courseId) {
                const formData = new FormData();
                formData.append('title', courseData.title);
                formData.append('description', courseData.description);
                formData.append('category', courseData.category);
                formData.append('level', courseData.level);
                formData.append('price', courseData.price);
                if (courseData.thumbnail) {
                    formData.append('thumbnail', courseData.thumbnail);
                }

                const { data: newCourse } = await api.post('/instructor/courses', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                courseId = newCourse._id;
            }

            for (const video of videos) {
                if (video.file) {
                    const videoFormData = new FormData();
                    videoFormData.append('video', video.file);
                    if (video.notePdf) {
                        videoFormData.append('notePdf', video.notePdf);
                    }
                    videoFormData.append('title', video.title);
                    videoFormData.append('description', video.description);
                    videoFormData.append('summary', video.summary);
                    videoFormData.append('order', video.order);

                    await api.post(`/instructor/courses/${courseId}/videos`, videoFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            if (shouldSubmit) {
                if (videos.length === 0 && !selectedCourseId) {
                    alert('You must add at least one video to submit for review.');
                    setLoading(false);
                    return;
                }
                await api.post(`/instructor/courses/${courseId}/submit`);
                alert('Course submitted successfully!');
            } else {
                alert('Saved successfully!');
            }

            navigate('/instructor/courses');
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-24">
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Course Content Hub</h1>
                <p className="text-dark-muted font-bold uppercase tracking-widest text-xs">Deploy new knowledge or expand existing frontiers</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Mode Selector */}
                <div className="bg-dark-layer1 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            type="button"
                            onClick={() => setSelectedCourseId('')}
                            className={`p-6 rounded-3xl border transition-all text-left ${!selectedCourseId ? 'bg-brand-primary/10 border-brand-primary' : 'bg-dark-layer2 border-white/5 hover:border-white/20'}`}
                        >
                            <h4 className="text-white font-black uppercase tracking-tight mb-2">Create New Course</h4>
                            <p className="text-xs text-dark-muted">Initiate a fresh course with new metadata.</p>
                        </button>

                        <div className="relative">
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className={`w-full p-6 h-full rounded-3xl border transition-all text-left appearance-none bg-dark-layer2 ${selectedCourseId ? 'bg-brand-primary/10 border-brand-primary text-white' : 'border-white/5 text-dark-muted hover:border-white/20'}`}
                            >
                                <option value="">Expand Existing Course...</option>
                                {existingCourses.map(c => (
                                    <option key={c._id} value={c._id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {!selectedCourseId && (
                    <div className="bg-dark-layer1 border border-white/5 p-8 rounded-[2.5rem] space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                <Info size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Basic Information</h3>
                                <p className="text-xs text-dark-muted font-bold uppercase tracking-widest">The core identity of your new course</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-4">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={courseData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary font-medium"
                                    placeholder="Enter Course Title"
                                    required={!selectedCourseId}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-4">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={courseData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary font-medium"
                                    placeholder="e.g. Design, Business"
                                    required={!selectedCourseId}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-4">Description</label>
                            <textarea
                                name="description"
                                value={courseData.description}
                                onChange={handleInputChange}
                                className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary font-medium min-h-[120px]"
                                placeholder="Describe the learning objectives"
                                required={!selectedCourseId}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-4">Thumbnail</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white file:hidden font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-4">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={courseData.price}
                                    onChange={handleInputChange}
                                    className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary font-medium"
                                    placeholder="0 for free"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Videos Section */}
                <div className="bg-dark-layer1 border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                                <FileVideo size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Curriculum Content</h3>
                                <p className="text-xs text-dark-muted font-bold uppercase tracking-widest">Videos and resources</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={addVideoSlot}
                            className="bg-brand-primary hover:bg-brand-hover text-dark-bg px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> Add Video
                        </button>
                    </div>

                    <div className="space-y-6">
                        {videos.map((video, index) => (
                            <div key={index} className="bg-dark-layer2 p-8 rounded-[2rem] border border-white/5 relative group animate-in slide-in-from-right duration-300">
                                <button
                                    type="button"
                                    onClick={() => removeVideoSlot(index)}
                                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                >
                                    <X size={16} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={video.title}
                                            onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                                            className="w-full bg-dark-bg border border-white/5 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-brand-primary text-sm font-bold"
                                            placeholder="Video Title"
                                            required
                                        />
                                        <textarea
                                            value={video.description}
                                            onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                                            className="w-full bg-dark-bg border border-white/5 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-brand-primary text-xs"
                                            placeholder="Brief description"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-dark-muted uppercase tracking-widest ml-2">Video File</p>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleVideoFileChange(index, 'file', e.target.files[0])}
                                                className="w-full bg-dark-bg border border-white/5 rounded-xl px-5 py-2.5 text-xs text-white file:hidden cursor-pointer"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-dark-muted uppercase tracking-widest ml-2">Extra Resources (PDF)</p>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => handleVideoFileChange(index, 'notePdf', e.target.files[0])}
                                                className="w-full bg-dark-bg border border-white/5 rounded-xl px-5 py-2.5 text-xs text-white file:hidden cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {videos.length === 0 && (
                            <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                <FileVideo size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="text-dark-muted text-xs font-bold uppercase tracking-widest">No segments added to this curriculum yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-6 pb-12">
                    <button
                        type="button"
                        onClick={() => handleSubmit(null, false)}
                        disabled={loading}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/5"
                    >
                        Save Strategy
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(null, true)}
                        disabled={loading}
                        className="px-10 py-4 bg-brand-primary hover:bg-brand-hover text-dark-bg rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-brand-primary/20"
                    >
                        {loading ? 'Deploying...' : 'Deploy Content'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadCourse;
