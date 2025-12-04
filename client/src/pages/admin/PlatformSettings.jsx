import React, { useState } from 'react';
import { Settings, Save, Globe, Mail, Lock, Palette } from 'lucide-react';

const PlatformSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'Course Launcher',
        siteDescription: 'Premium online learning platform',
        supportEmail: 'support@courselauncher.com',
        registrationEnabled: true,
        courseApprovalRequired: true,
        maxUploadSize: 500,
        allowGuestBrowsing: true
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // In a real implementation, this would save to backend
        setSaved(true);
        alert('Settings saved successfully!');
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Platform Settings</h1>

            {/* General Settings */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-brand-primary" />
                    General Settings
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Site Name</label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Site Description</label>
                        <textarea
                            value={settings.siteDescription}
                            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                            rows={3}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Support Email</label>
                        <input
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Access Control */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-brand-primary" />
                    Access Control
                </h3>

                <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Enable User Registration</p>
                            <p className="text-sm text-dark-muted">Allow new users to register on the platform</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.registrationEnabled}
                            onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                            className="w-5 h-5"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Course Approval Required</p>
                            <p className="text-sm text-dark-muted">Require admin approval for new courses</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.courseApprovalRequired}
                            onChange={(e) => setSettings({ ...settings, courseApprovalRequired: e.target.checked })}
                            className="w-5 h-5"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Allow Guest Browsing</p>
                            <p className="text-sm text-dark-muted">Let visitors browse courses without logging in</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.allowGuestBrowsing}
                            onChange={(e) => setSettings({ ...settings, allowGuestBrowsing: e.target.checked })}
                            className="w-5 h-5"
                        />
                    </label>
                </div>
            </div>

            {/* Upload Settings */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-brand-primary" />
                    Upload Settings
                </h3>

                <div>
                    <label className="block text-sm font-medium text-dark-muted mb-2">
                        Maximum Upload Size (MB)
                    </label>
                    <input
                        type="number"
                        value={settings.maxUploadSize}
                        onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
                        className="w-full bg-dark-layer2 border border-dark-layer2 rounded p-2 text-white"
                        min="1"
                        max="5000"
                    />
                    <p className="text-xs text-dark-muted mt-1">Maximum file size for video uploads</p>
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

export default PlatformSettings;
