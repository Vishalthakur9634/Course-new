import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Calendar, Clock, Download,
    Upload, CheckCircle2, AlertCircle, Loader2,
    BookOpen, Search, Filter, History, ChevronRight,
    ArrowUpCircle, Info, MessageSquare, ExternalLink, Award,
    Zap, Target, Shield, Cpu, Activity, X
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const MissionBriefing = () => {
    const { addToast } = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({}); // assignmentId -> submission

    // UI State
    const [filter, setFilter] = useState('all'); // all, pending, completed
    const [searchQuery, setSearchQuery] = useState('');

    // Upload state
    const [uploading, setUploading] = useState(null); // assignmentId
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSubmitModal, setShowSubmitModal] = useState(null); // assignment object
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: myLearning } = await api.get('/courses/my-learning');
            const enrolledCourses = myLearning.map(item => item.courseId).filter(Boolean);
            setCourses(enrolledCourses);

            if (enrolledCourses.length > 0) {
                const firstCourse = enrolledCourses[0];
                setSelectedCourse(firstCourse);
                await fetchAssignments(firstCourse._id);
            }
        } catch (error) {
            console.error('Error fetching data');
            addToast('Failed to load assignment data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (courseId) => {
        try {
            const { data: assData } = await api.get(`/assignments/course/${courseId}`);
            setAssignments(assData);

            const submissionPromises = assData.map(ass =>
                api.get(`/assignments/${ass._id}/my-submission`)
                    .then(res => ({ id: ass._id, data: res.data }))
                    .catch(() => ({ id: ass._id, data: null }))
            );

            const results = await Promise.all(submissionPromises);
            const submissionsMap = {};
            results.forEach(res => {
                if (res.data) submissionsMap[res.id] = res.data;
            });
            setSubmissions(submissionsMap);
        } catch (error) {
            console.error('Error fetching assignments');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSubmissionFile(file);
            addToast(`File "${file.name}" selected`, 'success');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile) return;

        const assignmentId = showSubmitModal._id;
        setUploading(assignmentId);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', submissionFile);

            const uploadRes = await api.post('/upload', formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            const { url, filename } = uploadRes.data;

            const { data: newSub } = await api.post(`/assignments/${assignmentId}/submit`, {
                submissionUrl: url,
                submissionName: filename,
                submissionText
            });

            setSubmissions({ ...submissions, [assignmentId]: newSub });
            setShowSubmitModal(null);
            setSubmissionFile(null);
            setSubmissionText('');
            addToast('Assignment submitted successfully', 'success');
        } catch (error) {
            addToast('Submission failed. Please try again.', 'error');
        } finally {
            setUploading(null);
            setUploadProgress(0);
        }
    };

    const getFilteredAssignments = () => {
        let filtered = assignments;

        if (searchQuery) {
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filter !== 'all') {
            filtered = filtered.filter(a => {
                const sub = submissions[a._id];
                const isOverdue = new Date(a.dueDate) < new Date() && !sub;
                if (filter === 'completed') return !!sub;
                if (filter === 'pending') return !sub && !isOverdue;
                return true;
            });
        }

        return filtered;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4 text-white">
            <Loader2 className="animate-spin text-brand-primary" size={48} />
            <p className="text-dark-muted font-bold uppercase tracking-widest text-xs">Loading assignments...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 font-inter px-4">
            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b border-white/5 pt-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                            <Shield className="text-brand-primary" size={18} />
                        </div>
                        <span className="text-brand-primary text-[10px] font-bold uppercase tracking-widest">Student Portal</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white uppercase tracking-tight">
                        Course <span className="text-brand-primary">Assignments</span>
                    </h1>
                    <p className="text-dark-muted font-bold text-xs flex items-center gap-2">
                        <BookOpen size={14} className="text-brand-primary" />
                        {selectedCourse?.title || 'General Curriculum'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <div className="flex-1 lg:flex-none relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH TASKS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full lg:w-64 bg-[#1a1a1a] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-white font-bold text-[10px] uppercase tracking-widest focus:border-brand-primary outline-none transition-all"
                        />
                    </div>

                    <select
                        value={selectedCourse?._id}
                        onChange={(e) => {
                            const course = courses.find(c => c._id === e.target.value);
                            setSelectedCourse(course);
                            if (course?._id) fetchAssignments(course._id);
                        }}
                        className="flex-1 lg:flex-none bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2.5 text-white font-bold text-[10px] uppercase tracking-widest focus:border-brand-primary outline-none cursor-pointer hover:bg-white/5 transition-all appearance-none"
                    >
                        {courses && courses.length > 0 && courses.map(course => (
                            <option key={course?._id} value={course?._id}>{course?.title}</option>
                        ))}
                    </select>

                    <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-lg border border-white/5">
                        {['all', 'pending', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-brand-primary text-dark-bg' : 'text-dark-muted hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Assignments List */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {getFilteredAssignments().map(ass => {
                    const submission = submissions[ass._id];
                    const isDue = new Date(ass.dueDate) < new Date() && !submission;

                    return (
                        <div key={ass._id} className="bg-[#1a1a1a] rounded-xl p-8 border border-white/5 hover:border-brand-primary/20 transition-all shadow-md group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">{ass.title}</h2>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-dark-muted uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-brand-primary" />
                                            <span>DUE: {new Date(ass.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Award size={12} className="text-yellow-500" />
                                            <span>{ass.points} pts</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    {submission ? (
                                        <div className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${submission.status === 'Graded' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'}`}>
                                            {submission.status.toUpperCase()}
                                        </div>
                                    ) : isDue ? (
                                        <div className="px-4 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                            OVERDUE
                                        </div>
                                    ) : (
                                        <div className="px-4 py-1 bg-white/5 text-dark-muted border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                            PENDING
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-dark-muted text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                                {ass.description}
                            </p>

                            <div className="flex flex-wrap gap-3 mb-8">
                                {ass.attachmentUrl && (
                                    <a
                                        href={ass.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-brand-primary font-bold uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all border border-brand-primary/10"
                                    >
                                        <Download size={14} /> Download Files
                                    </a>
                                )}
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                {!submission ? (
                                    <button
                                        onClick={() => setShowSubmitModal(ass)}
                                        className="w-full py-3 bg-brand-primary text-dark-bg rounded-lg font-bold uppercase tracking-widest text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Zap size={16} fill="currentColor" /> Submit Assignment
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        {submission.status === 'Graded' && (
                                            <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5">
                                                <h4 className="flex items-center gap-2 text-[9px] font-bold text-brand-primary uppercase tracking-widest mb-2">
                                                    <Info size={12} /> Instructor Feedback
                                                </h4>
                                                <p className="text-dark-muted text-xs font-medium leading-relaxed italic">
                                                    "{submission.feedback || 'Your submission has been reviewed.'}"
                                                </p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-white">{submission.grade}</span>
                                                    <span className="text-[10px] text-dark-muted font-bold uppercase">/ {ass.points} pts</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText size={18} className="text-brand-primary" />
                                                <span className="text-[10px] font-bold text-white uppercase truncate max-w-[150px]">{submission.submissionName || 'submission.file'}</span>
                                            </div>
                                            <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-white transition-colors">
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {assignments.length === 0 && (
                    <div className="lg:col-span-2 py-32 rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center px-10">
                        <Shield size={48} className="text-dark-muted/20 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No Assignments Found</h3>
                        <p className="text-dark-muted text-[10px] font-bold uppercase tracking-widest">Check back later for new tasks assigned by your instructor.</p>
                    </div>
                )}
            </div>

            {/* Submission Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !uploading && setShowSubmitModal(null)}></div>
                    <form
                        onSubmit={handleSubmit}
                        className="relative w-full max-w-xl bg-[#1a1a1a] border border-white/10 rounded-xl p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in zoom-in-95"
                    >
                        <header className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Submit <span className="text-brand-primary">Work</span></h2>
                                <p className="text-dark-muted text-[9px] font-bold uppercase tracking-widest truncate max-w-[300px]">{showSubmitModal.title}</p>
                            </div>
                            <button type="button" onClick={() => setShowSubmitModal(null)} className="text-dark-muted hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </header>

                        <div className="space-y-6">
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all">
                                {submissionFile ? (
                                    <div className="flex flex-col items-center text-center px-6">
                                        <FileText className="text-brand-primary mb-3" size={32} />
                                        <p className="text-white font-bold text-sm truncate max-w-xs">{submissionFile.name}</p>
                                        <p className="text-brand-primary text-[9px] font-bold uppercase tracking-widest mt-2">Ready to upload</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <ArrowUpCircle className="text-dark-muted mb-4" size={32} />
                                        <p className="text-xs font-bold text-white uppercase">Click to browse file</p>
                                        <p className="text-[9px] text-dark-muted mt-2 uppercase tracking-widest">PDF, ZIP, DOCX (Max 100MB)</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} required />
                            </label>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Comments (Optional)</label>
                                <textarea
                                    placeholder="Add any additional notes for the instructor..."
                                    value={submissionText}
                                    onChange={e => setSubmissionText(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white font-medium h-32 resize-none focus:border-brand-primary outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {uploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-bold text-brand-primary uppercase tracking-widest">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading || !submissionFile}
                                className="w-full py-4 bg-brand-primary text-dark-bg font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-lg disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                                {uploading ? 'Processing...' : 'Complete Submission'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MissionBriefing;
