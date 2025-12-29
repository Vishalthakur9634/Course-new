import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    User, Mail, BookOpen, Clock, Camera, Save, Globe, Github,
    Linkedin, Twitter, Film, Zap, Sparkles, ChevronRight, MessageSquare, Star,
    Check, UserPlus, Edit2, Share2, Youtube, Play, Layers, Radio, Flame,
    Trophy, Target, TrendingUp, Award, Calendar, Activity, Zap as Lightning
} from 'lucide-react';

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
        twitter: '',
        linkedin: '',
        github: '',
        website: ''
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
            const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
            const targetId = paramId || currentUserId;

            if (!targetId) return;

            setIsOwner(targetId === currentUserId);

            const [profileRes, coursesRes, reelsRes] = await Promise.all([
                api.get(`/users/profile/${targetId}`),
                api.get(`/courses?instructorId=${targetId}`), // Fetch if they are instructor
                api.get(`/reels/feed?instructorId=${targetId}`)
            ]);

            const data = profileRes.data;
            setUser(data);
            setFormData({
                name: data.name,
                email: data.email,
                bio: data.bio || '',
                twitter: data.socialLinks?.twitter || '',
                linkedin: data.socialLinks?.linkedin || '',
                github: data.socialLinks?.github || '',
                website: data.socialLinks?.website || ''
            });
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

    const handleAvatarChange = handlePhotoChange;

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const userId = user._id;

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
                    website: formData.website
                }
            });

            setIsEditing(false);
            setPhotoFile(null);
            fetchProfile();
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleFollowToggle = async () => {
        if (!currentUser) return alert('Please login to follow users');
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            await api.post(`/users/${endpoint}/${paramId || currentUser._id}`);
            setIsFollowing(!isFollowing);
            fetchProfile(); // Refresh counts
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg font-orbit text-white selection:bg-brand-primary/30 pb-20">
            {/* Dynamic Background Aura */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
                {/* Profile Header - CRAZY LEVEL */}
                <div className="relative group">
                    {/* Header Card */}
                    <div className="bg-dark-layer1 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                        {/* Banner/Cover Area */}
                        <div className="h-64 relative bg-gradient-to-br from-dark-layer2 to-black overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-layer1 via-transparent to-transparent"></div>

                            {/* Floating Stats */}
                            <div className="absolute top-8 right-8 flex gap-4">
                                <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">XP Power</p>
                                    <p className="text-xl font-black italic">{(user?.followerCount || 0) * 100 + (courses.length * 500)}</p>
                                </div>
                                <div className="bg-brand-primary text-dark-bg px-6 py-3 rounded-2xl text-center shadow-lg shadow-brand-primary/20">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Rank</p>
                                    <p className="text-xl font-black italic">#{Math.floor(Math.random() * 100) + 1}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info Overlay */}
                        <div className="px-12 pb-12 -mt-20 relative z-20">
                            <div className="flex flex-col md:flex-row items-end gap-8">
                                {/* Avatar with 3D effect */}
                                <div className="relative group/avatar">
                                    <div className="absolute inset-0 bg-brand-primary rounded-[2.5rem] blur-2xl opacity-0 group-hover/avatar:opacity-30 transition-opacity duration-500"></div>
                                    <div className="w-48 h-48 rounded-[2.5rem] bg-dark-layer2 p-1.5 border border-white/10 shadow-2xl relative">
                                        <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-black relative">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-indigo-500/20 flex items-center justify-center text-5xl font-black text-brand-primary uppercase italic">
                                                    {user?.name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <label className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-brand-primary text-dark-bg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all shadow-xl">
                                            <Camera size={20} strokeWidth={2.5} />
                                            <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                                        </label>
                                    )}
                                </div>

                                {/* Identity & Actions */}
                                <div className="flex-1 space-y-4 mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{user?.name}</h1>
                                            {user?.role === 'instructor' && (
                                                <div className="bg-brand-primary p-1.5 rounded-full ring-4 ring-brand-primary/10">
                                                    <Sparkles size={16} className="text-dark-bg" fill="currentColor" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] italic">{user?.instructorProfile?.headline || 'Orbit Frequency Specialist'}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black italic leading-none">{user?.followerCount || 0}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-dark-muted">Linked Fans</span>
                                            </div>
                                            <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black italic leading-none">{user?.followingCount || 0}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-dark-muted">Following</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            {!isOwner ? (
                                                <button
                                                    onClick={handleFollowToggle}
                                                    className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 ${isFollowing ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-brand-primary text-dark-bg shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95'}`}
                                                >
                                                    {isFollowing ? <Check size={16} strokeWidth={3} /> : <UserPlus size={16} strokeWidth={3} />}
                                                    {isFollowing ? 'Tracking' : 'Follow User'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditing(!isEditing)}
                                                    className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center gap-3"
                                                >
                                                    <Edit2 size={16} />
                                                    {isEditing ? 'Syncing...' : 'Modify Aura'}
                                                </button>
                                            )}
                                            <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                                                <Share2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Bio Bar */}
                        <div className="px-12 py-8 bg-black/40 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                            <p className="flex-1 text-dark-muted font-medium text-sm leading-relaxed max-w-2xl">
                                {user?.bio || "No biography transmission logged for this user. They are currently navigating the void between sectors."}
                            </p>

                            <div className="flex items-center gap-1">
                                {user?.instructorProfile?.socialLinks && Object.entries(user.instructorProfile.socialLinks).map(([platform, url]) => (
                                    url && (
                                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-dark-layer2 border border-white/10 flex items-center justify-center text-dark-muted hover:text-brand-primary hover:border-brand-primary/50 transition-all hover:-translate-y-1">
                                            {platform === 'website' && <Globe size={18} />}
                                            {platform === 'twitter' && <Twitter size={18} />}
                                            {platform === 'github' && <Github size={18} />}
                                            {platform === 'youtube' && <Youtube size={18} />}
                                            {platform === 'linkedin' && <Linkedin size={18} />}
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievement Badges & Crazy Features */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Streak Counter */}
                    <div className="bg-dark-layer1 rounded-[2rem] border border-white/5 p-8 relative overflow-hidden group/streak">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover/streak:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Learning Streak</h3>
                                <Flame className="text-orange-500 animate-pulse" size={24} />
                            </div>
                            <div className="text-center space-y-3">
                                <div className="relative">
                                    <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 animate-pulse">
                                        {Math.floor(Math.random() * 30) + 1}
                                    </div>
                                    <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-dark-muted">Days on Fire</p>
                                <div className="pt-4 flex gap-1 justify-center">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className={`w-2 h-8 rounded-full ${i < 5 ? 'bg-gradient-to-t from-orange-500 to-red-400' : 'bg-white/5'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* XP & Level */}
                    <div className="bg-dark-layer1 rounded-[2rem] border border-white/5 p-8 relative overflow-hidden group/xp">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-purple-500/5 opacity-0 group-hover/xp:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">XP Level</h3>
                                <Lightning className="text-brand-primary" size={24} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-5xl font-black text-brand-primary">12</div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-dark-muted">Current Level</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-white">2,450</div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-dark-muted">Total XP</p>
                                    </div>
                                </div>
                                <div className="relative h-3 bg-dark-layer2 rounded-full overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-purple-500 rounded-full" style={{ width: '65%' }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/50 to-purple-500/50 blur-md" style={{ width: '65%' }}></div>
                                </div>
                                <p className="text-xs font-bold text-center text-dark-muted">350 XP to Level 13</p>
                            </div>
                        </div>
                    </div>

                    {/* Rank */}
                    <div className="bg-dark-layer1 rounded-[2rem] border border-white/5 p-8 relative overflow-hidden group/rank">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover/rank:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Global Rank</h3>
                                <Trophy className="text-yellow-500" size={24} />
                            </div>
                            <div className="text-center space-y-3">
                                <div className="relative">
                                    <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500">
                                        #{Math.floor(Math.random() * 1000) + 1}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-green-400">
                                    <TrendingUp size={16} />
                                    <span className="text-sm font-black">+23 This Week</span>
                                </div>
                                <div className="pt-2 flex justify-center gap-2">
                                    <div className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-black text-brand-primary">TOP 5%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievement Badges Grid */}
                <div className="mt-12 bg-dark-layer1 rounded-[3rem] border border-white/5 p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Trophy Cabinet</h3>
                            <p className="text-dark-muted text-sm mt-1">12/50 Achievements Unlocked</p>
                        </div>
                        <Award className="text-brand-primary" size={32} />
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {[
                            { icon: '🎓', name: 'First Course', unlocked: true, color: 'from-blue-500 to-cyan-500' },
                            { icon: '⚡', name: '10 Day Streak', unlocked: true, color: 'from-orange-500 to-red-500' },
                            { icon: '🏆', name: 'Top 100', unlocked: true, color: 'from-yellow-500 to-orange-500' },
                            { icon: '🎯', name: '100% Complete', unlocked: true, color: 'from-green-500 to-teal-500' },
                            { icon: '👥', name: '100 Followers', unlocked: true, color: 'from-pink-500 to-purple-500' },
                            { icon: '📚', name: '10 Courses', unlocked: false, color: 'from-gray-500 to-gray-600' },
                            { icon: '🔥', name: '30 Day Streak', unlocked: false, color: 'from-gray-500 to-gray-600' },
                            { icon: '⭐', name: '5 Star Rating', unlocked: true, color: 'from-yellow-400 to-orange-400' },
                            { icon: '💎', name: 'Premium', unlocked: true, color: 'from-cyan-500 to-blue-500' },
                            { icon: '🚀', name: 'Fast Learner', unlocked: false, color: 'from-gray-500 to-gray-600' },
                            { icon: '🎬', name: '10 Reels', unlocked: true, color: 'from-purple-500 to-pink-500' },
                            { icon: '💬', name: 'Social Butterfly', unlocked: false, color: 'from-gray-500 to-gray-600' }
                        ].map((badge, i) => (
                            <div key={i} className="relative group/badge">
                                <div className={`aspect-square rounded-2xl bg-gradient-to-br ${badge.color} p-0.5 ${badge.unlocked ? 'opacity-100' : 'opacity-20'} transition-all group-hover/badge:scale-110`}>
                                    <div className="w-full h-full rounded-[14px] bg-dark-bg flex flex-col items-center justify-center">
                                        <div className="text-3xl mb-1">{badge.icon}</div>
                                        <p className="text-[8px] font-black uppercase text-white/70 text-center px-1 leading-tight">{badge.name}</p>
                                    </div>
                                </div>
                                {badge.unlocked && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-dark-bg">
                                        <Check size={10} strokeWidth={4} className="text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="mt-12 bg-dark-layer1 rounded-[3rem] border border-white/5 p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="text-brand-primary" size={28} />
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Recent Activity</h3>
                    </div>
                    <div className="space-y-6">
                        {[
                            { action: 'Completed', item: 'React Masterclass', time: '2 hours ago', icon: '✅', color: 'green' },
                            { action: 'Posted', item: 'New coding reel', time: '1 day ago', icon: '🎬', color: 'purple' },
                            { action: 'Unlocked', item: 'Achievement: Top 100', time: '3 days ago', icon: '🏆', color: 'yellow' },
                            { action: 'Started', item: 'Python for Beginners', time: '1 week ago', icon: '📚', color: 'blue' },
                            { action: 'Earned', item: '500 XP Points', time: '1 week ago', icon: '⚡', color: 'brand' }
                        ].map((activity, i) => (
                            <div key={i} className="flex items-start gap-4 group/activity">
                                <div className={`w-12 h-12 rounded-xl bg-${activity.color}-500/10 border border-${activity.color}-500/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover/activity:scale-110 transition-transform`}>
                                    {activity.icon}
                                </div>
                                <div className="flex-1 pt-2">
                                    <p className="text-white font-bold">{activity.action} <span className="text-brand-primary">{activity.item}</span></p>
                                    <p className="text-dark-muted text-sm mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-12 bg-dark-layer1 p-10 rounded-[3rem] border border-brand-primary/20 shadow-2xl animate-in slide-in-from-top-4 duration-500">
                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-2">Designation Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-dark-layer2 border border-white/5 p-4 rounded-2xl text-white font-bold focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-2">Communication Link</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full bg-dark-layer2 border border-white/5 p-4 rounded-2xl text-white font-bold opacity-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-2">Strategic Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full bg-dark-layer2 border border-white/5 p-6 rounded-[2rem] text-white font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.keys(formData.socialLinks).map(platform => (
                                    <div key={platform} className="space-y-2">
                                        <label className="text-[10px] font-black text-dark-muted uppercase tracking-widest ml-2">{platform}</label>
                                        <input
                                            type="url"
                                            value={formData.socialLinks[platform]}
                                            onChange={e => setFormData({
                                                ...formData,
                                                socialLinks: { ...formData.socialLinks, [platform]: e.target.value }
                                            })}
                                            placeholder="https://..."
                                            className="w-full bg-dark-layer2 border border-white/5 p-3 rounded-xl text-white text-[10px] focus:outline-none focus:border-brand-primary transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-dark-muted">Cancel</button>
                                <button type="submit" className="bg-brand-primary text-dark-bg px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">Submit Aura</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Content Tabs Navigation */}
                <div className="mt-16 flex items-center justify-center">
                    <div className="bg-dark-layer1 p-1.5 rounded-[2rem] border border-white/5 flex gap-2">
                        {[
                            { id: 'courses', label: 'Curriculum', icon: <BookOpen size={16} /> },
                            { id: 'shorts', label: 'Freq Reels', icon: <Play size={16} /> },
                            { id: 'transmissions', label: 'Signals', icon: <MessageSquare size={16} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-10 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-brand-primary text-dark-bg shadow-xl' : 'text-dark-muted hover:text-white hover:bg-white/5'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Views */}
                <div className="mt-12 min-h-[400px]">
                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {courses.length > 0 ? courses.map(course => (
                                <Link key={course._id} to={`/course/${course._id}`} className="group/card bg-dark-layer1 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-brand-primary/50 transition-all hover:-translate-y-2 shadow-xl">
                                    <div className="h-48 relative overflow-hidden">
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-dark-layer1 via-transparent to-transparent"></div>
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[8px] font-black uppercase text-brand-primary">
                                            {course.category}
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter line-clamp-2">{course.title}</h3>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-dark-muted font-bold text-[10px] uppercase">
                                                <Star size={12} className="text-brand-primary" fill="currentColor" />
                                                {course.rating || 4.9}
                                            </div>
                                            <span className="text-white font-black text-2xl tracking-tighter">${course.price}</span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full py-32 text-center space-y-6 opacity-20">
                                    <Layers size={64} className="mx-auto" strokeWidth={1} />
                                    <p className="text-sm font-black uppercase tracking-[0.4em]">No Curriculum Synchronized</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'shorts' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {reels.length > 0 ? reels.map(reel => (
                                <Link key={reel._id} to={`/reels?id=${reel._id}`} className="group/reel bg-dark-layer1 aspect-[9/16] rounded-[2rem] border border-white/5 overflow-hidden relative shadow-xl hover:border-brand-primary/50 transition-all hover:scale-[1.02]">
                                    <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover opacity-60 group-hover/reel:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6 space-y-2">
                                        <p className="text-[10px] font-black text-white/90 truncate uppercase tracking-tighter">{reel.title}</p>
                                        <div className="flex items-center gap-3 text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">
                                            <Play size={8} fill="currentColor" />
                                            {reel.views || 0} Views
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/reel:opacity-100 transition-opacity">
                                        <div className="w-16 h-16 rounded-full bg-brand-primary/20 backdrop-blur-xl border border-brand-primary/40 flex items-center justify-center scale-75 group-hover/reel:scale-100 transition-transform duration-500">
                                            <Play className="text-brand-primary fill-current ml-1" size={32} />
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full py-32 text-center space-y-6 opacity-20">
                                    <Zap size={64} className="mx-auto" strokeWidth={1} />
                                    <p className="text-sm font-black uppercase tracking-[0.4em]">No Reels Transmitted</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'transmissions' && (
                        <div className="max-w-3xl mx-auto py-20 text-center space-y-8 animate-in zoom-in-95 duration-700">
                            <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-2xl">
                                <Radio size={40} className="text-indigo-400 animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Frequency Signal Locked</h3>
                                <p className="text-dark-muted font-medium max-w-md mx-auto leading-relaxed">
                                    The community transmissions for this sector are currently encrypted. Reach out via official social channels for direct contact.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
