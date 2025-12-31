import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, Info, Zap, UserPlus, MessageSquare, Award, Clock } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const NotificationCenter = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
            // Refetch unread count to be sure
            const { data } = await api.get('/notifications');
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_follower': return <UserPlus size={16} className="text-blue-400" />;
            case 'new_message': return <MessageSquare size={16} className="text-green-400" />;
            case 'certificate_issued': return <Award size={16} className="text-yellow-400" />;
            case 'system_announcement': return <Zap size={16} className="text-purple-400" />;
            case 'new_enrollment': return <Zap size={16} className="text-brand-primary" />;
            default: return <Info size={16} className="text-dark-muted" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 top-full mt-4 w-[400px] bg-dark-layer1 border border-white/10 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-dark-layer2/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell size={20} className="text-brand-primary" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        )}
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-[11px] text-white">Orbit Intel</h3>
                </div>
                <div className="flex items-center gap-4">
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Mark all read</button>
                    )}
                    <button onClick={onClose} className="text-dark-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {loading && notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Scanning Waves...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                            <Zap size={32} />
                        </div>
                        <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">No signals detected in this sector.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-6 flex gap-4 hover:bg-white/5 transition-all group relative ${!notification.isRead ? 'bg-brand-primary/5' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notification.isRead ? 'bg-brand-primary/20' : 'bg-white/5'}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <h4 className={`text-sm font-black uppercase tracking-tight text-white ${!notification.isRead ? 'text-brand-primary' : ''}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[9px] font-bold text-dark-muted flex items-center gap-1 opacity-50">
                                            <Clock size={10} /> {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-dark-muted font-medium line-clamp-2 leading-relaxed">
                                        {notification.message}
                                    </p>

                                    <div className="flex items-center gap-4 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1 hover:brightness-125"
                                            >
                                                <Check size={12} /> Mark as Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification._id)}
                                            className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1 hover:text-red-500"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                                {!notification.isRead && (
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-primary"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 text-center bg-dark-layer2/30">
                <Link
                    to="/notifications"
                    onClick={onClose}
                    className="text-[10px] font-black text-dark-muted uppercase tracking-widest hover:text-white transition-colors"
                >
                    View All Signal Logs
                </Link>
            </div>
        </div>
    );
};

export default NotificationCenter;
