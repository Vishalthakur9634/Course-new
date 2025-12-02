import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Grid, BookOpen } from 'lucide-react';

const Categories = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
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
        }
    };

    const filteredCourses = selectedCategory === 'all'
        ? courses
        : courses.filter(course => course.category === selectedCategory);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Grid size={32} className="text-brand-primary" />
                <h1 className="text-3xl font-bold text-white">Browse by Category</h1>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === 'all'
                            ? 'bg-brand-primary text-white'
                            : 'bg-dark-layer1 text-dark-text border border-dark-layer2 hover:border-brand-primary/50'
                        }`}
                >
                    All Courses
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category
                                ? 'bg-brand-primary text-white'
                                : 'bg-dark-layer1 text-dark-text border border-dark-layer2 hover:border-brand-primary/50'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            {filteredCourses.length === 0 ? (
                <div className="bg-dark-layer1 p-12 rounded-lg border border-dark-layer2 text-center">
                    <BookOpen size={48} className="text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">No courses found in this category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <div
                            key={course._id}
                            onClick={() => navigate(`/course/${course._id}`)}
                            className="bg-dark-layer1 rounded-lg overflow-hidden border border-dark-layer2 hover:border-brand-primary/50 transition-all cursor-pointer group"
                        >
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <span className="inline-block bg-brand-primary/20 text-brand-primary text-xs px-2 py-1 rounded mb-2">
                                    {course.category}
                                </span>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-dark-muted text-sm mb-3 line-clamp-2">
                                    {course.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-brand-primary font-bold text-xl">
                                        ${course.price}
                                    </span>
                                    <span className="text-dark-muted text-sm">
                                        {course.videos?.length || 0} videos
                                    </span>
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
