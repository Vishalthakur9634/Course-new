import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Twitter, Github, Linkedin, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Check if backend has a contact endpoint, if not simulate success for now
            // In a real app, this would be api.post('/contact', formData)
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus({ type: 'success', message: 'Message launched! We will get back to you soon.' });
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
                            Let's Talk <br />
                            <span className="text-brand-primary">Adventure.</span>
                        </h1>
                        <p className="text-xl text-dark-muted font-medium max-w-lg leading-relaxed">
                            Have a question about a course, or just want to say hi? We're here to help you navigate your learning journey.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-3xl hover:bg-white/5 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-dark-bg transition-all duration-300">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-dark-muted uppercase tracking-widest">Email Us</p>
                                <p className="text-lg font-bold text-white">hello@orbitquest.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-3xl hover:bg-white/5 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-dark-bg transition-all duration-300">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-dark-muted uppercase tracking-widest">Call Support</p>
                                <p className="text-lg font-bold text-white">+1 (555) ORBIT-XP</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-3xl hover:bg-white/5 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-dark-bg transition-all duration-300">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-dark-muted uppercase tracking-widest">Visit Base</p>
                                <p className="text-lg font-bold text-white">Silicon Valley, CA 94043</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <p className="text-xs font-black text-dark-muted uppercase tracking-[0.3em] mb-4">Follow the Journey</p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <button key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-dark-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all shadow-lg active:scale-90">
                                    <Icon size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                        <MessageCircle size={300} className="text-brand-primary" />
                    </div>
                    {status.type && (
                        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <p className="text-sm font-bold">{status.message}</p>
                        </div>
                    )}
                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-dark-muted uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-dark-layer2/50 border border-white/5 rounded-2xl py-4.5 px-6 text-white focus:outline-none focus:border-brand-primary transition-all shadow-inner placeholder:text-dark-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-dark-muted uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-dark-layer2/50 border border-white/5 rounded-2xl py-4.5 px-6 text-white focus:outline-none focus:border-brand-primary transition-all shadow-inner placeholder:text-dark-muted/30"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-dark-muted uppercase tracking-widest ml-1">Subject</label>
                            <div className="relative group/sel">
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-dark-layer2/50 border border-white/5 rounded-2xl py-4.5 px-6 text-white focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer shadow-inner"
                                >
                                    <option>General Inquiry</option>
                                    <option>Course Feedback</option>
                                    <option>Billing Issue</option>
                                    <option>Instructor Partnership</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-dark-muted group-focus-within/sel:text-brand-primary transition-colors">
                                    <MessageCircle size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-dark-muted uppercase tracking-widest ml-1">Your Message</label>
                            <textarea
                                rows="4"
                                required
                                placeholder="How can we help you reach your goals?"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-dark-layer2/50 border border-white/5 rounded-2xl py-4.5 px-6 text-white focus:outline-none focus:border-brand-primary transition-all resize-none shadow-inner placeholder:text-dark-muted/30"
                            ></textarea>
                        </div>
                        <button
                            disabled={loading}
                            className={`w-full py-5 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-2xl transition-all shadow-[0_10px_30px_rgba(255,161,22,0.2)] flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-[0.2em] text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? 'Preparing Launch...' : <><Send size={20} /> Launch Message</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
