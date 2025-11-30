import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

const VideoPlayer = ({ src, poster, onProgress }) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const containerRef = useRef(null);
    const progressIntervalRef = useRef(null);

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

    // Initialize HLS
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                // Extract quality levels
                const qualities = data.levels.map((level, index) => ({
                    index,
                    height: level.height,
                    label: `${level.height}p`
                }));

                setAvailableQualities([{ index: -1, label: 'Auto' }, ...qualities]);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
            });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = src;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [src]);

    // Progress Tracking
    useEffect(() => {
        if (isPlaying && onProgress) {
            progressIntervalRef.current = setInterval(() => {
                if (videoRef.current) {
                    onProgress(videoRef.current.currentTime, videoRef.current.duration);
                }
            }, 30000); // Update every 30 seconds
        } else {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        }
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [isPlaying, onProgress]);

    // Play/Pause
    const togglePlay = () => {
        const video = videoRef.current;
        if (isPlaying) {
            video.pause();
            // Save progress on pause
            if (onProgress) onProgress(video.currentTime, video.duration);
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
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
            className="relative bg-black group w-full h-full"
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

            {/* Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-4 px-4 transition-opacity duration-300 z-50 ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Progress Bar */}
                <div
                    className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4 hover:h-2 transition-all"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-white">
                    {/* Left Controls */}
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:scale-110 transition">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute} className="hover:scale-110 transition">
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1"
                            />
                        </div>

                        <span className="text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4">
                        {/* Settings Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="hover:scale-110 transition"
                            >
                                <Settings size={20} />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg p-4 min-w-[200px] z-50">
                                    {/* Playback Speed */}
                                    <div className="mb-4">
                                        <div className="text-xs text-gray-400 mb-2 uppercase font-bold">Playback Speed</div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {speeds.map(speed => (
                                                <button
                                                    key={speed}
                                                    onClick={() => changeSpeed(speed)}
                                                    className={`px-2 py-1 text-xs rounded transition-colors ${playbackSpeed === speed ? 'bg-brand-primary text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                >
                                                    {speed}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quality */}
                                    <div>
                                        <div className="text-xs text-gray-400 mb-2 uppercase font-bold">Quality</div>
                                        <div className="space-y-1">
                                            {availableQualities.map(quality => (
                                                <button
                                                    key={quality.index}
                                                    onClick={() => changeQuality(quality.index)}
                                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${currentQuality === quality.label ? 'bg-brand-primary text-white' : 'hover:bg-gray-800'}`}
                                                >
                                                    {quality.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen} className="hover:scale-110 transition">
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Play button overlay for initial state */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-brand-primary/90 rounded-full p-6 shadow-lg transform transition-transform group-hover:scale-110">
                        <Play size={48} fill="white" className="text-white ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
