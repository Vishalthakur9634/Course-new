import React, { useState, useEffect } from 'react';
import {
    Plus, FileText, Calendar, Clock, Download,
    ChevronRight, Loader2, Save, Trash2, Users,
    Clock3, CheckCircle2, AlertCircle, Search,
    Filter, Send, User, MessageSquare, BookOpen
} from 'lucide-react';
import api from '../../utils/api';

const InstructorAssignments = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Create form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        points: 100,
        attachmentUrl: '',
        attachmentName: ''
    });

    // Submissions state
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedSub, setSelectedSub] = useState(null);
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

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/assignments', { ...formData, courseId: selectedCourse._id });
            setShowCreateModal(false);
            setFormData({ title: '', description: '', dueDate: '', points: 100, attachmentUrl: '', attachmentName: '' });
            fetchAssignments(selectedCourse._id);
        } catch (error) {
            alert('Failed to create assignment');
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
        try {
            await api.put(`/assignments/submissions/${selectedSub._id}/grade`, gradingData);
            alert('Graded successfully');
            fetchSubmissions(selectedAssignment);
            setSelectedSub(null);
        } catch (error) {
            alert('Failed to grade');
        }
    };

    // Sidebar: Course Selection
    const CourseSidebar = () => (
        <div className="w-full md:w-80 space-y-4">
            <div className="bg-dark-layer1 rounded-3xl p-6 border border-white/5 shadow-xl">
                <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="text-brand-primary" size={20} /> Courses
                </h3>
                <div className="space-y-2">
                    {courses.map(course => (
                        <button
                            key={course._id}
                            onClick={() => { setSelectedCourse(course); setSelectedAssignment(null); }}
                            className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedCourse?._id === course._id
                                ? 'bg-brand-primary border-brand-primary text-dark-bg font-black'
                                : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'
                                }`}
                        >
                            <p className="text-sm truncate">{course.title}</p>
                            <p className={`text-[10px] uppercase font-bold mt-1 opacity-70`}>{course.category}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={40} />
            <p className="text-dark-muted font-black uppercase tracking-widest text-xs">Loading Assignment Hub...</p>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row gap-8 min-h-full">
            <CourseSidebar />

            <div className="flex-1 space-y-6">
                {/* Header Section */}
                <div className="bg-dark-layer1 rounded-[2.5rem] border border-white/5 p-8 flex justify-between items-center shadow-2xl">
                    <div>
                        <h2 className="text-3xl font-black text-white">{selectedCourse?.title || 'Select Course'}</h2>
                        <p className="text-dark-muted text-xs font-black uppercase tracking-widest mt-1">Assignment Management Protocol</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-brand-primary text-dark-bg px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20"
                    >
                        <Plus size={20} /> Create Assignment
                    </button>
                </div>

                {!selectedAssignment ? (
                    /* Assignment List */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {assignments.map(ass => (
                            <div key={ass._id} className="bg-dark-layer1 rounded-3xl p-6 border border-white/5 hover:border-brand-primary/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-primary/10 transition-all"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/5 rounded-2xl text-brand-primary">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Due Date</p>
                                        <p className="text-sm font-bold text-white">{new Date(ass.dueDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-white mb-2">{ass.title}</h4>
                                <p className="text-dark-muted text-sm line-clamp-2 mb-6 font-medium">{ass.description}</p>

                                <button
                                    onClick={() => fetchSubmissions(ass)}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-xs uppercase hover:bg-white/10 transition-all"
                                >
                                    <Users size={16} /> View Submissions
                                </button>
                            </div>
                        ))}
                        {assignments.length === 0 && (
                            <div className="md:col-span-2 py-20 bg-dark-layer1 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                                <AlertCircle size={48} className="text-dark-muted mb-4" />
                                <h3 className="text-white font-black text-xl mb-2">No Assignments Yet</h3>
                                <p className="text-dark-muted max-w-xs mx-auto">Click "Create Assignment" to start assigning tasks to your students.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Submissions Review */
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => setSelectedAssignment(null)}
                            className="flex items-center gap-2 text-dark-muted hover:text-white transition-colors text-sm font-black uppercase tracking-widest"
                        >
                            <ChevronRight className="rotate-180" size={16} /> Back to Assignments
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Students List */}
                            <div className="lg:col-span-1 bg-dark-layer1 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-[600px] shadow-2xl">
                                <header className="p-6 border-b border-white/5 bg-white/[0.01]">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                                        <Users className="text-brand-primary" size={20} /> Attempts
                                    </h3>
                                </header>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {submissions.map(sub => (
                                        <button
                                            key={sub._id}
                                            onClick={() => { setSelectedSub(sub); setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' }); }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${selectedSub?._id === sub._id
                                                ? 'bg-brand-primary border-brand-primary shadow-lg scale-[1.02]'
                                                : 'bg-white/5 border-transparent hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-dark-layer2 flex items-center justify-center text-white font-bold">
                                                {sub.studentId?.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className={`text-sm font-black truncate ${selectedSub?._id === sub._id ? 'text-dark-bg' : 'text-white'}`}>{sub.studentId?.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${sub.status === 'Graded' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-dark-bg'
                                                        }`}>
                                                        {sub.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {submissions.length === 0 && <div className="text-center py-20 text-dark-muted font-bold italic">No one has submitted yet.</div>}
                                </div>
                            </div>

                            {/* Grading Detail Pane */}
                            <div className="lg:col-span-2 bg-dark-layer1 rounded-[2.5rem] border border-white/5 min-h-[600px] shadow-2xl flex flex-col">
                                {selectedSub ? (
                                    <div className="flex-1 flex flex-col">
                                        <header className="p-8 border-b border-white/5 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-dark-layer2 rounded-2xl flex items-center justify-center text-brand-primary border border-white/5">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-white">{selectedSub.studentId?.name}</h3>
                                                    <p className="text-xs text-dark-muted font-bold">{selectedSub.studentId?.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Submitted On</p>
                                                <p className="text-sm font-bold text-white">{new Date(selectedSub.createdAt).toLocaleString()}</p>
                                            </div>
                                        </header>

                                        <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                                            {/* File Section */}
                                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                                <h4 className="text-xs font-black text-dark-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Download size={14} /> Submission File
                                                </h4>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                                                            <FileText size={32} />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-black truncate max-w-xs">{selectedSub.submissionName || 'assignment_upload.pdf'}</p>
                                                            <p className="text-xs text-dark-muted font-bold">Final version</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={selectedSub.submissionUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-black text-xs uppercase transition-all"
                                                    >
                                                        Download & View
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Student Notes */}
                                            {selectedSub.submissionText && (
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-black text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                                        <MessageSquare size={14} /> Student Comments
                                                    </h4>
                                                    <div className="bg-dark-layer2 p-6 rounded-3xl text-dark-muted font-medium italic border border-white/5 shadow-inner">
                                                        "{selectedSub.submissionText}"
                                                    </div>
                                                </div>
                                            )}

                                            {/* Grading Form */}
                                            <div className="pt-8 border-t border-white/5 space-y-6">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-2">Score (Max {selectedAssignment.points})</label>
                                                        <input
                                                            type="number"
                                                            value={gradingData.grade}
                                                            onChange={e => setGradingData({ ...gradingData, grade: e.target.value })}
                                                            className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-2xl focus:outline-none focus:border-brand-primary"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button
                                                            onClick={handleGrade}
                                                            className="w-full py-4 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-xl shadow-brand-primary/20"
                                                        >
                                                            <CheckCircle2 size={18} /> Update Grade
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-2">Final Feedback</label>
                                                    <textarea
                                                        value={gradingData.feedback}
                                                        onChange={e => setGradingData({ ...gradingData, feedback: e.target.value })}
                                                        placeholder="Provide detailed feedback to the student..."
                                                        className="w-full bg-dark-layer2 border border-white/10 rounded-3xl px-6 py-4 text-white font-medium focus:outline-none h-32 resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                        <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-6 text-dark-muted opacity-20">
                                            <User size={64} />
                                        </div>
                                        <h4 className="text-xl font-black text-white italic">Awaiting Selection</h4>
                                        <p className="text-dark-muted max-w-xs mx-auto mt-2">Pick an attempt from the left to start reviewing and grading the submission.</p>
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
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)}></div>
                    <form onSubmit={handleCreateAssignment} className="relative w-full max-w-xl bg-dark-layer1 border border-white/10 rounded-[3rem] p-10 shadow-3xl space-y-6">
                        <header>
                            <h2 className="text-2xl font-black text-white">Create New Task</h2>
                            <p className="text-dark-muted text-[10px] font-black uppercase tracking-widest mt-1">Populating curriculum with new assignment</p>
                        </header>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Assignment Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                required
                            />
                            <textarea
                                placeholder="Description and Instructions..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium h-32 resize-none focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Max Points</label>
                                    <input
                                        type="number"
                                        value={formData.points}
                                        onChange={e => setFormData({ ...formData, points: e.target.value })}
                                        className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all border border-white/10 uppercase text-xs tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 py-4 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-xl shadow-brand-primary/20"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Publish Task
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InstructorAssignments;
