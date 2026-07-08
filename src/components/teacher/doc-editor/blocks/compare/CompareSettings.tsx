import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { Checkbox } from '../../../../Checkbox';
import { SettingsSelect } from '../common/SettingsSelect';
import type { CompareSettings as CompareSettingsType } from './CompareTypes';

interface CompareSettingsProps {
  isOpen: boolean;
  settings: CompareSettingsType;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<CompareSettingsType>) => void;
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

export const CompareSettings: React.FC<CompareSettingsProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<CompareSettingsType>({
    themeColor: '#6366f1',
    cardStyle: 'bordered',
    showBorder: true,
    equalHeight: true,
    columnSpacing: 'normal',
    headerStyle: 'filled',
    responsiveMode: 'stack',
    ...settings
  });

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        themeColor: '#6366f1',
        cardStyle: 'bordered',
        showBorder: true,
        equalHeight: true,
        columnSpacing: 'normal',
        headerStyle: 'filled',
        responsiveMode: 'stack',
        ...settings
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateField = (fields: Partial<CompareSettingsType>) => {
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
        aria-label="Cấu hình So sánh"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary border border-indigo-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình So sánh</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập bảng so sánh</p>
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
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu thẻ card</span>
            <SettingsSelect
              ariaLabel="Kiểu thẻ card So sánh"
              value={localSettings.cardStyle}
              onChange={(value) => handleUpdateField({ cardStyle: value as any })}
              options={[
                { value: 'bordered', label: 'Có viền nhẹ' },
                { value: 'flat', label: 'Không viền (Phẳng)' },
                { value: 'shadow', label: 'Đổ bóng lớn' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu tiêu đề</span>
            <SettingsSelect
              ariaLabel="Kiểu tiêu đề So sánh"
              value={localSettings.headerStyle}
              onChange={(value) => handleUpdateField({ headerStyle: value as any })}
              options={[
                { value: 'filled', label: 'Nền xám đầy (Filled)' },
                { value: 'accent', label: 'Viền màu chủ đề (Accent)' },
                { value: 'minimal', label: 'Đơn giản (Minimal)' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Khoảng cách cột</span>
            <SettingsSelect
              ariaLabel="Khoảng cách cột So sánh"
              value={localSettings.columnSpacing}
              onChange={(value) => handleUpdateField({ columnSpacing: value as any })}
              options={[
                { value: 'compact', label: 'Hẹp' },
                { value: 'normal', label: 'Vừa phải' },
                { value: 'wide', label: 'Rộng rãi' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Thiết bị nhỏ</span>
            <SettingsSelect
              ariaLabel="Thiết bị nhỏ So sánh"
              value={localSettings.responsiveMode}
              onChange={(value) => handleUpdateField({ responsiveMode: value as any })}
              options={[
                { value: 'stack', label: 'Xếp chồng dọc (Stack)' },
                { value: 'scroll', label: 'Cuộn ngang (Scroll)' }
              ]}
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <Checkbox
              checked={!!localSettings.showBorder}
              onChange={(checked) => handleUpdateField({ showBorder: checked })}
              label={<span className="font-black text-slate-600">Hiển thị đường viền các cột</span>}
            />
            <Checkbox
              checked={!!localSettings.equalHeight}
              onChange={(checked) => handleUpdateField({ equalHeight: checked })}
              label={<span className="font-black text-slate-600">Các cột luôn có chiều cao bằng nhau</span>}
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
