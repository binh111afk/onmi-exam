import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { Checkbox } from '../../../../Checkbox';
import { SettingsSelect } from '../common/SettingsSelect';
import type { TabsSettings as TabsSettingsType } from './TabsTypes';

interface TabsSettingsProps {
  isOpen: boolean;
  settings: TabsSettingsType;
  tabs: { id: string; title: string }[];
  onClose: () => void;
  onUpdateSettings: (settings: Partial<TabsSettingsType>) => void;
}

const TABS_THEME_COLORS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Xanh dương', hex: '#3b82f6' },
  { name: 'Tím', hex: '#8b5cf6' },
  { name: 'Xanh lá', hex: '#10b981' },
  { name: 'Cam', hex: '#f59e0b' },
  { name: 'Đỏ', hex: '#ef4444' },
  { name: 'Xám', hex: '#64748b' }
];

export const TabsSettings: React.FC<TabsSettingsProps> = ({
  isOpen,
  settings,
  tabs,
  onClose,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<TabsSettingsType>({
    themeColor: '#6366f1',
    defaultActiveTab: '',
    tabStyle: 'underline',
    position: 'top',
    equalWidth: false,
    scrollMode: true,
    roundedTabs: true,
    ...settings
  });

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        themeColor: '#6366f1',
        defaultActiveTab: '',
        tabStyle: 'underline',
        position: 'top',
        equalWidth: false,
        scrollMode: true,
        roundedTabs: true,
        ...settings
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateField = (fields: Partial<TabsSettingsType>) => {
    const nextSettings = { ...localSettings, ...fields };
    setLocalSettings(nextSettings);
    onUpdateSettings(nextSettings);
  };

  const handleApply = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="fixed inset-0 bg-slate-900/15 backdrop-blur-md pointer-events-none"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Cấu hình Tabs"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary border border-indigo-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Tabs</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập kiểu hiển thị tab</p>
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
            <span className="font-black text-slate-600 uppercase tracking-wider">Tab mặc định</span>
            <SettingsSelect
              ariaLabel="Tab mặc định"
              value={localSettings.defaultActiveTab || ''}
              onChange={(value) => handleUpdateField({ defaultActiveTab: value })}
              className="max-w-[160px]"
              options={[
                { value: '', label: 'Tab đầu tiên' },
                ...tabs.map((tab, idx) => ({
                  value: tab.id,
                  label: tab.title || `Tab ${idx + 1}`
                }))
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu dáng tab</span>
            <SettingsSelect
              ariaLabel="Kiểu dáng tab"
              value={localSettings.tabStyle}
              onChange={(value) => handleUpdateField({ tabStyle: value as any })}
              options={[
                { value: 'underline', label: 'Gạch chân (Underline)' },
                { value: 'pills', label: 'Nút kẹp (Pills)' },
                { value: 'blocks', label: 'Khối liền (Blocks)' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Vị trí thanh Tab</span>
            <SettingsSelect
              ariaLabel="Vị trí thanh Tab"
              value={localSettings.position}
              onChange={(value) => handleUpdateField({ position: value as any })}
              options={[
                { value: 'top', label: 'Phía trên (Top)' },
                { value: 'bottom', label: 'Phía dưới (Bottom)' },
                { value: 'left', label: 'Bên trái (Left)' }
              ]}
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <Checkbox
              checked={!!localSettings.equalWidth}
              onChange={(checked) => handleUpdateField({ equalWidth: checked })}
              label={<span className="font-black text-slate-600">Độ rộng các tab bằng nhau</span>}
            />
            <Checkbox
              checked={!!localSettings.scrollMode}
              onChange={(checked) => handleUpdateField({ scrollMode: checked })}
              label={<span className="font-black text-slate-600">Bật thanh cuộn ngang khi tràn tab</span>}
            />
            <Checkbox
              checked={!!localSettings.roundedTabs}
              onChange={(checked) => handleUpdateField({ roundedTabs: checked })}
              label={<span className="font-black text-slate-600">Bo góc tròn các góc cạnh</span>}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-black text-slate-600 uppercase tracking-wider block">Màu sắc chủ đề</span>
            <div className="grid grid-cols-4 gap-2">
              {TABS_THEME_COLORS.map((color) => {
                const isSelected = localSettings.themeColor === color.hex;
                return (
                  <button
                    key={color.hex}
                    onClick={() => handleUpdateField({ themeColor: color.hex })}
                    className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: color.hex }}
                      className="w-4 h-4 rounded-full border border-white shadow-2xs"
                    />
                    <span className="text-[8px] font-bold text-slate-500">{color.name}</span>
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
