import React from 'react';

interface BlockEmptyStateProps {
  text: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
}

export const BlockEmptyState: React.FC<BlockEmptyStateProps> = ({
  text,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-indigo-100 bg-white/70 px-4 py-8 text-center flex flex-col items-center justify-center gap-3 select-none">
      {icon && <div className="text-slate-400">{icon}</div>}
      <div className="text-[10px] font-bold text-slate-400 italic">
        {text}
      </div>
      <button
        onClick={onAction}
        className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider bg-primary hover:bg-primary-hover text-white rounded-xl transition shadow-3xs cursor-pointer select-none"
      >
        {actionLabel}
      </button>
    </div>
  );
};
