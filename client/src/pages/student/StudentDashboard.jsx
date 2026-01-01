import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
    PlayCircle, Clock, Award, TrendingUp, BookOpen,
    Zap, Star, ChevronRight, Layout, Sparkles,
    Flame, Target, Rocket, ShieldCheck
} from 'lucide-react';

const StudentDashboard = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, xp: 0, level: 1 });
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrollmentRes, profileRes] = await Promise.all([
                api.get('/enrollment/my-courses'),
                api.get(`/users/${JSON.parse(localStorage.getItem('user'))._id}/public-profile`)
            ]);

            setEnrollments(enrollmentRes.data);
            const completed = enrollmentRes.data.filter(e => e.isCompleted).length;
            const inProgress = enrollmentRes.data.filter(e => !e.isCompleted && e.progress > 0).length;

            setStats({
                total: enrollmentRes.data.length,
                inProgress,
                completed,
                xp: profileRes.data.gamification?.xp || 0,
                level: profileRes.data.gamification?.level || 1,
                badges: profileRes.data.gamification?.badges || []
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-dark-muted font-black uppercase tracking-widest text-xs">Syncing Orbit Interface...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-24">
            {/* Header / Hero Section - Orbit High Fidelity */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-purple-600/10 to-transparent rounded-[3.5rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
                <div className="relative bg-dark-layer1 border border-white/5 rounded-[3.5rem] p-10 md:p-16 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse-slow"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <span className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20 animate-pulse">
                                    Strategic Learning Active
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                Welcome Back, <span className="text-brand-primary italic">{currentUser?.name?.split(' ')[0]}</span>
                            </h1>
                            <p className="text-xl text-dark-muted font-medium max-w-xl leading-relaxed">
                                Your orbit is expanding. You've gained <span className="text-white font-bold">{stats.xp} XP</span> this phase. Ready to push the boundaries of your knowledge today?
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/browse" className="bg-brand-primary text-dark-bg px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-hover shadow-xl shadow-brand-primary/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3">
                                    <Rocket size={18} /> Discover New Paths
                                </Link>
                                <Link to="/my-learning" className="bg-white/5 text-white border border-white/10 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                                    <Layout size={18} /> View Curriculum
                                </Link>
                            </div>
                        </div>

                        {/* Level / XP Widget */}
                        <div className="w-full lg:w-96 bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-8 backdrop-blur-3xl relative overflow-hidden group/xp">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover/xp:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">Orbit Rank</p>
                                    <h3 className="text-3xl font-black text-white italic">Mastery Level {stats.level}</h3>
                                </div>
                                <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-dark-bg shadow-xl shadow-brand-primary/20">
                                    <Zap size={28} fill="currentColor" />
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex justify-between items-end">
                                    <p className="text-sm font-black text-white">{stats.xp} <span className="text-dark-muted">Total XP</span></p>
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{1000 - (stats.xp % 1000)} XP to Lvl {stats.level + 1}</p>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-primary to-orange-500 transition-all duration-1000"
                                        style={{ width: `${(stats.xp % 1000) / 10}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="flex -space-x-3">
                                    {stats.badges?.slice(0, 3).map((badge, i) => (
                                        <div key={i} className="w-10 h-10 rounded-xl bg-dark-layer2 border-2 border-dark-layer1 flex items-center justify-center text-brand-primary" title={badge.name}>
                                            <ShieldCheck size={18} />
                                        </div>
                                    ))}
                                    {stats.badges?.length > 3 && (
                                        <div className="w-10 h-10 rounded-xl bg-dark-layer1 border-2 border-dark-layer2 flex items-center justify-center text-[10px] font-black text-white">
                                            +{stats.badges.length - 3}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Achievements unlocked</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Cumulative Paths', value: stats.total, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
                    { label: 'Active Missions', value: stats.inProgress, icon: Target, color: 'text-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/10' },
                    { label: 'Skills Overview', value: stats.completed, icon: Award, color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/10' },
                    { label: 'Learning Streak', value: '4 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-500/10' }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} ${stat.border} border rounded-[2.5rem] p-8 group relative overflow-hidden transition-all duration-300 hover:border-brand-primary/30`}>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${stat.color} transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                            <p className="text-[10px] text-dark-muted font-black uppercase tracking-[0.2em] mt-2">{stat.label}</p>
                        </div>
                        <stat.icon size={120} className={`absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${stat.color}`} />
                    </div>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Continued Learning Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-brand-primary rounded-full"></div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Orbit Log</h2>
                        </div>
                        <Link to="/student/learning" className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2">
                            Access All <ChevronRight size={14} />
                        </Link>
                    </div>

                    {enrollments.filter(e => !e.isCompleted).length === 0 ? (
                        <div className="bg-dark-layer1 border border-dashed border-white/10 rounded-[3rem] p-24 text-center space-y-6">
                            <Sparkles size={80} className="mx-auto text-dark-muted opacity-20 animate-pulse" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase italic">Silence in the Galaxy</h3>
                                <p className="text-dark-muted max-w-sm mx-auto font-medium">No active paths discovered. Time to initiate a new learning mission.</p>
                            </div>
                            <Link to="/student/browse" className="inline-block bg-white/5 text-brand-primary border border-brand-primary/30 px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-primary hover:text-dark-bg transition-all">
                                Launch Discovery
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {enrollments.filter(e => !e.isCompleted).slice(0, 3).map((enrollment) => (
                                <Link
                                    key={enrollment._id}
                                    to={`/course/${enrollment.courseId._id}`}
                                    className="group flex flex-col md:flex-row items-center gap-8 bg-dark-layer1 border border-white/5 p-6 rounded-[2.5rem] hover:border-brand-primary transition-all shadow-2xl overflow-hidden relative"
                                >
                                    <div className="w-full md:w-64 aspect-video bg-dark-layer2 rounded-[1.8rem] overflow-hidden flex-shrink-0 relative">
                                        <img src={enrollment.courseId.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <PlayCircle size={48} className="text-brand-primary drop-shadow-2xl" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-dark-muted group-hover:text-white">
                                                {enrollment.courseId.category || 'Strategic Path'}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">
                                            {enrollment.courseId.title}
                                        </h3>
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest mb-1">
                                                <span className="text-dark-muted italic">Mastery Completion</span>
                                                <span className="text-brand-primary">{Math.round(enrollment.progress)}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-primary transition-all duration-1000 group-hover:scale-x-[1.02] origin-left"
                                                    style={{ width: `${enrollment.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pr-4 hidden md:block">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-dark-muted group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Social / Leaderboard / Quick Actions */}
                <div className="space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-purple-500 rounded-full"></div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Daily Ops</h2>
                        </div>
                        <div className="bg-dark-layer1 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            {[
                                { label: 'Daily Practice', icon: Target, desc: 'Earn 100 XP', color: 'text-blue-400', link: '/student/practice' },
                                { label: 'Knowledge Test', icon: ShieldCheck, desc: 'Review 3 Lessons', color: 'text-purple-400', link: '/student/learning' },
                                { label: 'New Discussions', icon: TrendingUp, desc: '5 Active Threads', color: 'text-orange-400', link: '/community' }
                            ].map((quest, i) => (
                                <Link key={i} to={quest.link} className="flex items-center gap-5 p-4 rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                                    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${quest.color} group-hover:scale-110 transition-transform`}>
                                        <quest.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-white text-sm uppercase tracking-tight">{quest.label}</p>
                                        <p className="text-[10px] text-dark-muted font-bold tracking-widest">{quest.desc}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-dark-muted group-hover:text-white" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-brand-primary rounded-full"></div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Top Orbiters</h2>
                        </div>
                        <div className="bg-gradient-to-br from-dark-layer1 to-dark-bg border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Award size={100} className="text-brand-primary" />
                            </div>
                            <div className="space-y-6 relative z-10">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-white border border-white/10 italic">
                                            #{i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-3 w-3/4 bg-white/10 rounded-full animate-pulse mb-2"></div>
                                            <div className="h-2 w-1/2 bg-white/5 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="text-[10px] font-bold text-dark-muted">--- XP</div>
                                    </div>
                                ))}
                                <Link to="/community" className="block text-center pt-4 text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] hover:text-white transition-colors">
                                    Join The Leaderboard →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

