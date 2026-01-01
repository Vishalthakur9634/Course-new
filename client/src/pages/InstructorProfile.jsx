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
    const fileInputRef = useRef(null);

    useEffect(() => {
        console.log('InstructorProfile: Mounted/Updated. ID:', instructorId);
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id === instructorId || user._id === instructorId) {
                setIsOwner(true);
            }
        }
        if (instructorId) {
            fetchData();
        } else {
            console.error('InstructorProfile: No instructorId provided!');
            setLoading(false);
        }
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
        console.log('InstructorProfile: fetchData started for', instructorId);
        setLoading(true);
        try {
            // Fetch Profile first (Critical)
            console.log('InstructorProfile: Fetching profile...');
            const profileRes = await api.get(`/users/profile/${instructorId}`);
            console.log('InstructorProfile: Profile fetched', profileRes.data);
            setInstructor(profileRes.data);

            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const isCurrentUserOwner = currentUser && (currentUser.id === instructorId || currentUser._id === instructorId);

            // Fetch other data in parallel (Non-critical)
            console.log('InstructorProfile: Fetching aux data...');
            const [coursesRes, reelsRes, articlesRes] = await Promise.allSettled([
                api.get(`/courses?instructorId=${instructorId}`),
                api.get(`/reels/feed?instructorId=${instructorId}`),
                api.get(`/articles?authorId=${instructorId}`)
            ]);
            console.log('InstructorProfile: Aux data fetched');

            // Handle Courses
            if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value.data)) {
                if (isCurrentUserOwner) {
                    setCourses(coursesRes.value.data);
                } else {
                    setCourses(coursesRes.value.data.filter(c => c.isPublished && c.approvalStatus === 'approved'));
                }
            } else {
                console.warn('Failed to fetch courses or invalid format', coursesRes);
                setCourses([]);
            }

            // Handle Reels
            if (reelsRes.status === 'fulfilled' && Array.isArray(reelsRes.value.data)) {
                setReels(reelsRes.value.data);
            } else {
                console.warn('Failed to fetch reels', reelsRes);
                setReels([]);
            }

            // Handle Articles
            if (articlesRes.status === 'fulfilled' && Array.isArray(articlesRes.value.data)) {
                setArticles(articlesRes.value.data);
            } else {
                console.warn('Failed to fetch articles', articlesRes);
                setArticles([]);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // If profile fails, instructor remains null, showing Not Found screen
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
        <div className="h-full flex items-center justify-center bg-[#0a0a0a] min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-dark-muted font-bold uppercase tracking-widest text-[10px]">Loading Profile Information...</p>
            </div>
        </div>
    );

    if (!instructor) return (
        <div className="h-full flex items-center justify-center bg-[#0a0a0a] min-h-screen text-white">
            <div className="text-center space-y-6">
                <User size={64} className="mx-auto text-dark-muted" />
                <h2 className="text-2xl font-bold uppercase tracking-tight">Educator Profile Not Found</h2>
                <Link to="/" className="inline-block px-8 py-3 bg-brand-primary text-dark-bg font-bold rounded-lg text-xs uppercase tracking-widest">Return to Homepage</Link>
            </div>
        </div>
    );

    const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);

    return (
        <div className="max-w-[1400px] mx-auto space-y-16 pb-32 px-4 md:px-8 font-inter text-white pt-10">
            {/* Header Section */}
            <div className="bg-[#1a1a1a] rounded-2xl shadow-xl overflow-hidden border border-white/5">
                <div className="p-10 md:p-16 flex flex-col lg:flex-row items-center lg:items-center gap-10 md:gap-16">
                    <div className="relative group/avatar">
                        <div
                            onClick={handleAvatarClick}
                            className={`relative w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl transition-all overflow-hidden ${isOwner ? 'cursor-pointer hover:border-brand-primary/50' : ''}`}
                        >
                            {instructor.avatar ? (
                                <img src={instructor.avatar} className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-105" alt={instructor.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-white/5 uppercase">
                                    {instructor.name.charAt(0)}
                                </div>
                            )}

                            {isOwner && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <Camera className="text-brand-primary" size={32} />
                                    <span className="text-white text-[9px] font-bold uppercase tracking-widest">Update Photo</span>
                                </div>
                            )}

                            {isUpdatingAvatar && (
                                <div className="absolute inset-0 bg-dark-bg/80 flex items-center justify-center">
                                    <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-brand-primary text-dark-bg px-6 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest shadow-xl border-4 border-[#1a1a1a] flex items-center gap-2 whitespace-nowrap">
                            <ShieldCheck size={14} /> Verified Educator
                        </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <div className="space-y-2">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tight leading-none">{instructor.name}</h1>
                                <div className="flex justify-center lg:justify-start gap-2">
                                    {['twitter', 'linkedin', 'github'].map(social => (
                                        instructor.socialLinks?.[social] && (
                                            <a key={social} href={instructor.socialLinks[social]} target="_blank" rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-dark-muted hover:text-brand-primary transition-all">
                                                {social === 'twitter' ? <Twitter size={18} /> : social === 'linkedin' ? <Linkedin size={18} /> : <Github size={18} />}
                                            </a>
                                        )
                                    ))}
                                </div>
                            </div>
                            <p className="text-xl md:text-2xl text-brand-primary font-bold uppercase tracking-tight max-w-2xl">
                                {instructor.instructorProfile?.headline || "Senior Professional Educator"}
                            </p>
                        </div>

                        <p className="text-base text-dark-muted font-medium max-w-2xl leading-relaxed">
                            {instructor.bio || "Industry expert dedicated to developing high-impact technical curriculum and mentoring the next generation of engineers."}
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-dark-muted uppercase tracking-widest">
                                <MapPin size={14} className="text-brand-primary" /> {instructor.location || 'Global Educator'}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-dark-muted uppercase tracking-widest">
                                <BookOpen size={14} className="text-brand-primary" /> {courses.length} Courses
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-dark-muted uppercase tracking-widest">
                                <Users size={14} className="text-brand-primary" /> {totalStudents.toLocaleString()} Students
                            </div>
                        </div>

                        {!isOwner && (
                            <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                                <button
                                    onClick={isFollowing ? handleUnfollow : handleFollow}
                                    disabled={followLoading}
                                    className={`px-10 py-3.5 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg ${isFollowing ? 'bg-white/5 text-white border border-white/10 hover:bg-red-500/10 hover:text-red-500' : 'bg-brand-primary text-dark-bg hover:brightness-110'}`}
                                >
                                    {followLoading ? 'Processing...' : isFollowing ? 'Unfollow' : 'Follow Educator'}
                                </button>
                                <button
                                    onClick={() => navigate(`/messages/${instructor._id}`)}
                                    className="px-10 py-3.5 bg-white/5 text-white border border-white/10 rounded-lg font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all font-inter"
                                >
                                    Message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-[#1a1a1a] p-1 rounded-xl border border-white/5 flex gap-2 w-fit mx-auto md:mx-0">
                {[
                    { id: 'courses', label: 'Course Catalog', icon: BookOpen, count: courses.length },
                    { id: 'reels', label: 'Video Insights', icon: Film, count: reels.length },
                    { id: 'articles', label: 'Published Insights', icon: PenTool, count: articles.length },
                    { id: 'about', label: 'Career History', icon: Award }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand-primary text-dark-bg shadow-lg' : 'text-dark-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {tab.count !== undefined && <span className="opacity-50 ml-1">({tab.count})</span>}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'courses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <Link key={course._id} to={`/course/${course._id}`}
                                className="group bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all flex flex-col h-full shadow-lg">
                                <div className="aspect-[16/9] relative overflow-hidden bg-[#262626]">
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-brand-primary text-dark-bg px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                            {course.category}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 group-hover:text-brand-primary transition-colors line-clamp-2">{course.title}</h3>
                                    <p className="text-dark-muted text-xs font-medium line-clamp-2 leading-relaxed mb-8">
                                        {course.description}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                                <Star size={14} fill="currentColor" />
                                                <span className="text-sm">{course.rating || 4.9}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">
                                                {course.enrollmentCount || 0} Learners
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold text-white">${course.price}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {activeTab === 'reels' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {reels.map(reel => (
                            <div
                                key={reel._id}
                                className="aspect-[9/16] bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-primary/30 transition-all group relative cursor-pointer"
                                onClick={() => navigate(`/reels?instructorId=${instructor._id}`)}
                            >
                                <img src={reel.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-100" alt={reel.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                                    <h4 className="text-white font-bold text-[11px] line-clamp-2 uppercase tracking-tight mb-3">{reel.title}</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-dark-muted uppercase tracking-widest">
                                            <Eye size={12} /> {reel.views || '1.1K'}
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-brand-primary text-dark-bg flex items-center justify-center shadow-lg">
                                            <Play size={14} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'articles' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {articles.map(article => (
                            <Link key={article._id} to={`/blog/${article.slug}`}
                                className="group bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex gap-6 hover:border-brand-primary/20 transition-all shadow-lg">
                                <div className="w-40 h-40 rounded-xl bg-[#262626] overflow-hidden shrink-0">
                                    {article.coverImage ? (
                                        <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-dark-muted">
                                            <PenTool size={32} opacity={0.2} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 py-1 space-y-3 min-w-0">
                                    <div className="flex items-center gap-3 text-[9px] font-bold text-dark-muted uppercase tracking-widest">
                                        <Calendar size={12} className="text-brand-primary" /> {new Date(article.createdAt).toLocaleDateString()}
                                    </div>
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors line-clamp-2 leading-tight">
                                        {article.title}
                                    </h3>
                                    <p className="text-xs text-dark-muted font-medium line-clamp-2 leading-relaxed">
                                        {article.content.replace(/<[^>]*>/g, '')}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="bg-[#1a1a1a] rounded-2xl p-10 md:p-16 border border-white/5 space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            <div className="space-y-8">
                                <h3 className="text-3xl font-bold text-white uppercase tracking-tight">Professional <span className="text-brand-primary">Philosophy</span></h3>
                                <div className="text-lg text-dark-muted leading-relaxed font-medium">
                                    {instructor.bio || "Industry expert dedicated to developing high-impact technical curriculum and mentoring the next generation of engineers."}
                                </div>
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {instructor.instructorProfile?.skills?.map(skill => (
                                        <span key={skill} className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-10">
                                <h4 className="text-[10px] font-bold text-dark-muted uppercase tracking-widest border-b border-white/5 pb-2">Verified Performance</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {[
                                        { label: 'Courses Created', value: courses.length, icon: BookOpen, color: 'text-brand-primary' },
                                        { label: 'Total Students', value: totalStudents.toLocaleString(), icon: Users, color: 'text-white' },
                                        { label: 'Active Followers', value: instructor.followers?.length || 0, icon: Heart, color: 'text-white' },
                                        { label: 'Teaching Multiplier', value: 'Level 4 Expert', icon: Zap, color: 'text-brand-primary' }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-dark-muted">
                                                <stat.icon size={24} className={stat.color} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-xl font-bold text-white uppercase tracking-tight">{stat.value}</p>
                                            </div>
                                        </div>
                                    ))}
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
