import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { PlayCircle, Search, Clock, Zap, Award, BookOpen, CheckCircle, Flame, Share2, Users, MessageSquare, TrendingUp, Globe, Plus, Heart, Star, ArrowRight, Cpu, Sparkles } from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';

const Dashboard = () => {
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [socialPulse, setSocialPulse] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userObj = JSON.parse(localStorage.getItem('user'));
            const userId = userObj.id || userObj._id;
            const [coursesRes, userRes, enrollmentsRes, followingRes, communityRes] = await Promise.all([
                api.get('/courses'),
                api.get(`/users/profile/${userId}`),
                api.get('/enrollment/my-courses'),
                api.get(`/users/following/${userId}`),
                api.get('/community/posts?limit=5')
            ]);
            setCourses(coursesRes.data);
            setUser(userRes.data);
            setEnrollments(enrollmentsRes.data || []);
            setFollowing(Array.isArray(followingRes.data) ? followingRes.data : []);
            setSocialPulse(communityRes.data.posts || []);
        } catch (error) {
            console.error('Failed to fetch data', error);
            // Initialize with empty arrays to prevent mapping errors if API fails
            setCourses([]);
            setEnrollments([]);
            setFollowing([]);
            setSocialPulse([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;

    // Calculate Stats
    const totalTimeSpentSeconds = enrollments.reduce((acc, curr) => acc + (curr.totalTimeSpent || 0), 0);
    const totalHours = Math.round(totalTimeSpentSeconds / 3600);
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const certificatesEarned = enrollments.filter(e => e.certificateIssued).length;
    const inProgressCount = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

    // Filter Logic
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Categories (Dynamic)
    const categories = ['All', ...new Set(courses.map(c =>
        c.category.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    ))];
    // Continue Watching Logic (from enrollments)
    const recentEnrollments = enrollments
        .filter(e => e.courseId && e.progress < 100)
        .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
        .slice(0, 3);

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-24">
            {/* Split Layout: Main Content | Social Sidebar */}
            <div className="flex flex-col xl:flex-row gap-12">

                {/* Main Dashboard Column */}
                <div className="flex-1 space-y-12">
                    {/* Main Command Header */}
                    <div className="relative group p-[2px] bg-gradient-to-br from-brand-primary/40 to-brand-hover/40 rounded-[3.5rem] shadow-2xl overflow-hidden shadow-brand-primary/10">
                        <div className="absolute inset-0 bg-dark-layer1 rounded-[3.4rem] z-0"></div>

                        {/* Futuristic Grid Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none z-1" style={{ backgroundImage: 'linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className="relative z-10 p-10 md:p-20 flex flex-col md:flex-row items-center gap-16">
                            <div className="flex-1 text-center md:text-left space-y-8">
                                <div className="space-y-4">
                                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none italic uppercase">
                                        STELLAR <span className="text-gradient">{user?.name?.split(' ')[0] || 'CHAMPION'}</span>
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <div className="h-[2px] w-12 bg-brand-primary" />
                                        <p className="text-xs text-brand-primary font-black uppercase tracking-[0.5em] opacity-80">Sector Security Status: OPTIMAL</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                    <Link to="/my-learning" className="cyber-button bg-brand-primary text-dark-bg px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:scale-105 shadow-2xl shadow-brand-primary/40 transition-all flex items-center gap-3">
                                        <PlayCircle size={20} /> INITIALIZE MISSION
                                    </Link>
                                    <Link to="/discover-sectors" className="glass-panel text-white px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-brand-primary/10 border border-brand-primary/30 transition-all flex items-center gap-3 group">
                                        <Globe size={20} className="text-brand-primary group-hover:rotate-180 transition-transform duration-1000" /> SCAN GALAXY
                                    </Link>
                                </div>
                            </div>

                            {/* Orbit Stats Hub */}
                            <div className="w-full md:w-72 glass-panel p-10 space-y-8 relative overflow-hidden group/stats rounded-[3rem] border-brand-primary/20">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/10 rounded-full blur-[40px] group-hover/stats:scale-150 transition-transform duration-1000" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-center text-[11px] font-black text-dark-muted uppercase tracking-widest">
                                        <span>Rank Integrity</span>
                                        <span className="text-brand-primary">LVL {Math.floor((user?.gamification?.xp || 0) / 1000) + 1}</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-gradient-to-r from-brand-primary to-quantum-purple shadow-[0_0_15px_rgba(0,242,255,0.5)]" style={{ width: '65%' }} />
                                    </div>
                                    <div className="flex items-center justify-center gap-4 py-2">
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                        <span className="text-lg font-black text-white tracking-[0.2em]">{user?.gamification?.xp || 0} XP</span>
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Nodes Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: 'Intel Logged', value: `${totalHours}H`, icon: Clock, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
                            { label: 'Sectors Cleared', value: completedCourses, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
                            { label: 'Awards Issued', value: certificatesEarned, icon: Award, color: 'text-stellar-gold', bg: 'bg-stellar-gold/10' },
                            { label: 'Active Missions', value: inProgressCount, icon: Flame, color: 'text-red-400', bg: 'bg-red-400/10' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-panel p-8 group hover:border-brand-primary/50 transition-all flex flex-col items-center gap-4 text-center rounded-[2.5rem]">
                                <div className={`w-16 h-16 rounded-[1.5rem] ${stat.bg} border border-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 shadow-lg transition-transform duration-500`}>
                                    <stat.icon size={28} />
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white tracking-tighter leading-none">{stat.value}</p>
                                    <p className="text-[10px] text-dark-muted font-black uppercase tracking-[0.2em] mt-3 opacity-60">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Continue Learning - Scrollable */}
                    {recentEnrollments.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex justify-between items-end px-2">
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                    <TrendingUp className="text-brand-primary" /> Active Schematics
                                </h2>
                                <Link to="/my-learning" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">View All Briefs</Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {recentEnrollments.map(enrollment => (
                                    <Link to={`/course/${enrollment.courseId._id}`} key={enrollment._id} className="bg-dark-layer1 border border-white/5 rounded-[2.5rem] p-6 hover:border-brand-primary/50 transition-all group shadow-2xl relative overflow-hidden">
                                        <div className="aspect-video rounded-[1.8rem] overflow-hidden mb-6 border border-white/5">
                                            <img src={enrollment.courseId.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="font-black text-lg text-white line-clamp-1 leading-none uppercase tracking-tight italic">{enrollment.courseId.title}</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[9px] font-black text-dark-muted uppercase tracking-widest">
                                                    <span>Synchronization</span>
                                                    <span>{Math.round(enrollment.progress)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-brand-primary" style={{ width: `${enrollment.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Course Discovery Grid */}
                    <section className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
                            <div>
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                                    <Zap size={32} className="text-brand-primary" /> Galaxy Recon
                                </h2>
                                <p className="text-dark-muted font-bold text-xs uppercase tracking-[0.2em] mt-2">New Sector Opportunities Detected</p>
                            </div>
                            <div className="relative w-full md:w-96 flex">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                                <input
                                    type="text"
                                    placeholder="SCANNING FOR CURRICULUM..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark-layer1 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[11px] font-black text-white uppercase tracking-widest focus:border-brand-primary focus:outline-none transition-all placeholder:text-dark-muted/30"
                                />
                            </div>
                        </div>

                        {/* Category Pills - High Fidelity */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-xl ${selectedCategory === cat
                                        ? 'bg-brand-primary text-dark-bg'
                                        : 'bg-white/5 text-dark-muted border border-white/5 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                            {filteredCourses.slice(0, 6).map((course) => (
                                <Link to={`/course/${course._id}`} key={course._id} className="group bg-dark-layer1 border border-white/5 rounded-[3rem] overflow-hidden hover:border-brand-primary transition-all duration-500 flex flex-col h-full shadow-2xl relative">
                                    <div className="aspect-[16/10] bg-dark-layer2 relative overflow-hidden">
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent flex flex-col justify-end p-8">
                                            <div className="flex justify-between items-end">
                                                <span className="bg-brand-primary text-dark-bg px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl">
                                                    {course.category}
                                                </span>
                                                <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 backdrop-blur-xl border border-brand-primary/30 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-dark-bg transition-all transform group-hover:rotate-12 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                                    <PlayCircle size={22} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col space-y-4">
                                        <h3 className="text-xl font-black text-white italic leading-tight group-hover:text-brand-primary transition-colors tracking-tighter line-clamp-1 uppercase">
                                            {course.title}
                                        </h3>
                                        <div className="flex justify-between items-center py-4 border-t border-white/5 mt-auto">
                                            <div className="flex items-center gap-3 text-dark-muted font-black text-[10px] uppercase tracking-widest">
                                                <Star className="text-yellow-500" size={14} fill="currentColor" />
                                                <span>4.9 CORE</span>
                                            </div>
                                            <span className="font-black text-2xl text-white tracking-tighter">${course.price}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* SOCIAL SIDEBAR: THE PULSE ENGINE */}
                <div className="w-full xl:w-[400px] space-y-12">
                    {/* Social Pulse Section */}
                    <div className="bg-dark-layer1 border border-white/10 rounded-[3.5rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter border-l-4 border-brand-primary pl-4">Social Pulse</h3>
                                    <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest pl-4">Live Satellite Sync</p>
                                </div>
                                <div className="p-2.5 bg-brand-primary/10 rounded-2xl text-brand-primary animate-pulse">
                                    <Globe size={20} />
                                </div>
                            </div>

                            {/* Who You Follow - Orbit Avatars */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Active Operatives</p>
                                    <span className="text-[9px] font-black text-brand-primary uppercase">{following.length} Followed</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {following.slice(0, 5).map(f => (
                                        <Link key={f._id} to={f.role === 'instructor' ? `/instructor/profile/${f._id}` : `/u/${f._id}`} className="relative group">
                                            <div className="w-14 h-14 rounded-2xl bg-dark-layer2 p-0.5 border border-white/10 group-hover:border-brand-primary transition-all overflow-hidden rotate-3 group-hover:rotate-0">
                                                <img src={f.avatar || 'https://via.placeholder.com/150'} className="w-full h-full rounded-[1.1rem] object-cover" alt={f.name} />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-layer1" />
                                        </Link>
                                    ))}
                                    <button className="w-14 h-14 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-dark-muted hover:border-brand-primary hover:text-white transition-all">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Recent Feed Activity */}
                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Signal Stream</p>
                                <div className="space-y-6">
                                    {socialPulse.length > 0 ? socialPulse.map((post, idx) => (
                                        <div key={idx} className="group relative pl-6 border-l border-white/5 hover:border-brand-primary/50 transition-all py-2">
                                            <div className="absolute left-[-5px] top-6 w-2 h-2 rounded-full bg-dark-layer2 border border-white/20 group-hover:bg-brand-primary transition-colors"></div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">{post.author?.name}</span>
                                                    <span className="text-[9px] font-bold text-dark-muted uppercase tracking-widest opacity-50">• {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-[11px] text-dark-muted font-medium line-clamp-2 leading-relaxed italic group-hover:text-white/80 transition-colors">
                                                    "{post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content}"
                                                </p>
                                                <div className="flex items-center gap-4 pt-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-brand-primary uppercase">
                                                        <MessageSquare size={12} /> {post.comments?.length || 0}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-red-400 uppercase">
                                                        <Heart size={12} fill="currentColor" /> {post.likes?.length || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-10 text-center space-y-3 opacity-30">
                                            <Users size={32} className="mx-auto" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Signals Captured</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Link to="/community" className="block w-full py-4 bg-brand-primary text-dark-bg rounded-2xl font-black uppercase text-[10px] tracking-widest text-center hover:bg-brand-hover transition-all shadow-xl shadow-brand-primary/20">
                                Launch Sync Terminal
                            </Link>
                        </div>
                    </div>

                    {/* Neural Tutor Access Widget [NEW] */}
                    <div className="glass-panel p-10 rounded-[4rem] border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 via-transparent to-quantum-purple/5 relative overflow-hidden group">
                        <div className="absolute -left-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Cpu size={240} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-brand-primary/20 border-2 border-brand-primary/50 flex items-center justify-center text-brand-primary shadow-[0_0_30px_rgba(0,242,255,0.3)] mb-8 animate-pulse">
                                <Sparkles size={40} />
                            </div>
                            <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Neural Tutor Active</h4>
                            <p className="text-sm text-dark-muted leading-relaxed font-bold opacity-80 mb-10 px-4">
                                Initialize a direct neural link for personalized guidance through complex sectors.
                            </p>
                            <Link to="/intelligent-tutor" className="w-full py-5 bg-white text-dark-bg rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-brand-primary transition-all shadow-2xl">
                                SYNC INTELLIGENCE
                            </Link>
                        </div>
                    </div>

                    {/* Pro Tip/Badge Widget */}
                    <div className="glass-panel p-8 rounded-[3.5rem] border-white/5 space-y-6 relative overflow-hidden group">
                        <Award size={80} className="absolute -right-8 -bottom-8 text-white/5 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                        <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Strategist Tip</h4>
                        <p className="text-xs text-dark-muted leading-relaxed font-bold opacity-70">
                            Follow top architects in your sector to receive real-time intelligence drops and unlock exclusive community orbits.
                        </p>
                        <Link to="/leaderboard" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] flex items-center gap-2 hover:translate-x-2 transition-transform">
                            View Top Operatives <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
