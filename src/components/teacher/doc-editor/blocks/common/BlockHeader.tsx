import React from 'react';

interface BlockHeaderProps {
  icon: React.ReactNode;
  label: string;
}

export const BlockHeader: React.FC<BlockHeaderProps> = ({ icon, label }) => {
  return (
    <div className="flex items-center justify-between text-indigo-600 font-extrabold text-[8px] uppercase tracking-wide select-none">
      <span className="flex items-center gap-1.5">
        {icon} {label}
      </span>
    </div>
  );
};
