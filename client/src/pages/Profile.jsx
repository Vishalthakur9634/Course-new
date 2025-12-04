import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { User, Mail, BookOpen, Clock, Camera, Save, Globe, Github, Linkedin, Twitter } from 'lucide-react';

const Profile = () => {
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            const { data } = await api.get(`/users/profile/${userId}`);
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

    if (loading) return <div className="text-center mt-10 text-white">Loading profile...</div>;

    const totalCourses = user.purchasedCourses.length;
    const completedVideos = user.watchHistory.filter(h => h.completed).length;
    const totalWatchTime = Math.round(user.watchHistory.reduce((acc, curr) => acc + curr.progress, 0) / 60);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-500">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-dark-muted text-sm">Enrolled Courses</p>
                        <p className="text-2xl font-bold text-white">{totalCourses}</p>
                    </div>
                </div>
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-500">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-dark-muted text-sm">Videos Completed</p>
                        <p className="text-2xl font-bold text-white">{completedVideos}</p>
                    </div>
                </div>
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-dark-muted text-sm">Minutes Watched</p>
                        <p className="text-2xl font-bold text-white">{totalWatchTime}m</p>
                    </div>
                </div>
            </div>

            <div className="bg-dark-layer1 p-8 rounded-lg border border-dark-layer2">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User size={20} className="text-brand-primary" /> Account Details
                    </h2>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-brand-primary hover:text-brand-hover text-sm font-medium"
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-3xl">{user.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 p-2 bg-brand-primary rounded-full cursor-pointer hover:bg-brand-hover transition-colors">
                                    <Camera size={16} className="text-white" />
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            )}
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">{user.name}</p>
                            <p className="text-dark-muted text-sm">{user.email}</p>
                            <p className="text-dark-muted text-sm capitalize">{user.role}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                                className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-white disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-white opacity-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            disabled={!isEditing}
                            rows={3}
                            placeholder="Tell us about yourself..."
                            className="w-full bg-dark-layer2 border border-dark-layer2 p-3 rounded text-white disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-3">Social Media Links</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="url"
                                value={formData.twitter}
                                onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                                disabled={!isEditing}
                                placeholder="Twitter URL"
                                className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-white disabled:opacity-50"
                            />
                            <input
                                type="url"
                                value={formData.linkedin}
                                onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                disabled={!isEditing}
                                placeholder="LinkedIn URL"
                                className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-white disabled:opacity-50"
                            />
                            <input
                                type="url"
                                value={formData.github}
                                onChange={e => setFormData({ ...formData, github: e.target.value })}
                                disabled={!isEditing}
                                placeholder="GitHub URL"
                                className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-white disabled:opacity-50"
                            />
                            <input
                                type="url"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                disabled={!isEditing}
                                placeholder="Website URL"
                                className="w-full bg-dark-layer2 border border-dark-layer2 p-2 rounded text-white disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2 rounded flex items-center gap-2 transition-colors"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;
