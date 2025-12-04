import React, { useState, useEffect, useRef } from 'react';

const ResizablePanel = ({
    children,
    defaultWidth = 300,
    minWidth = 200,
    maxWidth = 600,
    position = 'left', // 'left' or 'right'
    storageKey = 'resizable-panel-width',
    className = ''
}) => {
    const [width, setWidth] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? parseInt(saved) : defaultWidth;
    });
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(storageKey, width.toString());
    }, [width, storageKey]);

    const startResizing = (e) => {
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const newWidth = position === 'left'
                ? e.clientX
                : window.innerWidth - e.clientX;

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, minWidth, maxWidth, position]);

    return (
        <div
            ref={panelRef}
            className={`relative h-full ${className}`}
            style={{ width: `${width}px`, transition: isResizing ? 'none' : 'width 0.2s ease' }}
        >
            {children}

            {/* Resize Handle */}
            <div
                className={`absolute top-0 ${position === 'left' ? 'right-0' : 'left-0'} w-1 h-full cursor-ew-resize bg-transparent hover:bg-brand-primary transition-colors group`}
                onMouseDown={startResizing}
            >
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-16 bg-dark-layer2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ [position === 'left' ? 'right' : 'left']: '-6px' }}>
                    <div className="w-0.5 h-8 bg-dark-muted rounded-full mx-0.5"></div>
                    <div className="w-0.5 h-8 bg-dark-muted rounded-full mx-0.5"></div>
                </div>
            </div>
        </div>
    );
};

export default ResizablePanel;
