import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { PlayCircle, Search, Clock, Zap, Award } from 'lucide-react';

const Dashboard = () => {
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            const [coursesRes, userRes] = await Promise.all([
                api.get('/courses'),
                api.get(`/users/profile/${userId}`)
            ]);
            setCourses(coursesRes.data);
            setUser(userRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;

    // Filter Logic
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Categories (Dynamic)
    const categories = ['All', ...new Set(courses.map(c => c.category))];

    // Continue Watching Logic
    const inProgressCourses = user?.watchHistory
        ?.filter(h => !h.completed && h.progress > 0)
        .map(h => {
            const course = courses.find(c => c._id === h.courseId._id);
            return course ? { ...course, lastWatched: h.lastWatched, progress: h.progress } : null;
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
        .slice(0, 3) || []; // Top 3 recent

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-primary to-purple-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Welcome back, {user?.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-lg opacity-90 mb-8">
                        Ready to continue your learning journey? You have {inProgressCourses.length} courses in progress.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/my-learning" className="bg-white text-brand-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                            <PlayCircle size={20} /> My Learning
                        </Link>
                        <Link to="/profile" className="bg-black/20 text-white px-6 py-3 rounded-lg font-bold hover:bg-black/30 transition-colors backdrop-blur-sm">
                            View Profile
                        </Link>
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
            </div>

            {/* Continue Watching (if any) */}
            {inProgressCourses.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Clock className="text-brand-primary" /> Continue Watching
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {inProgressCourses.map(course => (
                            <Link to={`/course/${course._id}`} key={course._id} className="bg-dark-layer1 border border-dark-layer2 rounded-lg p-4 hover:border-brand-primary transition-all flex gap-4 items-center group">
                                <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0 relative">
                                    <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle size={20} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white line-clamp-1">{course.title}</h3>
                                    <p className="text-xs text-brand-primary mt-1">Resume Learning</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Search & Filter */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-500" /> Explore Courses
                    </h2>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Search for courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-layer1 border border-dark-layer2 rounded-full py-2 pl-10 pr-4 text-white focus:border-brand-primary focus:outline-none"
                        />
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-dark-layer1 text-dark-muted hover:bg-dark-layer2 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Link to={`/course/${course._id}`} key={course._id} className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden hover:border-brand-primary transition-all group hover:shadow-lg hover:shadow-brand-primary/10">
                            <div className="aspect-video bg-dark-layer2 relative overflow-hidden">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <PlayCircle size={56} className="text-brand-primary drop-shadow-lg" />
                                </div>
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white">
                                    {course.videos.length} Videos
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-brand-primary/10 text-brand-primary text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                                        {course.category}
                                    </span>
                                    <span className="text-yellow-500 flex items-center gap-1 text-sm font-bold">
                                        <Award size={14} /> 4.8
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white line-clamp-1 mb-2 group-hover:text-brand-primary transition-colors">{course.title}</h3>
                                <p className="text-dark-muted text-sm line-clamp-2 mb-4">{course.description}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-dark-layer2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                                        <span className="text-sm text-dark-muted">Instructor</span>
                                    </div>
                                    <span className="font-bold text-xl text-white">${course.price}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-dark-muted text-lg">No courses found matching your criteria.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                            className="text-brand-primary mt-2 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
