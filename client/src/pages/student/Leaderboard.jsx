import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Award, TrendingUp, Users, Star, Trophy, Medal, BookOpen, Sparkles } from 'lucide-react';

const Leaderboard = () => {
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboards();
    }, []);

    const fetchLeaderboards = async () => {
        try {
            // Fetch top students based on enrollment count and course completion
            const { data: enrollments } = await api.get('/enrollment/leaderboard');

            // Fetch top instructors based on student count and ratings
            const { data: instructorData } = await api.get('/users/instructors/top');

            setStudents(enrollments || []);
            setInstructors(instructorData || []);
        } catch (error) {
            console.error('Error fetching leaderboards:', error);
            setStudents([]);
            setInstructors([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                <p className="text-dark-muted mt-4">Loading leaderboards...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-bold">
                    <Trophy size={16} /> Global Leaderboard
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Top Performers</h1>
                <p className="text-dark-muted max-w-2xl mx-auto text-lg leading-relaxed">Celebrate the dedication and achievements of our most active students and top-rated instructors.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Students Leaderboard */}
                <section className="bg-dark-layer1 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-gradient-to-r from-brand-primary/10 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center">
                                <Users className="text-brand-primary" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Top Students</h2>
                                <p className="text-xs text-dark-muted font-bold uppercase tracking-widest">Global Ranking</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {students.length === 0 ? (
                            <div className="text-center py-8 text-dark-muted">
                                No student data available yet
                            </div>
                        ) : (
                            students.map((student, index) => {
                                const rank = index + 1;
                                const userName = student.userId?.name || student.name || 'Unknown Student';
                                const points = student.points || (student.coursesCompleted * 100) || 0;
                                const courses = student.coursesCompleted || student.courses || 0;

                                return (
                                    <div key={student._id} className="flex items-center justify-between p-5 rounded-3xl hover:bg-white/5 transition-all duration-300 group cursor-default">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-dark-bg ring-4 ring-yellow-500/20' :
                                                    rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-dark-bg ring-4 ring-gray-400/20' :
                                                        rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white ring-4 ring-amber-700/20' :
                                                            'bg-dark-layer2 text-dark-text border border-white/5'
                                                    }`}>
                                                    {userName.charAt(0).toUpperCase()}
                                                </div>
                                                {rank <= 3 && (
                                                    <div className="absolute -top-3 -right-3 animate-bounce">
                                                        <Medal size={24} className={
                                                            rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' :
                                                                rank === 2 ? 'text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]' :
                                                                    'text-amber-600 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]'
                                                        } />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white group-hover:text-brand-primary transition-colors">{userName}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="flex items-center gap-1 text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5 font-bold uppercase tracking-wider">
                                                        <BookOpen size={10} className="text-brand-primary" /> {courses} Courses
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Sparkles size={14} className="text-brand-primary animate-pulse" />
                                                <p className="text-xl font-black text-white">{points.toLocaleString()}</p>
                                            </div>
                                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] mt-0.5">Quest XP</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="p-6 text-center border-t border-white/5">
                        <button className="text-sm font-black text-brand-primary hover:text-white transition-colors uppercase tracking-widest">View Full Standings</button>
                    </div>
                </section>

                {/* Instructors Leaderboard */}
                <section className="bg-dark-layer1 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                <TrendingUp className="text-purple-400" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Elite Mentors</h2>
                                <p className="text-xs text-dark-muted font-bold uppercase tracking-widest">Master Instructors</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {instructors.length === 0 ? (
                            <div className="text-center py-8 text-dark-muted">
                                No instructor data available yet
                            </div>
                        ) : (
                            instructors.map((instructor, index) => {
                                const rank = index + 1;
                                return (
                                    <div key={instructor._id} className="flex items-center justify-between p-5 rounded-3xl hover:bg-white/5 transition-all duration-300 group cursor-default">
                                        <div className="flex items-center gap-5">
                                            <div className="text-3xl font-black text-dark-layer2 w-12 text-center group-hover:text-purple-500/50 transition-colors tracking-tighter">
                                                #{rank}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">{instructor.name}</h3>
                                                <p className="text-xs text-dark-muted font-medium mt-0.5">{(instructor.studentCount || instructor.students || 0).toLocaleString()} Students Enrolled</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-yellow-500/10 py-1.5 px-4 rounded-2xl border border-yellow-500/20 shadow-inner">
                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-lg font-black text-yellow-500">{instructor.rating || 0}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="p-6 mt-auto">
                        <div className="bg-dark-layer2/50 rounded-2xl p-6 border border-white/5 text-center">
                            <p className="text-sm text-dark-muted font-medium italic">"The best instructors are those who show you where to look but don't tell you what to see."</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Leaderboard;
