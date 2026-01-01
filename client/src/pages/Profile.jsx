import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    User, Mail, BookOpen, Clock, Camera, Save, Globe, Github,
    Linkedin, Twitter, Film, Zap, Sparkles, ChevronRight, MessageSquare, Star,
    Check, UserPlus, Edit2, Share2, Youtube, Play, Layers, Radio, Flame,
    Trophy, Target, TrendingUp, Award, Calendar, Activity, Zap as Lightning, Shield
} from 'lucide-react';
import SkillRadar from '../components/dashboard/SkillRadar';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';

const Profile = () => {
    const { userId: paramId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        headline: '',
        twitter: '',
        linkedin: '',
        github: '',
        website: '',
        youtube: ''
    });
    const [courses, setCourses] = useState([]);
    const [reels, setReels] = useState([]);
    const [activeTab, setActiveTab] = useState('courses');
    const [isOwner, setIsOwner] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

    useEffect(() => {
        fetchProfile();
    }, [paramId]);

    const fetchProfile = async () => {
        try {
            const userObj = JSON.parse(localStorage.getItem('user'));
            const currentUserId = userObj?.id || userObj?._id;
            const targetId = paramId || currentUserId;

            if (!targetId) return;

            setIsOwner(targetId === currentUserId);

            const [profileRes, coursesRes, reelsRes] = await Promise.all([
                api.get(`/users/profile/${targetId}`),
                api.get(`/courses?instructorId=${targetId}`),
                api.get(`/reels/feed?instructorId=${targetId}`)
            ]);

            const data = profileRes.data;

            setUser(data);
            setFormData({
                name: data.name,
                email: data.email,
                bio: data.bio || '',
                headline: data.instructorProfile?.headline || '',
                twitter: data.instructorProfile?.socialLinks?.twitter || '',
                linkedin: data.instructorProfile?.socialLinks?.linkedin || '',
                github: data.instructorProfile?.socialLinks?.github || '',
                website: data.instructorProfile?.socialLinks?.website || '',
                youtube: data.instructorProfile?.socialLinks?.youtube || ''
            });
            setCourses(coursesRes.data || []);
            setReels(reelsRes.data || []);
            if (data.avatar) {
                setPhotoPreview(data.avatar);
            }
            setIsFollowing(data.isFollowing || false);
        } catch (error) {
            console.error('Error fetching profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const userId = user._id || user.id;

            if (photoFile) {
                const photoFormData = new FormData();
                photoFormData.append('photo', photoFile);
                await api.post(`/users/profile/${userId}/photo`, photoFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            await api.put(`/users/profile/${userId}`, {
                ...formData,
                socialLinks: {
                    twitter: formData.twitter,
                    linkedin: formData.linkedin,
                    github: formData.github,
                    website: formData.website,
                    youtube: formData.youtube
                },
                headline: formData.headline
            });

            setIsEditing(false);
            setPhotoFile(null);

            const updatedUser = {
                ...currentUser,
                name: formData.name,
                avatar: photoPreview || currentUser.avatar
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            window.dispatchEvent(new Event('profileUpdate'));

            fetchProfile();
            alert('Profile Updated Successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleFollowToggle = async () => {
        if (!currentUser) return alert('Please login to follow users');
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const currentUserId = currentUser.id || currentUser._id;
            const targetId = paramId || currentUserId;
            await api.post(`/users/${endpoint}/${targetId}`);
            setIsFollowing(!isFollowing);
            fetchProfile();
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
            <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-inter text-white pb-32">
            <div className="max-w-[1400px] mx-auto px-6 pt-16 space-y-12">
                {/* Profile Performance Header */}
                <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden shadow-3xl">
                    {/* Cover Area */}
                    <div className="h-48 relative bg-[#0a0a0a] border-b border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-30" />
                        <div className="absolute top-6 right-8 flex gap-4">
                            <div className="bg-[#141414] border border-white/10 px-4 py-2 rounded-xl text-center min-w-[80px]">
                                <p className="text-[10px] font-semibold text-dark-muted uppercase tracking-wider mb-1">XP</p>
                                <p className="text-xl font-bold">{user?.gamification?.xp || 0}</p>
                            </div>
                            <div className="bg-brand-primary text-dark-bg px-4 py-2 rounded-xl text-center min-w-[80px]">
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Level</p>
                                <p className="text-xl font-bold">{user?.gamification?.level || 1}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Identity Overlay */}
                    <div className="px-12 pb-10 -mt-24 flex flex-col lg:flex-row items-end gap-10 border-b border-white/5 bg-[#141414]">
                        <div className="relative group/avatar">
                            <div className="w-48 h-48 rounded-[2.5rem] bg-[#0a0a0a] p-1.5 border-2 border-white/5 shadow-3xl overflow-hidden transition-all group-hover/avatar:border-brand-primary/50">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[2rem]" />
                                ) : (
                                    <div className="w-full h-full bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-7xl font-bold text-brand-primary uppercase">
                                        {user?.name?.[0]}
                                    </div>
                                )}
                            </div>
                            {isOwner && (
                                <label className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-brand-primary text-dark-bg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/20">
                                    <Camera size={22} />
                                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                                </label>
                            )}
                        </div>

                        <div className="flex-1 space-y-6 mb-4">
                            <div className="space-y-1 text-center lg:text-left">
                                <div className="flex flex-col lg:flex-row items-center gap-4">
                                    <h1 className="text-4xl font-bold text-white">{user?.name}</h1>
                                    {user?.role === 'instructor' && (
                                        <div className="bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20 flex items-center gap-2">
                                            <Shield size={14} className="text-brand-primary" />
                                            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Instructor</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-brand-primary font-medium text-sm opacity-80">{user?.instructorProfile?.headline || 'Member'}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 pt-2">
                                <div className="flex items-center gap-8 border-r border-white/5 pr-8">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold">{user?.followerCount || 0}</span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-dark-muted mt-1">Followers</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold">{user?.followingCount || 0}</span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-dark-muted mt-1">Following</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {!isOwner ? (
                                        <button
                                            onClick={handleFollowToggle}
                                            className={`px-8 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[11px] transition-all flex items-center gap-2 shadow-lg ${isFollowing ? 'bg-white/5 border border-white/10 text-white' : 'bg-brand-primary text-dark-bg border border-brand-primary shadow-brand-primary/20 hover:brightness-110'}`}
                                        >
                                            {isFollowing ? <Check size={16} /> : <UserPlus size={16} />}
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="px-8 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[11px] hover:bg-white/10 transition-all flex items-center gap-2"
                                        >
                                            <Edit2 size={16} />
                                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                        </button>
                                    )}
                                    <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-lg">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registry Metadata */}
                    <div className="px-12 py-10 flex flex-col lg:flex-row items-center justify-between gap-10 bg-[#0a0a0a]/20">
                        <div className="max-w-3xl space-y-2">
                            <h3 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">About Me</h3>
                            <p className="text-dark-muted font-medium text-sm leading-relaxed">
                                {user?.bio || "No bio added yet."}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {user?.instructorProfile?.socialLinks && Object.entries(user.instructorProfile.socialLinks).map(([platform, url]) => (
                                url && (
                                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-dark-muted hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-xl group/link">
                                        {platform === 'website' && <Globe size={20} className="group-hover/link:scale-110 transition-transform" />}
                                        {platform === 'twitter' && <Twitter size={20} className="group-hover/link:scale-110 transition-transform" />}
                                        {platform === 'github' && <Github size={20} className="group-hover/link:scale-110 transition-transform" />}
                                        {platform === 'youtube' && <Youtube size={20} className="group-hover/link:scale-110 transition-transform" />}
                                        {platform === 'linkedin' && <Linkedin size={20} className="group-hover/link:scale-110 transition-transform" />}
                                    </a>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Registry Modification Form */}
                {isEditing && (
                    <div className="bg-[#141414] border border-brand-primary/30 rounded-3xl p-10 shadow-3xl animate-in fade-in slide-in-from-top-6">
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-dark-muted ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary/40 outline-none text-sm transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-dark-muted ml-1">Headline</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Senior Software Engineer"
                                    value={formData.headline}
                                    onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary/40 outline-none text-sm transition-all shadow-inner"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-medium text-dark-muted ml-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white font-medium h-24 focus:border-brand-primary/40 outline-none text-sm transition-all resize-none shadow-inner"
                                />
                            </div>

                            {/* Social Links */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-dark-muted ml-1">Website</label>
                                <input
                                    type="text"
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary/40 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-dark-muted ml-1">LinkedIn</label>
                                <input
                                    type="text"
                                    value={formData.linkedin}
                                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary/40 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-dark-muted ml-1">Twitter</label>
                                <input
                                    type="text"
                                    value={formData.twitter}
                                    onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary/40 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-dark-muted ml-1">YouTube</label>
                                <input
                                    type="text"
                                    value={formData.youtube}
                                    onChange={e => setFormData({ ...formData, youtube: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary/40 outline-none text-sm transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-xs hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-brand-primary text-dark-bg px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg hover:brightness-110 transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Performance Matrix Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Activity & Capability Matrix */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-[#141414] border border-white/5 rounded-3xl p-10 space-y-10 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-4">
                                        <Activity className="text-brand-primary" size={24} /> Performance Log
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-muted opacity-50">Timeline of Community Contribution</p>
                                </div>
                            </div>
                            <ActivityHeatmap />
                        </div>

                        <div className="bg-[#141414] border border-white/5 rounded-3xl p-10 space-y-10 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-4">
                                        <Target className="text-brand-primary" size={24} /> Strategic Domains
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-muted opacity-50">Capability and Skillset Distribution</p>
                                </div>
                            </div>
                            <SkillRadar courses={courses} />
                        </div>
                    </div>

                    {/* Milestones & Progression */}
                    <div className="space-y-10">
                        <div className="bg-[#141414] border border-white/5 rounded-3xl p-10 shadow-2xl space-y-10">
                            <div className="flex items-center justify-between bg-[#0a0a0a]/40 -mx-10 -mt-10 p-6 border-b border-white/5 px-10">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-dark-muted opacity-60">Achievement Milestones</h3>
                                <Trophy size={20} className="text-yellow-500" />
                            </div>
                            <div className="grid grid-cols-1 gap-10 text-center">
                                <div className="space-y-2">
                                    <p className="text-5xl font-bold tracking-tighter text-white">#{Math.floor(Math.random() * 500) + 1}</p>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-primary">Network Standing</p>
                                </div>
                                <div className="h-px bg-white/5 mx-10" />
                                <div className="space-y-2">
                                    <p className="text-5xl font-bold tracking-tighter text-brand-primary">{Math.floor(Math.random() * 20) + 5}</p>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-dark-muted opacity-60">Synchronized Streak</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-3xl p-10 shadow-3xl space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all pointer-events-none">
                                <Lightning size={100} />
                            </div>
                            <header className="space-y-3">
                                <h3 className="text-[11px] font-bold text-brand-primary uppercase tracking-[0.3em]">Module Threshold</h3>
                                <div className="flex items-baseline justify-between pt-4 border-b border-brand-primary/10 pb-4">
                                    <div className="space-y-1">
                                        <p className="text-4xl font-bold text-white tracking-tight">Tier 13</p>
                                        <p className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Active Progression</p>
                                    </div>
                                    <span className="text-sm font-bold text-brand-primary tracking-widest">750 / 1000 Performance Units</span>
                                </div>
                            </header>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-brand-primary transition-all duration-1000 ease-out" style={{ width: '75%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Engagement Registry Matrix */}
                <div className="space-y-12 pt-10">
                    <div className="flex items-center justify-center p-1.5 bg-[#141414] rounded-2xl border border-white/5 w-fit mx-auto shadow-2xl">
                        {['courses', 'shorts', 'posts'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-12 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-brand-primary text-dark-bg shadow-xl' : 'text-dark-muted hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[400px]">
                        {activeTab === 'courses' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {courses.length > 0 ? courses.map(course => (
                                    <Link key={course._id} to={`/course/${course._id}`} className="group bg-[#141414] border border-white/5 rounded-3xl overflow-hidden hover:border-brand-primary/30 transition-all shadow-2xl flex flex-col h-full">
                                        <div className="aspect-video relative overflow-hidden bg-[#0a0a0a]">
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                                            <div className="absolute top-4 right-4 bg-[#0a0a0a]/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase text-brand-primary border border-white/10 shadow-xl">
                                                {course.category}
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-6 flex-1 flex flex-col">
                                            <h4 className="font-bold text-xl uppercase tracking-tight group-hover:text-brand-primary transition-colors line-clamp-2 leading-tight">{course.title}</h4>
                                            <div className="flex justify-between items-center mt-auto pt-8 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-widest">
                                                    <Star size={14} fill="currentColor" />
                                                    {course.rating || 4.9} High Fidelity
                                                </div>
                                                <span className="text-white font-bold text-2xl tracking-tighter">${course.price}</span>
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="col-span-full py-40 text-center space-y-4 opacity-10">
                                        <Layers size={64} className="mx-auto" />
                                        <p className="text-[11px] font-bold uppercase tracking-[0.4em]">Registry Empty: No Published Paths</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'shorts' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {reels.length > 0 ? reels.map(reel => (
                                    <Link key={reel._id} to={`/reels?id=${reel._id}`} className="group aspect-[9/16] bg-[#141414] rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl hover:border-brand-primary/30 transition-all">
                                        <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                            <p className="text-[11px] font-bold text-white truncate uppercase tracking-tight mb-2 group-hover:text-brand-primary transition-colors">{reel.title}</p>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-brand-primary uppercase tracking-[0.2em]">
                                                <Play size={12} fill="currentColor" /> {reel.views || 0} Synchronized
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="col-span-full py-40 text-center space-y-4 opacity-10">
                                        <Play size={64} className="mx-auto" />
                                        <p className="text-[11px] font-bold uppercase tracking-[0.4em]">Registry Empty: No Semantic Shorts</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'posts' && (
                            <div className="py-40 text-center space-y-6 bg-[#141414]/30 rounded-[3rem] border border-dashed border-white/5 shadow-inner opacity-10">
                                <MessageSquare size={80} className="mx-auto" />
                                <p className="text-[11px] font-bold uppercase tracking-[0.4em]">Registry Empty: No Community Signal</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
