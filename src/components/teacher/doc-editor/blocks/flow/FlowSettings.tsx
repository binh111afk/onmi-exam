import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { SettingsSelect } from '../common/SettingsSelect';
import type { FlowSettings as FlowSettingsType } from './FlowTypes';

interface FlowSettingsProps {
  isOpen: boolean;
  settings: FlowSettingsType;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<FlowSettingsType>) => void;
}

const FLOW_THEME_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Xanh dương', value: '#3b82f6' },
  { name: 'Tím', value: '#8b5cf6' },
  { name: 'Xanh lá', value: '#10b981' },
  { name: 'Cam', value: '#f59e0b' },
  { name: 'Đỏ', value: '#ef4444' },
  { name: 'Xám', value: '#64748b' }
];

export const FlowSettings: React.FC<FlowSettingsProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<FlowSettingsType>({
    connectorStyle: 'solid',
    stepNumbering: 'numbers',
    cardStyle: 'bordered',
    stepSpacing: 'normal',
    themeColor: '#6366f1',
    ...settings
  });

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        connectorStyle: 'solid',
        stepNumbering: 'numbers',
        cardStyle: 'bordered',
        stepSpacing: 'normal',
        themeColor: '#6366f1',
        ...settings
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateField = (fields: Partial<FlowSettingsType>) => {
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
        aria-label="Cấu hình Quy trình"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary border border-indigo-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Quy trình</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập kiểu hiển thị</p>
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
              ariaLabel="Bố cục Quy trình"
              value={localSettings.layout ?? 'horizontal'}
              onChange={(value) => handleUpdateField({ layout: value as any })}
              options={[
                { value: 'horizontal', label: 'Ngang (Horizontal)' },
                { value: 'vertical', label: 'Dọc (Vertical)' },
                { value: 'zigzag', label: 'Zigzag' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu mũi tên</span>
            <SettingsSelect
              ariaLabel="Kiểu mũi tên Quy trình"
              value={localSettings.arrowStyle ?? 'straight'}
              onChange={(value) => handleUpdateField({ arrowStyle: value as any })}
              options={[
                { value: 'straight', label: 'Mũi tên thẳng' },
                { value: 'dashed', label: 'Mũi tên đứt nét' },
                { value: 'curved', label: 'Mũi tên cong' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu đường nối</span>
            <SettingsSelect
              ariaLabel="Kiểu đường nối Quy trình"
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
            <span className="font-black text-slate-600 uppercase tracking-wider">Đánh số bước</span>
            <SettingsSelect
              ariaLabel="Đánh số bước Quy trình"
              value={localSettings.stepNumbering}
              onChange={(value) => handleUpdateField({ stepNumbering: value as any })}
              options={[
                { value: 'numbers', label: 'Số tự nhiên (1, 2, 3)' },
                { value: 'roman', label: 'Số La Mã (I, II, III)' },
                { value: 'alphabet', label: 'Chữ cái (A, B, C)' },
                { value: 'none', label: 'Không hiển thị' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Kiểu thẻ card</span>
            <SettingsSelect
              ariaLabel="Kiểu thẻ card Quy trình"
              value={localSettings.cardStyle}
              onChange={(value) => handleUpdateField({ cardStyle: value as any })}
              options={[
                { value: 'bordered', label: 'Có viền nhẹ' },
                { value: 'flat', label: 'Không viền (Phẳng)' },
                { value: 'shadow', label: 'Đổ bóng' }
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-600 uppercase tracking-wider">Khoảng cách bước</span>
            <SettingsSelect
              ariaLabel="Khoảng cách bước Quy trình"
              value={localSettings.stepSpacing}
              onChange={(value) => handleUpdateField({ stepSpacing: value as any })}
              options={[
                { value: 'compact', label: 'Hẹp' },
                { value: 'normal', label: 'Thường' },
                { value: 'wide', label: 'Rộng' }
              ]}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-black text-slate-600 uppercase tracking-wider block">Màu sắc chủ đề</span>
            <div className="grid grid-cols-4 gap-2">
              {FLOW_THEME_COLORS.map((color) => {
                const isSelected = localSettings.themeColor === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => handleUpdateField({ themeColor: color.value })}
                    className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition cursor-pointer ${isSelected
                        ? 'border-indigo-400 bg-indigo-50'
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
