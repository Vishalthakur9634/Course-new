import React, { useState } from 'react';
import { Cpu, Send, Sparkles, Brain, Zap, Shield } from 'lucide-react';

const NeuralTutor = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Neural Interface Active. I am your Quantum Tutor. How can I assist your learning transmission today?', timestamp: new Date() }
    ]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setMessages([...messages, { role: 'user', text: input, timestamp: new Date() }]);
        setInput('');

        // Simulate AI thinking
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `Analyzing your query regarding "${input}"... Transmission received. Based on current sector data, I recommend focusing on sub-orbital logic patterns.`,
                timestamp: new Date()
            }]);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col gap-6 p-2 md:p-6 overflow-hidden max-w-5xl mx-auto w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        <Cpu className="text-brand-primary animate-pulse" size={36} />
                        NEURAL <span className="text-brand-primary">TUTOR</span>
                    </h1>
                    <p className="text-dark-muted font-bold text-xs uppercase tracking-widest mt-1 opacity-60">Cognitive Neural Enhancement Interface v2.4</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl flex items-center gap-2 group cursor-help transition-all hover:bg-brand-primary/20">
                        <Brain size={16} className="text-brand-primary" />
                        <span className="text-xs font-bold text-white uppercase">Sync 98%</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden glass-panel rounded-3xl border border-white/5 flex flex-col relative shadow-2xl shadow-brand-primary/5">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-slide-up`}>
                            <div className={`max-w-[80%] flex items-start gap-4 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border-2 ${msg.role === 'ai' ? 'bg-brand-primary/20 border-brand-primary/50 text-brand-primary' : 'bg-white/5 border-white/10 text-white'
                                    } shadow-lg`}>
                                    {msg.role === 'ai' ? <Sparkles size={20} /> : <Zap size={20} />}
                                </div>
                                <div className={`p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-xl border ${msg.role === 'ai'
                                        ? 'bg-dark-layer2/80 text-white border-brand-primary/10'
                                        : 'bg-brand-primary text-dark-bg border-brand-primary font-bold'
                                    }`}>
                                    {msg.text}
                                    <div className={`text-[10px] mt-2 opacity-40 uppercase tracking-tighter ${msg.role === 'ai' ? 'text-left' : 'text-right'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-black/20 border-t border-white/5 relative z-10">
                    <form onSubmit={handleSend} className="relative group">
                        <input
                            type="text"
                            placeholder="Input learning parameters or ask a question..."
                            className="w-full bg-dark-layer1/50 border border-white/10 rounded-2xl py-5 pl-7 pr-16 text-white text-lg font-bold focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-primary text-dark-bg rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-brand-primary/30"
                        >
                            <Send size={24} />
                        </button>
                    </form>
                    <div className="flex gap-4 mt-4 overflow-x-auto pb-2 no-scrollbar">
                        {['Explain Reactor Logic', 'Optimize Path', 'Debug Transmission'].map(tip => (
                            <button
                                key={tip}
                                onClick={() => setInput(tip)}
                                className="whitespace-nowrap px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-dark-muted hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                            >
                                {tip}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded flex items-center justify-center text-brand-primary"><Zap size={20} /></div>
                    <div>
                        <div className="text-[10px] uppercase font-black text-dark-muted">Engine Core</div>
                        <div className="text-sm font-bold text-white">Quantum 1.0</div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-quantum-purple/10 rounded flex items-center justify-center text-quantum-purple"><Shield size={20} /></div>
                    <div>
                        <div className="text-[10px] uppercase font-black text-dark-muted">Secure Access</div>
                        <div className="text-sm font-bold text-white">Encrypted Node</div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-stellar-gold/10 rounded flex items-center justify-center text-stellar-gold"><Sparkles size={20} /></div>
                    <div>
                        <div className="text-[10px] uppercase font-black text-dark-muted">Expertise Sync</div>
                        <div className="text-sm font-bold text-white">High Precision</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NeuralTutor;
