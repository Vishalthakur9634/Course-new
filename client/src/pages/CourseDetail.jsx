import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import VideoPlayer from '../components/VideoPlayer';
import CourseSidebar from '../components/CourseSidebar';
import VideoTabs from '../components/VideoTabs';
import Reviews from '../components/Reviews';
import PaymentModal from '../components/PaymentModal';
import { Menu, X, Lock, PlayCircle, ShieldCheck, Heart, Check, Share2 } from 'lucide-react';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progressMap, setProgressMap] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [videoTime, setVideoTime] = useState(0);

    // Access Control State
    const [hasAccess, setHasAccess] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userObj = JSON.parse(userStr);
            setCurrentUser(userObj);
            checkWishlistStatus(userObj.id || userObj._id);
        }

        // Capture Referral Code
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
            localStorage.setItem('currentReferral', refCode);
            // Optionally count clicks here via API
        }

        fetchCourseData();
    }, [id]);

    const checkWishlistStatus = async (userId) => {
        try {
            const { data } = await api.get(`/users/${userId}/wishlist`);
            const inWishlist = data.some(c => c._id === id);
            setIsWishlisted(inWishlist);
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const toggleWishlist = async () => {
        if (!currentUser) {
            alert('Please login to add to wishlist');
            return;
        }

        try {
            const userId = currentUser.id || currentUser._id;
            const { data } = await api.post(`/users/${userId}/wishlist/${id}`);
            setIsWishlisted(data.action === 'added');
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    const fetchCourseData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);
            const userId = user.id || user._id;

            const [courseRes, userRes] = await Promise.all([
                api.get(`/courses/${id}`),
                api.get(`/users/profile/${userId}`)
            ]);

            setCourse(courseRes.data);

            // Check Access: Admin OR Enrolled OR Instructor (Owner)
            const isEnrolled = userRes.data.enrolledCourses?.some(enrollment => {
                const courseId = enrollment.courseId?._id || enrollment.courseId;
                return courseId === id;
            });
            const isAdmin = user.role === 'superadmin';
            const isOwner = courseRes.data.instructorId?._id === userId || courseRes.data.instructorId === userId;

            if (isAdmin || isEnrolled || isOwner) {
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
        const completed = (currentTime / duration) > 0.8; // Reduced to 80% for better UX

        try {
            setVideoTime(currentTime);
            const userId = JSON.parse(localStorage.getItem('user')).id;
            await api.put(`/enrollment/${course._id}/progress`, {
                videoId: activeVideo._id,
                progress: currentTime, // Send raw time or %? Backend expects 'progress' but treats it as value to store in watchHistory. Enrollment uses it for completedVideos logic if 'completed' is true. 
                // enrollment.js: const { videoId, progress, timeSpent, completed } = req.body;
                // It pushes completedVideos if completed is true.
                completed,
                timeSpent: 5 // approx
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
        <div className="flex h-full overflow-hidden bg-dark-bg relative rounded-xl border border-white/5">
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
                    className="bg-black w-full relative flex-shrink-0 flex items-center justify-center md:h-[60vh] aspect-video md:aspect-auto"
                    style={{ height: window.innerWidth >= 768 ? `${videoHeight}vh` : 'auto' }}
                >
                    {hasAccess ? (
                        activeVideo ? (
                            <VideoPlayer
                                src={`/${activeVideo.videoUrl.replace(/\\/g, '/').replace(/^\/+/, '')}`}
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

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="flex-1 bg-brand-primary hover:bg-brand-hover text-white font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-primary/25"
                                    >
                                        Buy Now
                                    </button>
                                    <button
                                        onClick={toggleWishlist}
                                        className={`px-4 rounded-xl border-2 transition-colors flex items-center justify-center ${isWishlisted
                                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                            : 'border-dark-layer2 hover:border-white text-white'
                                            }`}
                                    >
                                        <Heart size={24} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const shareId = currentUser?.referralCode || currentUser?.id || currentUser?._id;
                                            const shareLink = `${window.location.origin}/course/${course._id}${shareId ? `?ref=${shareId}` : ''}`;
                                            navigator.clipboard.writeText(shareLink);
                                            alert('Signal Propagation: Course link copied to clipboard!');
                                        }}
                                        className="px-4 rounded-xl border-2 border-dark-layer2 hover:border-brand-primary hover:text-brand-primary text-white transition-colors flex items-center justify-center gap-2"
                                        title="Share Course"
                                    >
                                        <Share2 size={24} />
                                    </button>
                                </div>

                                <p className="mt-4 text-xs text-dark-muted flex items-center justify-center gap-1">
                                    <ShieldCheck size={14} /> 30-Day Money-Back Guarantee
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vertical Resizer Handle (Desktop Only) */}
                <div
                    className="hidden md:block h-1 bg-dark-layer2 hover:bg-brand-primary cursor-row-resize transition-colors w-full z-10"
                    onMouseDown={startResizingVideo}
                />

                {/* Tabs & Instructor Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {hasAccess ? (
                        <>
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    {activeVideo && (
                                        <VideoTabs
                                            video={activeVideo}
                                            course={course}
                                            currentTime={videoTime}
                                        />
                                    )}

                                    {/* Course Progress Bar */}
                                    <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-white font-bold">Course Progress</h3>
                                            <span className="text-brand-primary font-bold">
                                                {Math.round((Object.values(progressMap).filter(p => p.completed).length / course.videos.length) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-dark-layer2 rounded-full h-3">
                                            <div
                                                className="bg-brand-primary h-3 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${(Object.values(progressMap).filter(p => p.completed).length / course.videos.length) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-dark-muted text-sm mt-2">
                                            {Object.values(progressMap).filter(p => p.completed).length} of {course.videos.length} lessons completed
                                        </p>
                                    </div>

                                    {/* Instructor Section */}
                                    {course.instructorId && (
                                        <div className="bg-dark-layer1 border border-dark-layer2 rounded-xl p-6">
                                            <h3 className="text-xl font-bold text-white mb-4">Course Provider</h3>
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
                            <div className="mt-1 flex-shrink-0">
                                {hasAccess ? (
                                    activeVideo?._id === video._id ? (
                                        <PlayCircle size={16} className="text-brand-primary" />
                                    ) : progressMap[video._id]?.completed ? (
                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                            <Check size={12} className="text-white" strokeWidth={4} />
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-dark-muted" />
                                    )
                                ) : (
                                    <Lock size={16} className="text-dark-muted" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-medium ${activeVideo?._id === video._id ? 'text-brand-primary' : 'text-white'}`}>
                                    {index + 1}. {video.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-dark-muted">{video.duration || '10:00'}</p>
                                    {progressMap[video._id]?.completed && (
                                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Completed</span>
                                    )}
                                </div>
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
        </div>
    );
};

export default CourseDetail;
