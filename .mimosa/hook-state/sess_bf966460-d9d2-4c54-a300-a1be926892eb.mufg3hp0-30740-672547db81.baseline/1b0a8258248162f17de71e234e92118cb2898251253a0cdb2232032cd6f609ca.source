import React from 'react';
import { ChevronDown, Hash, WrapText, Settings } from 'lucide-react';
import type { CodeLanguage, CodeTheme } from './CodeTypes';
import { SUPPORTED_LANGUAGES, SUPPORTED_THEMES } from './CodeUtils';

interface CodeToolbarProps {
  isBlockActive: boolean;
  language: CodeLanguage;
  theme: CodeTheme;
  showLineNumbers: boolean;
  wrapLine: boolean;
  onLanguageChange: (lang: CodeLanguage) => void;
  onThemeChange: (theme: CodeTheme) => void;
  onToggleLineNumbers: () => void;
  onToggleWrapLine: () => void;
  onOpenSettings: () => void;
}

const SEP = () => <div className="w-px h-3.5 bg-slate-200 mx-0.5" />;

const Dropdown = <T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        title={label}
      >
        <span className="text-slate-400 text-[9px] mr-0.5">{label}:</span>
        {selected?.label ?? value}
        <ChevronDown size={9} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 min-w-[140px]">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[10px] font-medium hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer ${value === opt.value ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ToggleBtn = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={label}
    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
      active
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

export const CodeToolbar: React.FC<CodeToolbarProps> = ({
  isBlockActive,
  language,
  theme,
  showLineNumbers,
  wrapLine,
  onLanguageChange,
  onThemeChange,
  onToggleLineNumbers,
  onToggleWrapLine,
  onOpenSettings,
}) => {
  if (!isBlockActive) return null;

  return (
    <div className="mb-2 animate-fadeIn select-none">
      <div className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-white border border-slate-200 rounded-xl shadow-sm flex-wrap">
        <Dropdown
          label="Ngôn ngữ"
          value={language}
          options={SUPPORTED_LANGUAGES}
          onChange={onLanguageChange}
        />
        <SEP />
        <Dropdown
          label="Theme"
          value={theme}
          options={SUPPORTED_THEMES}
          onChange={onThemeChange}
        />
        <SEP />
        <ToggleBtn
          active={showLineNumbers}
          onClick={onToggleLineNumbers}
          icon={<Hash size={11} />}
          label="Số dòng"
        />
        <ToggleBtn
          active={wrapLine}
          onClick={onToggleWrapLine}
          icon={<WrapText size={11} />}
          label="Xuống dòng"
        />
        <SEP />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onOpenSettings}
          title="Cấu hình nâng cao"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <Settings size={11} />
          Cấu hình
        </button>
      </div>
    </div>
  );
};
