import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import VideoPlayer from '../../components/VideoPlayer';
import VideoTabs from '../../components/VideoTabs';
import {
    Play, CheckCircle, Lock, Layout, Menu, X, ChevronRight,
    BookOpen, GraduationCap, ChevronDown, List, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const YouTubeWatchPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [completedVideos, setCompletedVideos] = useState([]);

    useEffect(() => {
        fetchData();
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const accessRes = await api.get(`/enrollment/${id}/access`);
            if (!accessRes.data.hasAccess) {
                navigate(`/course/${id}`);
                return;
            }

            const { data } = await api.get(`/courses/${id}`);
            setCourse(data);
            if (data.videos?.length > 0) {
                setActiveVideo(data.videos[0]);
            }
            try {
                const progressRes = await api.get(`/enrollment/${id}`);
                // Extract completed videos from enrollment progress
                const completed = progressRes.data.progress
                    ?.filter(p => p.completed)
                    .map(p => p.videoId) || [];
                setCompletedVideos(completed);
                console.log('Loaded completed videos:', completed);
            } catch (e) {
                console.log('Progress fetch failed:', e);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            if (error.response?.status === 403) {
                navigate(`/course/${id}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVideoSelect = (video) => {
        setActiveVideo(video);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading || !course) return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                <p className="text-xs font-medium text-dark-muted uppercase tracking-widest">Loading Course...</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden font-inter">
            {/* HEADER */}
            <header className="h-16 bg-[#141414] border-b border-white/5 flex items-center justify-between px-6 z-50 shadow-lg">
                <div className="flex items-center gap-4">
                    <Link
                        to="/my-learning"
                        className="p-2 hover:bg-white/5 rounded-lg transition-all text-dark-muted hover:text-white"
                        title="Back to Learning"
                    >
                        <ChevronRight size={20} className="rotate-180" />
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-1" />
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold text-white line-clamp-1">{course.title}</h1>
                        <p className="text-[10px] text-brand-primary font-medium uppercase tracking-wider opacity-80">
                            {course.instructorId?.name || "Instructor"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`px-4 py-2 rounded-lg border text-[11px] font-semibold tracking-wide transition-all flex items-center gap-2 ${isSidebarOpen
                            ? 'bg-brand-primary text-dark-bg border-brand-primary shadow-md'
                            : 'bg-transparent text-white border-white/10 hover:border-white/20'}`}
                    >
                        {isSidebarOpen ? <X size={16} /> : <List size={16} />}
                        <span>Course Content</span>
                    </button>
                </div>
            </header>

            {/* MAIN WORKSPACE INTEGRATION */}
            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0a0a0a]">
                    {/* PLAYER */}
                    <div className="w-full bg-black/20 p-4 lg:p-8">
                        <div className="max-w-7xl mx-auto w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5 relative">
                            {activeVideo ? (
                                <VideoPlayer
                                    src={activeVideo.videoUrl}
                                    poster={course.thumbnail}
                                    onProgress={async (currentTime, duration, isGenuineComplete) => {
                                        // Update progress every time this is called (every 5 seconds from VideoPlayer)
                                        if (currentTime && duration) {
                                            const progressPercent = (currentTime / duration) * 100;

                                            // Mark as complete if watched 90% or more
                                            if (progressPercent >= 90 && !completedVideos.includes(activeVideo._id)) {
                                                // Will be marked complete via progress endpoint
                                                setCompletedVideos([...completedVideos, activeVideo._id]);
                                                console.log('✅ Video completed:', activeVideo.title);
                                            }

                                            // Save progress periodically
                                            try {
                                                await api.put(`/enrollment/${course._id}/progress`, {
                                                    videoId: activeVideo._id,
                                                    progress: currentTime,
                                                    completed: progressPercent >= 90,
                                                    timeSpent: 5
                                                });
                                            } catch (error) {
                                                console.error('Error saving progress:', error);
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-dark-muted">
                                    <Play size={48} className="opacity-20" />
                                    <p className="text-xs font-medium uppercase tracking-widest opacity-40">Select a video to start</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 bg-[#0a0a0a] w-full">
                        <div className="w-full">
                            <VideoTabs
                                video={activeVideo || {}}
                                course={course}
                                currentTime={0}
                                dashboardOverhaulInProgress={true}
                            />
                        </div>
                    </div>
                </div>

                {/* SIDEBAR */}
                <aside
                    className={`fixed inset-y-0 right-0 w-80 lg:w-[380px] bg-[#141414] border-l border-white/5 transform transition-all duration-500 ease-in-out z-[60] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden opacity-0'}`}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-white/5 bg-[#0a0a0a]/20">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                                    <List size={16} className="text-brand-primary" />
                                    Course Content
                                </h3>
                                <span className="text-[10px] font-medium text-dark-muted uppercase px-2 py-1 bg-white/5 rounded border border-white/5">
                                    {course.videos?.length || 0} Videos
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-medium uppercase text-dark-muted tracking-wider">Progress</p>
                                    <p className="text-sm font-bold text-white">
                                        {Math.round((completedVideos.length / (course.videos?.length || 1)) * 100)}%
                                    </p>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-brand-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(completedVideos.length / (course.videos?.length || 1)) * 100}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#141414]">
                            {course.videos?.map((video, idx) => {
                                const isActive = activeVideo?._id === video._id;
                                const isCompleted = completedVideos.includes(video._id);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleVideoSelect(video)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border ${isActive
                                            ? 'bg-brand-primary/10 border-brand-primary/30'
                                            : 'bg-[#0a0a0a]/20 border-transparent hover:bg-white/5'}`}
                                    >
                                        <div className="shrink-0">
                                            {isActive ? (
                                                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg">
                                                    <Play size={14} className="text-dark-bg ml-0.5 fill-current" />
                                                </div>
                                            ) : isCompleted ? (
                                                <CheckCircle size={20} className="text-green-500" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[11px] font-medium text-dark-muted">
                                                    {idx + 1}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-[13px] font-medium truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
                                                {video.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1 text-[9px] text-dark-muted opacity-60">
                                                    <Clock size={10} />
                                                    <span>12:45</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default YouTubeWatchPage;
