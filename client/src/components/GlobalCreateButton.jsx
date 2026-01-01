import React, { useState } from 'react';
import { Plus, Video, FileText, Image, Box, X, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalCreateButton = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions = [
        {
            icon: <Video size={20} />,
            label: 'Upload Video',
            path: '/social',
            color: 'bg-blue-500',
            roles: ['student', 'instructor', 'admin', 'superadmin']
        },
        {
            icon: <FileText size={20} />,
            label: 'Write Article',
            path: '/instructor/articles',
            color: 'bg-green-500',
            roles: ['instructor', 'admin', 'superadmin']
        },
        {
            icon: <BookOpen size={20} />,
            label: 'Create Course',
            path: '/instructor/upload',
            color: 'bg-purple-500',
            roles: ['instructor', 'superadmin']
        },
        {
            icon: <Box size={20} />,
            label: 'New Bundle',
            path: '/instructor/bundles',
            color: 'bg-orange-500',
            roles: ['instructor', 'superadmin']
        },
    ];

    // Filter actions based on user role
    const userRole = user?.role || 'student';
    const allowedActions = actions.filter(action => action.roles.includes(userRole));

    if (allowedActions.length === 0) return null;

    return (
        <div className="fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8">
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3 mb-4">
                        {allowedActions.map((action, index) => (
                            <motion.button
                                key={action.label}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate(action.path);
                                }}
                                className="group flex items-center gap-3 pr-1"
                            >
                                <span className="bg-dark-layer2 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {action.label}
                                </span>
                                <div className={`${action.color} p-3 rounded-full text-white shadow-lg shadow-black/50 hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-2xl shadow-brand-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-dark-layer2 text-white border border-white/20 rotate-45' : 'bg-brand-primary text-dark-bg'
                    }`}
            >
                {isOpen ? <Plus size={24} /> : <Plus size={24} className="stroke-[3px]" />}
            </button>
        </div>
    );
};

export default GlobalCreateButton;
