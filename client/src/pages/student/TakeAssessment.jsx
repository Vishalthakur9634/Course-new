import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, ChevronRight, ChevronLeft, Send, CheckCircle,
    AlertCircle, Code, FileText, List, Play, Terminal, Award, Sparkles
} from 'lucide-react';
import api from '../../utils/api';
import CodeEditor from '../../components/CodeEditor';

const TakeAssessment = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { [questionId]: { value, type } }
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState(null);

    // Coding specific
    const [output, setOutput] = useState([]);

    useEffect(() => {
        fetchAssessment();
    }, [courseId]);

    useEffect(() => {
        if (timeLeft === 0) {
            handleAutoSubmit();
        }
        if (timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, isFinished]);

    const fetchAssessment = async () => {
        try {
            const { data } = await api.get(`/mega/assessments/${courseId}`);
            if (!data) {
                alert('No assessment found for this course.');
                navigate(-1);
                return;
            }
            setAssessment(data);
            if (data.durationLimit > 0) {
                setTimeLeft(data.durationLimit * 60);
            }

            // Initialize answers
            const initialAnswers = {};
            data.questions.forEach((q, idx) => {
                if (q.type === 'mcq') initialAnswers[idx] = { value: null, type: 'mcq' };
                else if (q.type === 'coding') initialAnswers[idx] = { value: q.starterCode || '', type: 'coding' };
                else initialAnswers[idx] = { value: '', type: 'subjective' };
            });
            setAnswers(initialAnswers);
        } catch (error) {
            console.error('Error fetching assessment', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (index, value) => {
        setAnswers({
            ...answers,
            [index]: { ...answers[index], value }
        });
    };

    const handleRunCode = () => {
        const q = assessment.questions[activeQuestionIndex];
        const studentCode = answers[activeQuestionIndex].value;
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));

        try {
            // Very basic evaluation for client-side JS
            // In a real app, this would run against test cases
            // eslint-disable-next-line no-eval
            eval(studentCode);

            // Simple validation if test cases exist
            if (q.testCases && q.testCases.length > 0) {
                logs.push('\n--- Running Test Cases ---');
                q.testCases.forEach((tc, idx) => {
                    if (!tc.hidden) {
                        logs.push(`Test Case ${idx + 1}: ${tc.input} -> Expected ${tc.expectedOutput}`);
                    }
                });
            }
        } catch (error) {
            logs.push(`Error: ${error.message}`);
        } finally {
            console.log = originalLog;
            setOutput(logs);
        }
    };

    const calculateScore = () => {
        let score = 0;
        const processedAnswers = [];

        assessment.questions.forEach((q, idx) => {
            const studentAns = answers[idx];
            let isCorrect = false;
            let questionScore = 0;

            if (q.type === 'mcq' && studentAns) {
                isCorrect = studentAns.value === q.correctAnswerIndex;
                if (isCorrect) questionScore = q.points;
            }
            // Coding and Subjective usually require manual grading or deeper logic
            // For now, we mark them as 'Pending' Grade but we can auto-grade simple coding if test cases matched

            processedAnswers.push({
                questionId: q._id,
                type: q.type,
                mcqAnswer: q.type === 'mcq' ? studentAns.value : undefined,
                codeAnswer: q.type === 'coding' ? studentAns.value : undefined,
                subjectiveAnswer: q.type === 'subjective' ? studentAns.value : undefined,
                isCorrect,
                score: questionScore
            });
            score += questionScore;
        });

        return { score, processedAnswers };
    };

    const handleSubmit = async () => {
        const confirmSubmit = window.confirm('Are you sure you want to submit your assessment?');
        if (!confirmSubmit) return;

        setIsSubmitting(true);
        const { score, processedAnswers } = calculateScore();

        try {
            const { data } = await api.post(`/mega/assessments/${assessment._id}/submit`, {
                answers: processedAnswers,
                totalScore: score
            });
            setResult(data);
            setIsFinished(true);
        } catch (error) {
            console.error('Submission error', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAutoSubmit = async () => {
        setIsFinished(true);
        const { score, processedAnswers } = calculateScore();
        try {
            const { data } = await api.post(`/mega/assessments/${assessment._id}/submit`, {
                answers: processedAnswers,
                totalScore: score
            });
            setResult(data);
        } catch (error) {
            console.error('Auto-submission error', error);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-white">
            <Sparkles className="animate-pulse text-brand-primary mb-4" size={48} />
            <h2 className="text-xl font-black uppercase tracking-widest">Constructing High-Fidelity Workspace...</h2>
        </div>
    );

    if (isFinished) {
        const percentage = ((result?.totalScore || 0) / assessment.questions.reduce((acc, q) => acc + q.points, 0)) * 100;
        const passed = percentage >= assessment.passingScore;

        return (
            <div className="h-full bg-dark-bg flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-dark-layer1 rounded-[3rem] border border-white/5 p-12 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-brand-secondary" />

                    <div className={`mb-8 inline-flex p-6 rounded-full ${passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {passed ? <CheckCircle size={80} /> : <AlertCircle size={80} />}
                    </div>

                    <h1 className="text-4xl font-black text-white mb-2">
                        {passed ? 'Mastery Achieved!' : 'Growth Opportunity'}
                    </h1>
                    <p className="text-dark-muted mb-10 font-bold uppercase tracking-widest">
                        Assessment: {assessment.title}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-dark-muted uppercase mb-2">Your Score</p>
                            <p className="text-3xl font-black text-white">{percentage.toFixed(1)}%</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-dark-muted uppercase mb-2">Status</p>
                            <p className={`text-3xl font-black ${passed ? 'text-green-400' : 'text-red-400'}`}>
                                {passed ? 'PASSED' : 'RETRY'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate(`/course/${courseId}`)}
                            className="w-full py-4 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover transition-all shadow-xl shadow-brand-primary/20"
                        >
                            RETURN TO COURSE
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                        >
                            RETAKE ASSESSMENT
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = assessment.questions[activeQuestionIndex];

    return (
        <div className="h-full bg-dark-bg flex flex-col overflow-hidden">
            {/* Header: Progress & Timer */}
            <header className="bg-dark-layer1 border-b border-white/5 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shadow-2xl">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <button onClick={() => navigate(-1)} className="p-2 text-dark-muted hover:text-white bg-white/5 rounded-xl transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-white leading-tight">{assessment.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-primary transition-all duration-500"
                                    style={{ width: `${((activeQuestionIndex + 1) / assessment.questions.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest whitespace-nowrap">
                                Question {activeQuestionIndex + 1} of {assessment.questions.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border font-black text-sm transition-all shadow-lg ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-white'
                            }`}>
                            <Clock size={18} />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 md:flex-none px-10 py-2.5 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'SUBMITTING...' : <><Send size={18} /> FINISH TEST</>}
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-hidden">
                {/* Left: Sidebar Question Map (Desktop Only) */}
                <div className="hidden lg:flex w-20 flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4">
                    {assessment.questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setActiveQuestionIndex(idx);
                                setOutput([]);
                            }}
                            className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center font-black text-sm transition-all border ${activeQuestionIndex === idx
                                ? 'bg-brand-primary text-dark-bg border-brand-primary shadow-lg shadow-brand-primary/20 scale-110'
                                : answers[idx]?.value !== null && answers[idx]?.value !== ''
                                    ? 'bg-white/10 text-white border-white/20'
                                    : 'text-dark-muted border-white/5 hover:bg-white/5'
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                {/* Center: Question Content */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 bg-dark-layer1 rounded-[2.5rem] border border-white/5 p-8 md:p-12 overflow-y-auto custom-scrollbar shadow-2xl shadow-black/50 relative">
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentQuestion.type === 'coding' ? 'bg-purple-500/20 text-purple-400' :
                                currentQuestion.type === 'subjective' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-green-500/20 text-green-400'
                                }`}>
                                {currentQuestion.type || 'MCQ'}
                            </span>
                            <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">
                                • {currentQuestion.points} Points
                            </span>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-snug">
                            {currentQuestion.questionText}
                        </h3>

                        {/* Interactive Area Based on Type */}
                        <div className="space-y-8">
                            {currentQuestion.type === 'mcq' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQuestion.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerChange(activeQuestionIndex, idx)}
                                            className={`group text-left p-6 rounded-[2rem] border transition-all flex items-center gap-5 relative overflow-hidden ${answers[activeQuestionIndex]?.value === idx
                                                ? 'bg-brand-primary border-brand-primary text-dark-bg scale-[1.02] shadow-2xl'
                                                : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <span className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-black shadow-lg ${answers[activeQuestionIndex]?.value === idx
                                                ? 'bg-dark-bg text-brand-primary'
                                                : 'bg-dark-layer2 text-dark-muted group-hover:text-white'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="font-bold text-lg">{option}</span>

                                            {answers[activeQuestionIndex]?.value === idx && (
                                                <CheckCircle size={24} className="absolute right-6 opacity-50" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'coding' && (
                                <div className="flex flex-col gap-6 h-[500px]">
                                    <div className="flex-1 rounded-[2rem] border border-white/10 overflow-hidden shadow-inner bg-[#1e1e1e]">
                                        <CodeEditor
                                            value={answers[activeQuestionIndex].value}
                                            onChange={(val) => handleAnswerChange(activeQuestionIndex, val)}
                                            height="100%"
                                        />
                                    </div>
                                    <div className="bg-dark-layer2/50 rounded-[2rem] border border-white/5 flex flex-col overflow-hidden">
                                        <div className="px-6 py-3 border-b border-white/5 flex justify-between items-center bg-black/20">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-dark-muted uppercase tracking-widest">
                                                <Terminal size={14} className="text-brand-secondary" /> Console Output
                                            </div>
                                            <button
                                                onClick={handleRunCode}
                                                className="px-4 py-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-dark-bg text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-2"
                                            >
                                                <Play size={12} fill="currentColor" /> Run Code
                                            </button>
                                        </div>
                                        <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar bg-black/40 min-h-[120px]">
                                            {output.length > 0 ? (
                                                output.map((line, i) => (
                                                    <div key={i} className="text-green-400 pb-1">{line}</div>
                                                ))
                                            ) : (
                                                <span className="text-dark-muted italic text-xs">Awaiting execution...</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentQuestion.type === 'subjective' && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-1">Your Submission / Narrative</label>
                                    <textarea
                                        value={answers[activeQuestionIndex].value}
                                        onChange={(e) => handleAnswerChange(activeQuestionIndex, e.target.value)}
                                        placeholder="Articulate your response or provide resources links here..."
                                        className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-8 text-white font-medium focus:outline-none focus:border-brand-primary min-h-[400px] resize-none shadow-inner"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        <button
                            disabled={activeQuestionIndex === 0}
                            onClick={() => {
                                setActiveQuestionIndex(prev => prev - 1);
                                setOutput([]);
                            }}
                            className="flex-1 py-5 bg-dark-layer1 border border-white/5 text-white font-black rounded-3xl hover:bg-white/5 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
                        >
                            <ChevronLeft size={24} /> PREVIOUS CHALLENGE
                        </button>
                        <button
                            onClick={() => {
                                if (activeQuestionIndex < assessment.questions.length - 1) {
                                    setActiveQuestionIndex(prev => prev + 1);
                                    setOutput([]);
                                } else {
                                    handleSubmit();
                                }
                            }}
                            className={`flex-1 py-5 font-black rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-3 ${activeQuestionIndex === assessment.questions.length - 1
                                ? 'bg-brand-primary text-dark-bg hover:shadow-brand-primary/40'
                                : 'bg-dark-layer1 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5'
                                }`}
                        >
                            {activeQuestionIndex === assessment.questions.length - 1 ? 'FINISH ASSESSMENT' : 'NEXT CHALLENGE'}
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TakeAssessment;
