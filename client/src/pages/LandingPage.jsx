import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Play, BookOpen, Users, Award, CheckCircle,
    ArrowRight, Rocket, Zap, Shield, Globe,
    Cpu, Sparkles, Star, ChevronDown, GraduationCap, Briefcase, BarChart
} from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 200], [1, 0]);
    const scale = useTransform(scrollY, [0, 200], [1, 0.95]);

    const features = [
        {
            icon: GraduationCap,
            title: "Expert Instruction",
            desc: "Learn from top industry professionals with proven track records in tech and design.",
            color: "text-brand-primary",
            bg: "bg-brand-primary/10"
        },
        {
            icon: Briefcase,
            title: "Career Ready",
            desc: "Focus on real-world skills and projects that prepare you for the current job market.",
            color: "text-blue-400",
            bg: "bg-blue-400/10"
        },
        {
            icon: BarChart,
            title: "Track Progress",
            desc: "Advanced analytics to monitor your learning journey and skill acquisition.",
            color: "text-purple-400",
            bg: "bg-purple-400/10"
        }
    ];

    const stats = [
        { label: "Active Learners", value: "250K+" },
        { label: "Elite Courses", value: "1.2K+" },
        { label: "Certified Instructors", value: "450+" },
        { label: "Career Success", value: "98%" }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-brand-primary selection:text-dark-bg font-inter">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-6 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    style={{ opacity, scale }}
                    className="max-w-5xl mx-auto w-full relative z-10"
                >
                    <div className="text-center space-y-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-primary"
                        >
                            <Award size={14} />
                            Industry Leading Educational Platform
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-5xl md:text-8xl font-bold uppercase tracking-tight leading-[1.1]"
                        >
                            Master the <br />
                            <span className="text-brand-primary">Skills for Tomorrow</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-dark-muted max-w-2xl mx-auto text-lg md:text-xl font-medium"
                        >
                            Comprehensive curriculum designed by experts to help you achieve
                            professional excellence in software engineering and design.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                        >
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-10 py-4 bg-brand-primary text-dark-bg font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                            >
                                Start Learning Now <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/browse"
                                className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all border border-white/10 text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                            >
                                Browse Catalog <BookOpen size={18} />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-muted/40"
                >
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Scroll</span>
                    <ChevronDown size={16} />
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-6 bg-[#0d0d0d] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Our Methodology</h2>
                        <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Professional Learning Framework</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -8 }}
                                className="p-10 bg-[#141414] border border-white/5 rounded-2xl group transition-all"
                            >
                                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-8 border border-white/5 transition-transform group-hover:scale-110`}>
                                    <feature.icon className={feature.color} size={28} />
                                </div>
                                <h4 className="text-xl font-bold uppercase mb-4 tracking-tight text-white group-hover:text-brand-primary transition-colors">
                                    {feature.title}
                                </h4>
                                <p className="text-dark-muted leading-relaxed text-sm font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="space-y-1">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="text-4xl md:text-6xl font-bold text-white tracking-tight"
                                >
                                    {stat.value}
                                </motion.div>
                                <div className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto bg-[#141414] border border-white/5 rounded-2xl p-12 md:p-24 relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />

                    <div className="relative z-10 space-y-10">
                        <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-tight leading-none">
                            Advance Your <br />
                            <span className="text-brand-primary">Career Path</span>
                        </h2>
                        <p className="text-lg text-dark-muted max-w-xl mx-auto font-medium leading-relaxed">
                            Join thousands of ambitious professionals who are leveling up their
                            technical expertise through our structured learning paths.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-12 py-4 bg-brand-primary text-dark-bg rounded-lg font-bold uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-xl shadow-brand-primary/10"
                            >
                                Create Free Account
                            </Link>
                            <Link
                                to="/browse"
                                className="w-full sm:w-auto px-12 py-4 bg-white/5 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/10"
                            >
                                View All Courses
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-20 px-6 bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center">
                                <GraduationCap size={18} className="text-dark-bg transition-transform group-hover:scale-110" />
                            </div>
                            <div className="text-left">
                                <span className="text-xl font-bold uppercase tracking-tight text-white">
                                    PLATFORM
                                </span>
                                <p className="text-[9px] font-bold text-dark-muted uppercase tracking-[0.3em] mt-0.5 opacity-50">Professional Education</p>
                            </div>
                        </div>

                        <div className="flex gap-10">
                            {['Courses', 'About', 'Pricing', 'Contact'].map(item => (
                                <Link key={item} to={`/${item.toLowerCase()}`} className="text-[10px] font-bold text-dark-muted uppercase tracking-widest hover:text-brand-primary transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </div>

                        <div className="text-[9px] font-bold text-dark-muted uppercase tracking-widest opacity-40">
                            © 2026 Professional Educational Platform.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
