import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Send, Sparkles, Brain, Zap, Shield, User, GraduationCap, Target, MessageSquare } from 'lucide-react';
import api from '../utils/api';

const NeuralTutor = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/content/tutor/history');
                if (res.data) {
                    const msgs = Array.isArray(res.data) ? res.data : (res.data.messages || []);
                    setMessages(msgs.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
                } else {
                    setMessages([{ role: 'ai', text: 'Professional greetings. I am your AI Mentor. How can I assist with your curriculum today?', timestamp: new Date() }]);
                }
            } catch (error) {
                console.error("Error fetching chat history:", error);
                setMessages([{ role: 'ai', text: 'Professional greetings. I am your AI Mentor. How can I assist with your curriculum today?', timestamp: new Date() }]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        setInput('');

        const optimisticMsg = { role: 'user', text: userText, timestamp: new Date() };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await api.post('/content/tutor/chat', { text: userText });
            setMessages(prev => [...prev, { ...res.data.aiMessage, timestamp: new Date(res.data.aiMessage.timestamp) }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'ai', text: 'Service interruption detected. Please attempt re-transmission.', timestamp: new Date() }]);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-10 p-6 md:p-10 max-w-5xl mx-auto w-full font-inter text-white pb-32">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold uppercase tracking-tight text-white flex items-center gap-4">
                        <div className="p-2.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20 shadow-xl shadow-brand-primary/5">
                            <GraduationCap className="text-brand-primary" size={32} />
                        </div>
                        AI <span className="text-brand-primary">Mentor</span>
                    </h1>
                    <p className="text-[10px] text-dark-muted font-bold uppercase tracking-[0.3em] opacity-60">Strategic Performance & Curriculum Support</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-5 py-2.5 bg-[#141414] border border-white/5 rounded-xl flex items-center gap-3 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest opacity-80">Online Pulse</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-[550px] bg-[#141414] rounded-3xl border border-white/5 flex flex-col relative shadow-3xl overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] flex items-start gap-5 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center border-2 transition-all shadow-xl ${msg.role === 'ai' ? 'bg-[#1a1a1a] border-white/5 text-brand-primary' : 'bg-brand-primary border-brand-primary text-dark-bg'
                                    }`}>
                                    {msg.role === 'ai' ? <Sparkles size={22} /> : <User size={22} />}
                                </div>
                                <div className="space-y-2">
                                    <div className={`p-5 rounded-2xl text-sm font-medium leading-[1.6] shadow-2xl border transition-all ${msg.role === 'ai' ? 'bg-[#1a1a1a] text-white border-white/5' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className={`text-[9px] font-bold uppercase tracking-widest opacity-30 ${msg.role === 'ai' ? 'text-left' : 'text-right'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-8 bg-white/[0.01] border-t border-white/5">
                    <form onSubmit={handleSend} className="relative group">
                        <input
                            type="text"
                            placeholder="Request technical consultation..."
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-5 pl-8 pr-16 text-white text-base font-medium focus:border-brand-primary/50 outline-none transition-all shadow-inner"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-primary text-dark-bg rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <div className="flex gap-3 mt-6 overflow-x-auto pb-2 no-scrollbar">
                        {['Strategic Growth Plan', 'Complex Code Analysis', 'Curriculum Mapping'].map(tip => (
                            <button
                                key={tip}
                                onClick={() => setInput(tip)}
                                className="whitespace-nowrap px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-dark-muted hover:text-white hover:bg-brand-primary/10 hover:border-brand-primary/20 transition-all uppercase tracking-widest shadow-md"
                            >
                                {tip}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: <Target size={20} />, label: "Precision Engine", value: "Curriculum Optimized", color: "text-brand-primary" },
                    { icon: <Shield size={20} />, label: "Protocol Status", value: "Secure Consultation", color: "text-white" },
                    { icon: <MessageSquare size={20} />, label: "Response Flux", value: "High Fidelity", color: "text-white" }
                ].map((item, i) => (
                    <div key={i} className="bg-[#141414] p-6 rounded-2xl border border-white/5 flex items-center gap-5 shadow-xl">
                        <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ${item.color} shadow-lg transition-transform group-hover:scale-105`}>
                            {item.icon}
                        </div>
                        <div className="space-y-1">
                            <div className="text-[9px] uppercase font-bold text-dark-muted tracking-[0.2em] opacity-50">{item.label}</div>
                            <div className="text-xs font-bold text-white uppercase tracking-tight">{item.value}</div>
                        </div>
                    </div>
                ))}
            </footer>
        </div>
    );
};

export default NeuralTutor;
