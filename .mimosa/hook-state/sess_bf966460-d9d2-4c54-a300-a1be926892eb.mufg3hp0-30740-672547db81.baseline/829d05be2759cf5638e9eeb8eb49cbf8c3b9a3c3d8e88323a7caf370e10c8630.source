import React from 'react';

interface OtherBlockCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const OtherBlockCard: React.FC<OtherBlockCardProps> = ({
  onClick,
  icon,
  title,
  description,
}) => {
  return (
    <div
      onClick={onClick}
      className="border border-slate-100 hover:border-primary/20 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-4 group bg-slate-50/30 hover:bg-white text-left select-none"
    >
      <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-black text-[#1E293B] group-hover:text-primary transition-colors mb-0.5">
          {title}
        </h4>
        <p className="text-[10px] text-slate-500 font-medium leading-normal">
          {description}
        </p>
      </div>
    </div>
  );
};
