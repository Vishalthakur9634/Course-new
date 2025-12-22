import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, FileText, Upload, X } from 'lucide-react';

const InstructorPractice = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [problems, setProblems] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchProblems(selectedCourse._id);
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor/courses');
            setCourses(data);
            if (data.length > 0) setSelectedCourse(data[0]);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchProblems = async (courseId) => {
        try {
            const { data } = await api.get(`/practice/course/${courseId}`);
            setProblems(data);
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAttachments([...attachments, { name: data.filename, url: data.url, type: 'file' }]);
        } catch (error) {
            console.error('Upload error:', error);
            alert('File upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                courseId: selectedCourse._id,
                title,
                description,
                attachments
            };
            const { data } = await api.post('/practice', payload);
            setProblems([data, ...problems]);
            setShowForm(false);
            setTitle('');
            setDescription('');
            setAttachments([]);
        } catch (error) {
            console.error('Error creating problem:', error);
            alert('Failed to create practice problem');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this problem?')) return;
        try {
            await api.delete(`/practice/${id}`);
            setProblems(problems.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error deleting problem:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-dark-layer1 p-6 rounded-xl border border-dark-layer2">
                <div>
                    <h1 className="text-2xl font-bold text-white">Daily Practice Problems</h1>
                    <p className="text-dark-muted">Upload daily challenges for your students</p>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={selectedCourse?._id || ''}
                        onChange={(e) => setSelectedCourse(courses.find(c => c._id === e.target.value))}
                        className="bg-dark-layer2 text-white px-4 py-2 rounded-lg border border-dark-layer2 focus:outline-none focus:border-brand-primary"
                    >
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        {showForm ? 'Cancel' : 'New Problem'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-dark-layer1 p-6 rounded-xl border border-dark-layer2 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-dark-layer2 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-primary border border-dark-layer2"
                                placeholder="e.g., Daily Challenge #45"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-dark-layer2 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-primary border border-dark-layer2 min-h-[100px]"
                                placeholder="Problem details..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-1">Attachments (PDF/PPT)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {attachments.map((att, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-dark-layer2 px-3 py-1 rounded-full border border-dark-layer2">
                                        <FileText size={14} className="text-brand-primary" />
                                        <span className="text-sm text-white">{att.name}</span>
                                        <button type="button" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 text-brand-primary hover:text-white transition-colors text-sm"
                            >
                                <Upload size={16} /> Upload File
                            </button>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90">
                                Create Problem
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {problems.map(problem => (
                    <div key={problem._id} className="bg-dark-layer1 p-6 rounded-xl border border-dark-layer2 hover:border-brand-primary/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">{problem.title}</h3>
                                <p className="text-dark-muted text-sm mb-4 whitespace-pre-wrap">{problem.description}</p>

                                {problem.attachments && problem.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {problem.attachments.map((att, i) => (
                                            <a
                                                key={i}
                                                href={att.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-dark-layer2 px-3 py-1.5 rounded-lg text-sm text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                                            >
                                                <FileText size={14} />
                                                View Attachment
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-dark-muted">
                                    {new Date(problem.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => handleDelete(problem._id)}
                                    className="text-dark-muted hover:text-red-400 p-1"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {problems.length === 0 && !loading && (
                    <div className="text-center py-12 text-dark-muted">
                        No practice problems created for this course yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorPractice;
