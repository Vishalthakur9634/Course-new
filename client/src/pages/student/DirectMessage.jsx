import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
    Send, Paperclip, Search, MoreVertical,
    Smile, Image as ImageIcon, Phone, Video,
    ChevronLeft, User, Check, CheckCheck, Clock, MessageSquare
} from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001'); // Adjust based on your server URL

const DirectMessage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchConversations();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchMessages(userId);
            // Join conversation room
            const conversationId = [currentUser?._id || currentUser?.id, userId].sort().join('_');
            socket.emit('join_room', conversationId);
        }
    }, [userId, currentUser]);

    useEffect(() => {
        socket.on('receive_message', (data) => {
            if (data.senderId !== (currentUser?._id || currentUser?.id)) {
                setMessages(prev => [...prev, data]);
            }
        });
        return () => socket.off('receive_message');
    }, [currentUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConversations(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async (targetId) => {
        try {
            const { data } = await api.get(`/messages/${targetId}`);
            setMessages(data);
            const conv = conversations.find(c => c.user._id === targetId);
            if (conv) setActiveChat(conv.user);
            else {
                // Fetch user info if not in conversations
                const userRes = await api.get(`/users/profile/${targetId}`);
                setActiveChat(userRes.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !userId) return;

        try {
            const messageData = {
                receiverId: userId,
                message: newMessage
            };
            const { data } = await api.post('/messages/send', messageData);

            setMessages(prev => [...prev, data]);
            setNewMessage('');

            // Emit via socket
            socket.emit('send_message', {
                ...data,
                conversationId: [currentUser?._id || currentUser?.id, userId].sort().join('_')
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] bg-dark-bg rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
            {/* Sidebar - Conversations */}
            <div className={`w-full md:w-80 lg:w-96 bg-dark-layer1 border-r border-white/5 flex flex-col ${userId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-dark-layer2 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {conversations.map((conv, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(`/messages/${conv.user._id}`)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${userId === conv.user._id ? 'bg-brand-primary/10 border border-brand-primary/20' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-dark-layer2 overflow-hidden border border-white/10">
                                    <img src={conv.user.avatar || `https://i.pravatar.cc/150?u=${conv.user._id}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-dark-layer1 rounded-full"></div>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-sm text-white truncate">{conv.user.name}</h4>
                                    <span className="text-[10px] text-dark-muted font-bold uppercase">{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-dark-muted truncate leading-tight">{conv.lastMessage}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <div className="w-5 h-5 bg-brand-primary rounded-lg flex items-center justify-center text-[10px] font-black text-dark-bg">
                                    {conv.unreadCount}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-dark-layer2/30 ${!userId ? 'hidden md:flex items-center justify-center p-12' : 'flex'}`}>
                {userId && activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-4 bg-dark-layer1/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/messages')} className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-dark-layer2 overflow-hidden border border-white/10 shrink-0">
                                    <img src={activeChat.avatar || `https://i.pravatar.cc/150?u=${activeChat._id}`} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-black text-white leading-none">{activeChat.name}</h4>
                                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Secure Connection
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 hover:bg-white/10 rounded-2xl text-dark-muted hover:text-white transition-all">
                                    <Phone size={20} />
                                </button>
                                <button className="p-3 hover:bg-white/10 rounded-2xl text-dark-muted hover:text-white transition-all">
                                    <Video size={20} />
                                </button>
                                <button className="p-3 hover:bg-white/10 rounded-2xl text-dark-muted hover:text-white transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar bg-gradient-to-b from-dark-bg/50 to-transparent">
                            {messages.map((msg, idx) => {
                                const isOwn = msg.senderId?._id === (currentUser?._id || currentUser?.id) || msg.senderId === (currentUser?._id || currentUser?.id);
                                return (
                                    <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                        <div className={`max-w-[70%] group`}>
                                            <div className={`px-5 py-4 rounded-[1.5rem] shadow-xl ${isOwn ? 'bg-brand-primary text-dark-bg rounded-tr-none' : 'bg-dark-layer1 text-white rounded-tl-none border border-white/5'}`}>
                                                <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                                            </div>
                                            <div className={`flex items-center gap-2 mt-2 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <span className="text-[10px] font-bold text-dark-muted uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isOwn && (
                                                    <span className="text-dark-bg/40">
                                                        {msg.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 md:p-8 bg-dark-layer1/50 backdrop-blur-xl border-t border-white/5">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-dark-layer2 border border-white/10 rounded-[2rem] p-2 pl-6">
                                <button type="button" className="text-dark-muted hover:text-brand-primary transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white py-3 font-medium"
                                />
                                <div className="flex items-center gap-2 px-2">
                                    <button type="button" className="p-2 text-dark-muted hover:text-yellow-500 transition-colors">
                                        <Smile size={20} />
                                    </button>
                                    <button type="button" className="p-2 text-dark-muted hover:text-blue-500 transition-colors">
                                        <ImageIcon size={20} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-brand-primary hover:bg-brand-hover text-dark-bg p-3 rounded-full transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="text-center space-y-4 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-primary/20">
                            <MessageSquare size={48} className="text-brand-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Start a Conversation</h2>
                        <p className="text-dark-muted max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed">
                            Select a user from the list to start messaging.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectMessage;
