import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { User, Mail, BookOpen, Clock, Camera, Save } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        avatar: ''
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
                avatar: data.avatar || ''
            });
        } catch (error) {
            console.error('Error fetching profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const userId = user._id;
            await api.put(`/users/profile/${userId}`, formData);
            setIsEditing(false);
            fetchProfile();
            alert('Profile updated successfully');
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading profile...</div>;

    // Calculate stats
    const totalCourses = user.purchasedCourses.length;
    const completedVideos = user.watchHistory.filter(h => h.completed).length;
    const totalWatchTime = Math.round(user.watchHistory.reduce((acc, curr) => acc + curr.progress, 0) / 60); // in minutes

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>

            {/* Stats Cards */}
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

            {/* Profile Settings */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={18} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 p-2 pl-10 rounded text-white disabled:opacity-50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-muted mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={18} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full bg-dark-layer2 border border-dark-layer2 p-2 pl-10 rounded text-white disabled:opacity-50"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-muted mb-2">Avatar URL</label>
                            <div className="relative">
                                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={18} />
                                <input
                                    type="url"
                                    value={formData.avatar}
                                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full bg-dark-layer2 border border-dark-layer2 p-2 pl-10 rounded text-white disabled:opacity-50"
                                />
                            </div>
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
