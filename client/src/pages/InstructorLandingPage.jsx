import React from 'react';
import { Link } from 'react-router-dom';
import { Play, DollarSign, Users, BarChart, ArrowRight, Check } from 'lucide-react';

const InstructorLandingPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white">
            {/* Navbar */}
            <nav className="border-b border-dark-layer2 bg-dark-layer1/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-purple-600 rounded-lg flex items-center justify-center">
                            <Play size={16} className="text-white fill-current" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            CourseLauncher <span className="text-brand-primary text-sm font-medium ml-1">for Instructors</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm text-dark-muted hover:text-white transition-colors">
                            Student Home
                        </Link>
                        <Link to="/login" className="text-sm font-medium hover:text-brand-primary transition-colors">
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                        >
                            Start Teaching
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/80 via-dark-bg/95 to-dark-bg"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
                                Share Your Knowledge <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">
                                    Earn What You Deserve
                                </span>
                            </h1>
                            <p className="text-xl text-dark-muted mb-8">
                                Join our community of expert instructors. Create courses, reach students globally, and build a sustainable income stream.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/register"
                                    className="bg-brand-primary hover:bg-brand-hover text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25"
                                >
                                    Become an Instructor <ArrowRight size={20} />
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-dark-layer1 border border-dark-layer2 rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-700"></div>
                                    <div>
                                        <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                                        <div className="h-3 w-20 bg-gray-800 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-32 bg-gray-800 rounded-lg w-full"></div>
                                    <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
                                    <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
                                </div>
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-green-400 font-bold">+$1,250.00</div>
                                    <div className="text-xs text-dark-muted">This Month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Why Teach with Us?</h2>
                    <p className="text-dark-muted max-w-2xl mx-auto">We provide the tools and support you need to succeed as an online instructor.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-dark-layer1 p-8 rounded-2xl border border-dark-layer2">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                            <DollarSign className="text-green-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Keep More Earnings</h3>
                        <p className="text-dark-muted">Competitive revenue share model designed to reward high-quality content creators.</p>
                    </div>
                    <div className="bg-dark-layer1 p-8 rounded-2xl border border-dark-layer2">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Users className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Global Reach</h3>
                        <p className="text-dark-muted">Connect with students from around the world who are eager to learn from you.</p>
                    </div>
                    <div className="bg-dark-layer1 p-8 rounded-2xl border border-dark-layer2">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                            <BarChart className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Powerful Analytics</h3>
                        <p className="text-dark-muted">Track your performance, understand your students, and optimize your courses.</p>
                    </div>
                </div>
            </div>

            {/* How it Works */}
            <div className="bg-dark-layer1/30 border-y border-dark-layer2 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Plan Your Course', desc: 'Outline your curriculum and gather materials.' },
                            { step: '02', title: 'Record Video', desc: 'Film your lectures using your preferred equipment.' },
                            { step: '03', title: 'Upload & Launch', desc: 'Use our easy uploader to publish your course.' },
                            { step: '04', title: 'Earn Money', desc: 'Get paid every time a student purchases your course.' }
                        ].map((item, index) => (
                            <div key={index} className="relative">
                                <div className="text-6xl font-bold text-dark-layer2 absolute -top-8 -left-4 select-none">{item.step}</div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-dark-muted">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="bg-gradient-to-br from-purple-600/20 to-brand-primary/20 border border-purple-500/30 rounded-3xl p-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Inspire?</h2>
                        <p className="text-xl text-dark-muted max-w-2xl mx-auto mb-8">
                            Join us today and start your journey as an online instructor.
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 bg-white text-dark-bg px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-colors"
                        >
                            Start Teaching Today <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-dark-layer2 bg-dark-layer1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                            <Play size={16} className="text-white fill-current" />
                        </div>
                        <span className="text-xl font-bold text-white">CourseLauncher</span>
                    </div>
                    <div className="text-dark-muted text-sm">
                        © 2024 CourseLauncher. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InstructorLandingPage;
