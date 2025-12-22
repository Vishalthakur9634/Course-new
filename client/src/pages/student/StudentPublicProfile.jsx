import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { Award, BookOpen, Clock, Calendar, Rocket, Crown, Medal, User } from 'lucide-react';

const StudentPublicProfile = () => {
    // Note: In a real app, you might use a username or public ID. 
    // For now, we'll assume the URL provides the userId.
    const { studentKey } = useParams(); // Using studentKey as userId for now
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentKey) {
            fetchProfile();
        } else {
            // If no key in URL, try to load 'me' or redirect
            // Ideally this page is public, so it needs an ID
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?._id) fetchProfile(user._id);
        }
    }, [studentKey]);

    const fetchProfile = async (id = studentKey) => {
        try {
            const { data } = await api.get(`/users/${id}/public-profile`);
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-dark-muted">Loading profile...</div>;
    if (!profile) return <div className="text-center py-20 text-red-500">Profile not found.</div>;

    const { gamification } = profile;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header / Banner */}
            <div className="relative bg-dark-layer1 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="h-48 bg-gradient-to-r from-brand-primary to-purple-600 opacity-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="px-8 pb-8 relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-3xl bg-dark-layer1 p-1.5 shadow-2xl">
                            {profile.avatar ? (
                                <img src={profile.avatar} className="w-full h-full rounded-2xl object-cover" alt={profile.name} />
                            ) : (
                                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                    <User size={40} className="text-white/50" />
                                </div>
                            )}
                        </div>
                        {gamification?.level >= 5 && (
                            <div className="absolute -top-3 -right-3 bg-yellow-400 text-dark-bg p-2 rounded-xl shadow-lg transform rotate-12">
                                <Crown size={20} fill="currentColor" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2 mb-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-white">{profile.name}</h1>
                            <span className="px-3 py-1 bg-white/5 text-white border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                                {profile.role}
                            </span>
                        </div>
                        <p className="text-dark-muted max-w-xl">{profile.bio || "This student hasn't written a bio yet."}</p>
                        <div className="flex items-center gap-4 text-sm font-medium text-dark-muted pt-2">
                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-primary" /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-brand-primary" /> {gamification?.coursesCompleted} Completed courses</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1">
                        <div className="text-xs font-bold text-dark-muted uppercase tracking-widest">Orbit Level</div>
                        <div className="text-5xl font-black text-white">{gamification?.level || 1}</div>
                        <div className="text-sm font-bold text-brand-primary">{gamification?.xp} XP</div>
                    </div>
                </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gamification?.badges?.length > 0 ? gamification.badges.map((badge, idx) => {
                    const Icon = badge.icon === 'Rocket' ? Rocket : badge.icon === 'Crown' ? Crown : badge.icon === 'BookOpen' ? BookOpen : Medal;
                    const colorClass = badge.color === 'blue' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                        badge.color === 'purple' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                            badge.color === 'green' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                                'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
                    return (
                        <div key={idx} className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center gap-4 transition-all hover:scale-105 ${colorClass}`}>
                            <div className="p-4 bg-dark-bg/30 rounded-2xl">
                                <Icon size={32} />
                            </div>
                            <div>
                                <h3 className="font-black text-lg">{badge.name}</h3>
                                <p className="text-xs opacity-70 mt-1 uppercase tracking-wider">Badge Unlocked</p>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full p-8 border border-white/5 bg-white/5 rounded-3xl text-center text-dark-muted">
                        No badges earned yet. Keep learning!
                    </div>
                )}
            </div>

            {/* Certificates Showcase */}
            {profile.certificates && profile.certificates.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Award size={24} className="text-brand-primary" />
                        Certificates
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile.certificates.map(cert => (
                            <div key={cert._id} className="bg-dark-layer1 border border-white/10 p-6 rounded-3xl flex items-center gap-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-dark-bg shadow-lg shadow-orange-500/20">
                                    <Award size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{cert.courseTitle || "Course Certificate"}</h4>
                                    <p className="text-sm text-dark-muted mb-2">Issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                    <span className="text-xs font-mono text-white/30 truncate block max-w-[200px]">ID: {cert.certificateId}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPublicProfile;
