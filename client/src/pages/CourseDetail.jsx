import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import VideoPlayer from '../components/VideoPlayer';
import CourseSidebar from '../components/CourseSidebar';
import VideoTabs from '../components/VideoTabs';
import { Menu, X } from 'lucide-react';

const CourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progressMap, setProgressMap] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            const [courseRes, userRes] = await Promise.all([
                api.get(`/courses/${id}`),
                api.get(`/users/profile/${userId}`)
            ]);

            setCourse(courseRes.data);
            if (courseRes.data.videos.length > 0) {
                setActiveVideo(courseRes.data.videos[0]);
            }

            // Map progress
            const progress = {};
            userRes.data.watchHistory.forEach(h => {
                progress[h.videoId._id] = h;
            });
            setProgressMap(progress);

        } catch (error) {
            console.error('Error fetching course details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoSelect = (video) => {
        setActiveVideo(video);
        // Mobile: Close sidebar on select
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleProgress = async (currentTime, duration) => {
        if (!activeVideo || !course) return;

        const progress = currentTime;
        const completed = (currentTime / duration) > 0.9; // 90% watched = completed

        try {
            const userId = JSON.parse(localStorage.getItem('user')).id;
            await api.post('/users/progress', {
                userId,
                videoId: activeVideo._id,
                courseId: course._id,
                progress,
                completed
            });

            // Update local state
            setProgressMap(prev => ({
                ...prev,
                [activeVideo._id]: { ...prev[activeVideo._id], completed }
            }));
        } catch (error) {
            console.error('Error saving progress', error);
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading course...</div>;
    if (!course) return <div className="text-center mt-10 text-white">Course not found</div>;

    return (
        <div className="flex h-[calc(100vh-80px)] -m-4 md:-m-8 overflow-hidden bg-dark-bg">
            {/* Main Content (Video + Tabs) */}
            {/* Main Content (Video + Tabs) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Video Player Area */}
                <div className="bg-black w-full relative h-[60vh] flex-shrink-0">
                    {activeVideo ? (
                        <VideoPlayer
                            src={`http://localhost:5001${activeVideo.videoUrl}`}
                            poster={activeVideo.thumbnailUrl}
                            onProgress={handleProgress}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white">Select a video to start learning</div>
                    )}
                </div>

                {/* Tabs Area (Below Video) */}
                <div className="flex-1 overflow-hidden p-4">
                    {activeVideo && <VideoTabs video={activeVideo} course={course} />}
                </div>
            </div>

            {/* Sidebar (Playlist) */}
            <div className={`fixed inset-y-0 right-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <CourseSidebar
                    course={course}
                    activeVideo={activeVideo}
                    onVideoSelect={handleVideoSelect}
                    progressMap={progressMap}
                />

                {/* Mobile Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden absolute top-4 -left-12 bg-dark-layer1 text-white p-2 rounded-l-lg border-y border-l border-dark-layer2"
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </div>
    );
};

export default CourseDetail;
