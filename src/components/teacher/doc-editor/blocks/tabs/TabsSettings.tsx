import React from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import type { TabsSettings as TabsSettingsType } from './TabsTypes';

interface TabsSettingsProps {
  isOpen: boolean;
  settings: TabsSettingsType;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<TabsSettingsType>) => void;
}

const TABS_THEME_COLORS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Slate', hex: '#64748b' },
];

export const TabsSettings: React.FC<TabsSettingsProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/15 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Cấu hình Tabs"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn select-none"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary border border-indigo-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Tabs</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Màu sắc chủ đề</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            aria-label="Đóng cấu hình"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Màu sắc chủ đề</span>
            <div className="flex gap-2">
              {TABS_THEME_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onUpdateSettings({ themeColor: c.hex })}
                  style={{ backgroundColor: c.hex }}
                  className={`w-6 h-6 rounded-full border border-white shadow-3xs cursor-pointer hover:scale-110 transition ${
                    settings.themeColor === c.hex ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
};
