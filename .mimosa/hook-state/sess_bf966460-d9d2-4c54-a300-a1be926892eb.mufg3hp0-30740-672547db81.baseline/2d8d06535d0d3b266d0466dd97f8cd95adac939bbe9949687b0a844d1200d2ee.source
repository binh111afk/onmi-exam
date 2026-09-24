import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  triggerClassName?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, triggerClassName }) => {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [arrowLeft, setArrowLeft] = useState(0);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateCoords = () => {
    if (triggerRef.current && tooltipRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      let top = rect.top - tooltipRect.height - 9; // 9px space above
      let pos: 'top' | 'bottom' = 'top';

      // Boundary check left/right
      if (left < 8) {
        left = 8;
      }
      const maxLeft = window.innerWidth - tooltipRect.width - 8;
      if (left > maxLeft) {
        left = maxLeft;
      }

      // Boundary check top (flip to bottom if not enough space on top)
      if (top < 8) {
        top = rect.bottom + 9;
        pos = 'bottom';
      }

      // Calculate arrow offset relative to the tooltip box
      const triggerCenter = rect.left + rect.width / 2;
      const relativeArrowLeft = triggerCenter - left;

      setCoords({ top, left });
      setPlacement(pos);
      setArrowLeft(relativeArrowLeft);
    }
  };

  const handleMouseEnter = () => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    delayTimer.current = setTimeout(() => {
      setVisible(true);
      setActive(true);
    }, 200); // Trigger after 200ms
  };

  const handleMouseLeave = () => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    setActive(false);
    delayTimer.current = setTimeout(() => {
      setVisible(false);
    }, 150); // Fade out duration 150ms
  };

  useEffect(() => {
    if (visible && active) {
      updateCoords();
      
      // Listen to scroll events on any parent scroll viewport (capture: true) and resize
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', updateCoords, true);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [visible, active]);

  useEffect(() => {
    return () => {
      if (delayTimer.current) clearTimeout(delayTimer.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={triggerClassName ?? "inline-flex items-center justify-center h-full animate-fadeIn"}
    >
      {children}
      {visible && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-2.5 py-1 text-[9px] font-black text-white bg-slate-900 rounded-lg shadow-md pointer-events-none select-none transition-opacity duration-150 ease-in-out font-sans"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            opacity: active ? 1 : 0,
          }}
        >
          {content}
          
          {/* Tooltip Arrow */}
          <div 
            className="absolute w-0 h-0 border-solid"
            style={{
              left: `${arrowLeft}px`,
              marginLeft: '-5px',
              borderWidth: placement === 'top' ? '5px 5px 0 5px' : '0 5px 5px 5px',
              borderColor: placement === 'top' 
                ? 'rgb(15, 23, 42) transparent transparent transparent' 
                : 'transparent transparent rgb(15, 23, 42) transparent',
              bottom: placement === 'top' ? '-5px' : 'auto',
              top: placement === 'bottom' ? '-5px' : 'auto',
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
};
