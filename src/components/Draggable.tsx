import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface DraggableProps {
    children: React.ReactNode;
    initialPos?: { x: number; y: number };
}

const Draggable: React.FC<DraggableProps> = ({ children, initialPos = { x: 0, y: 0 } }) => {
    const [pos, setPos] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent dragging if clicking on a button, input, or interactive MUI components
        const target = e.target as HTMLElement;
        if (target.closest('button, input, [role="button"], .MuiSlider-root, .MuiSelect-root, .MuiInputBase-root, .MuiPopover-root')) {
            return;
        }

        setIsDragging(true);
        setDragStart({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        });
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPos({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    return (
        <Box
            ref={ref}
            onMouseDown={handleMouseDown}
            sx={{
                position: 'fixed',
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: 1000,
                // Center initially if x/y are 0? No, let parent decide valid initial pos or CSS
                // But transform is relative to the *element's original position* if not absolute?
                // Wait, 'fixed' makes it relative to viewport. Top/Left 0 default.
                top: 0,
                left: 0,
                touchAction: 'none'
            }}
        >
            {children}
        </Box>
    );
};

export default Draggable;
