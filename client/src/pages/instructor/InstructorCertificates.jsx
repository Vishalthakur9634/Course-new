import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Award, Download, Calendar, Search, Filter, Loader2, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const InstructorCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const { data } = await api.get('/instructor-admin/certificates');
            setCertificates(data);
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCertificates = certificates.filter(cert =>
        cert.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.courseId?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = async (cert) => {
        // Create a temporary certificate element
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '1000px';
        tempDiv.style.height = '600px';
        tempDiv.style.background = '#0a0a0a';
        tempDiv.style.color = 'white';
        tempDiv.style.padding = '40px';
        tempDiv.style.border = '20px solid #d4af37'; // Gold border
        tempDiv.style.textAlign = 'center';
        tempDiv.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'serif';">
                <h1 style="color: #d4af37; font-size: 60px; margin-bottom: 20px;">Certificate of Completion</h1>
                <p style="font-size: 24px; margin-bottom: 30px;">This gets awarded to</p>
                <h2 style="font-size: 48px; border-bottom: 2px solid #d4af37; padding-bottom: 10px; margin-bottom: 30px;">${cert.userId?.name}</h2>
                <p style="font-size: 24px;">For successfully completing the course</p>
                <h3 style="font-size: 36px; margin: 20px 0; color: #d4af37;">${cert.courseId?.title}</h3>
                <div style="margin-top: 50px; display: flex; justify-content: space-between; width: 100%; padding: 0 50px;">
                    <div>
                        <p style="border-top: 1px solid white; padding-top: 10px; width: 200px;">Instructor</p>
                    </div>
                    <div>
                        <p style="border-top: 1px solid white; padding-top: 10px; width: 200px;">Date: ${new Date(cert.issueDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <p style="margin-top: 20px; font-size: 14px; opacity: 0.7;">ID: ${cert.certificateNumber}</p>
            </div>
        `;
        document.body.appendChild(tempDiv);

        try {
            const canvas = await html2canvas(tempDiv);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.save(`Certificate-${cert.certificateNumber}.pdf`);
        } catch (err) {
            console.error('Download error', err);
            alert('Error downloading certificate');
        } finally {
            document.body.removeChild(tempDiv);
        }
    };

    return (
        <div className="p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Issued Certificates</h1>
                    <p className="text-dark-muted mt-2">Manage and view certificates awarded to your students</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                    <input
                        className="bg-dark-layer1 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-dark-muted focus:border-brand-primary outline-none min-w-[300px]"
                        placeholder="Search student, course, or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-dark-muted"><Loader2 className="animate-spin inline mr-2" /> Loading data...</div>
            ) : filteredCertificates.length === 0 ? (
                <div className="text-center py-20 bg-dark-layer1 border border-white/10 rounded-3xl">
                    <Award size={48} className="mx-auto text-dark-muted opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Certificates Issued Yet</h3>
                    <p className="text-dark-muted mt-2">Certificates will appear here once students complete your courses.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCertificates.map(cert => (
                        <div key={cert._id} className="bg-dark-layer1 border border-white/10 rounded-3xl p-6 group hover:border-brand-primary/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-all" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-dark-bg">
                                        <Award size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold truncate">{cert.courseId?.title}</h3>
                                        <p className="text-xs text-dark-muted mono mt-1">ID: {cert.certificateNumber}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-dark-layer2 flex items-center justify-center flex-shrink-0">
                                            {cert.userId?.avatar ? (
                                                <img src={cert.userId.avatar} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User size={14} className="text-dark-muted" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-dark-muted uppercase font-bold tracking-wider">Student</p>
                                            <p className="text-sm text-white font-bold">{cert.userId?.name || 'Unknown User'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-dark-layer2 flex items-center justify-center flex-shrink-0">
                                            <Calendar size={14} className="text-dark-muted" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-dark-muted uppercase font-bold tracking-wider">Issued On</p>
                                            <p className="text-sm text-white font-bold">{new Date(cert.issueDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownload(cert)}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-brand-primary font-bold flex items-center justify-center gap-2 transition-all mt-auto"
                                >
                                    <Download size={18} /> Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstructorCertificates;
