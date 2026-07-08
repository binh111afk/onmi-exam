import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { Checkbox } from '../../../../Checkbox';
import type { DiagramSettings as DiagramSettingsType } from './DiagramTypes';

interface DiagramSettingsProps {
  isOpen: boolean;
  settings: DiagramSettingsType;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<DiagramSettingsType>) => void;
}

const THEME_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Xanh dương', value: '#3b82f6' },
  { name: 'Tím', value: '#8b5cf6' },
  { name: 'Xanh lá', value: '#10b981' },
  { name: 'Cam', value: '#f59e0b' },
  { name: 'Đỏ', value: '#ef4444' },
  { name: 'Xám', value: '#64748b' }
];

export const DiagramSettings: React.FC<DiagramSettingsProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<DiagramSettingsType>({
    nodeStyle: 'rounded',
    nodeSpacing: 'normal',
    showArrows: true,
    showDescriptions: true,
    themeColor: '#6366f1',
    ...settings
  });

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        nodeStyle: 'rounded',
        nodeSpacing: 'normal',
        showArrows: true,
        showDescriptions: true,
        themeColor: '#6366f1',
        ...settings
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateField = (fields: Partial<DiagramSettingsType>) => {
    setLocalSettings(prev => ({ ...prev, ...fields }));
  };

  const handleApply = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/15 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Cấu hình Sơ đồ"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary border border-indigo-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Sơ đồ</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập kiểu dáng sơ đồ</p>
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

        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-[10px]">
          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Bố cục</span>
            <select
              value={localSettings.layout}
              onChange={(e) => handleUpdateField({ layout: e.target.value as any })}
              className="bg-white border border-slate-200 focus:border-primary rounded-xl px-3 py-2 font-bold text-slate-800 outline-none transition cursor-pointer text-[10px]"
            >
              <option value="horizontal">Ngang (A → B → C)</option>
              <option value="vertical">Dọc (A ↓ B ↓ C)</option>
              <option value="tree">Cây phân cấp (Tree)</option>
              <option value="cycle">Vòng tuần hoàn (Cycle)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu liên kết</span>
            <select
              value={localSettings.arrowStyle}
              onChange={(e) => handleUpdateField({ arrowStyle: e.target.value as any })}
              className="bg-white border border-slate-200 focus:border-primary rounded-xl px-3 py-2 font-bold text-slate-800 outline-none transition cursor-pointer text-[10px]"
            >
              <option value="straight">Mũi tên thẳng</option>
              <option value="dashed">Mũi tên đứt nét</option>
              <option value="curved">Mũi tên uốn cong</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu nút mốc</span>
            <select
              value={localSettings.nodeStyle}
              onChange={(e) => handleUpdateField({ nodeStyle: e.target.value as any })}
              className="bg-white border border-slate-200 focus:border-primary rounded-xl px-3 py-2 font-bold text-slate-800 outline-none transition cursor-pointer text-[10px]"
            >
              <option value="rounded">Bo góc tròn (Rounded)</option>
              <option value="sharp">Góc vuông (Sharp)</option>
              <option value="oval">Hình bầu dục (Oval)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Khoảng cách nút</span>
            <select
              value={localSettings.nodeSpacing}
              onChange={(e) => handleUpdateField({ nodeSpacing: e.target.value as any })}
              className="bg-white border border-slate-200 focus:border-primary rounded-xl px-3 py-2 font-bold text-slate-800 outline-none transition cursor-pointer text-[10px]"
            >
              <option value="compact">Chật hẹp (Compact)</option>
              <option value="normal">Vừa phải (Normal)</option>
              <option value="wide">Rộng rãi (Wide)</option>
            </select>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <Checkbox
              checked={!!localSettings.showArrows}
              onChange={(checked) => handleUpdateField({ showArrows: checked })}
              label={<span className="font-black text-slate-600">Hiển thị các mũi tên liên kết</span>}
            />
            <Checkbox
              checked={!!localSettings.showDescriptions}
              onChange={(checked) => handleUpdateField({ showDescriptions: checked })}
              label={<span className="font-black text-slate-600">Hiển thị mô tả của các nút</span>}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-black text-slate-600 uppercase tracking-wider block">Màu sắc chủ đề</span>
            <div className="grid grid-cols-4 gap-2">
              {THEME_COLORS.map((color) => {
                const isSelected = localSettings.themeColor === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => handleUpdateField({ themeColor: color.value })}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: color.value }}
                      className="w-5 h-5 rounded-full border border-white shadow-2xs"
                    />
                    <span className="text-[9px] font-bold text-slate-500">{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-655 hover:bg-slate-50 font-bold text-[10px] rounded-xl cursor-pointer transition select-none"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] rounded-xl cursor-pointer transition select-none"
          >
            Áp dụng
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
};
