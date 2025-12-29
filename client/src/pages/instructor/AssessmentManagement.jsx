import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Award, BookOpen, Clock, Check, X,
    ChevronRight, Loader2, Sparkles, Code, FileText,
    List, Settings, Save, ArrowLeft, RefreshCw, BarChart, Users, Eye
} from 'lucide-react';
import api from '../../utils/api';
import CodeEditor from '../../components/CodeEditor';

const AssessmentManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('builder'); // 'builder' or 'results'

    // Submissions state
    const [submissions, setSubmissions] = useState([]);
    const [selectedSub, setSelectedSub] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse && activeTab === 'results' && assessment) {
            fetchSubmissions(assessment._id);
        }
    }, [selectedCourse, activeTab, assessment]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/instructor/courses');
            setCourses(response.data);
            if (response.data.length > 0) {
                handleSelectCourse(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (assessmentId) => {
        try {
            const { data } = await api.get(`/mega/assessments/${assessmentId}/submissions`);
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching submissions', error);
        }
    };

    const handleSelectCourse = async (course) => {
        setSelectedCourse(course);
        setAssessment(null);
        try {
            const response = await api.get(`/mega/assessments/${course._id}`);
            if (response.data) {
                setAssessment(response.data);
            } else {
                setAssessment({
                    title: `Mastery Test: ${course.title}`,
                    courseId: course._id,
                    questions: [{
                        type: 'mcq',
                        questionText: '',
                        options: ['', '', '', ''],
                        correctAnswerIndex: 0,
                        points: 1
                    }],
                    passingScore: 70,
                    durationLimit: 30
                });
            }
        } catch (error) {
            console.error('Error fetching assessment');
        }
    };

    const handleAddQuestion = (type = 'mcq') => {
        const newQuestion = {
            type,
            questionText: '',
            points: 1
        };

        if (type === 'mcq') {
            newQuestion.options = ['', '', '', ''];
            newQuestion.correctAnswerIndex = 0;
        } else if (type === 'coding') {
            newQuestion.starterCode = '// Write your code here';
            newQuestion.testCases = [{ input: '', expectedOutput: '', hidden: false }];
        }

        setAssessment({
            ...assessment,
            questions: [...assessment.questions, newQuestion]
        });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...assessment.questions];
        newQuestions[index][field] = value;
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...assessment.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const handleAddTestCase = (qIndex) => {
        const newQuestions = [...assessment.questions];
        newQuestions[qIndex].testCases.push({ input: '', expectedOutput: '', hidden: false });
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const handleTestCaseChange = (qIndex, tIndex, field, value) => {
        const newQuestions = [...assessment.questions];
        newQuestions[qIndex].testCases[tIndex][field] = value;
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const handleDeleteQuestion = (index) => {
        const newQuestions = assessment.questions.filter((_, i) => i !== index);
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/mega/assessments', assessment);
            alert('Assessment saved successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error saving assessment');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateSubmission = async () => {
        try {
            await api.put(`/mega/assessment-submissions/${selectedSub._id}/grade`, {
                answers: selectedSub.answers,
                totalScore: selectedSub.totalScore,
                status: 'Graded'
            });
            alert('Updated successfully!');
            fetchSubmissions(assessment._id);
            setSelectedSub(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full bg-dark-bg text-white">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-xl font-bold font-black tracking-widest uppercase">Mastery Builder Initializing...</p>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8 h-full bg-dark-bg overflow-hidden">
            {/* Sidebar: Course Selection */}
            <div className="w-full md:w-80 flex-shrink-0 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="bg-dark-layer1 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-white mb-2">Curriculum</h2>
                    <p className="text-[10px] text-brand-primary font-black mb-8 uppercase tracking-[0.2em]">Select course to manage</p>

                    <div className="space-y-4">
                        {courses.map(course => (
                            <button
                                key={course._id}
                                onClick={() => handleSelectCourse(course)}
                                className={`w-full text-left p-5 rounded-3xl transition-all border flex items-center justify-between group ${selectedCourse?._id === course._id
                                    ? 'bg-brand-primary border-brand-primary shadow-xl scale-[1.02]'
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-black truncate ${selectedCourse?._id === course._id ? 'text-dark-bg' : 'text-white'}`}>{course.title}</p>
                                    <p className={`text-[9px] uppercase tracking-widest font-black mt-1 ${selectedCourse?._id === course._id ? 'text-dark-bg/60' : 'text-brand-primary'}`}>
                                        {course.isPublished ? 'Live' : 'Draft'}
                                    </p>
                                </div>
                                <ChevronRight size={18} className={selectedCourse?._id === course._id ? 'text-dark-bg' : 'text-dark-muted group-hover:text-white'} />
                            </button>
                        ))}
                    </div>
                </div>

                {selectedCourse && assessment && (
                    <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                        <div className="flex bg-dark-layer2 p-1 rounded-2xl border border-white/5 mb-6">
                            <button
                                onClick={() => setActiveTab('builder')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'builder' ? 'bg-brand-primary text-dark-bg' : 'text-dark-muted hover:text-white'}`}
                            >
                                <Settings size={14} /> Builder
                            </button>
                            <button
                                onClick={() => setActiveTab('results')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-brand-primary text-dark-bg' : 'text-dark-muted hover:text-white'}`}
                            >
                                <BarChart size={14} /> Results
                            </button>
                        </div>
                        <h4 className="font-black text-white text-xs uppercase tracking-widest mb-4">Mastery Stats</h4>
                        <div className="space-y-4 opacity-80">
                            <div className="flex justify-between text-xs font-bold text-dark-muted">
                                <span>Total Challenges</span>
                                <span className="text-white">{assessment.questions.length}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-dark-muted">
                                <span>Max Possible Pts</span>
                                <span className="text-brand-primary">{assessment.questions.reduce((acc, q) => acc + (q.points || 0), 0)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-dark-muted">
                                <span>Avg Score</span>
                                <span className="text-white">-- %</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col">
                {!selectedCourse ? (
                    <div className="h-full flex flex-col items-center justify-center bg-dark-layer1 rounded-[3.5rem] border border-dashed border-white/10 text-center p-12">
                        <Award size={100} className="text-dark-muted/20 mb-8" />
                        <h2 className="text-4xl font-black text-white mb-4 italic">The Mastery Engine</h2>
                        <p className="text-dark-muted max-w-md mx-auto font-medium">Select a student curriculum to begin crafting advanced assessments or review collective performance analytics.</p>
                    </div>
                ) : activeTab === 'builder' ? (
                    /* Builder Tab Content (Same as previous implementation but refined) */
                    <div className="bg-dark-layer1 rounded-[3.5rem] border border-white/5 flex-1 flex flex-col overflow-hidden shadow-2xl relative">
                        <header className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/[0.01]">
                            <div>
                                <h1 className="text-3xl font-black text-white truncate max-w-md">{assessment?.title}</h1>
                                <p className="text-dark-muted text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <BookOpen size={14} className="text-brand-primary" /> Building for <span className="text-white">{selectedCourse.title}</span>
                                </p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-12 py-4 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover shadow-2xl shadow-brand-primary/20 transition-all flex items-center gap-3 uppercase text-xs tracking-[0.2em]"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Update Assessment
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                            {/* (Rest of builder UI here - keeping it concise) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-dark-muted uppercase ml-1">Title</label>
                                    <input type="text" value={assessment?.title} onChange={e => setAssessment({ ...assessment, title: e.target.value })} className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-3 text-white font-bold focus:outline-none focus:border-brand-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-dark-muted uppercase ml-1">Pass %</label>
                                    <input type="number" value={assessment?.passingScore} onChange={e => setAssessment({ ...assessment, passingScore: e.target.value })} className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-3 text-white font-bold focus:outline-none focus:border-brand-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-dark-muted uppercase ml-1">Time (Min)</label>
                                    <input type="number" value={assessment?.durationLimit} onChange={e => setAssessment({ ...assessment, durationLimit: e.target.value })} className="w-full bg-dark-layer2 border border-white/10 rounded-2xl px-6 py-3 text-white font-bold focus:outline-none focus:border-brand-primary" />
                                </div>
                            </div>

                            <div className="space-y-10">
                                {assessment?.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="bg-dark-layer2/50 border border-white/5 rounded-[3rem] p-10 relative group hover:border-brand-primary/20 transition-all">
                                        <div className="absolute -left-3 top-10 w-10 h-10 bg-brand-primary text-dark-bg rounded-2xl flex items-center justify-center font-black shadow-2xl">{qIndex + 1}</div>
                                        <button onClick={() => handleDeleteQuestion(qIndex)} className="absolute top-10 right-10 p-3 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-400/10 rounded-2xl"><Trash2 size={20} /></button>

                                        <div className="pl-6 space-y-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
                                                <div className="lg:col-span-3 space-y-2">
                                                    <label className="text-[10px] font-black text-dark-muted uppercase ml-1">Question Prompt ({q.type})</label>
                                                    <textarea value={q.questionText} onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)} className="w-full bg-dark-layer1 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-brand-primary min-h-[80px] resize-none" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-dark-muted uppercase ml-1">Points</label>
                                                    <input type="number" value={q.points} onChange={e => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))} className="w-full bg-dark-layer1 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand-primary" />
                                                </div>
                                            </div>

                                            {q.type === 'mcq' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className={`flex items-center gap-4 p-2 rounded-2xl border ${q.correctAnswerIndex === oIndex ? 'border-brand-primary bg-brand-primary/5' : 'border-white/5'}`}>
                                                            <button onClick={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${q.correctAnswerIndex === oIndex ? 'bg-brand-primary text-dark-bg' : 'bg-dark-layer2 text-dark-muted'}`}>{oIndex + 1}</button>
                                                            <input value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="flex-1 bg-transparent border-none text-sm text-white font-bold focus:outline-none" placeholder="Option text..." />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'coding' && (
                                                <div className="space-y-4">
                                                    <div className="h-48 rounded-2xl border border-white/10 overflow-hidden"><CodeEditor value={q.starterCode} onChange={v => handleQuestionChange(qIndex, 'starterCode', v)} height="100%" /></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center gap-4 pt-8">
                                    <button onClick={() => handleAddQuestion('mcq')} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-brand-primary hover:text-dark-bg transition-all">Add MCQ</button>
                                    <button onClick={() => handleAddQuestion('coding')} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-purple-500 transition-all">Add Coding</button>
                                    <button onClick={() => handleAddQuestion('subjective')} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-blue-500 transition-all">Add Subjective</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Results / Submissions Tab */
                    <div className="flex-1 flex gap-6 overflow-hidden">
                        {/* Submissions List */}
                        <div className="w-full lg:w-96 flex flex-col bg-dark-layer1 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
                            <header className="p-8 border-b border-white/5 bg-white/[0.01]">
                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                    <Users size={20} className="text-brand-primary" /> Active Attempts
                                </h3>
                            </header>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {submissions.map(sub => (
                                    <button
                                        key={sub._id}
                                        onClick={() => setSelectedSub(sub)}
                                        className={`w-full text-left p-6 rounded-[2.5rem] border transition-all ${selectedSub?._id === sub._id ? 'bg-brand-secondary border-brand-secondary shadow-xl scale-[1.02]' : 'bg-white/5 border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${sub.status === 'Graded' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>{sub.status}</span>
                                            <span className="text-[9px] font-bold text-dark-muted">{new Date(sub.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className={`font-black text-sm ${selectedSub?._id === sub._id ? 'text-dark-bg' : 'text-white'}`}>{sub.studentId?.name}</p>
                                        <p className={`text-[10px] font-bold mt-1 ${selectedSub?._id === sub._id ? 'text-dark-bg/60' : 'text-brand-primary'}`}>Total Mastery: {sub.totalScore} Pts</p>
                                    </button>
                                ))}
                                {submissions.length === 0 && <div className="text-center py-20 text-dark-muted font-bold italic">No submissions for this test.</div>}
                            </div>
                        </div>

                        {/* Detail Review Pane */}
                        <div className="flex-1 bg-dark-layer1 rounded-[3.5rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
                            {selectedSub ? (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <header className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-brand-primary rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-dark-bg shadow-xl">{selectedSub.studentId?.name?.charAt(0)}</div>
                                            <div>
                                                <h2 className="text-2xl font-black text-white">{selectedSub.studentId?.name}</h2>
                                                <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest mt-1">Assessment Completion Protocol</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-10">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-dark-muted uppercase">Final Score</p>
                                                <input value={selectedSub.totalScore} onChange={e => setSelectedSub({ ...selectedSub, totalScore: parseInt(e.target.value) })} className="bg-transparent border-none text-3xl font-black text-brand-primary text-center focus:outline-none w-20" />
                                            </div>
                                            <button onClick={handleUpdateSubmission} className="px-8 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover transition-all text-[10px] uppercase tracking-widest">Update Grade</button>
                                        </div>
                                    </header>

                                    <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                                        {selectedSub.answers.map((ans, idx) => (
                                            <div key={idx} className="bg-dark-layer2/40 p-10 rounded-[3rem] border border-white/5 relative">
                                                <div className="absolute -left-3 top-10 flex flex-col gap-2">
                                                    <div className="w-10 h-10 bg-dark-layer1 border border-white/10 rounded-2xl flex items-center justify-center text-white font-black">{idx + 1}</div>
                                                    <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-dark-muted"><Eye size={16} /></div>
                                                </div>

                                                <div className="pl-6 space-y-6">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{ans.type} response</span>
                                                        <div className="flex items-center gap-3">
                                                            <label className="text-[10px] font-black text-dark-muted uppercase">Question Score</label>
                                                            <input value={ans.score} onChange={e => {
                                                                const n = [...selectedSub.answers]; n[idx].score = parseInt(e.target.value); setSelectedSub({ ...selectedSub, answers: n });
                                                            }} className="w-12 bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-center text-white font-black focus:outline-none" />
                                                        </div>
                                                    </div>

                                                    {ans.type === 'coding' ? (
                                                        <div className="h-64 rounded-3xl border border-white/10 overflow-hidden shadow-inner bg-[#1e1e1e]">
                                                            <CodeEditor value={ans.codeAnswer} readOnly height="100%" />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-dark-layer1 p-8 rounded-[2rem] border border-white/5 text-white font-medium italic whitespace-pre-wrap leading-relaxed shadow-inner">
                                                            {ans.mcqAnswer !== undefined ? `Selected Option: ${ans.mcqAnswer + 1}` : ans.subjectiveAnswer || ans.codeAnswer}
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-dark-muted uppercase ml-2 tracking-widest">Instructor Evaluation Comment</label>
                                                        <textarea value={ans.feedback} onChange={e => {
                                                            const n = [...selectedSub.answers]; n[idx].feedback = e.target.value; setSelectedSub({ ...selectedSub, answers: n });
                                                        }} className="w-full bg-dark-layer1 border border-white/10 rounded-[2rem] px-8 py-4 text-white font-medium focus:outline-none h-20 resize-none" placeholder="Provide feedback to student..." />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-dark-layer1 text-center p-12">
                                    <BarChart size={120} className="text-dark-muted opacity-10 mb-8" />
                                    <h3 className="text-2xl font-black text-white italic">Analytics Awaiting Selection</h3>
                                    <p className="text-dark-muted max-w-sm mx-auto mt-4">Inspect individual student attempts to provide personalized feedback and verify mastery levels.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentManagement;
