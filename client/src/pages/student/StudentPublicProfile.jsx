import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import {
    Award, BookOpen, Clock, Calendar, Rocket, Crown, Medal, User,
    Sparkles, Shield, Target, Flame, ChevronRight, Zap, Camera
} from 'lucide-react';

const StudentPublicProfile = () => {
    const { studentKey } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('achievements');
    const [isOwner, setIsOwner] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!studentKey || studentKey === 'undefined') return;
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        if (currentUser && (currentUser._id === studentKey || currentUser.id === studentKey)) {
            setIsOwner(true);
        }
        fetchProfile();
    }, [studentKey]);

    useEffect(() => {
        if (profile && !isOwner) {
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            if (currentUser) {
                const followingIds = currentUser.following || [];
                setIsFollowing(followingIds.includes(profile._id));
            }
        }
    }, [profile, isOwner]);

    const fetchProfile = async () => {
        if (!studentKey || studentKey === 'undefined') {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.get(`/users/${studentKey}/public-profile`);
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
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

            await api.put(`/users/profile/${studentKey}`, { avatar: avatarUrl });

            setProfile(prev => ({ ...prev, avatar: avatarUrl }));

            // Update local storage
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
            const { data } = await api.post(`/users/follow/${profile._id}`);
            setIsFollowing(true);
            setProfile(prev => ({
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
            const { data } = await api.post(`/users/unfollow/${profile._id}`);
            setIsFollowing(false);
            setProfile(prev => ({
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
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-dark-muted font-bold uppercase tracking-widest text-[10px]">Loading Profile...</p>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="h-full flex items-center justify-center bg-dark-bg text-white">
            <div className="text-center space-y-4">
                <User size={64} className="mx-auto text-red-500 opacity-50" />
                <h2 className="text-2xl font-black uppercase">profile not found</h2>
                <Link to="/" className="text-brand-primary hover:underline font-bold">Return Home</Link>
            </div>
        </div>
    );

    const { gamification } = profile;

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-12 pb-24">
            {/* Header Section - 3D Quantum Interface */}
            <div className="relative group p-[2px] bg-gradient-to-br from-brand-primary/40 to-brand-hover/40 rounded-[4rem] shadow-2xl overflow-hidden glass-panel">
                <div className="absolute inset-0 bg-dark-layer1 rounded-[3.9rem] z-0"></div>

                {/* Stellar Grid Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none z-1" style={{ backgroundImage: 'linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center gap-14">
                    {/* Avatar with Stellar Aura */}
                    <div className="relative group/avatar">
                        <div className="absolute inset-0 bg-brand-primary rounded-[3.5rem] blur-[60px] opacity-20 group-hover/avatar:opacity-50 transition-all duration-1000"></div>
                        <div
                            onClick={handleAvatarClick}
                            className={`relative w-48 h-48 md:w-56 md:h-56 rounded-[3rem] p-[2px] bg-gradient-to-br from-brand-primary to-brand-hover shadow-2xl transition-all duration-700 overflow-hidden ${isOwner ? 'cursor-pointer hover:scale-105 hover:rotate-2 border-none' : ''}`}
                        >
                            <div className="w-full h-full rounded-[2.9rem] bg-dark-bg overflow-hidden relative border border-white/10 shadow-inner">
                                {profile.avatar ? (
                                    <img src={profile.avatar} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-1000" alt={profile.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-layer1 to-black">
                                        <User size={80} className="text-white/10" />
                                    </div>
                                )}

                                {isOwner && (
                                    <div className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <Camera className="text-white" size={32} />
                                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Update Photo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                        {/* Rank Badge */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-brand-primary text-dark-bg px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-lg">
                            Level {gamification?.level || 1}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-2">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase">{profile.name}</h1>
                                {gamification?.level >= 10 && (
                                    <Crown className="text-yellow-500" size={32} fill="currentColor" />
                                )}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <span className="text-brand-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
                                    {profile.role}
                                </span>
                                <span className="text-dark-muted font-medium text-[10px] uppercase tracking-wider opacity-40">ID: {profile._id?.slice(-8).toUpperCase()}</span>
                            </div>
                        </div>

                        <p className="text-lg text-dark-muted font-medium max-w-2xl leading-relaxed opacity-80">
                            {profile.bio || "No bio available."}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-4">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-dark-muted uppercase tracking-wider">
                                <Calendar size={16} className="text-brand-primary" /> Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="flex items-center gap-6 pl-6 border-l border-white/10">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{profile.followers?.length || 0}</p>
                                    <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider mt-1">Followers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{profile.following?.length || 0}</p>
                                    <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider mt-1">Following</p>
                                </div>
                            </div>
                        </div>

                        {!isOwner && (
                            <div className="flex gap-6 pt-8">
                                <button
                                    onClick={isFollowing ? handleUnfollow : handleFollow}
                                    disabled={followLoading}
                                    className={`px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl ${isFollowing
                                        ? 'bg-white/5 text-white border border-white/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40'
                                        : 'bg-brand-primary text-dark-bg hover:scale-105 shadow-brand-primary/40'
                                        }`}
                                >
                                    {followLoading ? 'Syncing...' : isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                                <button className="bg-white/5 px-8 py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-wider text-white hover:bg-white/10 border border-white/10 transition-all">
                                    Message
                                </button>
                            </div>
                        )}
                    </div>

                    {/* XP Strategic View */}
                    <div className="w-full md:w-64 glass-panel p-10 rounded-[3.5rem] text-center space-y-6 relative overflow-hidden group/xp border-brand-primary/20">
                        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/xp:opacity-100 transition-opacity" />
                        <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.4em]">Integrated XP</p>
                        <p className="text-5xl font-black text-white tracking-tighter italic">{gamification?.xp?.toLocaleString() || 0}</p>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                            <div
                                className="h-full bg-gradient-to-r from-brand-primary to-quantum-purple shadow-[0_0_15px_rgba(0,242,255,0.5)] transition-all duration-2000"
                                style={{ width: `${(gamification?.xp % 1000) / 10}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] opacity-60">NEXT TIER: {1000 - (gamification?.xp % 1000)} XP</p>
                    </div>
                </div>
            </div>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Completed Paths', value: gamification?.coursesCompleted || 0, icon: BookOpen, color: 'text-blue-400' },
                    { label: 'Badges Unlocked', value: gamification?.badges?.length || 0, icon: Target, color: 'text-purple-400' },
                    { label: 'Certificates', value: profile.certificates?.length || 0, icon: Award, color: 'text-yellow-400' },
                    { label: 'Active Days', value: profile?.createdAt ? Math.floor((new Date() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24)) : 0, icon: Flame, color: 'text-orange-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-dark-layer1 border border-white/5 rounded-3xl p-6 group hover:bg-dark-layer2 transition-all">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex gap-10 border-b border-white/5 px-4">
                {[
                    { id: 'achievements', label: 'Hall of Fame', icon: Award },
                    { id: 'courses', label: 'Enrolled Paths', icon: BookOpen },
                    { id: 'activity', label: 'Log', icon: Clock }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative flex items-center gap-2 pb-6 transition-all ${activeTab === tab.id ? 'text-brand-primary' : 'text-dark-muted hover:text-white'}`}
                    >
                        <tab.icon size={18} />
                        <span className="font-black uppercase tracking-widest text-[11px]">{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full shadow-[0_-5px_15px_rgba(251,191,36,0.3)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'achievements' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Badges Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Sparkles className="text-brand-primary" size={24} /> Badges of Mastery
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {gamification?.badges?.length > 0 ? gamification.badges.map((badge, idx) => {
                                    const Icon = badge.icon === 'Rocket' ? Rocket : badge.icon === 'Crown' ? Crown : badge.icon === 'BookOpen' ? BookOpen : Medal;
                                    const colorMap = {
                                        blue: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
                                        purple: 'border-purple-500/30 text-purple-400 bg-purple-500/5',
                                        green: 'border-green-500/30 text-green-400 bg-green-500/5',
                                        yellow: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
                                    };
                                    return (
                                        <div key={idx} className={`p-8 rounded-[2.5rem] border ${colorMap[badge.color] || colorMap.blue} flex flex-col items-center text-center gap-4 transition-all hover:scale-105 group relative overflow-hidden shadow-2xl`}>
                                            <div className="p-4 bg-white/5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg">
                                                <Icon size={32} />
                                            </div>
                                            <div className="z-10">
                                                <h4 className="font-black text-sm uppercase tracking-tight text-white mb-1">{badge.name}</h4>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Rank Earned</p>
                                            </div>
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    );
                                }) : (
                                    <div className="col-span-full py-20 text-center bg-dark-layer1 rounded-[3rem] border border-white/5 border-dashed">
                                        <Target size={64} className="mx-auto mb-4 opacity-10" />
                                        <p className="text-dark-muted font-black uppercase tracking-widest text-sm">Targeting future achievements...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Certificates Section */}
                        {profile.certificates?.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Award className="text-brand-primary" size={24} /> Strategic Credentials
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {profile.certificates.map(cert => (
                                        <div key={cert._id} className="group bg-dark-layer1 border border-white/10 p-8 rounded-[2.5rem] flex flex-col gap-6 hover:border-brand-primary transition-all relative overflow-hidden shadow-2xl">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center text-dark-bg shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
                                                <Medal size={32} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-xl uppercase tracking-tighter group-hover:text-brand-primary transition-colors">{cert.courseTitle}</h4>
                                                <div className="flex items-center gap-2 mt-2 text-dark-muted font-black text-[10px] uppercase tracking-widest">
                                                    <Clock size={12} /> Earned {new Date(cert.issuedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-dark-muted">
                                                <span>ID: {cert.certificateId || 'VERIFIED'}</span>
                                                <ChevronRight size={16} className="text-brand-primary" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {profile.enrolledCourses?.map((enrollment, idx) => (
                                <div key={idx} className="bg-dark-layer1 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-brand-primary transition-all group flex flex-col h-full shadow-2xl">
                                    <div className="aspect-video bg-dark-layer2 relative overflow-hidden">
                                        <img src={enrollment.courseId?.thumbnail} alt={enrollment.courseId?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                                            <span className="bg-brand-primary text-dark-bg px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest self-start">
                                                {enrollment.courseId?.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        <h3 className="text-xl font-black text-white line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                                            {enrollment.courseId?.title}
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black text-dark-muted uppercase tracking-widest">
                                                <span>Mastery Progress</span>
                                                <span>{enrollment.progress || 0}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-primary transition-all duration-1000"
                                                    style={{ width: `${enrollment.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!profile.enrolledCourses || profile.enrolledCourses.length === 0) && (
                                <div className="col-span-full py-32 text-center bg-dark-layer1 rounded-[3rem] border border-white/5 border-dashed">
                                    < BookOpen size={64} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-dark-muted font-black uppercase tracking-widest text-sm">No paths initiated yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="bg-dark-layer1 rounded-[3rem] border border-white/10 p-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
                        <Clock size={64} className="mx-auto text-brand-primary opacity-20" />
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Log Active</h3>
                            <p className="text-dark-muted font-medium max-w-sm mx-auto">This explorer is making moves. Full activity history is being encrypted for final reveal.</p>
                        </div>
                        <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Last Login', value: 'Recent' },
                                { label: 'Daily Streak', value: '4 Days' },
                                { label: 'Contributions', value: '12 Posts' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">{item.label}</p>
                                    <p className="text-xl font-black text-white mt-1 uppercase">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPublicProfile;

