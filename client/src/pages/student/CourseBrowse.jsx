import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Search, Filter, Star, Users, DollarSign } from 'lucide-react';

const CourseBrowse = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            const published = response.data.filter(c => c.isPublished && c.approvalStatus === 'approved');
            setCourses(published);
            setFilteredCourses(published);

            const cats = ['All', ...new Set(published.map(c => c.category))];
            setCategories(cats);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = courses;

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(c => c.category === selectedCategory);
        }

        setFilteredCourses(filtered);
    }, [searchTerm, selectedCategory, courses]);

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Browse Courses</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-layer1 border border-dark-layer2 rounded-lg py-2 pl-10 pr-4 text-white focus:border-brand-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                            ? 'bg-brand-primary text-white'
                            : 'bg-dark-layer1 text-dark-muted hover:bg-dark-layer2'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                    <Link
                        key={course._id}
                        to={`/course/${course._id}`}
                        className="bg-dark-layer1 border border-dark-layer2 rounded-xl overflow-hidden hover:border-brand-primary transition-all group"
                    >
                        <div className="aspect-video bg-dark-layer2 relative">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-white">
                                {course.videos?.length || 0} Videos
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-brand-primary/10 text-brand-primary text-xs px-2 py-1 rounded font-bold uppercase">
                                    {course.category}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                    <Star size={14} fill="currentColor" />
                                    <span>{course.rating || 4.5}</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                            <p className="text-dark-muted text-sm line-clamp-2 mb-4">{course.description}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-dark-layer2">
                                <div className="flex items-center gap-1 text-sm text-dark-muted">
                                    <Users size={14} />
                                    <span>{course.enrollmentCount || 0}</span>
                                </div>
                                <span className="font-bold text-xl text-white">${course.price}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-dark-muted">No courses found</p>
                </div>
            )}
        </div>
    );
};

export default CourseBrowse;
