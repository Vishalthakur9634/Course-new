import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Users, Search, TrendingUp, BookOpen, Activity } from 'lucide-react';

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/instructor-admin/students');
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/instructor-admin/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const filteredStudents = students.filter(enrollment => {
        const student = enrollment.studentId || enrollment.userId;
        const matchesSearch = student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourse === 'all' || enrollment.courseId?._id === selectedCourse;
        return matchesSearch && matchesCourse;
    });

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading students...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">My Students</h1>
                <div className="flex items-center gap-2 text-dark-muted">
                    <Users size={20} />
                    <span>{filteredStudents.length} students</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-layer1 border border-dark-layer2 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-primary focus:outline-none"
                    />
                </div>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="bg-dark-layer1 border border-dark-layer2 rounded-lg px-4 py-3 text-white focus:border-brand-primary focus:outline-none"
                >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                </select>
            </div>

            {/* Students List */}
            <div className="bg-dark-layer1 rounded-lg border border-dark-layer2 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-dark-layer2">
                        <tr>
                            <th className="text-left p-4 text-dark-muted font-medium">Student</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Course</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Progress</th>
                            <th className="text-left p-4 text-dark-muted font-medium">Enrolled Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(enrollment => (
                            <tr key={enrollment._id} className="border-t border-dark-layer2 hover:bg-dark-layer2 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <span className="text-white font-bold">
                                                {(enrollment.studentId || enrollment.userId)?.name?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{(enrollment.studentId || enrollment.userId)?.name || 'Unknown'}</p>
                                            <p className="text-sm text-dark-muted">{(enrollment.studentId || enrollment.userId)?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-white">{enrollment.courseId?.title || 'N/A'}</p>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex-1 h-2 bg-dark-layer2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-primary"
                                                    style={{ width: `${enrollment.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-dark-muted">{enrollment.progress || 0}%</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-white text-sm">
                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredStudents.length === 0 && (
                <div className="text-center text-dark-muted py-10">
                    No students found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default MyStudents;
