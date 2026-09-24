import React from 'react';

interface DragIndicatorProps {
  top: number;
  visible: boolean;
}

export const DragIndicator: React.FC<DragIndicatorProps> = ({ top, visible }) => {
  if (!visible) return null;
  
  return (
    <div 
      className="absolute left-6 right-6 h-0.5 bg-primary pointer-events-none z-[45] rounded-full transition-all duration-75"
      style={{ 
        top: `${top}px`, 
        transform: 'translateY(-50%)' 
      }}
    />
  );
};
