import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Bell, Check, Trash2, Clock } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications);
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
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearRead = async () => {
        try {
            await api.delete('/notifications/clear-read');
            setNotifications(notifications.filter(n => !n.isRead));
        } catch (error) {
            console.error('Error clearing read notifications:', error);
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Bell className="text-brand-primary" />
                    Notifications
                </h1>
                <div className="flex gap-3">
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-brand-primary hover:text-brand-hover transition-colors"
                    >
                        Mark all as read
                    </button>
                    <button
                        onClick={clearRead}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                        Clear read
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-dark-layer1 rounded-xl border border-dark-layer2">
                        <Bell size={48} className="mx-auto text-dark-muted mb-4 opacity-50" />
                        <p className="text-dark-muted">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`p-4 rounded-xl border transition-all ${notification.isRead
                                    ? 'bg-dark-layer1 border-dark-layer2 opacity-75'
                                    : 'bg-dark-layer2 border-brand-primary/30 shadow-lg shadow-brand-primary/5'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className={`font-bold mb-1 ${notification.isRead ? 'text-white' : 'text-brand-primary'}`}>
                                        {notification.title}
                                    </h3>
                                    <p className="text-dark-muted text-sm mb-3">{notification.message}</p>
                                    <div className="flex items-center gap-4 text-xs text-dark-muted">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </span>
                                        {notification.link && (
                                            <a href={notification.link} className="text-brand-primary hover:underline">
                                                View Details
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification._id)}
                                            className="p-2 hover:bg-brand-primary/10 rounded-lg text-brand-primary transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification._id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
