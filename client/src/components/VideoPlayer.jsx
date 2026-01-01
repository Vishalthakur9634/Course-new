import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, PictureInPicture } from 'lucide-react';

const VideoPlayer = ({ src, poster, onProgress }) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const containerRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const playPromiseRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentQuality, setCurrentQuality] = useState('Auto');
    const [availableQualities, setAvailableQualities] = useState([]);

    // Initialize HLS or Native Video
    useEffect(() => {
        const video = videoRef.current;
        console.log('VideoPlayer: Initializing with src:', src);
        if (!video || !src) return;

        // Check if source is HLS
        const isHLS = src.includes('.m3u8');

        if (isHLS && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                console.log('HLS Manifest Parsed (Ready to play)', data);
                // Extract quality levels
                const qualities = data.levels.map((level, index) => ({
                    index,
                    height: level.height,
                    label: `${level.height}p`
                }));

                setAvailableQualities([{ index: -1, label: 'Auto' }, ...qualities]);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data.type, data.details, data.fatal, data);
                if (data.details === 'manifestParsingError') {
                    console.warn('HLS Manifest parsing failed. Attempting fallback to native MP4 if available...');
                    // Logic to switch to mp4 if we had that url
                }
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Fatal network error encountered, try to recover');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Fatal media error encountered, try to recover');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error, destroying HLS instance');
                            hls.destroy();
                            break;
                    }
                }
            });

        } else {
            // Native playback (MP4, WebM, or Native HLS on Safari)
            video.src = src;
            video.load();
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [src]);

    // Genuine Watch Tracking
    const [watchedDuration, setWatchedDuration] = useState(0);

    // Progress Tracking
    useEffect(() => {
        if (isPlaying && onProgress) {
            progressIntervalRef.current = setInterval(() => {
                // Interval logic if needed
            }, 1000);
        }
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isPlaying, onProgress]);

    // Dedicated timer for genuine watch time
    useEffect(() => {
        let watchTimer;
        if (isPlaying) {
            watchTimer = setInterval(() => {
                setWatchedDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(watchTimer);
    }, [isPlaying]);

    // Report Progress
    useEffect(() => {
        if (isPlaying && onProgress) {
            const reportTimer = setInterval(() => {
                if (videoRef.current) {
                    const current = videoRef.current.currentTime;
                    const total = videoRef.current.duration;

                    // Genuine Completion Logic: Must watch 60% of duration
                    const isGenuineComplete = (watchedDuration / total) >= 0.6;

                    // Pass extra flag to parent
                    onProgress(current, total, isGenuineComplete);
                }
            }, 5000); // Report every 5 seconds
            return () => clearInterval(reportTimer);
        }
    }, [isPlaying, onProgress, watchedDuration]);

    // Play/Pause
    const togglePlay = async () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            if (playPromiseRef.current) {
                try {
                    await playPromiseRef.current;
                } catch (e) {
                    // Ignore play errors
                }
            }
            video.pause();
            setIsPlaying(false);
            if (onProgress) onProgress(video.currentTime, video.duration);
        } else {
            const playPromise = video.play();
            playPromiseRef.current = playPromise;

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    playPromiseRef.current = null;
                    setIsPlaying(true);
                }).catch(error => {
                    playPromiseRef.current = null;
                    setIsPlaying(false);
                    if (error.name !== 'AbortError') {
                        console.log("Playback interrupted or prevented", error);
                    }
                });
            } else {
                setIsPlaying(true);
            }
        }
    };

    // Update time
    const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime);
    };

    // Update duration
    const handleLoadedMetadata = () => {
        setDuration(videoRef.current.duration);
    };

    // Seek
    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * duration;
    };

    // Volume
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (isMuted) {
            videoRef.current.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            videoRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    // Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // Quality change
    const changeQuality = (qualityIndex) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = qualityIndex;
            const quality = availableQualities.find(q => q.index === qualityIndex);
            setCurrentQuality(quality?.label || 'Auto');
            setShowSettings(false);
        }
    };

    // Playback speed change
    const changeSpeed = (speed) => {
        videoRef.current.playbackRate = speed;
        setPlaybackSpeed(speed);
    };

    // Format time
    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const controlsTimeoutRef = useRef(null);

    const handleMouseEnter = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
    };

    const handleMouseLeave = () => {
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative bg-[#0a0a0a] group w-full h-full font-inter overflow-hidden border border-white/5 shadow-3xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseEnter}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                poster={poster}
            />

            {/* CONTROLS */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-6 px-8 transition-all duration-500 z-50 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
            >
                {/* PROGRESS BAR */}
                <div
                    className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-6 group/progress relative overflow-hidden"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-brand-primary relative rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                    </div>
                </div>

                <div className="flex items-center justify-between text-white">
                    {/* LEFT CONTROLS */}
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} className="translate-x-0.5" />}
                        </button>

                        <div className="flex items-center gap-4">
                            <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <div className="w-24 h-1 bg-white/10 rounded-full relative overflow-hidden group/volume">
                                <div
                                    className="absolute inset-0 bg-brand-primary"
                                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                        </div>

                        <div className="text-[11px] font-medium text-white/60">
                            <span className="text-white">{formatTime(currentTime)}</span>
                            <span className="mx-2">/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* RIGHT CONTROLS */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-3 rounded-2xl transition-all border ${showSettings ? 'bg-brand-primary text-dark-bg border-brand-primary' : 'bg-white/5 border-white/10 text-dark-muted hover:text-white shadow-xl'}`}
                            >
                                <Settings size={22} className={showSettings ? 'rotate-90 transition-transform duration-500' : ''} />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-4 bg-[#141414] border border-white/10 rounded-xl shadow-2xl p-6 min-w-[240px] z-[100]">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Speed</div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {speeds.map(speed => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => changeSpeed(speed)}
                                                        className={`py-1.5 rounded-lg text-[10px] font-medium transition-all border ${playbackSpeed === speed ? 'bg-brand-primary text-dark-bg border-brand-primary' : 'bg-transparent border-white/5 text-white/60 hover:border-white/20'}`}
                                                    >
                                                        {speed}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Quality</div>
                                            <div className="space-y-1">
                                                {availableQualities.map(quality => (
                                                    <button
                                                        key={quality.index}
                                                        onClick={() => changeQuality(quality.index)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium border transition-all ${currentQuality === quality.label ? 'bg-brand-primary text-dark-bg border-brand-primary' : 'bg-transparent border-white/5 text-white/60 hover:border-white/20'}`}
                                                    >
                                                        {quality.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => document.pictureInPictureElement ? document.exitPictureInPicture() : videoRef.current.requestPictureInPicture()}
                            className="text-white/60 hover:text-white transition-all"
                            title="Mini Player"
                        >
                            <PictureInPicture size={20} />
                        </button>

                        <button onClick={toggleFullscreen} className="text-white/60 hover:text-white transition-all">
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex gap-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                        <button
                            onClick={(e) => { e.stopPropagation(); videoRef.current.currentTime -= 10; }}
                            className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-primary hover:text-dark-bg transition-all"
                        >
                            <span className="text-[10px] font-bold">-10s</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="w-16 h-16 bg-brand-primary text-dark-bg rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="translate-x-0.5" />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); videoRef.current.currentTime += 10; }}
                            className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-primary hover:text-dark-bg transition-all"
                        >
                            <span className="text-[10px] font-bold">+10s</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* PLAY OVERLAY */}

        </div>
    );
};

export default VideoPlayer;
