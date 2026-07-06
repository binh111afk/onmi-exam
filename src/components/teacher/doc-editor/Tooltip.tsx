import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    delayTimer.current = setTimeout(() => {
      setVisible(true);
      setActive(true);
    }, 300); // Delay 300ms before showing
  };

  const handleMouseLeave = () => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    setActive(false);
    delayTimer.current = setTimeout(() => {
      setVisible(false);
    }, 150); // Fade-out duration 150ms
  };

  useEffect(() => {
    if (visible && active && triggerRef.current && tooltipRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      let top = rect.top - tooltipRect.height - 8; // 8px space above

      // Viewport boundary checks
      if (left < 8) {
        left = 8;
      }
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      if (top < 8) {
        // Position below if not enough room on top
        top = rect.bottom + 8;
      }

      setCoords({ top, left });
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
      className="inline-flex items-center justify-center h-full"
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-2 py-1.5 text-[9px] font-black text-white bg-slate-900 rounded-lg shadow-md pointer-events-none select-none transition-opacity duration-150 ease-in-out"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            opacity: active ? 1 : 0,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
