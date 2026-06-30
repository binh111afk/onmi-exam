import React from 'react';

export const StudyIllustration: React.FC = () => {
  return (
    <svg viewBox="0 0 600 600" className="w-full h-full max-h-[450px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background soft circle */}
      <circle cx="300" cy="300" r="180" fill="#F8FAFC" />
      <circle cx="300" cy="300" r="140" fill="#EFF6FF" />

      {/* Desk surface line */}
      <line x1="120" y1="440" x2="480" y2="440" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />

      {/* Laptop / Computer */}
      <rect x="230" y="270" width="140" height="100" rx="6" fill="#0F172A" />
      <rect x="240" y="280" width="120" height="80" rx="3" fill="#FFFFFF" />
      
      {/* Laptop keyboard and base */}
      <path d="M210 376C210 372.686 212.686 370 216 370H384C387.314 370 390 372.686 390 376V380H210V376Z" fill="#94A3B8" />
      <rect x="280" y="380" width="40" height="4" fill="#64748B" />

      {/* Book stack */}
      {/* Book 1 (bottom) */}
      <rect x="150" y="400" width="60" height="16" rx="2" fill="#2563EB" />
      <rect x="155" y="404" width="55" height="8" fill="#EFF6FF" opacity="0.3" />
      <path d="M150 400H154V416H150V400Z" fill="#1D4ED8" />

      {/* Book 2 */}
      <rect x="155" y="384" width="50" height="16" rx="2" fill="#10B981" />
      <rect x="160" y="388" width="45" height="8" fill="#ECFDF5" opacity="0.3" />
      <path d="M155 384H159V400H155V384Z" fill="#059669" />

      {/* Book 3 (top) */}
      <rect x="152" y="368" width="52" height="16" rx="2" fill="#F59E0B" />
      <path d="M152 368H156V384H152V368Z" fill="#D97706" />

      {/* Lamp */}
      <path d="M430 440L420 330" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
      <path d="M420 330C420 330 380 330 380 310" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
      {/* Lamp Shade */}
      <path d="M360 300L400 300L410 325H350L360 300Z" fill="#0F172A" />
      {/* Lamp light glow (subtle, calm) */}
      <polygon points="380,325 240,440 370,440" fill="#FEF3C7" opacity="0.4" />

      {/* Plant pot */}
      <rect x="420" y="390" width="30" height="30" rx="3" fill="#E2E8F0" />
      <path d="M415 390H455V394H415V390Z" fill="#CBD5E1" />
      {/* Leaves */}
      <path d="M435 390C435 375 425 365 425 365C425 365 440 370 435 390Z" fill="#10B981" />
      <path d="M435 390C435 370 450 360 450 360C450 360 445 375 435 390Z" fill="#059669" />
      <path d="M435 390C430 380 410 375 410 375C410 375 425 382 435 390Z" fill="#059669" />

      {/* Abstract geometric charts inside the screen */}
      <rect x="250" y="295" width="40" height="50" rx="3" fill="#F8FAFC" />
      <line x1="255" y1="305" x2="285" y2="305" stroke="#CBD5E1" strokeWidth="2" />
      <line x1="255" y1="315" x2="275" y2="315" stroke="#2563EB" strokeWidth="2" />
      <line x1="255" y1="325" x2="280" y2="325" stroke="#64748B" strokeWidth="2" />
      <line x1="255" y1="335" x2="270" y2="335" stroke="#E2E8F0" strokeWidth="2" />

      <rect x="295" y="295" width="55" height="50" rx="3" fill="#F8FAFC" />
      <circle cx="322" cy="320" r="16" stroke="#10B981" strokeWidth="4" />
      <path d="M322 304A16 16 0 0 1 338 320" stroke="#F59E0B" strokeWidth="4" />

      {/* Floating stars of learning motivation */}
      <path d="M190 220L193 226L200 227L195 232L196 239L190 235L184 239L185 232L180 227L187 226L190 220Z" fill="#F59E0B" opacity="0.7" />
      <path d="M410 210L412 214L417 215L413 219L414 224L410 221L406 224L407 219L403 215L408 214L410 210Z" fill="#2563EB" opacity="0.6" />
    </svg>
  );
};
