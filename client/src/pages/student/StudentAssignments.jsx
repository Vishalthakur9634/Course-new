import React, { useState, useEffect } from 'react';
import {
    FileText, Calendar, Clock, Download,
    Upload, CheckCircle2, AlertCircle, Loader2,
    BookOpen, Search, Filter, History, ChevronRight,
    ArrowUpCircle, Info, MessageSquare, ExternalLink, Award
} from 'lucide-react';
import api from '../../utils/api';

const StudentAssignments = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({}); // assignmentId -> submission

    // Upload state
    const [uploading, setUploading] = useState(null); // assignmentId
    const [showSubmitModal, setShowSubmitModal] = useState(null); // assignment object
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submissionText, setSubmissionText] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Get my courses
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
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (courseId) => {
        try {
            const { data: assData } = await api.get(`/assignments/course/${courseId}`);
            setAssignments(assData);

            // Fetch my submissions for these assignments in parallel
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) setSubmissionFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile) return;

        const assignmentId = showSubmitModal._id;
        setUploading(assignmentId);
        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append('file', submissionFile);
            const uploadRes = await api.post('/upload', formData);
            const { url, filename } = uploadRes.data;

            // 2. Submit Assignment
            const { data: newSub } = await api.post(`/assignments/${assignmentId}/submit`, {
                submissionUrl: url,
                submissionName: filename,
                submissionText
            });

            setSubmissions({ ...submissions, [assignmentId]: newSub });
            setShowSubmitModal(null);
            setSubmissionFile(null);
            setSubmissionText('');
            alert('Assignment submitted successfully!');
        } catch (error) {
            alert('Upload failed');
        } finally {
            setUploading(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={40} />
            <p className="text-dark-muted font-black uppercase tracking-widest text-xs">Accessing Student Portal...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Content */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter">My Tasks</h1>
                    <p className="text-dark-muted font-black uppercase tracking-[0.3em] text-[10px] mt-2 ml-1">Academic Performance Hub</p>
                </div>

                <div className="flex gap-4">
                    <select
                        value={selectedCourse?._id}
                        onChange={(e) => {
                            const course = courses.find(c => c._id === e.target.value);
                            setSelectedCourse(course);
                            if (course?._id) fetchAssignments(course._id);
                        }}
                        className="bg-dark-layer1 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-brand-primary focus:outline-none shadow-xl"
                    >
                        {courses && courses.length > 0 && courses.filter(Boolean).map(course => (
                            <option key={course?._id} value={course?._id}>{course?.title}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {assignments.map(ass => {
                    const submission = submissions[ass._id];
                    const isDue = new Date(ass.dueDate) < new Date() && !submission;

                    return (
                        <div key={ass._id} className="bg-dark-layer1 rounded-[3rem] p-10 border border-white/5 relative group hover:border-brand-primary/20 transition-all overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                {submission ? (
                                    <div className="flex flex-col items-end">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${submission.status === 'Graded' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-yellow-500 text-dark-bg shadow-lg shadow-yellow-500/20'
                                            }`}>
                                            {submission.status === 'Graded' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                            {submission.status}
                                        </div>
                                        {submission.status === 'Graded' && (
                                            <p className="mt-2 text-2xl font-black text-brand-primary">{submission.grade}<span className="text-xs text-dark-muted">/{ass.points}</span></p>
                                        )}
                                    </div>
                                ) : isDue ? (
                                    <div className="px-4 py-1.5 bg-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle size={12} /> Overdue
                                    </div>
                                ) : (
                                    <div className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={12} /> Pending
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white">{ass.title}</h2>
                                    <div className="flex items-center gap-4 text-xs font-bold text-dark-muted uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-primary" /> {new Date(ass.dueDate).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><Award size={14} className="text-purple-500" /> {ass.points} Points</span>
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                                    <p className="text-dark-muted font-medium leading-relaxed italic line-clamp-3">
                                        {ass.description}
                                    </p>
                                </div>

                                {ass.attachmentUrl && (
                                    <a
                                        href={ass.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-brand-primary font-black uppercase text-[10px] tracking-widest hover:underline"
                                    >
                                        <Download size={14} /> Download Instructions
                                    </a>
                                )}

                                <div className="pt-6 border-t border-white/5">
                                    {!submission ? (
                                        <button
                                            onClick={() => setShowSubmitModal(ass)}
                                            className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-brand-primary hover:text-dark-bg transition-all flex items-center justify-center gap-3"
                                        >
                                            <ArrowUpCircle size={20} /> Deploy Solution
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            {submission.status === 'Graded' && (
                                                <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/20 space-y-3">
                                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                                        <MessageSquare size={14} /> Instructor Feedback
                                                    </h4>
                                                    <p className="text-dark-muted text-sm font-medium italic">"{submission.feedback || 'Excellent work on this task.'}"</p>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between px-4 py-2 border border-white/5 rounded-2xl bg-white/[0.01]">
                                                <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Submitted File:</span>
                                                <div className="flex items-center gap-2 text-white font-bold text-xs">
                                                    <FileText size={14} className="text-brand-primary" />
                                                    {submission.submissionName || 'view_submission'}
                                                    <ExternalLink size={12} className="opacity-50 cursor-pointer hover:opacity-100" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {assignments.length === 0 && (
                    <div className="lg:col-span-2 py-40 bg-dark-layer1 rounded-[4rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-10">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                            <BookOpen size={48} className="text-dark-muted" />
                        </div>
                        <h3 className="text-3xl font-black text-white italic mb-4">No Tasks Assigned</h3>
                        <p className="text-dark-muted font-medium max-w-md">Your instructor hasn't posted any assignments for this course yet. Check back soon for new challenges!</p>
                    </div>
                )}
            </div>

            {/* Submission Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowSubmitModal(null)}></div>
                    <form onSubmit={handleSubmit} className="relative w-full max-w-xl bg-dark-layer1 border border-white/10 rounded-[3.5rem] p-12 shadow-3xl space-y-8 animate-in zoom-in-95 duration-300">
                        <header>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-4 bg-brand-primary/10 rounded-3xl text-brand-primary">
                                    <Upload size={32} />
                                </div>
                                <button type="button" onClick={() => setShowSubmitModal(null)} className="p-2 text-dark-muted hover:text-white transition-all">
                                    <AlertCircle size={24} className="rotate-45" />
                                </button>
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Submit Solution</h2>
                            <p className="text-dark-muted text-xs font-black uppercase tracking-[0.2em] mt-2">Uploading to {showSubmitModal.title}</p>
                        </header>

                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer group-hover:border-brand-primary group-hover:bg-brand-primary/5 transition-all">
                                    {submissionFile ? (
                                        <div className="flex flex-col items-center p-4">
                                            <FileText className="text-brand-primary mb-2" size={32} />
                                            <p className="text-white font-bold text-sm text-center">{submissionFile.name}</p>
                                            <p className="text-dark-muted text-[10px] mt-1 uppercase font-black">Ready for deployment</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <ArrowUpCircle className="text-dark-muted mb-2 group-hover:text-brand-primary" size={32} />
                                            <p className="text-sm font-black text-white uppercase tracking-widest">Select Archive / File</p>
                                            <p className="text-[10px] text-dark-muted mt-1 uppercase">PDF, ZIP, DOCX (Max 20MB)</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" onChange={handleFileUpload} required />
                                </label>
                            </div>

                            <textarea
                                placeholder="Submission notes, external links, or observations..."
                                value={submissionText}
                                onChange={e => setSubmissionText(e.target.value)}
                                className="w-full bg-dark-layer2 border border-white/5 rounded-3xl px-8 py-5 text-white font-medium h-32 resize-none focus:ring-2 focus:ring-brand-primary focus:outline-none placeholder:text-dark-muted/50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={uploading || !submissionFile}
                            className="w-full py-6 bg-brand-primary text-dark-bg font-black rounded-3xl hover:bg-brand-hover transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest shadow-2xl shadow-brand-primary/30 disabled:opacity-50"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Deployment'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;
