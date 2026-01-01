import React from 'react';
import { motion } from 'framer-motion';

const ActivityHeatmap = () => {
    // Generate mock data for the last 365 days
    const generateData = () => {
        const data = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Random intensity 0-4
            // Bias towards more activity recently
            let intensity = Math.floor(Math.random() * 5);
            if (Math.random() > 0.7) intensity = 0; // Random gaps

            data.push({
                date: date.toISOString().split('T')[0],
                intensity: intensity, // 0 = empty, 1-4 = levels
            });
        }
        return data;
    };

    const data = generateData();

    const getColor = (intensity) => {
        switch (intensity) {
            case 1: return 'bg-brand-primary/30';
            case 2: return 'bg-brand-primary/50';
            case 3: return 'bg-brand-primary/80';
            case 4: return 'bg-brand-primary';
            default: return 'bg-white/5';
        }
    };

    return (
        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest">Orbit Log</h3>
                <div className="flex gap-1 text-[9px] font-bold text-dark-muted">
                    <span>Less</span>
                    <div className="w-2 h-2 bg-white/5 rounded-sm"></div>
                    <div className="w-2 h-2 bg-brand-primary/30 rounded-sm"></div>
                    <div className="w-2 h-2 bg-brand-primary/50 rounded-sm"></div>
                    <div className="w-2 h-2 bg-brand-primary/80 rounded-sm"></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-sm"></div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                {data.map((day, i) => (
                    <motion.div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-sm ${getColor(day.intensity)}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.001 }}
                        title={`${day.date}: Level ${day.intensity}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ActivityHeatmap;
