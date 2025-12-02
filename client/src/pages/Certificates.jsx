import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Award, Download, CheckCircle } from 'lucide-react';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            const { data } = await api.get(`/certificates/user/${userId}`);
            setCertificates(data);
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white text-center">Loading certificates...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Award size={32} className="text-brand-primary" />
                <h1 className="text-3xl font-bold text-white">My Certificates</h1>
            </div>

            {certificates.length === 0 ? (
                <div className="bg-dark-layer1 p-12 rounded-lg border border-dark-layer2 text-center">
                    <Award size={48} className="text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">You haven't earned any certificates yet</p>
                    <p className="text-dark-muted text-sm mt-2">Complete courses to earn certificates!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map(cert => (
                        <div
                            key={cert._id}
                            className="bg-gradient-to-br from-brand-primary/10 to-purple-600/10 border-2 border-brand-primary/30 rounded-lg p-6 hover:border-brand-primary transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Award size={40} className="text-brand-primary" />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            Certificate of Completion
                                        </h3>
                                        <p className="text-sm text-dark-muted">
                                            {new Date(cert.issueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <CheckCircle size={24} className="text-green-500" />
                            </div>

                            <div className="mb-4">
                                <p className="text-2xl font-bold text-white mb-2">
                                    {cert.courseId?.title}
                                </p>
                                <p className="text-brand-primary font-mono text-sm">
                                    Certificate ID: {cert.certificateCode}
                                </p>
                            </div>

                            <button className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                                <Download size={18} />
                                Download Certificate
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Certificates;
