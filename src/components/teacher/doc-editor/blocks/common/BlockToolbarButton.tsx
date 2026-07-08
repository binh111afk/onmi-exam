import React from 'react';

interface BlockToolbarButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  disabled?: boolean;
}

export const BlockToolbarButton: React.FC<BlockToolbarButtonProps> = ({
  onClick,
  icon,
  label,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-lg text-[9px] font-black text-slate-600 hover:text-slate-800 hover:border-slate-350 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer select-none"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
