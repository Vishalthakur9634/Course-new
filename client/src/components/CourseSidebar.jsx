import React from 'react';
import { PlayCircle, CheckCircle, Clock } from 'lucide-react';

const CourseSidebar = ({ course, activeVideo, onVideoSelect, progressMap }) => {
    return (
        <aside className="bg-[#0a0a0a] border-l border-white/5 h-full flex flex-col w-80 flex-shrink-0 transition-all duration-700 shadow-3xl">
            <header className="p-8 border-b border-white/5 bg-[#141414]/30">
                <h3 className="text-xs font-bold text-white uppercase tracking-[0.4em]">Syllabus <span className="text-brand-primary">Matrix</span></h3>
                <p className="text-[9px] font-bold text-dark-muted mt-2 uppercase tracking-widest opacity-40">{course.videos.length} Modules Registered</p>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar py-4">
                {course.videos.map((video, index) => {
                    const isActive = activeVideo?._id === video._id;
                    const isCompleted = progressMap[video._id]?.completed;

                    return (
                        <button
                            key={video._id}
                            onClick={() => onVideoSelect(video)}
                            className={`w-full text-left p-6 border-b border-white/5 flex gap-4 transition-all hover:bg-white/[0.03] relative group ${isActive ? 'bg-brand-primary/5' : ''
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 w-1 h-full bg-brand-primary shadow-[0_0_20px_rgba(255,161,22,0.6)]" />
                            )}
                            <div className="shrink-0 pt-1">
                                {isCompleted ? (
                                    <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-lg shadow-green-500/5">
                                        <CheckCircle size={18} className="text-green-500" />
                                    </div>
                                ) : (
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${isActive ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-[#141414] border-white/10 group-hover:border-brand-primary/40'}`}>
                                        <PlayCircle size={18} className={isActive ? 'text-dark-bg' : 'text-dark-muted group-hover:text-brand-primary'} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 space-y-2">
                                <div className="flex flex-col gap-1">
                                    <h4 className={`text-[11px] font-bold uppercase tracking-tight leading-relaxed transition-colors ${isActive ? 'text-brand-primary' : 'text-white'}`}>
                                        <span className="opacity-30 mr-2">{String(index + 1).padStart(2, '0')}</span> {video.title}
                                    </h4>
                                    {isCompleted && (
                                        <span className="w-fit text-[8px] font-black bg-green-500/10 text-green-500 px-2 py-0.5 rounded-md uppercase tracking-widest border border-green-500/20">Validated</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-dark-muted font-bold tracking-widest opacity-40 uppercase">
                                    <Clock size={12} className="text-brand-primary opacity-60" /> {video.duration || '12:00'} MIN
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
};

export default CourseSidebar;
