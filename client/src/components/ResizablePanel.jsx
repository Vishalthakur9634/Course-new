import React, { useState, useEffect, useRef } from 'react';

const ResizablePanel = ({
    children,
    defaultWidth = 300,
    minWidth = 200,
    maxWidth = 600,
    position = 'left', // 'left' or 'right'
    storageKey = 'resizable-panel-width',
    className = '',
    isCollapsed = false,
    collapsedWidth = 80
}) => {
    const [width, setWidth] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? parseInt(saved) : defaultWidth;
    });
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        if (!isCollapsed) {
            localStorage.setItem(storageKey, width.toString());
        }
    }, [width, storageKey, isCollapsed]);

    const startResizing = (e) => {
        if (isCollapsed) return;
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing || isCollapsed) return;

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
    }, [isResizing, minWidth, maxWidth, position, isCollapsed]);

    return (
        <div
            ref={panelRef}
            className={`relative h-full ${className}`}
            style={{
                width: isCollapsed ? `${collapsedWidth}px` : `${width}px`,
                transition: isResizing ? 'none' : 'width 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
        >
            {children}

            {/* Resize Handle */}
            {!isCollapsed && (
                <div
                    className={`absolute top-0 ${position === 'left' ? 'right-0' : 'left-0'} w-1 h-full cursor-ew-resize bg-transparent hover:bg-brand-primary transition-colors group z-50`}
                    onMouseDown={startResizing}
                >
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-16 bg-dark-layer2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg" style={{ [position === 'left' ? 'right' : 'left']: '-6px' }}>
                        <div className="w-0.5 h-8 bg-dark-muted rounded-full mx-0.5"></div>
                        <div className="w-0.5 h-8 bg-dark-muted rounded-full mx-0.5"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResizablePanel;
