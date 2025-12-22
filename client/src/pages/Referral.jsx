import React, { useState, useEffect } from 'react';
import { Gift, Share2, Copy, Users, DollarSign, Rocket, Sparkles, ChevronRight, Loader } from 'lucide-react';
import api from '../utils/api';

const Referral = () => {
    const [stats, setStats] = useState(null);
    const [referralLink, setReferralLink] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            const { data } = await api.get('/referrals/stats');
            setStats(data.stats);
            setReferralLink(data.link);
            setReferralCode(data.referralCode);
        } catch (error) {
            console.error('Error fetching referral stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader className="animate-spin text-brand-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-6 space-y-24">
            <header className="flex flex-col lg:flex-row items-center gap-16 text-center lg:text-left pt-8">
                <div className="flex-1 space-y-8">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest animate-pulse">
                        <Gift size={16} /> Affiliate Program
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                            Grow Together. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-orange-500">Earn Forever.</span>
                        </h1>
                        <p className="text-xl text-dark-muted font-medium max-w-2xl leading-relaxed">
                            Invite your friends to the OrbitQuest community and earn <span className="text-white font-black underline decoration-brand-primary underline-offset-4">20% commission</span> on every single course they purchase. Life-time payouts.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5 pt-4">
                        <button onClick={() => document.getElementById('referral-toolbox').scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-brand-primary hover:bg-brand-hover text-dark-bg font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,161,22,0.3)] transform hover:-translate-y-1">
                            Get My Link <ChevronRight size={20} />
                        </button>
                        <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-sm">
                            How it works
                        </button>
                    </div>
                </div>
                <div className="relative group">
                    <div className="absolute inset-0 bg-brand-primary/30 blur-[120px] rounded-full group-hover:bg-brand-primary/40 transition-all duration-700"></div>
                    <div className="relative bg-dark-layer1 border-2 border-white/10 p-12 rounded-[4rem] shadow-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                        <div className="text-center space-y-4">
                            <div className="w-24 h-24 bg-dark-layer2 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/5">
                                <Rocket size={48} className="text-brand-primary drop-shadow-[0_0_15px_rgba(255,161,22,0.5)]" />
                            </div>
                            <p className="text-5xl font-black text-white tracking-tighter">${stats?.totalEarnings?.toFixed(2) || '0.00'}</p>
                            <p className="text-xs font-black text-dark-muted uppercase tracking-[0.3em]">Total Earnings</p>
                            <div className="h-3 bg-dark-layer2 rounded-full mt-10 overflow-hidden p-0.5 border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-brand-primary to-orange-500 rounded-full shadow-[0_0_15px_rgba(255,161,22,0.6)] transition-all duration-1000"
                                    style={{ width: `${Math.min((stats?.totalEarnings || 0) / 1000 * 100, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-dark-muted font-bold mt-4">Payouts are processed monthly</p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Share2, title: 'Share Link', desc: 'Copy your unique referral link and share it across your network or social media.' },
                    { icon: Users, title: 'They Join', desc: 'Your friends sign up using your link and start their learning adventure on Orbit.' },
                    { icon: DollarSign, title: 'You Earn', desc: "Get 20% of every purchase they make. No limits, no caps on earnings." },
                ].map((step, i) => (
                    <div key={i} className="bg-dark-layer1 border border-white/10 p-10 rounded-[3rem] relative group hover:border-brand-primary/40 hover:bg-dark-layer1/50 transition-all duration-300 shadow-2xl">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-brand-primary mb-8 group-hover:bg-brand-primary group-hover:text-dark-bg transition-all duration-500">
                            <step.icon size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3">{step.title}</h3>
                        <p className="text-dark-muted font-medium text-base leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </section>

            <div id="referral-toolbox" className="bg-dark-layer1 border-2 border-white/10 rounded-[4rem] p-10 lg:p-20 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -right-24 p-32 opacity-5 pointer-events-none rotate-12">
                    <Sparkles size={400} className="text-white" />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 relative z-10">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tight mb-2">Referral Toolbox</h2>
                            <p className="text-dark-muted font-medium italic">Empower your network with world-class education.</p>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-dark-muted uppercase tracking-[0.3em] ml-2">Your Unique Link</label>
                            <div className="flex gap-2 p-3 bg-dark-layer2/50 border border-white/5 rounded-3xl group focus-within:border-brand-primary transition-all shadow-inner">
                                <input
                                    readOnly
                                    value={referralLink || 'Loading...'}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white font-black ml-4 text-base"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className={`p-4 ${copied ? 'bg-green-500 text-white' : 'bg-dark-layer1 text-brand-primary hover:bg-brand-primary hover:text-dark-bg'} rounded-2xl transition-all flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] shadow-xl border border-white/5 active:scale-95`}
                                >
                                    <Copy size={18} /> {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                            <div className="text-center">
                                <p className="text-dark-muted text-xs">Referral Code: <span className="text-white font-bold">{referralCode}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: 'Total Clicks', val: stats?.clicks || 0, trend: 'Active' },
                            { label: 'Referrals', val: stats?.totalReferrals || 0, trend: 'Lifetime' },
                            { label: 'Conversion', val: stats?.clicks > 0 ? `${((stats.totalReferrals / stats.clicks) * 100).toFixed(1)}%` : '0%', trend: 'Optimum' },
                            { label: 'Earned', val: `$${stats?.totalEarnings?.toFixed(2) || '0.00'}`, trend: 'Live' }
                        ].map((stat, i) => (
                            <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col justify-between hover:bg-white/[0.07] transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">{stat.label}</p>
                                    <span className="text-[8px] font-black py-0.5 px-2 bg-brand-primary/20 text-brand-primary rounded-full">{stat.trend}</span>
                                </div>
                                <p className="text-3xl font-black text-white tracking-tighter">{stat.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="text-center py-8">
                <p className="text-xs font-bold text-dark-muted uppercase tracking-[0.5em] mb-4">Our Partners</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
                    {/* Placeholder logos */}
                    <span className="text-xl font-black italic">TECHHUB</span>
                    <span className="text-xl font-black italic">LEARNLY</span>
                    <span className="text-xl font-black italic">DEVFLOW</span>
                    <span className="text-xl font-black italic">SKILLSYNC</span>
                </div>
            </footer>
        </div>
    );
};

export default Referral;
