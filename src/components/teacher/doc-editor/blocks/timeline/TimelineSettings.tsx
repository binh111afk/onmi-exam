import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { Checkbox } from '../../../../Checkbox';
import { SettingsSelect } from '../common/SettingsSelect';
import type { TimelineSettings as TimelineSettingsType } from './TimelineTypes';

interface TimelineSettingsProps {
  isOpen: boolean;
  settings: TimelineSettingsType;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<TimelineSettingsType>) => void;
}

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Xanh dương', value: '#3b82f6' },
  { name: 'Tím', value: '#8b5cf6' },
  { name: 'Xanh lá', value: '#10b981' },
  { name: 'Cam', value: '#f59e0b' },
  { name: 'Đỏ', value: '#ef4444' },
  { name: 'Xám', value: '#64748b' }
];

export const TimelineSettings: React.FC<TimelineSettingsProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<TimelineSettingsType>({
    showDate: true,
    showNumber: true,
    compactMode: false,
    spacing: 'cozy',
    nodeStyle: 'circle',
    connectorStyle: 'solid',
    themeColor: '#6366f1',
    ...settings
  });

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        showDate: true,
        showNumber: true,
        compactMode: false,
        spacing: 'cozy',
        nodeStyle: 'circle',
        connectorStyle: 'solid',
        themeColor: '#6366f1',
        ...settings
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateField = (fields: Partial<TimelineSettingsType>) => {
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
        aria-label="Cấu hình Dòng thời gian"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary border border-indigo-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Timeline</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập dòng thời gian</p>
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
            <SettingsSelect
              ariaLabel="Bố cục Timeline"
              value={localSettings.layout ?? 'vertical'}
              onChange={(value) => handleUpdateField({ layout: value as any })}
              options={[
                { value: 'vertical', label: 'Dọc (Vertical)' },
                { value: 'horizontal', label: 'Ngang (Horizontal)' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu nút mốc</span>
            <SettingsSelect
              ariaLabel="Kiểu nút mốc Timeline"
              value={localSettings.nodeStyle}
              onChange={(value) => handleUpdateField({ nodeStyle: value as any })}
              options={[
                { value: 'circle', label: 'Tròn' },
                { value: 'square', label: 'Vuông' },
                { value: 'pill', label: 'Bo góc vừa' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu đường nối</span>
            <SettingsSelect
              ariaLabel="Kiểu đường nối Timeline"
              value={localSettings.connectorStyle}
              onChange={(value) => handleUpdateField({ connectorStyle: value as any })}
              options={[
                { value: 'solid', label: 'Nét liền' },
                { value: 'dashed', label: 'Nét đứt' },
                { value: 'dotted', label: 'Chấm tròn' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Khoảng cách</span>
            <SettingsSelect
              ariaLabel="Khoảng cách Timeline"
              value={localSettings.spacing}
              onChange={(value) => handleUpdateField({ spacing: value as any })}
              options={[
                { value: 'compact', label: 'Chật hẹp' },
                { value: 'cozy', label: 'Vừa phải' },
                { value: 'comfortable', label: 'Rộng rãi' }
              ]}
            />
          </div>

          <div className="flex flex-col space-y-3 pt-2 border-t border-slate-100">
            <Checkbox
              checked={localSettings.direction === 'reverse'}
              onChange={(checked) => handleUpdateField({ direction: checked ? 'reverse' : 'normal' })}
              label={<span className="font-black text-slate-600">Đảo ngược thứ tự các mốc</span>}
            />
            <Checkbox
              checked={!!localSettings.showDate}
              onChange={(checked) => handleUpdateField({ showDate: checked })}
              label={<span className="font-black text-slate-600">Hiển thị ngày/mốc thời gian</span>}
            />
            <Checkbox
              checked={!!localSettings.showNumber}
              onChange={(checked) => handleUpdateField({ showNumber: checked })}
              label={<span className="font-black text-slate-600">Hiển thị số thứ tự thẻ</span>}
            />
            <Checkbox
              checked={!!localSettings.compactMode}
              onChange={(checked) => handleUpdateField({ compactMode: checked })}
              label={<span className="font-black text-slate-600">Chế độ thu gọn chữ (Compact)</span>}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-black text-slate-600 uppercase tracking-wider block">Màu sắc chủ đề</span>
            <div className="grid grid-cols-4 gap-2">
              {ACCENT_COLORS.map((color) => {
                const isSelected = localSettings.themeColor === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => handleUpdateField({ themeColor: color.value })}
                    className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: color.value }}
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
