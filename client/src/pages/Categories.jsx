import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Grid, BookOpen, Layers, Search, TrendingUp, Star } from 'lucide-react';

const Categories = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);

            // Extract unique categories
            const uniqueCategories = [...new Set(data.map(course => course.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = selectedCategory === 'all'
        ? courses
        : courses.filter(course => course.category === selectedCategory);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-32 px-4 md:px-8 font-inter">
            <header className="space-y-4 py-10 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                        <Layers size={28} className="text-brand-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight leading-none">
                            Curriculum <span className="text-brand-primary">Specializations</span>
                        </h1>
                        <p className="text-[10px] text-dark-muted font-bold tracking-[0.3em] uppercase opacity-70 mt-1.5">Strategic Taxonomy of Educational Disciplines</p>
                    </div>
                </div>
            </header>

            {/* Category Matrix Selectors */}
            <div className="flex flex-wrap gap-3 py-4">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border ${selectedCategory === 'all'
                        ? 'bg-brand-primary text-dark-bg border-brand-primary shadow-lg shadow-brand-primary/10'
                        : 'bg-[#141414] text-dark-muted border-white/5 hover:border-brand-primary/30 hover:text-white'
                        }`}
                >
                    All Curriculum
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border ${selectedCategory === category
                            ? 'bg-brand-primary text-dark-bg border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'bg-[#141414] text-dark-muted border-white/5 hover:border-brand-primary/30 hover:text-white'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Content Matrix Grid */}
            {filteredCourses.length === 0 ? (
                <div className="bg-[#141414] p-24 rounded-3xl border border-white/5 text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-dark-muted opacity-20">
                        <BookOpen size={48} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Index Empty</h3>
                        <p className="text-dark-muted text-[10px] font-bold uppercase tracking-widest opacity-60">No curriculum paths discovered in this specialization domain.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredCourses.map(course => (
                        <div
                            key={course._id}
                            onClick={() => navigate(`/course/${course._id}`)}
                            className="bg-[#141414] rounded-3xl overflow-hidden border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer group shadow-2xl flex flex-col h-full"
                        >
                            <div className="aspect-video relative overflow-hidden bg-[#262626]">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-[#0a0a0a]/80 backdrop-blur-md text-brand-primary border border-brand-primary/20 text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">
                                        {course.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1 space-y-6">
                                <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight leading-tight line-clamp-2">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-dark-muted font-medium line-clamp-2 leading-relaxed opacity-80">
                                    {course.description}
                                </p>
                                <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
                                    <div className="flex items-center gap-6">
                                        <span className="text-2xl font-bold text-white tracking-tight">
                                            ${course.price}
                                        </span>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-dark-muted uppercase tracking-widest opacity-60">
                                            <TrendingUp size={14} className="text-brand-primary" />
                                            {course.videos?.length || 0} Modules
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-xs">
                                        <Star size={14} fill="currentColor" />
                                        4.9
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Categories;
