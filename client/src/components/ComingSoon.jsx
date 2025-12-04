import React from 'react';

const ComingSoon = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <div className="text-6xl mb-4">🚧</div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-dark-muted">This page is coming soon!</p>
            <p className="text-sm text-dark-muted mt-2">The backend API is ready, just building the UI...</p>
        </div>
    );
};

export default ComingSoon;
