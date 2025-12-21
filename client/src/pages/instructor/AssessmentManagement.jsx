import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Award, BookOpen, Clock, Check, X, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import api from '../../utils/api';

const AssessmentManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

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
                    questions: [{ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, points: 1 }],
                    passingScore: 70,
                    durationLimit: 30
                });
            }
        } catch (error) {
            console.error('Error fetching assessment');
        }
    };

    const handleAddQuestion = () => {
        setAssessment({
            ...assessment,
            questions: [...assessment.questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, points: 1 }]
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/mega/assessments', assessment);
            alert('Assessment saved successfully!');
        } catch (error) {
            alert('Error saving assessment');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-96 text-white"><Loader2 className="animate-spin mr-2" /> Loading Courses...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6 min-h-[85vh]">
            {/* Sidebar: Course List */}
            <div className="lg:col-span-1 space-y-6">
                <div>
                    <h2 className="text-xl font-black text-white">Select Course</h2>
                    <p className="text-xs text-dark-muted mt-1">Build quizzes for your modules</p>
                </div>
                <div className="space-y-3 bg-dark-layer1 border border-white/5 rounded-[2rem] p-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {courses.map(course => (
                        <div
                            key={course._id}
                            onClick={() => handleSelectCourse(course)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${selectedCourse?._id === course._id ? 'bg-brand-primary border-brand-primary' : 'bg-white/5 border-transparent hover:bg-white/10'
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-black truncate ${selectedCourse?._id === course._id ? 'text-dark-bg' : 'text-white'}`}>{course.title}</p>
                                <p className={`text-[10px] uppercase tracking-widest font-bold ${selectedCourse?._id === course._id ? 'text-dark-bg/60' : 'text-dark-muted'}`}>${course.price}</p>
                            </div>
                            <ChevronRight size={18} className={selectedCourse?._id === course._id ? 'text-dark-bg' : 'text-dark-muted group-hover:text-white'} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main: Assessment Builder */}
            <div className="lg:col-span-3 space-y-8 bg-dark-layer1 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
                {!selectedCourse ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
                        <Award size={80} className="text-dark-muted opacity-20" />
                        <h3 className="text-2xl font-black text-white">Start Building Knowledge Tests</h3>
                        <p className="text-dark-muted max-w-sm">Select a course from the left panel to create or edit its assessment and quizzes.</p>
                    </div>
                ) : !assessment ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-primary" /></div>
                ) : (
                    <>
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
                            <div>
                                <h1 className="text-3xl font-black text-white">{assessment.title}</h1>
                                <p className="text-dark-muted flex items-center gap-2 mt-1"><Sparkles size={14} /> Powering learning validation for <span className="text-white font-bold">{selectedCourse.title}</span></p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="bg-dark-layer2 border border-white/5 rounded-2xl p-3 flex items-center gap-4 px-6 text-white font-bold text-sm">
                                    <Clock size={18} className="text-brand-primary" /> {assessment.durationLimit} min
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-8 py-3 bg-brand-primary text-dark-bg font-black rounded-2xl hover:bg-brand-hover shadow-xl shadow-brand-primary/20 transition-all flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Save Assessment
                                </button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">Passing Score (%)</label>
                                <input type="number" value={assessment.passingScore} onChange={e => setAssessment({ ...assessment, passingScore: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">Time Limit (Minutes)</label>
                                <input type="number" value={assessment.durationLimit} onChange={e => setAssessment({ ...assessment, durationLimit: e.target.value })} className="w-full bg-dark-layer2 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary" />
                            </div>
                        </div>

                        <div className="space-y-10 pt-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-white flex items-center gap-3">Questions <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-dark-muted">{assessment.questions.length}</span></h3>
                                <button onClick={handleAddQuestion} className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest hover:text-white transition-colors">
                                    <Plus size={16} /> Add Multiple Choice Question
                                </button>
                            </div>

                            <div className="space-y-8 pb-10">
                                {assessment.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="bg-dark-layer2/30 border border-white/5 rounded-[2rem] p-8 space-y-6 relative group">
                                        <button className="absolute top-8 right-8 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><Trash2 size={18} /></button>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-dark-muted uppercase tracking-[0.2em]">Question {qIndex + 1}</label>
                                            <textarea
                                                value={q.questionText}
                                                onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                                className="w-full bg-dark-layer1/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary h-24"
                                                placeholder="Ask your question here..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className={`flex items-center gap-4 bg-dark-layer1 border px-4 py-2 rounded-2xl transition-all ${q.correctAnswerIndex === oIndex ? 'border-brand-primary bg-brand-primary/10' : 'border-white/5'}`}>
                                                    <button
                                                        onClick={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)}
                                                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${q.correctAnswerIndex === oIndex ? 'bg-brand-primary text-dark-bg' : 'bg-dark-layer2 text-dark-muted'}`}
                                                    >
                                                        {q.correctAnswerIndex === oIndex ? <Check size={14} strokeWidth={4} /> : oIndex + 1}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                        className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssessmentManagement;
