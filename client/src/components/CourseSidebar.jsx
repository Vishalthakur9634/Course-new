import React from 'react';
import { PlayCircle, CheckCircle, Lock } from 'lucide-react';

const CourseSidebar = ({ course, activeVideo, onVideoSelect, progressMap }) => {
    return (
        <div className="bg-dark-layer1 border-l border-dark-layer2 h-full flex flex-col w-80 flex-shrink-0">
            <div className="p-4 border-b border-dark-layer2">
                <h3 className="font-bold text-white">Course Content</h3>
                <p className="text-xs text-dark-muted mt-1">{course.videos.length} Videos</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                {course.videos.map((video, index) => {
                    const isActive = activeVideo?._id === video._id;
                    const isCompleted = progressMap[video._id]?.completed;

                    return (
                        <button
                            key={video._id}
                            onClick={() => onVideoSelect(video)}
                            className={`w-full text-left p-4 border-b border-dark-layer2 flex gap-3 hover:bg-dark-layer2 transition-colors ${isActive ? 'bg-dark-layer2 border-l-4 border-l-brand-primary' : ''
                                }`}
                        >
                            <div className="mt-1">
                                {isCompleted ? (
                                    <CheckCircle size={16} className="text-green-500" />
                                ) : (
                                    <PlayCircle size={16} className={isActive ? 'text-brand-primary' : 'text-dark-muted'} />
                                )}
                            </div>
                            <div>
                                <h4 className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-white' : 'text-dark-text'}`}>
                                    {index + 1}. {video.title}
                                </h4>
                                <span className="text-xs text-dark-muted mt-1 block">{video.duration} min</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CourseSidebar;
