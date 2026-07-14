import React from 'react';
import { X, Hash, WrapText } from 'lucide-react';
import type { CodeLanguage, CodeTheme } from './CodeTypes';
import { SUPPORTED_LANGUAGES, SUPPORTED_THEMES } from './CodeUtils';

interface CodeSettingsDialogProps {
  isOpen: boolean;
  language: CodeLanguage;
  theme: CodeTheme;
  showLineNumbers: boolean;
  wrapLine: boolean;
  onLanguageChange: (lang: CodeLanguage) => void;
  onThemeChange: (theme: CodeTheme) => void;
  onToggleLineNumbers: () => void;
  onToggleWrapLine: () => void;
  onClose: () => void;
}

export const CodeSettingsDialog: React.FC<CodeSettingsDialogProps> = ({
  isOpen,
  language,
  theme,
  showLineNumbers,
  wrapLine,
  onLanguageChange,
  onThemeChange,
  onToggleLineNumbers,
  onToggleWrapLine,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[380px] max-w-[90vw] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Cấu hình Khối Mã nguồn</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Language */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Ngôn ngữ lập trình
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => onLanguageChange(l.value)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                    language === l.value
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Giao diện màu sắc
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onThemeChange(t.value)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-semibold border transition cursor-pointer text-left ${
                    theme === t.value
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleLineNumbers}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                showLineNumbers
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-200'
              }`}
            >
              <Hash size={12} />
              Số dòng {showLineNumbers ? 'BẬT' : 'TẮT'}
            </button>
            <button
              type="button"
              onClick={onToggleWrapLine}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                wrapLine
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-200'
              }`}
            >
              <WrapText size={12} />
              Xuống dòng {wrapLine ? 'BẬT' : 'TẮT'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
