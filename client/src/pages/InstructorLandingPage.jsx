import React from 'react';
import { Link } from 'react-router-dom';
import { Play, DollarSign, Users, BarChart, ArrowRight, Check, Rocket, BookOpen, Clock, Award } from 'lucide-react';
import Navbar from '../components/Navbar';

const InstructorLandingPage = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px] font-inter">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden py-24">
                <div className="absolute inset-0 bg-[#0a0a0a]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-transparent opacity-50"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
                                <Award size={16} className="text-brand-primary" />
                                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Educator Program</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none uppercase">
                                Teach the <br />
                                <span className="text-brand-primary">Next Generation</span>
                            </h1>
                            <p className="text-lg text-dark-muted max-w-xl leading-relaxed font-medium">
                                Join an elite community of expert instructors. Share your professional expertise, reach students globally, and build a scalable revenue stream.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/register"
                                    className="bg-brand-primary hover:brightness-110 text-dark-bg px-10 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    Get Started Today <ArrowRight size={18} />
                                </Link>
                                <Link
                                    to="/browse"
                                    className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
                                >
                                    Explore Courses
                                </Link>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BarChart size={200} />
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-lg uppercase tracking-tight">Analytics Dashboard</div>
                                        <div className="text-dark-muted text-[10px] font-bold uppercase tracking-widest">Real-time Performance</div>
                                    </div>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                            <div className="text-2xl font-bold text-white tracking-tight">$4,250.00</div>
                                            <div className="text-[9px] font-bold text-dark-muted uppercase tracking-widest mt-1">Monthly Earnings</div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                            <div className="text-2xl font-bold text-brand-primary tracking-tight">1,240</div>
                                            <div className="text-[9px] font-bold text-dark-muted uppercase tracking-widest mt-1">Active Students</div>
                                        </div>
                                    </div>
                                    <div className="h-24 bg-white/5 rounded-xl border border-white/5 flex items-end p-4 gap-2">
                                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                            <div key={i} className="flex-1 bg-brand-primary/20 rounded-t-sm group-hover:bg-brand-primary/40 transition-colors" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">Empowering <span className="text-brand-primary">Educators</span></h2>
                    <p className="text-dark-muted max-w-2xl mx-auto font-medium text-base">We provide the professional-grade tools and industry reach you need to thrive.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <DollarSign size={24} />, title: "Premium Revenue", desc: "Competitive revenue shares that prioritize high-quality content creators.", color: "text-green-500", bg: "bg-green-500/10" },
                        { icon: <Users size={24} />, title: "Informed Reach", desc: "Connect with a target audience of professionals and dedicated learners.", color: "text-brand-primary", bg: "bg-brand-primary/10" },
                        { icon: <BarChart size={24} />, title: "Precision Metrics", desc: "Deep analytics to track student progress and optimize your curriculum.", color: "text-white", bg: "bg-white/10" }
                    ].map((item, i) => (
                        <div key={i} className="bg-[#1a1a1a] p-10 rounded-2xl border border-white/5 hover:border-brand-primary/20 transition-all group">
                            <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform`}>
                                <div className={item.color}>{item.icon}</div>
                            </div>
                            <h3 className="text-xl font-bold mb-4 uppercase tracking-tight text-white">{item.title}</h3>
                            <p className="text-dark-muted text-sm font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How it Works */}
            <div className="bg-[#111] border-y border-white/5 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-20 text-center uppercase tracking-tight">Standard <span className="text-brand-primary">Workflow</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            { step: '01', title: 'Curriculum Design', desc: 'Structure your course modules and learning objectives.' },
                            { step: '02', title: 'Content Creation', desc: 'Securely record and upload high-fidelity video lectures.' },
                            { step: '03', title: 'Launch Readiness', desc: 'Optimize metadata and publish to the global catalog.' },
                            { step: '04', title: 'Professional Growth', desc: 'Earn revenue as students enroll and progress.' }
                        ].map((item, index) => (
                            <div key={index} className="relative group">
                                <div className="text-7xl font-bold text-white opacity-[0.02] absolute -top-12 -left-4 select-none group-hover:opacity-[0.05] transition-opacity">{item.step}</div>
                                <div className="relative z-10 space-y-3">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{item.title}</h3>
                                    <p className="text-dark-muted text-sm font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-16 md:p-24 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary"></div>
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tight">Ready to <span className="text-brand-primary">Innovate?</span></h2>
                        <p className="text-lg text-dark-muted max-w-2xl mx-auto font-medium leading-relaxed">
                            Join our instructor network today and start defining the future of online education.
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 bg-brand-primary text-dark-bg px-12 py-5 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-xl"
                        >
                            Complete Application <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#0a0a0a] py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                            <Rocket size={16} className="text-dark-bg" />
                        </div>
                        <span className="text-xl font-bold text-white uppercase tracking-tight">PLATFORM</span>
                    </div>
                    <div className="flex gap-8 text-[10px] font-bold text-dark-muted uppercase tracking-widest">
                        <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-brand-primary transition-colors">Instructor Portal</a>
                    </div>
                    <div className="text-dark-muted text-[10px] font-bold uppercase tracking-widest">
                        © 2024 Educational Platform.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InstructorLandingPage;
