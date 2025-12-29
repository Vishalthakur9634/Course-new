import React from 'react';
import {
    Users, TrendingUp, Globe, Hash, Crown, Star, MessageSquare, Zap
} from 'lucide-react';

const CommunitySidebar = ({
    activeTab,
    communities,
    myCommunities,
    selectedCommunity,
    setSelectedCommunity,
    posts
}) => {
    const categoryIcons = {
        announcements: Crown,
        general: MessageSquare,
        help: Zap,
        showcase: Star,
        offtopic: Globe,
        custom: Hash
    };

    const categoryColors = {
        announcements: 'from-yellow-500 to-orange-500',
        general: 'from-blue-500 to-indigo-500',
        help: 'from-green-500 to-teal-500',
        showcase: 'from-purple-500 to-pink-500',
        offtopic: 'from-gray-500 to-slate-500',
        custom: 'from-brand-primary to-purple-500'
    };

    const displayCommunities = activeTab === 'my_instructors' ? myCommunities : communities;

    return (
        <aside className="w-full lg:w-80 space-y-6">
            {/* Communities List */}
            <div className="bg-dark-layer1 border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] mb-4">
                    {activeTab === 'my_instructors' ? 'My Instructor Communities' : 'All Communities'}
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    <button
                        onClick={() => setSelectedCommunity(null)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${!selectedCommunity
                            ? 'bg-brand-primary/10 text-brand-primary border-2 border-brand-primary'
                            : 'text-dark-muted hover:text-white hover:bg-white/5 border-2 border-transparent'
                            }`}
                    >
                        <Globe size={18} /> All Posts
                    </button>
                    {displayCommunities.map((community) => {
                        const Icon = categoryIcons[community.category] || Hash;
                        return (
                            <button
                                key={community._id}
                                onClick={() => setSelectedCommunity(community)}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedCommunity?._id === community._id
                                    ? 'bg-brand-primary/10 text-brand-primary border-2 border-brand-primary'
                                    : 'text-dark-muted hover:text-white hover:bg-white/5 border-2 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${categoryColors[community.category]} flex items-center justify-center`}>
                                        <Icon size={14} className="text-white" />
                                    </div>
                                    <span className="truncate">{community.name}</span>
                                </div>
                                {community.isOfficial && <Crown size={14} className="text-yellow-400" />}
                            </button>
                        );
                    })}
                    {displayCommunities.length === 0 && (
                        <p className="text-dark-muted text-xs text-center py-4">
                            No communities found.
                        </p>
                    )}
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
                <h4 className="text-white font-black mb-3 flex items-center gap-2">
                    <TrendingUp size={18} className="text-brand-primary" />
                    Community Stats
                </h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-muted">Total Posts</span>
                        <span className="text-lg font-black text-white">{posts.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-muted">Communities</span>
                        <span className="text-lg font-black text-white">{communities.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-dark-muted">Active Members</span>
                        <span className="text-lg font-black text-brand-primary">1,240+</span>
                    </div>
                </div>
            </div>

            {/* Online Users */}
            <div className="bg-dark-layer1 border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h4 className="text-white font-black mb-4 flex items-center gap-2">
                    <Users size={16} /> Online Now
                </h4>
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-3 border-dark-bg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg relative">
                            U{i}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-bg"></div>
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-3 border-dark-bg bg-brand-primary flex items-center justify-center text-xs font-black text-dark-bg shadow-lg">
                        +1k
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default CommunitySidebar;
