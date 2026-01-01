import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, FileText, Calendar, Clock, Download,
    ChevronRight, Loader2, Save, Trash2, Users,
    Clock3, CheckCircle2, AlertCircle, Search,
    Filter, Send, User, MessageSquare, BookOpen,
    Zap, Target, Shield, Cpu, Activity, X, Upload,
    ExternalLink, Terminal, Layout
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const MissionControl = () => {
    const { addToast } = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        points: 100,
        attachmentUrl: '',
        attachmentName: ''
    });

    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [attachmentProgress, setAttachmentProgress] = useState(0);
    const fileInputRef = useRef(null);

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedSub, setSelectedSub] = useState(null);
    const [isGrading, setIsGrading] = useState(false);
    const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAssignments(selectedCourse._id);
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor/courses');
            setCourses(data);
            if (data.length > 0) setSelectedCourse(data[0]);
        } catch (error) {
            console.error('Error fetching courses');
            addToast('Failed to fetch courses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (courseId) => {
        try {
            const { data } = await api.get(`/assignments/course/${courseId}`);
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments');
        }
    };

    const handleAttachmentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAttachment(true);
        setAttachmentProgress(0);

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const res = await api.post('/upload', uploadData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setAttachmentProgress(progress);
                }
            });

            setFormData(prev => ({
                ...prev,
                attachmentUrl: res.data.url,
                attachmentName: res.data.filename
            }));
            addToast(`File "${file.name}" uploaded successfully`, 'success');
        } catch (error) {
            addToast('File upload failed', 'error');
        } finally {
            setUploadingAttachment(false);
            setAttachmentProgress(0);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!selectedCourse) return;

        setIsSaving(true);
        try {
            await api.post('/assignments', { ...formData, courseId: selectedCourse._id });
            setShowCreateModal(false);
            setFormData({ title: '', description: '', dueDate: '', points: 100, attachmentUrl: '', attachmentName: '' });
            fetchAssignments(selectedCourse._id);
            addToast('Assignment created successfully', 'success');
        } catch (error) {
            addToast('Failed to create assignment', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        setSelectedSub(null);
        try {
            const { data } = await api.get(`/assignments/${assignment._id}/submissions`);
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching submissions');
        }
    };

    const handleGrade = async () => {
        if (!selectedSub) return;
        setIsGrading(true);
        try {
            await api.put(`/assignments/submissions/${selectedSub._id}/grade`, gradingData);
            addToast('Grade updated successfully', 'success');
            fetchSubmissions(selectedAssignment);
            setSelectedSub(null);
        } catch (error) {
            addToast('Grading update failed', 'error');
        } finally {
            setIsGrading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-white p-20">
            <Loader2 className="animate-spin text-brand-primary" size={48} />
            <p className="text-dark-muted font-bold uppercase tracking-widest text-xs animate-pulse">Accessing Management Hub...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-8 min-h-full font-inter pb-24 px-4">
            {/* Sidebar: Course Selection */}
            <aside className="w-full xl:w-80 space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 shadow-xl space-y-6">
                    <header className="flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                            <Shield className="text-brand-primary" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-tight">Management</h3>
                            <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">Select Course</p>
                        </div>
                    </header>

                    <div className="space-y-2">
                        {courses.map(course => (
                            <button
                                key={course._id}
                                onClick={() => { setSelectedCourse(course); setSelectedAssignment(null); }}
                                className={`w-full text-left p-4 rounded-lg transition-all border ${selectedCourse?._id === course._id
                                    ? 'bg-brand-primary text-dark-bg border-brand-primary'
                                    : 'bg-white/5 border-transparent hover:bg-white/10 text-white'
                                    }`}
                            >
                                <p className="text-xs font-bold uppercase tracking-wide truncate">{course.title}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <Activity size={10} className={selectedCourse?._id === course._id ? 'text-dark-bg/60' : 'text-brand-primary'} />
                                    <p className={`text-[9px] uppercase font-bold tracking-tight ${selectedCourse?._id === course._id ? 'text-dark-bg/50' : 'text-dark-muted'
                                        }`}>{course.category || 'General'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
                {/* Header Section */}
                <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-8 flex flex-col md:flex-row justify-between items-center shadow-lg gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-brand-primary/5 rounded-xl border border-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Layout size={28} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                                {selectedCourse?.title || 'Management Hub'}
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">Active Connection</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-brand-primary text-dark-bg px-8 py-3 rounded-lg font-bold text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-lg uppercase tracking-widest"
                    >
                        <Plus size={18} /> New Assignment
                    </button>
                </div>

                {!selectedAssignment ? (
                    /* Assignment Grid */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {assignments.map(ass => (
                            <div key={ass._id} className="bg-[#1a1a1a] rounded-xl border border-white/5 p-8 hover:border-brand-primary/30 transition-all flex flex-col shadow-md">
                                <header className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-brand-primary">
                                        <Target size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-dark-muted uppercase tracking-widest mb-0.5">Due Date</p>
                                        <p className="text-xs font-bold text-white">{new Date(ass.dueDate).toLocaleDateString()}</p>
                                    </div>
                                </header>

                                <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{ass.title}</h4>
                                <p className="text-dark-muted text-sm font-medium line-clamp-2 leading-relaxed mb-6">
                                    {ass.description}
                                </p>

                                <div className="flex gap-3 mt-auto">
                                    <button
                                        onClick={() => fetchSubmissions(ass)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-bold text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-dark-bg transition-all"
                                    >
                                        <Users size={14} /> Review Submissions
                                    </button>
                                    <button className="p-3 bg-white/5 border border-white/10 rounded-lg text-dark-muted hover:text-red-500 hover:bg-red-500/10 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {assignments.length === 0 && (
                            <div className="lg:col-span-2 py-24 bg-[#1a1a1a]/50 rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center px-10">
                                <Activity size={48} className="text-dark-muted/20 mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No Assignments</h3>
                                <p className="text-dark-muted text-[10px] font-bold uppercase tracking-widest max-w-xs">Start by creating your first assignment for this course.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Submission Review Section */
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
                        <button
                            onClick={() => setSelectedAssignment(null)}
                            className="flex items-center gap-2 text-dark-muted hover:text-brand-primary transition-all text-[10px] font-bold uppercase tracking-widest"
                        >
                            <ChevronRight className="rotate-180" size={16} /> Back to Assignments
                        </button>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Submission List */}
                            <div className="w-full lg:w-80 bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-lg">
                                <header className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                    <span className="text-white">Submissions</span>
                                    <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded text-[10px] border border-brand-primary/10">{submissions.length}</span>
                                </header>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[600px] custom-scrollbar">
                                    {submissions.map(sub => (
                                        <button
                                            key={sub._id}
                                            onClick={() => { setSelectedSub(sub); setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' }); }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${selectedSub?._id === sub._id
                                                ? 'bg-brand-primary border-brand-primary shadow-sm'
                                                : 'bg-white/5 border-transparent hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${selectedSub?._id === sub._id ? 'bg-dark-bg text-brand-primary' : 'bg-[#1a1a1a] text-white'
                                                    }`}>
                                                    {sub.studentId?.name?.charAt(0)}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-dark-bg ${sub.status === 'Graded' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[11px] font-bold truncate uppercase ${selectedSub?._id === sub._id ? 'text-dark-bg' : 'text-white'}`}>{sub.studentId?.name}</p>
                                                <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${selectedSub?._id === sub._id ? 'text-dark-bg/60' : 'text-dark-muted'}`}>{sub.status}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {submissions.length === 0 && <div className="text-center py-10 text-dark-muted font-bold text-[9px] uppercase tracking-widest opacity-40">No entries yet.</div>}
                                </div>
                            </div>

                            {/* Evaluation Panel */}
                            <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl shadow-xl flex flex-col overflow-hidden">
                                {selectedSub ? (
                                    <div className="flex-1 flex flex-col">
                                        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-brand-primary border border-white/10">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{selectedSub.studentId?.name}</h3>
                                                    <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest mt-0.5">{selectedSub.studentId?.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-bold text-dark-muted uppercase tracking-widest mb-0.5">Submitted On</p>
                                                <p className="text-[11px] font-bold text-white">{new Date(selectedSub.createdAt).toLocaleString()}</p>
                                            </div>
                                        </header>

                                        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                                            {/* File Resource */}
                                            <div className="bg-black/20 rounded-xl p-6 border border-white/5 group">
                                                <h4 className="text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <BookOpen size={14} className="text-brand-primary" /> Submitted File
                                                </h4>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary border border-brand-primary/10 transition-transform group-hover:scale-105">
                                                            <FileText size={24} />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-white font-bold text-sm truncate uppercase tracking-tight">{selectedSub.submissionName || 'submission.file'}</p>
                                                            <p className="text-[9px] text-dark-muted font-bold uppercase tracking-widest mt-1">Verified Format</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={selectedSub.submissionUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-6 py-2.5 bg-brand-primary text-dark-bg rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all hover:brightness-110"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Student Comments */}
                                            {selectedSub.submissionText && (
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-bold text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                                        <MessageSquare size={14} className="text-brand-primary" /> Student Comments
                                                    </h4>
                                                    <div className="bg-black/20 p-6 rounded-xl text-dark-muted font-medium border border-white/5 text-xs leading-relaxed">
                                                        {selectedSub.submissionText}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Grading Section */}
                                            <div className="pt-8 border-t border-white/5 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Grade (Out of {selectedAssignment.points})</label>
                                                        <input
                                                            type="number"
                                                            value={gradingData.grade}
                                                            onChange={e => setGradingData({ ...gradingData, grade: e.target.value })}
                                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white font-bold text-2xl focus:border-brand-primary outline-none"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button
                                                            onClick={handleGrade}
                                                            disabled={isGrading}
                                                            className="w-full py-4 bg-brand-primary text-dark-bg font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-lg disabled:opacity-50"
                                                        >
                                                            {isGrading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                                            Submit Grade
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Instructor Feedback</label>
                                                    <textarea
                                                        value={gradingData.feedback}
                                                        onChange={e => setGradingData({ ...gradingData, feedback: e.target.value })}
                                                        placeholder="Provide constructive feedback..."
                                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white font-medium focus:border-brand-primary outline-none h-32 resize-none text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 animate-pulse text-dark-muted/30">
                                        <Shield size={64} className="mb-6" />
                                        <h4 className="text-2xl font-bold uppercase tracking-tight mb-2">Review Panel</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest max-w-xs">Select a student submission from the list to begin grading.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Assignment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && !uploadingAttachment && setShowCreateModal(false)}></div>
                    <form onSubmit={handleCreateAssignment} className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto">
                        <header className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">New <span className="text-brand-primary">Assignment</span></h2>
                                <p className="text-dark-muted text-[10px] font-bold uppercase tracking-widest">Designing Curriculum</p>
                            </div>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 text-dark-muted hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </header>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="Assignment title..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3.5 text-white font-bold text-sm focus:border-brand-primary outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    placeholder="Brief task overview..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white font-medium h-32 resize-none focus:border-brand-primary outline-none text-xs"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3.5 text-white font-bold text-xs focus:border-brand-primary outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Total Points</label>
                                    <input
                                        type="number"
                                        value={formData.points}
                                        onChange={e => setFormData({ ...formData, points: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3.5 text-white font-bold text-sm focus:border-brand-primary outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Resource Upload */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <BookOpen size={14} className="text-brand-primary" /> Attachment
                                </label>
                                <div
                                    onClick={() => !uploadingAttachment && fileInputRef.current.click()}
                                    className={`h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${formData.attachmentUrl ? 'border-brand-primary bg-brand-primary/5' : 'border-white/10 hover:border-brand-primary/30'}`}
                                >
                                    {uploadingAttachment ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-brand-primary" size={20} />
                                            <p className="text-[9px] text-brand-primary font-bold uppercase tracking-widest">{attachmentProgress}%</p>
                                        </div>
                                    ) : formData.attachmentUrl ? (
                                        <div className="flex items-center gap-3 px-6">
                                            <FileText className="text-brand-primary" size={20} />
                                            <p className="text-white font-bold text-[10px] truncate max-w-[200px]">{formData.attachmentName}</p>
                                            <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, attachmentUrl: '', attachmentName: '' })); }} className="text-dark-muted hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="text-dark-muted mx-auto mb-1.5" size={20} />
                                            <p className="text-[9px] text-dark-muted font-bold uppercase tracking-widest">Click to upload resource</p>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleAttachmentUpload} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-4 bg-white/5 text-white font-bold rounded-lg border border-white/10 uppercase text-[10px] tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || uploadingAttachment}
                                className="flex-1 py-4 bg-brand-primary text-dark-bg font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-lg disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                                Create Assignment
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MissionControl;
