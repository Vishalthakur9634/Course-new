import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { DollarSign, TrendingUp, CreditCard, Download, BookOpen } from 'lucide-react';

const InstructorEarnings = () => {
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const { data } = await api.get('/instructor-admin/earnings');
            setEarnings(data);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading earnings...</div>;
    }

    if (!earnings) {
        return <div className="text-center mt-10 text-white">Error loading earnings</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Earnings</h1>

            {/* Earnings Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <DollarSign size={24} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Total Earnings</p>
                            <p className="text-2xl font-bold text-white">${earnings.total?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-full">
                            <CreditCard size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Available</p>
                            <p className="text-2xl font-bold text-white">${earnings.available?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-full">
                            <TrendingUp size={24} className="text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Pending</p>
                            <p className="text-2xl font-bold text-white">${earnings.pending?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-full">
                            <Download size={24} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-dark-muted text-sm">Withdrawn</p>
                            <p className="text-2xl font-bold text-white">${earnings.withdrawn?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings by Course */}
            <div className="bg-dark-layer1 p-6 rounded-lg border border-dark-layer2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-brand-primary" />
                    Earnings by Course
                </h3>

                <div className="space-y-3">
                    {earnings.courseBreakdown?.map(course => (
                        <div key={course.courseId} className="flex items-center justify-between p-4 bg-dark-layer2 rounded">
                            <div>
                                <p className="text-white font-medium">{course.courseTitle}</p>
                                <p className="text-sm text-dark-muted">{course.enrollments} enrollments</p>
                            </div>
                            <p className="text-xl font-bold text-green-400">${course.revenue.toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                {(!earnings.courseBreakdown || earnings.courseBreakdown.length === 0) && (
                    <div className="text-center text-dark-muted py-10">
                        No earnings yet. Create and publish courses to start earning!
                    </div>
                )}
            </div>

            {/* Withdraw Button */}
            <div className="flex justify-end">
                <button
                    disabled={!earnings.available || earnings.available <= 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded transition-colors ${earnings.available && earnings.available > 0
                            ? 'bg-brand-primary hover:bg-brand-hover text-white'
                            : 'bg-dark-layer2 text-dark-muted cursor-not-allowed'
                        }`}
                >
                    <Download size={18} />
                    Withdraw Earnings
                </button>
            </div>
        </div>
    );
};

export default InstructorEarnings;
