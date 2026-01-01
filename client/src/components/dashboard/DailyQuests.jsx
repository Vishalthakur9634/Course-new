import React, { useState } from 'react';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DailyQuests = () => {
    const [quests, setQuests] = useState([
        { id: 1, text: 'Complete "React Patterns" Module', xp: 50, completed: false },
        { id: 2, text: 'Review 3 Community Repos', xp: 30, completed: true },
        { id: 3, text: 'Post a Daily Progress Log', xp: 20, completed: false },
    ]);

    const toggleQuest = (id) => {
        setQuests(quests.map(q =>
            q.id === id ? { ...q, completed: !q.completed } : q
        ));
    };

    return (
        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest">Daily Ops</h3>
                <div className="flex items-center gap-1 text-stellar-gold">
                    <Trophy size={14} />
                    <span className="text-[10px] font-black uppercase">Reward: 100 XP</span>
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {quests.map(quest => (
                        <motion.div
                            key={quest.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${quest.completed
                                    ? 'bg-brand-primary/10 border-brand-primary/30'
                                    : 'bg-dark-layer2 border-white/5 hover:border-white/20'
                                }`}
                            onClick={() => toggleQuest(quest.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`${quest.completed ? 'text-brand-primary' : 'text-dark-muted group-hover:text-white'} transition-colors`}>
                                    {quest.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                                </div>
                                <span className={`text-xs font-bold ${quest.completed ? 'text-white line-through opacity-50' : 'text-gray-300'}`}>
                                    {quest.text}
                                </span>
                            </div>
                            <span className="text-[9px] font-black text-dark-muted uppercase bg-black/20 px-2 py-1 rounded">
                                +{quest.xp} XP
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-brand-primary to-green-400 transition-all duration-500"
                    style={{ width: `${(quests.filter(q => q.completed).length / quests.length) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default DailyQuests;
