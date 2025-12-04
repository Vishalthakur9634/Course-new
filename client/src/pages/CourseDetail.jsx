import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import VideoPlayer from '../components/VideoPlayer';
import CourseSidebar from '../components/CourseSidebar';
import VideoTabs from '../components/VideoTabs';
import Reviews from '../components/Reviews';
import PaymentModal from '../components/PaymentModal';
import { Menu, X, Lock, PlayCircle, ShieldCheck } from 'lucide-react';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progressMap, setProgressMap] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Access Control State
    const [hasAccess, setHasAccess] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);
            const userId = user.id;

            const [courseRes, userRes] = await Promise.all([
                api.get(`/courses/${id}`),
                api.get(`/users/profile/${userId}`)
            ]);

            setCourse(courseRes.data);

            // Check Access: Admin OR Enrolled
            const isEnrolled = userRes.data.enrolledCourses?.some(enrollment => {
                const courseId = enrollment.courseId?._id || enrollment.courseId;
                return courseId === id;
            });
            const isAdmin = user.role === 'superadmin';

            if (isAdmin || isEnrolled) {
                setHasAccess(true);
                if (courseRes.data.videos.length > 0) {
                    setActiveVideo(courseRes.data.videos[0]);
                }
            }

            // Map progress
            const progress = {};
            if (userRes.data.watchHistory) {
                userRes.data.watchHistory.forEach(h => {
                    if (h.videoId) progress[h.videoId._id || h.videoId] = h;
                });
            }
            setProgressMap(progress);

        } catch (error) {
            console.error('Error fetching course details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoSelect = (video) => {
        if (!hasAccess) return;
        setActiveVideo(video);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleProgress = async (currentTime, duration) => {
        if (!activeVideo || !course || !hasAccess) return;

        const progress = currentTime;
        const completed = (currentTime / duration) > 0.9;

        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            await api.post('/users/progress', {
                userId,
                videoId: activeVideo._id,
                courseId: course._id,
                progress,
                completed
            });

            setProgressMap(prev => ({
                ...prev,
                [activeVideo._id]: { ...prev[activeVideo._id], completed }
            }));
        } catch (error) {
            console.error('Error saving progress', error);
        }
    };

    const handlePurchaseSuccess = () => {
        setHasAccess(true);
        fetchCourseData(); // Refresh to get updated state
    };

    // Resizable Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);

    // Resizable Video Player State
    const [videoHeight, setVideoHeight] = useState(60); // vh
    const [isResizingVideo, setIsResizingVideo] = useState(false);

    const startResizingSidebar = (e) => {
        setIsResizingSidebar(true);
    };

    const startResizingVideo = (e) => {
        setIsResizingVideo(true);
    };

    const stopResizing = () => {
        setIsResizingSidebar(false);
        setIsResizingVideo(false);
    };

    const resize = (e) => {
        if (isResizingSidebar) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 200 && newWidth < 600) {
                setSidebarWidth(newWidth);
            }
        }
        if (isResizingVideo) {
            const newHeight = (e.clientY / window.innerHeight) * 100;
            if (newHeight > 30 && newHeight < 85) {
                setVideoHeight(newHeight);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizingSidebar, isResizingVideo]);

    if (loading) return <div className="text-center mt-10 text-white">Loading course...</div>;
    if (!course) return <div className="text-center mt-10 text-white">Course not found</div>;

    return (
        <div className="flex h-[calc(100vh-80px)] -m-4 md:-m-8 overflow-hidden bg-dark-bg relative">
            {showPaymentModal && (
                <PaymentModal
                    course={course}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePurchaseSuccess}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0" style={{ marginRight: sidebarOpen ? 0 : 0 }}>
                {/* Video Player Area */}
                <div
                    className="bg-black w-full relative flex-shrink-0 flex items-center justify-center"
                    style={{ height: `${videoHeight}vh` }}
                >
                    {hasAccess ? (
                        activeVideo ? (
                            <VideoPlayer
                                src={`http://localhost:5001${activeVideo.videoUrl}`}
                                poster={activeVideo.thumbnailUrl}
                                onProgress={handleProgress}
                            />
                        ) : (
                            <div className="text-white">Select a video to start learning</div>
                        )
                    ) : (
                        // Locked State / Paywall
                        <div className="absolute inset-0 bg-dark-layer1/90 flex flex-col items-center justify-center p-8 text-center bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
                            <div className="bg-black/80 p-8 rounded-2xl backdrop-blur-md border border-brand-primary/30 max-w-lg w-full">
                                <Lock size={48} className="text-brand-primary mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Unlock This Course</h2>
                                <p className="text-dark-muted mb-6">Get full access to all videos, resources, and certification.</p>

                                <div className="flex items-center justify-center gap-4 mb-8">
                                    <div className="text-left">
                                        <p className="text-sm text-dark-muted">One-time payment</p>
                                        <p className="text-4xl font-bold text-white">${course.price}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-primary/25"
                                >
                                    Buy Now
                                </button>

                                <p className="mt-4 text-xs text-dark-muted flex items-center justify-center gap-1">
                                    <ShieldCheck size={14} /> 30-Day Money-Back Guarantee
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vertical Resizer Handle */}
                <div
                    className="h-1 bg-dark-layer2 hover:bg-brand-primary cursor-row-resize transition-colors w-full z-10"
                    onMouseDown={startResizingVideo}
                />

                {/* Tabs & Instructor Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {hasAccess ? (
                        <>
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    {activeVideo && <VideoTabs video={activeVideo} course={course} />}

                                    {/* Instructor Section */}
                                    {course.instructorId && (
                                        <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                                            <h3 className="text-xl font-bold text-white mb-4">Instructor</h3>
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                                    {course.instructorId.avatar ? (
                                                        <img src={course.instructorId.avatar} alt={course.instructorId.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        course.instructorId.name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-bold text-white">{course.instructorId.name}</h4>
                                                    {course.instructorId.instructorProfile?.headline && (
                                                        <p className="text-brand-primary text-sm mb-2">{course.instructorId.instructorProfile.headline}</p>
                                                    )}
                                                    <p className="text-dark-muted text-sm line-clamp-2 mb-3">{course.instructorId.bio || 'No bio available.'}</p>
                                                    <button
                                                        onClick={() => navigate(`/instructor/profile/${course.instructorId._id}`)}
                                                        className="text-white text-sm font-medium hover:text-brand-primary transition-colors"
                                                    >
                                                        View Full Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews Section */}
                                    <div className="mt-6">
                                        <Reviews courseId={id} />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Course Content Locked</h3>
                            <p className="text-dark-muted">Purchase the course to view details and resources.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Resizer Handle */}
            {sidebarOpen && (
                <div
                    className="w-1 bg-dark-layer2 hover:bg-brand-primary cursor-col-resize transition-colors z-50 hidden md:block"
                    onMouseDown={startResizingSidebar}
                />
            )}

            {/* Sidebar (Playlist) */}
            <div
                className={`fixed inset-y-0 right-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out bg-dark-layer1 border-l border-dark-layer2 flex flex-col`}
                style={{ width: sidebarOpen ? (window.innerWidth >= 768 ? sidebarWidth : '100%') : 0 }}
            >
                <div className="p-4 border-b border-dark-layer2 flex justify-between items-center">
                    <h3 className="font-bold text-white">Course Content</h3>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-dark-muted">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {course.videos.map((video, index) => (
                        <div
                            key={video._id}
                            onClick={() => handleVideoSelect(video)}
                            className={`p-4 border-b border-dark-layer2 cursor-pointer transition-colors flex gap-3 ${activeVideo?._id === video._id ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary' : 'hover:bg-dark-layer2'
                                } ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="mt-1">
                                {hasAccess ? (
                                    activeVideo?._id === video._id ? <PlayCircle size={16} className="text-brand-primary" /> : <div className="w-4 h-4 rounded-full border border-dark-muted" />
                                ) : (
                                    <Lock size={16} className="text-dark-muted" />
                                )}
                            </div>
                            <div>
                                <h4 className={`text-sm font-medium ${activeVideo?._id === video._id ? 'text-brand-primary' : 'text-white'}`}>
                                    {index + 1}. {video.title}
                                </h4>
                                <p className="text-xs text-dark-muted mt-1">{video.duration || '10:00'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden absolute top-4 right-4 z-50 bg-dark-layer1 text-white p-2 rounded-lg border border-dark-layer2 shadow-lg"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div >
    );
};

export default CourseDetail;
