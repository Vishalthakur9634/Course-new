import React from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
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
                            CourseLauncher
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/instructor-home" className="text-sm text-dark-muted hover:text-white transition-colors">
                            Become an Instructor
                        </Link>
                        <Link to="/login" className="text-sm font-medium hover:text-brand-primary transition-colors">
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/80 via-dark-bg/95 to-dark-bg"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Master New Skills <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">
                            Build Your Future
                        </span>
                    </h1>
                    <p className="text-xl text-dark-muted max-w-2xl mx-auto mb-10">
                        Access world-class courses from top instructors. Learn at your own pace, get certified, and advance your career.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto bg-brand-primary hover:bg-brand-hover text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25"
                        >
                            Start Learning Now <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/browse"
                            className="w-full sm:w-auto bg-dark-layer2 hover:bg-dark-layer1 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all border border-dark-layer2 hover:border-brand-primary/50"
                        >
                            Browse Courses
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-dark-layer1 p-8 rounded-2xl border border-dark-layer2 hover:border-brand-primary/30 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                            <BookOpen className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Expert-Led Courses</h3>
                        <p className="text-dark-muted">Learn from industry experts who have real-world experience and passion for teaching.</p>
                    </div>
                    <div className="bg-dark-layer1 p-8 rounded-2xl border border-dark-layer2 hover:border-brand-primary/30 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Users className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Community Learning</h3>
                        <p className="text-dark-muted">Join a global community of learners. Share ideas, get feedback, and grow together.</p>
                    </div>
                    <div className="bg-dark-layer1 p-8 rounded-2xl border border-dark-layer2 hover:border-brand-primary/30 transition-colors">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Award className="text-green-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Get Certified</h3>
                        <p className="text-dark-muted">Earn recognized certificates upon completion to showcase your skills to employers.</p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="border-y border-dark-layer2 bg-dark-layer1/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">10k+</div>
                            <div className="text-dark-muted">Active Students</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">500+</div>
                            <div className="text-dark-muted">Courses</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">100+</div>
                            <div className="text-dark-muted">Instructors</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">4.8/5</div>
                            <div className="text-dark-muted">Average Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="bg-gradient-to-br from-brand-primary/20 to-purple-600/20 border border-brand-primary/30 rounded-3xl p-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
                        <p className="text-xl text-dark-muted max-w-2xl mx-auto mb-8">
                            Join thousands of students already learning on CourseLauncher.
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 bg-white text-dark-bg px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-colors"
                        >
                            Join for Free <ArrowRight size={20} />
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

export default LandingPage;
