import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    User, BookOpen, Star, Award, Globe, Github, Linkedin, Twitter,
    CheckCircle, Clock, MapPin, Film, PenTool, Camera, Layout,
    MessageSquare, Users, Sparkles, Plus, Play, Eye, Share2,
    Zap, Rocket, Target, ShieldCheck, ChevronRight, Heart, Calendar
} from 'lucide-react';

const InstructorProfile = () => {
    const { instructorId } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [reels, setReels] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');
    const [isOwner, setIsOwner] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [activeReel, setActiveReel] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id === instructorId || user._id === instructorId) {
                setIsOwner(true);
            }
        }
        fetchData();
    }, [instructorId]);

    useEffect(() => {
        if (instructor && !isOwner) {
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            if (currentUser) {
                const followingIds = currentUser.following || [];
                setIsFollowing(followingIds.includes(instructor._id));
            }
        }
    }, [instructor, isOwner]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, coursesRes, reelsRes, articlesRes] = await Promise.all([
                api.get(`/users/profile/${instructorId}`),
                api.get(`/courses?instructorId=${instructorId}`),
                api.get(`/reels/feed?instructorId=${instructorId}`),
                api.get(`/articles?authorId=${instructorId}`)
            ]);

            setInstructor(profileRes.data);

            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const isCurrentUserOwner = currentUser && (currentUser.id === instructorId || currentUser._id === instructorId);

            if (isCurrentUserOwner) {
                setCourses(coursesRes.data);
            } else {
                setCourses(coursesRes.data.filter(c => c.isPublished && c.approvalStatus === 'approved'));
            }

            setReels(reelsRes.data);
            setArticles(articlesRes.data);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        if (isOwner) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUpdatingAvatar(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data: uploadData } = await api.post('/upload', formData);
            const avatarUrl = uploadData.url;

            await api.put(`/users/profile/${instructorId}`, { avatar: avatarUrl });

            setInstructor(prev => ({ ...prev, avatar: avatarUrl }));

            const user = JSON.parse(localStorage.getItem('user'));
            user.avatar = avatarUrl;
            localStorage.setItem('user', JSON.stringify(user));

            alert('Profile picture updated!');
        } catch (error) {
            console.error('Error updating avatar:', error);
            alert('Failed to update profile picture.');
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    const handleFollow = async () => {
        if (followLoading) return;
        setFollowLoading(true);
        try {
            const { data } = await api.post(`/users/follow/${instructor._id}`);
            setIsFollowing(true);
            setInstructor(prev => ({
                ...prev,
                followers: [...(prev.followers || []), 'temp-id']
            }));
            const user = JSON.parse(localStorage.getItem('user'));
            user.following = data.following;
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async () => {
        if (followLoading) return;
        setFollowLoading(true);
        try {
            const { data } = await api.post(`/users/unfollow/${instructor._id}`);
            setIsFollowing(false);
            setInstructor(prev => ({
                ...prev,
                followers: (prev.followers || []).filter(id => id !== 'temp-id')
            }));
            const user = JSON.parse(localStorage.getItem('user'));
            user.following = data.following;
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Unfollow error:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center bg-dark-bg">
            <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 border-t-4 border-brand-primary rounded-full animate-spin"></div>
                <p className="text-dark-muted font-black uppercase tracking-[0.3em] text-[10px]">Initializing Orbit Presence...</p>
            </div>
        </div>
    );

    if (!instructor) return (
        <div className="h-full flex items-center justify-center bg-dark-bg text-white">
            <div className="text-center space-y-4">
                <User size={64} className="mx-auto text-red-500 opacity-50" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Instructor Not In Orbit</h2>
                <Link to="/" className="text-brand-primary hover:underline font-bold">Return to Base</Link>
            </div>
        </div>
    );

    const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
    const avgRating = courses.length > 0
        ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length
        : 4.9;

    return (
        <div className="max-w-[1600px] mx-auto space-y-16 pb-32">
            {/* Mega Header Section - The Orbit Aura */}
            <div className="relative group p-1 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-[4rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-dark-layer1 rounded-[3.9rem] z-0"></div>

                {/* Dynamic Background Effects */}
                <div className="absolute inset-0 z-0 overflow-hidden rounded-[3.9rem]">
                    <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                </div>

                <div className="relative z-10 p-10 md:p-20 flex flex-col lg:flex-row items-center lg:items-end gap-12 lg:gap-20">
                    {/* High Fidelity Avatar */}
                    <div className="relative group/avatar">
                        <div className="absolute inset-0 bg-brand-primary rounded-[3.5rem] blur-3xl opacity-20 group-hover/avatar:opacity-50 transition-all duration-700"></div>
                        <div
                            onClick={handleAvatarClick}
                            className={`relative w-56 h-56 md:w-72 md:h-72 rounded-[3.2rem] p-1.5 bg-dark-layer2 border border-white/10 shadow-2xl transition-all duration-700 overflow-hidden ${isOwner ? 'cursor-pointer hover:scale-[1.03] active:scale-95' : ''}`}
                        >
                            <div className="w-full h-full rounded-[2.8rem] bg-gradient-to-br from-gray-800 to-black overflow-hidden relative border border-white/5">
                                {instructor.avatar ? (
                                    <img src={instructor.avatar} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-1000" alt={instructor.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-8xl font-black text-white/10 italic">
                                        {instructor.name.charAt(0)}
                                    </div>
                                )}

                                {isOwner && (
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                        <Camera className="text-brand-primary" size={40} />
                                        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Calibrate Aura</span>
                                    </div>
                                )}

                                {isUpdatingAvatar && (
                                    <div className="absolute inset-0 bg-dark-bg/80 flex items-center justify-center">
                                        <div className="w-12 h-12 border-t-4 border-brand-primary rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                        {/* Status Hub Bubble */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-brand-primary text-dark-bg px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl border-[6px] border-dark-layer1 flex items-center gap-3 whitespace-nowrap">
                            <ShieldCheck size={16} fill="currentColor" /> Verified Orbit Architect
                        </div>
                    </div>

                    {/* Instructor Identity Section */}
                    <div className="flex-1 text-center lg:text-left space-y-6 pt-10 lg:pt-0">
                        <div className="space-y-2">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none italic">{instructor.name}</h1>
                                <div className="flex justify-center lg:justify-start gap-3">
                                    {['twitter', 'linkedin', 'github'].map(social => (
                                        instructor.socialLinks?.[social] && (
                                            <a key={social} href={instructor.socialLinks[social]} target="_blank" rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-dark-muted hover:text-brand-primary hover:border-brand-primary/50 transition-all transform hover:-translate-y-1">
                                                {social === 'twitter' ? <Twitter size={20} /> : social === 'linkedin' ? <Linkedin size={20} /> : <Github size={20} />}
                                            </a>
                                        )
                                    ))}
                                </div>
                            </div>
                            <p className="text-2xl md:text-3xl text-brand-primary font-black uppercase tracking-tight italic opacity-90 max-w-3xl">
                                {instructor.instructorProfile?.headline || "Pioneering the Next Generation of Industry Standards"}
                            </p>
                        </div>

                        <p className="text-lg md:text-xl text-dark-muted font-medium max-w-2xl leading-relaxed italic border-l-4 border-brand-primary/30 pl-6">
                            {instructor.bio || "This mastermind is currently reconfiguring their digital footprint. Deep integration with their curriculum is already active."}
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
                            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-3xl border border-white/5 text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">
                                <MapPin size={16} className="text-brand-primary" /> {instructor.location || 'Orbit HQ'}
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-3xl border border-white/5 text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">
                                <Sparkles size={16} className="text-brand-primary" /> {courses.length}+ Mastery Paths
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-3xl border border-white/5 text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">
                                <Users size={16} className="text-brand-primary" /> {totalStudents.toLocaleString()} Enrolled
                            </div>
                            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                <div className="text-center">
                                    <p className="text-lg font-black text-white leading-none">{instructor.followers?.length || 0}</p>
                                    <p className="text-[9px] text-dark-muted font-black uppercase tracking-widest mt-1">Followers</p>
                                </div>
                            </div>
                        </div>

                        {!isOwner && (
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={isFollowing ? handleUnfollow : handleFollow}
                                    disabled={followLoading}
                                    className={`px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl ${isFollowing ? 'bg-white/5 text-white border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30' : 'bg-brand-primary text-dark-bg hover:bg-brand-hover shadow-brand-primary/20'}`}
                                >
                                    {followLoading ? 'Syncing...' : isFollowing ? 'Unfollow' : 'Follow Architect'}
                                </button>
                                <button
                                    onClick={() => navigate(`/messages/${instructor._id}`)}
                                    className="px-8 py-4 bg-dark-layer2 text-white border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Secure Message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Control Center - The Navigation System */}
            <div className="sticky top-[80px] z-40 bg-dark-bg/90 backdrop-blur-3xl border-y border-white/5 py-6">
                <div className="max-w-6xl mx-auto flex flex-wrap justify-center md:justify-start gap-4 md:gap-12 px-6">
                    {[
                        { id: 'reels', label: 'Immersive Reels', icon: Film, count: reels.length },
                        { id: 'courses', label: 'Curriculum Paths', icon: BookOpen, count: courses.length },
                        { id: 'articles', label: 'Strategic Insights', icon: PenTool, count: articles.length },
                        { id: 'about', label: 'Architect Bio', icon: Award }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group relative flex items-center gap-3 pb-2 transition-all ${activeTab === tab.id ? 'text-brand-primary scale-110' : 'text-dark-muted hover:text-white'}`}
                        >
                            <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse' : ''} />
                            <span className="font-black uppercase tracking-[0.2em] text-[11px] italic">{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-brand-primary text-dark-bg' : 'bg-white/5 text-dark-muted group-hover:bg-white/10 transition-all'}`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute -bottom-8 left-0 right-0 h-1 bg-brand-primary rounded-t-full shadow-[0_-8px_20px_rgba(251,191,36,0.6)]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Content Experience Area */}
            <div className="min-h-[600px] px-6">
                {activeTab === 'reels' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Vertical Intel</h2>
                                <p className="text-dark-muted font-bold mt-2 uppercase tracking-widest text-xs">High-speed knowledge drops from the architect.</p>
                            </div>
                            <Link to="/reels" className="bg-brand-primary text-dark-bg px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-brand-hover shadow-xl shadow-brand-primary/20 transition-all flex items-center gap-3">
                                Launch Mega Feed <ChevronRight size={16} />
                            </Link>
                        </div>

                        {reels.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                {reels.map(reel => (
                                    <div
                                        key={reel._id}
                                        className="aspect-[9/16] bg-dark-layer1 rounded-[3rem] overflow-hidden border border-white/5 hover:border-brand-primary/50 transition-all duration-500 group relative shadow-2xl cursor-pointer"
                                        onClick={() => navigate(`/reels?instructorId=${instructor._id}`)}
                                    >
                                        <img src={reel.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={reel.title} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-8 flex flex-col justify-end">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Zap size={14} className="text-brand-primary animate-pulse" fill="currentColor" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Orbit Short</span>
                                            </div>
                                            <h4 className="text-white font-black text-sm line-clamp-2 uppercase tracking-tight italic mb-4">{reel.title}</h4>
                                            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <Eye size={12} className="text-dark-muted" />
                                                    <span className="text-[10px] text-dark-muted font-black">{reel.views || '12.4K'}</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-dark-bg transition-all">
                                                    <Play size={16} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Overlay Decorations */}
                                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                                                <Share2 size={16} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] group hover:border-brand-primary/20 transition-all">
                                <Film size={100} className="mx-auto mb-8 text-dark-muted opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-widest">Reel Feed Dormant</h3>
                                <p className="text-dark-muted font-medium mt-4 max-w-md mx-auto">The architect is currently capturing vertical mastery. Tactical drops imminent.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Learning Schematics</h2>
                                <p className="text-dark-muted font-bold mt-2 uppercase tracking-widest text-xs">Full-scale digital environments designed for total dominance.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {courses.map(course => (
                                <Link key={course._id} to={`/course/${course._id}`}
                                    className="group bg-dark-layer1 border border-white/5 rounded-[3.5rem] overflow-hidden hover:border-brand-primary transition-all duration-700 flex flex-col h-full shadow-2xl relative">
                                    <div className="aspect-[16/10] bg-dark-layer2 relative overflow-hidden">
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent flex flex-col justify-end p-10">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <span className="bg-brand-primary text-dark-bg px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl">
                                                        {course.category}
                                                    </span>
                                                    <div className="flex items-center gap-2 pt-2 text-white/50 text-[10px] font-black uppercase tracking-widest">
                                                        <Clock size={12} /> {course.videos?.length || 12} Lessons Active
                                                    </div>
                                                </div>
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-brand-primary/20 backdrop-blur-xl border border-brand-primary/30 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-dark-bg transition-all transform group-hover:scale-110">
                                                    <Play size={28} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 flex-1 flex flex-col space-y-6">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-3xl font-black text-white italic leading-none group-hover:text-brand-primary transition-colors tracking-tighter line-clamp-2">
                                                {course.title}
                                            </h3>
                                        </div>

                                        <p className="text-dark-muted text-sm font-medium line-clamp-3 leading-relaxed">
                                            {course.description}
                                        </p>

                                        <div className="pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-yellow-500 font-black">
                                                    <Star size={18} fill="currentColor" className="animate-pulse" />
                                                    <span className="text-lg">{course.rating || 4.9}</span>
                                                </div>
                                                <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                                                <div className="flex items-center gap-2 text-dark-muted font-black text-[10px] uppercase tracking-widest">
                                                    <Users size={14} className="text-brand-primary" />
                                                    <span>{course.enrollmentCount || '2,490'} Orbiters</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest mb-1 italic">Tactical Access</p>
                                                <span className="font-black text-4xl text-white tracking-tighter">${course.price}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Path Decor */}
                                    <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                                            <Target size={24} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'articles' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Architectural Briefs</h2>
                                <p className="text-dark-muted font-bold mt-2 uppercase tracking-widest text-xs">Deep-dive technical insights and future-state manifestos.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {articles.map(article => (
                                <Link key={article._id} to={`/blog/${article.slug}`}
                                    className="group bg-dark-layer1 border border-white/5 rounded-[3.5rem] p-6 flex flex-col lg:flex-row gap-10 hover:border-brand-primary transition-all duration-700 shadow-2xl overflow-hidden relative">
                                    <div className="w-full lg:w-72 h-80 lg:h-full bg-dark-layer2 rounded-[2.8rem] overflow-hidden flex-shrink-0 relative">
                                        {article.coverImage ? (
                                            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-dark-muted bg-gradient-to-br from-gray-900 to-black">
                                                <PenTool size={60} className="opacity-10" />
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6">
                                            <span className="bg-brand-primary text-dark-bg px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl">
                                                {article.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 py-4 pr-4 space-y-6">
                                        <div className="flex items-center gap-4 text-[10px] font-black text-dark-muted uppercase tracking-widest italic">
                                            <Calendar size={14} className="text-brand-primary" /> {new Date(article.createdAt).toLocaleDateString()}
                                            <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                            <Clock size={14} className="text-brand-primary" /> {Math.ceil(article.content.length / 1000)} Min Read
                                        </div>

                                        <h3 className="text-4xl font-black text-white italic leading-tight group-hover:text-brand-primary transition-colors tracking-tighter line-clamp-2">
                                            {article.title}
                                        </h3>

                                        <p className="text-dark-muted text-lg font-medium line-clamp-3 leading-relaxed opacity-70">
                                            {article.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                                        </p>

                                        <div className="pt-8 flex items-center justify-between border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                                    <Star size={14} fill="currentColor" />
                                                </div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic font-bold">Recommended Insight</span>
                                            </div>
                                            <div className="text-brand-primary font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                                Read Schematic <Plus size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div className="bg-dark-layer1 border border-white/5 rounded-[4.5rem] p-12 md:p-24 space-y-20 relative overflow-hidden shadow-2xl">
                            <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[100px]"></div>

                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h3 className="text-5xl md:text-7xl font-black text-white italic leading-none tracking-tighter uppercase">The Vision</h3>
                                        <div className="w-24 h-2.5 bg-brand-primary rounded-full"></div>
                                    </div>
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-2xl md:text-3xl text-dark-muted leading-relaxed font-medium italic opacity-80">
                                            "{instructor.bio || "Pioneering digital education through the lens of architectural precision and strategic dominance. Every curriculum path is a blueprint for mastery."}"
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-6">
                                        {instructor.instructorProfile?.skills?.map(skill => (
                                            <span key={skill} className="bg-white/5 border border-white/10 px-8 py-3.5 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] text-white hover:border-brand-primary/50 transition-all cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    <div className="bg-dark-layer2/50 border border-white/5 p-10 md:p-16 rounded-[4rem] space-y-12 shadow-2xl">
                                        <h4 className="text-2xl font-black text-white uppercase italic tracking-widest flex items-center gap-4">
                                            <Rocket size={32} className="text-brand-primary" /> Orbit Credentials
                                        </h4>

                                        <div className="space-y-8">
                                            {[
                                                { label: 'Strategic Architect Rank', value: 'Level 10 Master', icon: ShieldCheck, color: 'text-blue-400' },
                                                { label: 'Cumulative Knowledge Drops', value: `${courses.length + reels.length + articles.length} Meta Items`, icon: Zap, color: 'text-yellow-400' },
                                                { label: 'Architect Presence', value: `Serving Since ${new Date(instructor.createdAt).getFullYear()}`, icon: Globe, color: 'text-purple-400' },
                                                { label: 'Community Trust Index', value: '99.8% Approval', icon: Heart, color: 'text-pink-400' }
                                            ].map((cred, i) => (
                                                <div key={i} className="flex items-center gap-6 group/cred">
                                                    <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${cred.color} group-hover/cred:scale-110 transition-transform shadow-xl`}>
                                                        <cred.icon size={28} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">{cred.label}</p>
                                                        <p className="text-xl font-black text-white italic tracking-tight">{cred.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-10 border-t border-white/5 flex gap-4">
                                            {['twitter', 'linkedin', 'github', 'youtube'].map(plat => (
                                                instructor.socialLinks?.[plat] && (
                                                    <a key={plat} href={instructor.socialLinks[plat]} target="_blank" rel="noopener noreferrer"
                                                        className="flex-1 bg-white/5 py-5 rounded-2xl border border-white/5 flex items-center justify-center text-dark-muted hover:text-brand-primary hover:border-brand-primary/50 transition-all font-black uppercase text-[9px] tracking-widest">
                                                        {plat}
                                                    </a>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorProfile;


