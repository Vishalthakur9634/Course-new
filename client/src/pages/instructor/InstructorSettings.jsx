import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Globe, Save } from 'lucide-react';

const InstructorSettings = () => {
    const [settings, setSettings] = useState({
        name: '',
        email: '',
        headline: '',
        bio: '',
        website: '',
        notifications: {
            emailOnEnrollment: true,
            emailOnReview: true,
            emailOnQuestion: true,
            weeklyReport: true
        },
        privacy: {
            showEmail: false,
            showProfileToStudents: true
        }
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // In real implementation, this would save to backend
        setSaved(true);
        alert('Settings saved successfully!');
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Instructor Settings</h1>

            {/* Profile Settings */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-brand-primary" />
                    Profile Settings
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Display Name</label>
                        <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                            placeholder="Your name"
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Email</label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            placeholder="your.email@example.com"
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Professional Headline</label>
                        <input
                            type="text"
                            value={settings.headline}
                            onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
                            placeholder="e.g., Web Development Expert | 10+ Years Experience"
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Bio</label>
                        <textarea
                            value={settings.bio}
                            onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                            rows={4}
                            placeholder="Tell students about yourself..."
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Website</label>
                        <input
                            type="url"
                            value={settings.website}
                            onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                            placeholder="https://yourwebsite.com"
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-brand-primary" />
                    Notification Preferences
                </h3>

                <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">New Enrollments</p>
                            <p className="text-sm text-dark-muted">Get notified when students enroll in your courses</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notifications.emailOnEnrollment}
                            onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, emailOnEnrollment: e.target.checked }
                            })}
                            className="w-5 h-5"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">New Reviews</p>
                            <p className="text-sm text-dark-muted">Get notified when students review your courses</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notifications.emailOnReview}
                            onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, emailOnReview: e.target.checked }
                            })}
                            className="w-5 h-5"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Q&A Questions</p>
                            <p className="text-sm text-dark-muted">Get notified when students ask questions</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notifications.emailOnQuestion}
                            onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, emailOnQuestion: e.target.checked }
                            })}
                            className="w-5 h-5"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Weekly Performance Report</p>
                            <p className="text-sm text-dark-muted">Receive weekly summary of your course performance</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notifications.weeklyReport}
                            onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, weeklyReport: e.target.checked }
                            })}
                            className="w-5 h-5"
                        />
                    </label>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-brand-primary" />
                    Privacy Settings
                </h3>

                <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Show Email to Students</p>
                            <p className="text-sm text-dark-muted">Allow students to see your email address</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.privacy.showEmail}
                            onChange={(e) => setSettings({
                                ...settings,
                                privacy: { ...settings.privacy, showEmail: e.target.checked }
                            })}
                            className="w-5 h-5"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Public Profile</p>
                            <p className="text-sm text-dark-muted">Make your instructor profile visible to all students</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.privacy.showProfileToStudents}
                            onChange={(e) => setSettings({
                                ...settings,
                                privacy: { ...settings.privacy, showProfileToStudents: e.target.checked }
                            })}
                            className="w-5 h-5"
                        />
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-3 rounded transition-colors ${saved
                            ? 'bg-green-500 text-white'
                            : 'bg-brand-primary hover:bg-brand-hover text-white'
                        }`}
                >
                    <Save size={18} />
                    {saved ? 'Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default InstructorSettings;
