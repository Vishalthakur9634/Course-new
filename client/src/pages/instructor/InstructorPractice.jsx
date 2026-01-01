import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import {
    Plus, Trash2, FileText, Upload, X, Code, Terminal, Check,
    Users, MessageSquare, Award, Clock, ChevronRight, Filter, Play
} from 'lucide-react';
import CodeEditor from '../../components/CodeEditor';

const InstructorPractice = () => {
    const { addToast } = useToast();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [problems, setProblems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('problems'); // 'problems' or 'submissions'

    // Submissions state
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradingFeedback, setGradingFeedback] = useState('');
    const [gradingScore, setGradingScore] = useState(0);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [type, setType] = useState('subjective');
    const [difficulty, setDifficulty] = useState('Easy');
    const [points, setPoints] = useState(10);
    const [starterCode, setStarterCode] = useState('// Write your code here\n');
    const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '', hidden: false }]);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchProblems(selectedCourse._id);
            if (activeTab === 'submissions') fetchSubmissions(selectedCourse._id);
        }
    }, [selectedCourse, activeTab]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/instructor/courses');
            setCourses(data);
            if (data.length > 0) setSelectedCourse(data[0]);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
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

    const fetchSubmissions = async (courseId) => {
        try {
            // Updated route to fetch all submissions for a course's problems
            const { data } = await api.get(`/practice/course/${courseId}/submissions`);
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
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
            addToast('Failed to upload attachment', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                courseId: selectedCourse._id,
                title,
                description,
                attachments,
                type,
                difficulty,
                points,
                starterCode: type === 'coding' ? starterCode : undefined,
                testCases: type === 'coding' ? testCases : undefined
            };
            await api.post('/practice', payload);
            fetchProblems(selectedCourse._id);
            setShowForm(false);
            // Reset...
            setTitle(''); setDescription(''); setAttachments([]); setType('subjective');
            setStarterCode('// Write your code here\n'); setTestCases([{ input: '', expectedOutput: '', hidden: false }]);
            addToast('Challenge deployed successfully', 'success');
        } catch (error) {
            addToast('Failed to create problem', 'error');
        }
    };

    const handleGradeSubmission = async () => {
        try {
            await api.put(`/practice/submission/${selectedSubmission._id}/grade`, {
                grade: gradingScore,
                feedback: gradingFeedback,
                status: 'Passed'
            });
            addToast('Graded successfully!', 'success');
            fetchSubmissions(selectedCourse._id);
            setSelectedSubmission(null);
        } catch (error) {
            addToast('Failed to grade', 'error');
        }
    };

    const handleDelete = async (problemId) => {
        if (!window.confirm('Delete this practice problem? This action cannot be undone.')) return;
        try {
            await api.delete(`/practice/${problemId}`);
            addToast('Problem deleted successfully', 'success');
            fetchProblems(selectedCourse._id);
        } catch (error) {
            console.error('Error deleting problem:', error);
            addToast('Failed to delete problem', 'error');
        }
    };

    return (
        <div className="space-y-6 flex flex-col h-full overflow-hidden p-6 bg-dark-bg">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-dark-layer1 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Terminal className="text-brand-primary" /> Practice Lab
                    </h1>
                    <p className="text-dark-muted font-medium mt-1">Design and evaluate student challenges</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex bg-dark-layer2 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('problems')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'problems' ? 'bg-brand-primary text-dark-bg shadow-lg' : 'text-dark-muted hover:text-white'}`}
                        >
                            Challenges
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'submissions' ? 'bg-brand-primary text-dark-bg shadow-lg' : 'text-dark-muted hover:text-white'}`}
                        >
                            Submissions
                        </button>
                    </div>

                    <select
                        value={selectedCourse?._id || ''}
                        onChange={(e) => setSelectedCourse(courses.find(c => c._id === e.target.value))}
                        className="bg-dark-layer2 text-white px-4 py-2 rounded-2xl border border-white/5 focus:outline-none focus:border-brand-primary font-bold text-sm"
                    >
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="p-3 bg-brand-primary text-dark-bg rounded-2xl hover:bg-brand-hover transition-all shadow-xl shadow-brand-primary/20"
                    >
                        {showForm ? <X size={24} /> : <Plus size={24} />}
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'problems' ? (
                    <div className="space-y-6">
                        {showForm && (
                            <div className="bg-dark-layer1 p-10 rounded-[3rem] border border-white/5 shadow-2xl animate-in zoom-in-95 duration-300">
                                <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3"><Plus className="text-brand-primary" /> Create New Challenge</h2>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Title</label>
                                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand-primary" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Problem Type</label>
                                            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand-primary">
                                                <option value="subjective">Subjective / Written</option>
                                                <option value="coding">Coding Challenge (JS)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Difficulty</label>
                                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand-primary">
                                                <option value="Easy">Beginner (Easy)</option>
                                                <option value="Medium">Intermediate (Medium)</option>
                                                <option value="Hard">Advanced (Hard)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Reward Points</label>
                                            <input type="number" value={points} onChange={e => setPoints(e.target.value)} className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand-primary" />
                                        </div>
                                        <div className="space-y-2 flex flex-col justify-end">
                                            <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} />
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-dark-layer2 border border-dashed border-white/20 hover:border-brand-primary rounded-2xl py-4 text-dark-muted hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                <Upload size={16} /> Attach Resource
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Problem Description</label>
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-brand-primary min-h-[150px] resize-none" required />
                                    </div>

                                    {type === 'coding' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Boilerplate Starter Code</label>
                                                    <div className="h-64 rounded-3xl border border-white/10 overflow-hidden shadow-inner">
                                                        <CodeEditor value={starterCode} onChange={setStarterCode} height="100%" />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Auto-Grading Test Cases</label>
                                                        <button type="button" onClick={() => setTestCases([...testCases, { input: '', expectedOutput: '', hidden: false }])} className="text-[10px] font-black text-brand-primary uppercase hover:underline flex items-center gap-1">
                                                            <Plus size={12} /> Add Case
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                                        {testCases.map((tc, idx) => (
                                                            <div key={idx} className="bg-dark-layer2 p-4 rounded-2xl border border-white/10 grid grid-cols-2 gap-3 relative group">
                                                                <button type="button" onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl scale-75 hover:scale-100">
                                                                    <X size={12} />
                                                                </button>
                                                                <input placeholder="Input" value={tc.input} onChange={e => {
                                                                    const n = [...testCases]; n[idx].input = e.target.value; setTestCases(n);
                                                                }} className="bg-dark-layer1 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" />
                                                                <input placeholder="Output" value={tc.expectedOutput} onChange={e => {
                                                                    const n = [...testCases]; n[idx].expectedOutput = e.target.value; setTestCases(n);
                                                                }} className="bg-dark-layer1 border border-white/5 rounded-xl px-4 py-2 text-xs text-brand-primary" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-4 pt-4">
                                        <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4 text-dark-muted font-black uppercase text-xs tracking-widest hover:text-white">Cancel</button>
                                        <button type="submit" className="px-12 py-4 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover shadow-2xl shadow-brand-primary/20 transition-all uppercase text-xs tracking-widest">Deploy Challenge</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {problems.map(problem => (
                                <div key={problem._id} className="bg-dark-layer1 p-8 rounded-[2.5rem] border border-white/5 hover:border-brand-primary/30 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${problem.type === 'coding' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {problem.type || 'Subjective'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${problem.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                                                problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                        <button onClick={() => handleDelete(problem._id)} className="text-dark-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">{problem.title}</h3>
                                    <p className="text-dark-muted text-sm line-clamp-3 mb-6 font-medium">{problem.description}</p>
                                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                        <div className="text-xs font-black text-brand-primary uppercase tracking-widest">{problem.points} Reward Points</div>
                                        <div className="text-[10px] text-dark-muted font-bold uppercase">{new Date(problem.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                        {/* Submissions List */}
                        <div className="lg:col-span-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-lg font-black text-white">Attempts</h3>
                                <Filter size={18} className="text-dark-muted" />
                            </div>
                            {submissions.map(sub => (
                                <button
                                    key={sub._id}
                                    onClick={() => setSelectedSubmission(sub)}
                                    className={`w-full text-left p-6 rounded-3xl border transition-all ${selectedSubmission?._id === sub._id ? 'bg-brand-primary border-brand-primary shadow-xl' : 'bg-dark-layer1 border-white/5 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${sub.status === 'Passed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {sub.status}
                                        </div>
                                        <span className={`text-[10px] font-black ${selectedSubmission?._id === sub._id ? 'text-dark-bg/60' : 'text-dark-muted'}`}>
                                            {new Date(sub.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <h4 className={`font-black text-sm truncate ${selectedSubmission?._id === sub._id ? 'text-dark-bg' : 'text-white'}`}>
                                        {sub.studentId?.name || 'Student'}
                                    </h4>
                                    <p className={`text-[11px] font-bold mt-1 ${selectedSubmission?._id === sub._id ? 'text-dark-bg/60' : 'text-dark-muted'}`}>
                                        Task: {sub.problemId?.title || 'Unknown Problem'}
                                    </p>
                                </button>
                            ))}
                            {submissions.length === 0 && (
                                <div className="text-center py-20 text-dark-muted italic">No submissions yet for this course.</div>
                            )}
                        </div>

                        {/* Submission Detail View */}
                        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
                            {selectedSubmission ? (
                                <div className="h-full bg-dark-layer1 rounded-[3rem] border border-white/5 flex flex-col shadow-2xl relative overflow-hidden">
                                    <header className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center font-black text-dark-bg text-xl">
                                                {selectedSubmission.studentId?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white">{selectedSubmission.studentId?.name}</h3>
                                                <p className="text-xs text-brand-primary font-black uppercase">{selectedSubmission.problemId?.title}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-dark-muted uppercase">Status</p>
                                                <p className="text-sm font-black text-white uppercase mt-1">{selectedSubmission.status}</p>
                                            </div>
                                            <div className="text-center border-l border-white/10 pl-6">
                                                <p className="text-[10px] font-black text-dark-muted uppercase">Points</p>
                                                <p className="text-sm font-black text-brand-primary mt-1">{selectedSubmission.grade} / {selectedSubmission.problemId?.points}</p>
                                            </div>
                                        </div>
                                    </header>

                                    <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                        {selectedSubmission.problemId?.type === 'coding' ? (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                                    <Code size={14} /> Student Implementation
                                                </h4>
                                                <div className="h-96 rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-[#1e1e1e]">
                                                    <CodeEditor value={selectedSubmission.code} readOnly height="100%" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                                    <FileText size={14} /> Student Response
                                                </h4>
                                                <div className="bg-dark-layer2 p-8 rounded-[2.5rem] border border-white/5 text-white font-medium leading-relaxed whitespace-pre-wrap">
                                                    {selectedSubmission.code}
                                                </div>
                                            </div>
                                        )}

                                        {/* Grading Form */}
                                        <div className="bg-dark-layer2 p-8 rounded-[3rem] border border-brand-primary/20 shadow-2xl mt-8">
                                            <h4 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                                                <Award className="text-brand-primary" /> Evaluation & Grading
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <div className="md:col-span-1 space-y-2">
                                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Assign Points</label>
                                                    <input
                                                        type="number"
                                                        value={gradingScore}
                                                        onChange={e => setGradingScore(parseInt(e.target.value))}
                                                        max={selectedSubmission.problemId?.points}
                                                        className="w-full bg-dark-layer1 border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:border-brand-primary"
                                                        placeholder="Score"
                                                    />
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Instructor Feedback</label>
                                                    <textarea
                                                        value={gradingFeedback}
                                                        onChange={e => setGradingFeedback(e.target.value)}
                                                        className="w-full bg-dark-layer1 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-brand-primary h-24 resize-none"
                                                        placeholder="Write constructive feedback here..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-6">
                                                <button onClick={handleGradeSubmission} className="bg-brand-primary text-dark-bg px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-hover shadow-xl shadow-brand-primary/20 transition-all">Submit Evaluation</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-dark-layer1 rounded-[3rem] border border-dashed border-white/10 text-center p-12">
                                    <Users size={80} className="text-dark-muted opacity-20 mb-6" />
                                    <h3 className="text-2xl font-black text-white italic">Select an attempt to evaluate</h3>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default InstructorPractice;
