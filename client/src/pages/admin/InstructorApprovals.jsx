import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { UserCheck, Search, Check, X, Clock, Mail } from 'lucide-react';

const InstructorApprovals = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            const { data } = await api.get('/admin/users');
            // Filter for instructors and those with instructor applications
            const instructorUsers = data.filter(u =>
                u.role === 'instructor' || u.instructorApplicationDate
            );
            setInstructors(instructorUsers);
        } catch (error) {
            console.error('Error fetching instructors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (userId, approve) => {
        try {
            await api.put(`/admin/users/${userId}/role`, {
                role: approve ? 'instructor' : 'student'
            });
            await fetchInstructors();
            alert(`Instructor application ${approve ? 'approved' : 'rejected'}!`);
        } catch (error) {
            console.error('Error updating instructor status:', error);
            alert('Failed to update instructor status');
        }
    };

    const filteredInstructors = instructors.filter(instructor => {
        const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instructor.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'pending') {
            return matchesSearch && instructor.instructorApplicationDate && !instructor.isInstructorApproved;
        } else if (filter === 'approved') {
            return matchesSearch && instructor.isInstructorApproved;
        }
        return matchesSearch;
    });

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading instructor applications...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Instructor Approvals</h1>
                <div className="flex items-center gap-2 text-dark-muted">
                    <UserCheck size={20} />
                    <span>{filteredInstructors.length} applications</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search instructors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-layer1 border border-dark-layer2 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-primary focus:outline-none"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-dark-layer1 border border-dark-layer2 rounded-lg px-4 py-3 text-white focus:border-brand-primary focus:outline-none"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="all">All</option>
                </select>
            </div>

            {/* Instructors List */}
            <div className="grid gap-4">
                {filteredInstructors.map(instructor => (
                    <div key={instructor._id} className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-xl">{instructor.name.charAt(0).toUpperCase()}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-white">{instructor.name}</h3>
                                        {instructor.isInstructorApproved ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                                Pending
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-dark-muted text-sm mb-3">
                                        <Mail size={14} />
                                        <span>{instructor.email}</span>
                                    </div>

                                    {instructor.instructorProfile && (
                                        <div className="space-y-2 text-sm">
                                            {instructor.instructorProfile.headline && (
                                                <p className="text-white font-medium">{instructor.instructorProfile.headline}</p>
                                            )}
                                            {instructor.instructorProfile.expertise?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {instructor.instructorProfile.expertise.slice(0, 5).map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-dark-layer2 text-dark-muted rounded text-xs">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {instructor.instructorApplicationDate && (
                                        <div className="flex items-center gap-2 text-dark-muted text-xs mt-3">
                                            <Clock size={12} />
                                            <span>Applied: {new Date(instructor.instructorApplicationDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!instructor.isInstructorApproved && instructor.instructorApplicationDate && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApproval(instructor._id, true)}
                                        className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                        title="Approve"
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleApproval(instructor._id, false)}
                                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                        title="Reject"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredInstructors.length === 0 && (
                <div className="text-center text-dark-muted py-10">
                    No instructor applications found.
                </div>
            )}
        </div>
    );
};

export default InstructorApprovals;
