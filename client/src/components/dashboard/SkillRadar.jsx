import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SkillRadar = ({ courses }) => {
    // Aggregate skills from course categories
    const processData = () => {
        if (!courses || courses.length === 0) {
            return [
                { subject: 'Frontend', A: 60, fullMark: 100 },
                { subject: 'Backend', A: 40, fullMark: 100 },
                { subject: 'Design', A: 75, fullMark: 100 },
                { subject: 'DevOps', A: 30, fullMark: 100 },
                { subject: 'AI/ML', A: 50, fullMark: 100 },
                { subject: 'Soft Skills', A: 80, fullMark: 100 },
            ];
        }

        // Real logic would go here, calculating progress per category
        // For now, returning cool-looking static data structure representing "Potential"
        return [
            { subject: 'React', A: 85, fullMark: 100 },
            { subject: 'Node.js', A: 65, fullMark: 100 },
            { subject: 'UI/UX', A: 90, fullMark: 100 },
            { subject: 'Database', A: 70, fullMark: 100 },
            { subject: 'Architecture', A: 50, fullMark: 100 },
            { subject: 'Testing', A: 40, fullMark: 100 },
        ];
    };

    const data = processData();

    return (
        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-4 h-[350px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-brand-primary/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex justify-between items-center relative z-10">
                <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest">Skills Overview</h3>
                <span className="text-[10px] font-bold text-brand-primary uppercase">Updated Today</span>
            </div>

            <div className="w-full h-[280px] px-4">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} aspect={1.5}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                        <Radar
                            name="Skills"
                            dataKey="A"
                            stroke="#00f2ff"
                            strokeWidth={2}
                            fill="#00f2ff"
                            fillOpacity={0.2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SkillRadar;
