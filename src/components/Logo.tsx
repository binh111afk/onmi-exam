import React from 'react';

interface LogoIconProps {
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <svg 
      viewBox="0 0 100 70" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue Orbit 1 (Tilted loop bottom-left to top-right) */}
      <path 
        d="M20 38 C 20 20, 80 15, 80 32 C 80 45, 30 52, 26 38" 
        stroke="#1E60D6" 
        strokeWidth="3.5" 
        strokeLinecap="round"
      />
      {/* Blue Orbit 2 (Tilted loop middle-left to bottom-right) */}
      <path 
        d="M26 38 C 15 28, 70 18, 85 30 C 95 40, 45 55, 30 52" 
        stroke="#1E60D6" 
        strokeWidth="3.5" 
        strokeLinecap="round"
      />
      {/* Blue Orbit 3 (Horizontal/tilted balance path) */}
      <path 
        d="M25 45 C 35 48, 70 50, 78 40 C 85 30, 60 22, 45 25" 
        stroke="#1E60D6" 
        strokeWidth="3.5" 
        strokeLinecap="round"
      />

      {/* Dark Blue Dot (Bottom Left) */}
      <circle cx="28" cy="46" r="7" fill="#1D4ED8" />

      {/* Orange Dot (Bottom Right) */}
      <circle cx="70" cy="45" r="7.5" fill="#F97316" />

      {/* Light Blue Dot (Top Right) */}
      <circle cx="70" cy="22" r="6.5" fill="#0EA5E9" />
    </svg>
  );
};

interface LogoProps {
  onViewChange?: (view: string) => void;
}

export const Logo: React.FC<LogoProps> = ({ onViewChange }) => {
  const handleClick = () => {
    if (onViewChange) {
      onViewChange('home');
    }
  };

  return (
    <div 
      onClick={handleClick} 
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <LogoIcon className="h-9 w-auto shrink-0" />
      <div className="flex flex-col justify-center leading-none">
        <span className="text-[17px] font-black tracking-tight text-[#1E60D6] font-sans">ONMI</span>
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#64748B] uppercase mt-0.5 font-sans">EXAM</span>
      </div>
    </div>
  );
};
