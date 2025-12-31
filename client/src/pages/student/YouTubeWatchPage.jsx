import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import VideoPlayer from '../../components/VideoPlayer';
import VideoTabs from '../../components/VideoTabs';
import {
    ThumbsUp, ThumbsDown, Share2, Save, MoreHorizontal,
    ChevronDown, ChevronUp, Bell, MessageSquare,
    Share, Flag, Scissors, Download, Eye, Calendar,
    Menu, X, Play, Clock, CheckCircle, Lock, Award, Sparkles
} from 'lucide-react';

const YouTubeWatchPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [progressMap, setProgressMap] = useState({});
    const [recommendations, setRecommendations] = useState([]);

    // Auth context
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchData();
        fetchRecommendations();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/courses/${id}`);
            setCourse(data);
            if (data.videos?.length > 0) {
                // Find first unwatched or last watched video
                setActiveVideo(data.videos[0]);
            }
            // Fetch likes/engagement here if needed
            setLikes(Math.floor(Math.random() * 5000)); // Demo data
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const { data } = await api.get('/courses');
            setRecommendations(data.filter(c => c._id !== id).slice(0, 8));
        } catch (err) {
            console.error(err);
        }
    };

    const handleVideoSelect = (video) => {
        setActiveVideo(video);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading || !course) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white font-black uppercase tracking-widest text-xs">Loading Theater...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <div className={`mx-auto ${isTheaterMode ? 'w-full' : 'max-w-[1700px] px-4 md:px-8 py-4 md:py-6'}`}>
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Primary Content (Player & Info) */}
                    <div className={`${isTheaterMode ? 'w-full' : 'lg:w-[70%]'} flex flex-col gap-4`}>
                        {/* Video Player Container */}
                        <div className={`relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ${isTheaterMode ? 'rounded-none' : ''}`}>
                            {activeVideo ? (
                                <VideoPlayer
                                    src={activeVideo.url}
                                    poster={course.thumbnail}
                                    onProgress={(p) => console.log('Progress:', p)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Lock size={48} className="text-white/20" />
                                </div>
                            )}
                        </div>

                        {/* Video Info Section */}
                        <div className={`flex flex-col gap-3 ${isTheaterMode ? 'px-4 md:px-8' : ''}`}>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                                {activeVideo?.title || course.title}
                            </h1>

                            {/* Engagement Bar */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Link to={`/instructor/profile/${course.instructorId?._id}`} className="flex items-center gap-3 group">
                                        <div className="w-10 h-10 rounded-full bg-brand-primary overflow-hidden border border-white/10">
                                            {course.instructorId?.avatar ? (
                                                <img src={course.instructorId.avatar} className="w-full h-full object-cover" alt={course.instructorId.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold">{course.instructorId?.name?.[0]}</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm hover:text-brand-primary transition-colors">{course.instructorId?.name || "Expert Instructor"}</p>
                                            <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">2.4M Explorers</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => setIsSubscribed(!isSubscribed)}
                                        className={`ml-4 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${isSubscribed ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-dark-bg hover:bg-gray-200'}`}
                                    >
                                        {isSubscribed ? 'Enrolled' : 'Enroll Now'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                                    <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/5">
                                        <button
                                            onClick={() => setIsLiked(!isLiked)}
                                            className={`flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-l-full transition-colors border-r border-white/10 ${isLiked ? 'text-brand-primary' : ''}`}
                                        >
                                            <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
                                            <span className="text-xs font-bold">{likes}</span>
                                        </button>
                                        <button className="px-4 py-2 hover:bg-white/10 rounded-r-full transition-colors">
                                            <ThumbsDown size={18} />
                                        </button>
                                    </div>

                                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors font-bold text-xs uppercase tracking-widest border border-white/5">
                                        <Share2 size={18} /> Share
                                    </button>

                                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors font-bold text-xs uppercase tracking-widest border border-white/5">
                                        <Save size={18} /> Save
                                    </button>

                                    <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/5">
                                        <MoreHorizontal size={18} />
                                    </button>

                                    <button
                                        onClick={() => setIsTheaterMode(!isTheaterMode)}
                                        className="hidden lg:flex p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/5"
                                        title="Theater Mode"
                                    >
                                        <Layout size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Description Box */}
                            <div className="bg-white/5 hover:bg-white/[0.07] rounded-xl p-4 transition-all cursor-pointer group" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                                <div className="flex items-center gap-4 text-sm font-bold mb-2">
                                    <span className="flex items-center gap-1"><Eye size={14} /> 1.2M views</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(course.createdAt).toLocaleDateString()}</span>
                                    <span className="text-brand-primary">#OrbitLearning #Mastery</span>
                                </div>
                                <div className={`text-sm text-gray-200 leading-relaxed whitespace-pre-wrap ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                                    {activeVideo?.description || course.description}
                                    {isDescriptionExpanded && (
                                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                            <h4 className="font-black uppercase tracking-widest text-[10px] text-brand-primary">Curriculum Highlights</h4>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {course.videos.map((v, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-dark-muted">
                                                        <CheckCircle size={14} className="text-brand-primary" /> {v.title}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <button className="mt-2 text-xs font-black uppercase tracking-widest hover:text-brand-primary transition-colors">
                                    {isDescriptionExpanded ? 'Show less' : '...more'}
                                </button>
                            </div>

                            {/* Comments Section */}
                            <div className="mt-4">
                                <VideoTabs video={activeVideo} course={course} currentTime={0} />
                            </div>
                        </div>
                    </div>

                    {/* Secondary Content (Sidebar) */}
                    <div className={`${isTheaterMode ? 'w-full lg:w-[28%] mt-8 lg:mt-0' : 'lg:w-[30%]'} flex flex-col gap-6`}>
                        {/* Course Curriculum Sidebar */}
                        <div className="bg-dark-layer1 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <h3 className="font-black text-xs uppercase tracking-widest text-brand-primary">Course Strategy</h3>
                                <span className="text-[10px] font-bold text-dark-muted uppercase">{course.videos.length} SEGMENTS</span>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                {course.videos.map((v, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleVideoSelect(v)}
                                        className={`w-full flex gap-3 p-3 hover:bg-white/5 transition-all group ${activeVideo?._id === v._id ? 'bg-brand-primary/10' : ''}`}
                                    >
                                        <div className="relative flex-shrink-0 w-32 aspect-video bg-dark-layer2 rounded-lg overflow-hidden border border-white/10">
                                            <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play size={16} fill="white" />
                                            </div>
                                            <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-black px-1.5 py-0.5 rounded">
                                                12:45
                                            </div>
                                            {activeVideo?._id === v._id && (
                                                <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                                                    <div className="flex gap-0.5 items-end h-4">
                                                        <div className="w-1 bg-brand-primary animate-bounce [animation-delay:0.1s]"></div>
                                                        <div className="w-1 bg-brand-primary animate-bounce [animation-delay:0.3s]"></div>
                                                        <div className="w-1 bg-brand-primary animate-bounce [animation-delay:0.2s]"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col text-left min-w-0">
                                            <h4 className={`text-xs font-black line-clamp-2 leading-tight ${activeVideo?._id === v._id ? 'text-brand-primary' : 'group-hover:text-brand-primary transition-colors'}`}>
                                                {v.title}
                                            </h4>
                                            <p className="text-[9px] text-dark-muted font-bold mt-1 uppercase tracking-widest">{course.instructorId?.name}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-dark-muted mt-0.5">
                                                <span>4.2K views</span>
                                                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                                <span>2 days ago</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation Wall */}
                        <div className="space-y-4">
                            <h3 className="font-black text-xs uppercase tracking-widest text-brand-primary flex items-center gap-2">
                                <Sparkles size={14} /> Recommended Frontiers
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {recommendations.map((rec, i) => (
                                    <Link
                                        to={`/course/${rec._id}`}
                                        key={i}
                                        className="flex gap-3 group animate-in slide-in-from-bottom-2"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className="w-32 aspect-video rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                                            <img src={rec.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rec.title} />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <div className="flex flex-col min-w-0 pt-0.5">
                                            <h4 className="text-xs font-black line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">{rec.title}</h4>
                                            <p className="text-[9px] text-dark-muted font-bold mt-1 uppercase tracking-widest">{rec.instructorId?.name || "Expert Explorer"}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white font-black uppercase tracking-tighter">Premium</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default YouTubeWatchPage;
