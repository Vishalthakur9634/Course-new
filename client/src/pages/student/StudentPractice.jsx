import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, CheckCircle, Clock, Play, Send, RefreshCw, Code, Terminal, ChevronRight } from 'lucide-react';
import CodeEditor from '../../components/CodeEditor';

// Workspace Component
const PracticeWorkspace = ({ problem, editorCode, setEditorCode, onRun, output, onSubmit, isSubmitting }) => {
    // Reset code when problem changes
    useEffect(() => {
        if (problem.type === 'coding' && problem.starterCode) {
            setEditorCode(problem.starterCode);
        } else {
            setEditorCode('// No starter code provided');
        }
    }, [problem, setEditorCode]);

    return (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
            {/* Left: Problem Description */}
            <div className="w-full lg:w-1/3 bg-dark-layer1 rounded-xl border border-dark-layer2 flex flex-col overflow-hidden shadow-xl">
                <div className="p-4 border-b border-dark-layer2 bg-dark-layer2/30">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${problem.type === 'coding' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                            {problem.type || 'Subjective'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${problem.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                            problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                            }`}>
                            {problem.difficulty}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{problem.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
                            {problem.points || 0} Points
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-6">{problem.description}</p>

                    {problem.attachments && problem.attachments.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <h4 className="text-xs font-bold text-dark-muted uppercase mb-3">Resources</h4>
                            <div className="flex flex-col gap-2">
                                {problem.attachments.map((att, i) => (
                                    <a
                                        key={i}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 bg-dark-layer2 hover:bg-white/5 p-3 rounded-lg text-sm text-brand-primary transition-colors border border-white/5"
                                    >
                                        <FileText size={16} />
                                        <span className="truncate">{att.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Code Editor & Output */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Editor Panel */}
                <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                    <div className="flex justify-between items-center p-2 bg-[#252526] border-b border-white/5">
                        <div className="flex items-center gap-2 px-2">
                            <Code size={14} className="text-brand-primary" />
                            <span className="text-xs font-bold text-dark-muted uppercase tracking-widest">JavaScript Playground</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditorCode(problem.starterCode || '')}
                                className="p-1.5 text-dark-muted hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Reset Code"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <CodeEditor
                            value={editorCode}
                            onChange={setEditorCode}
                            height="100%"
                            theme="vs-dark"
                        />
                    </div>
                </div>

                {/* Output & Actions Panel */}
                <div className="h-48 bg-dark-layer1 rounded-xl border border-dark-layer2 flex flex-col shadow-inner">
                    <div className="flex justify-between items-center p-3 border-b border-dark-layer2 bg-dark-layer2/20">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-brand-secondary" />
                            <span className="text-xs font-bold text-dark-muted uppercase tracking-wider">Console Output</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onRun}
                                className="px-4 py-1.5 bg-dark-layer2 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/5"
                            >
                                <Play size={14} className="fill-white" /> Run
                            </button>
                            <button
                                onClick={() => onSubmit(problem)}
                                disabled={isSubmitting}
                                className="px-6 py-1.5 bg-brand-primary text-black text-xs font-black rounded-lg hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : <><Send size={14} /> Submit Solution</>}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-black/40">
                        {output.length > 0 ? (
                            output.map((line, i) => (
                                <div key={i} className="text-green-400 border-b border-white/5 pb-1 mb-1 last:border-0">{line}</div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <span className="text-dark-muted italic text-xs">Run code to see test results and logs...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentPractice = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [loading, setLoading] = useState(true);

    // Practice 2.0 State
    const [editorCode, setEditorCode] = useState('');
    const [output, setOutput] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchProblems(selectedCourse._id);
        }
    }, [selectedCourse]);

    const fetchEnrolledCourses = async () => {
        try {
            const { data } = await api.get('/courses/my-learning');
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
            if (data.length > 0) setSelectedProblem(data[0]);
            else setSelectedProblem(null);
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
    };

    const handleRunCode = () => {
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));

        try {
            // eslint-disable-next-line no-eval
            eval(editorCode);
        } catch (error) {
            logs.push(`Error: ${error.message}`);
        } finally {
            console.log = originalLog;
            setOutput(logs);
        }
    };

    const handleSubmit = async (problem) => {
        if (!editorCode.trim()) {
            alert('Please write some code before submitting.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/practice/${problem._id}/submit`, {
                code: editorCode,
                status: 'Pending',
                grade: 0
            });
            alert('Solution submitted successfully!');
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit solution.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-dark-layer1">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
            <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-2xl p-6 border border-white/5">
                <h1 className="text-2xl font-black text-white flex items-center gap-3">
                    <Terminal className="text-brand-primary" /> Daily Challenges
                </h1>
                <p className="text-dark-muted text-sm mt-1 font-medium">Solve daily coding problems to earn points and climb the leaderboard.</p>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                {/* Left Drawer: Problem List / Course Selector */}
                <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4 min-h-0">
                    <div className="bg-dark-layer1 p-4 rounded-xl border border-dark-layer2 shadow-lg">
                        <label className="text-dark-muted font-bold text-[10px] uppercase tracking-widest mb-2 block">Active Course</label>
                        <select
                            value={selectedCourse?._id || ''}
                            onChange={(e) => setSelectedCourse(courses.find(c => c._id === e.target.value))}
                            className="w-full bg-dark-layer2 text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-brand-primary text-sm font-bold"
                        >
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 bg-dark-layer1/50 rounded-xl border border-dark-layer2 p-4 shadow-inner">
                        <label className="text-dark-muted font-bold text-[10px] uppercase tracking-widest mb-3 block">Available Problems</label>
                        {problems.map((problem) => (
                            <button
                                key={problem._id}
                                onClick={() => {
                                    setSelectedProblem(problem);
                                    setOutput([]);
                                }}
                                className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${selectedProblem?._id === problem._id
                                    ? 'bg-brand-primary/10 border-brand-primary shadow-lg scale-[1.02]'
                                    : 'bg-dark-layer1 border-dark-layer2 hover:border-brand-primary/30'
                                    }`}
                            >
                                {selectedProblem?._id === problem._id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${problem.type === 'coding' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {problem.type || 'Subjective'}
                                    </span>
                                    <span className="text-[10px] font-bold text-brand-primary">{problem.points} Pts</span>
                                </div>
                                <h4 className={`font-bold text-sm mb-1 ${selectedProblem?._id === problem._id ? 'text-white' : 'text-gray-300'} group-hover:text-white transition-colors flex items-center justify-between`}>
                                    {problem.title}
                                    <ChevronRight size={14} className={selectedProblem?._id === problem._id ? 'opacity-100' : 'opacity-0'} />
                                </h4>
                                <p className="text-[10px] text-dark-muted line-clamp-2">{problem.description}</p>
                            </button>
                        ))}

                        {problems.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-xs text-dark-muted italic">No challenges for this course.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Active Problem Workspace */}
                <div className="flex-1 min-w-0">
                    {selectedProblem ? (
                        <PracticeWorkspace
                            problem={selectedProblem}
                            editorCode={editorCode}
                            setEditorCode={setEditorCode}
                            onRun={handleRunCode}
                            output={output}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-dark-layer1 rounded-2xl border border-dashed border-dark-layer2 shadow-lg">
                            <CheckCircle size={64} className="mb-4 text-dark-primary/20" />
                            <h3 className="text-xl font-black text-white">Select a Problem</h3>
                            <p className="text-dark-muted text-sm max-w-xs text-center mt-2">Pick a challenge from the list to start coding and earn your points!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPractice;
