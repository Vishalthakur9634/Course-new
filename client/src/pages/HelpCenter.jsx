import React from 'react';
import { Search, HelpCircle, Book, Shield, DollarSign, MessageSquare, ExternalLink, ChevronRight, Mail } from 'lucide-react';

const HelpCenter = () => {
    const categories = [
        { icon: Book, title: 'Courses & Learning', desc: 'How to enroll, access content and track progress.' },
        { icon: DollarSign, title: 'Payments & Subscriptions', desc: 'Managing your billing, refunds and invoices.' },
        { icon: Shield, title: 'Account & Security', desc: 'Password resets, 2FA and profile management.' },
        { icon: MessageSquare, title: 'Community Guidelines', desc: 'Rules for interaction and forum behavior.' },
    ];

    const faqs = [
        "How do I request a refund?",
        "Can I download course videos for offline viewing?",
        "How do I become an instructor on Orbit?",
        "Are the certificates recognized by employers?",
        "How do I update my email address?"
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-16">
            <header className="text-center space-y-6 pt-8">
                <div className="w-20 h-20 bg-brand-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-brand-primary/30 shadow-2xl shadow-brand-primary/10">
                    <HelpCircle className="text-brand-primary" size={40} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">How can we <span className="text-brand-primary italic">help?</span></h1>
                <div className="max-w-2xl mx-auto relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-brand-primary transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Search for articles, guides..."
                        className="w-full bg-dark-layer1 border-2 border-white/10 rounded-[2.5rem] py-5 pl-16 pr-8 text-lg focus:outline-none focus:border-brand-primary transition-all shadow-2xl placeholder:text-dark-muted/50"
                    />
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat, i) => (
                    <div key={i} className="bg-dark-layer1 border border-white/10 rounded-[2.5rem] p-8 hover:border-brand-primary/50 transition-all duration-300 group cursor-pointer shadow-xl">
                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary transition-all">
                                <cat.icon className="text-dark-muted group-hover:text-dark-bg transition-colors" size={28} />
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="text-xl font-black text-white flex items-center justify-between">
                                    {cat.title} <ChevronRight size={18} className="text-dark-muted group-hover:text-brand-primary -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                </h3>
                                <p className="text-sm text-dark-muted leading-relaxed font-medium">{cat.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <div className="bg-dark-layer1 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-8 border-b border-white/5 pb-4 tracking-tight">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer py-1">
                            <span className="text-dark-muted hover:text-white font-bold transition-colors">{faq}</span>
                            <ExternalLink size={14} className="text-dark-layer2 group-hover:text-brand-primary transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            <footer className="bg-gradient-to-br from-brand-primary/10 to-indigo-600/10 border border-brand-primary/20 rounded-[2.5rem] p-12 text-center space-y-6">
                <h3 className="text-3xl font-black text-white tracking-tight leading-none">Still have questions?</h3>
                <p className="text-dark-muted max-w-xl mx-auto text-lg font-medium leading-relaxed">If you couldn't find the answer in our help center, our human support team is ready to assist you!</p>
                <button className="bg-brand-primary hover:bg-brand-hover text-dark-bg px-10 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-xl shadow-brand-primary/25 flex items-center gap-3 mx-auto uppercase tracking-widest">
                    <Mail size={22} /> Contact Orbit Support
                </button>
            </footer>
        </div>
    );
};

export default HelpCenter;
