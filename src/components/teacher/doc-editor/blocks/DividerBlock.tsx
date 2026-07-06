import React from 'react';

interface DividerBlockProps {
  idx: number;
  setActiveBlockIndex: (i: number) => void;
}

export const DividerBlockComponent: React.FC<DividerBlockProps> = ({
  idx,
  setActiveBlockIndex,
}) => {
  return (
    <div 
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 py-3 cursor-pointer select-none"
    >
      <hr className="border-t border-slate-200" />
    </div>
  );
};

export const DividerBlock = React.memo(DividerBlockComponent);
