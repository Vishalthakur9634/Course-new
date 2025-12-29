import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const UserLink = ({ user, className = "", showAvatar = true, avatarSize = "w-8 h-8", nameClass = "font-bold" }) => {
    if (!user) return null;

    const isInstructor = user.role === 'instructor';
    const profilePath = isInstructor
        ? `/instructor/profile/${user._id || user.id}`
        : `/u/${user._id || user.id}`;

    return (
        <Link
            to={profilePath}
            className={`flex items-center gap-2 hover:text-brand-primary transition-all group ${className}`}
        >
            {showAvatar && (
                <div className={`${avatarSize} rounded-full overflow-hidden bg-dark-layer2 flex-shrink-0 border border-white/5 group-hover:border-brand-primary/50 transition-all shadow-lg shadow-black/20`}>
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                            <User size={parseInt(avatarSize) * 0.5 || 14} className="text-white/50" />
                        </div>
                    )}
                </div>
            )}
            <span className={`${nameClass} truncate`}>{user.name}</span>
        </Link>
    );
};

export default UserLink;
