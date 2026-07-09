import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { Checkbox } from '../../../../Checkbox';
import type { DragDropSettings as DragDropSettingsType } from './Types';

interface SettingsDialogProps {
  isOpen: boolean;
  settings: DragDropSettingsType;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<DragDropSettingsType>) => void;
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

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<DragDropSettingsType>({
    shuffleCards: settings.shuffleCards ?? true,
    shuffleZones: settings.shuffleZones ?? true,
    allowRetry: settings.allowRetry ?? true,
    snapAnimation: settings.snapAnimation ?? true,
    showCorrectAnswer: settings.showCorrectAnswer ?? true,
    autoCheck: settings.autoCheck ?? false,
    multipleCorrect: settings.multipleCorrect ?? true,
    randomOrder: settings.randomOrder ?? false,
    themeColor: settings.themeColor ?? '#3b82f6',
  });

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        shuffleCards: settings.shuffleCards ?? true,
        shuffleZones: settings.shuffleZones ?? true,
        allowRetry: settings.allowRetry ?? true,
        snapAnimation: settings.snapAnimation ?? true,
        showCorrectAnswer: settings.showCorrectAnswer ?? true,
        autoCheck: settings.autoCheck ?? false,
        multipleCorrect: settings.multipleCorrect ?? true,
        randomOrder: settings.randomOrder ?? false,
        themeColor: settings.themeColor ?? '#3b82f6',
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateField = (fields: Partial<DragDropSettingsType>) => {
    const nextSettings = { ...localSettings, ...fields };
    setLocalSettings(nextSettings);
    onUpdateSettings(nextSettings);
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
        aria-label="Cấu hình Kéo thả"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-primary border border-blue-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Kéo thả</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập bài tập phân loại</p>
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
          <div className="space-y-3">
            <Checkbox
              checked={localSettings.shuffleCards}
              onChange={(checked) => handleUpdateField({ shuffleCards: checked })}
              label={<span className="font-black text-slate-600">Xáo trộn vị trí các thẻ khi bắt đầu</span>}
            />
            <Checkbox
              checked={localSettings.shuffleZones}
              onChange={(checked) => handleUpdateField({ shuffleZones: checked })}
              label={<span className="font-black text-slate-600">Xáo trộn vị trí các vùng thả</span>}
            />
            <Checkbox
              checked={localSettings.allowRetry}
              onChange={(checked) => handleUpdateField({ allowRetry: checked })}
              label={<span className="font-black text-slate-600">Cho phép học sinh làm lại bài</span>}
            />
            <Checkbox
              checked={localSettings.snapAnimation}
              onChange={(checked) => handleUpdateField({ snapAnimation: checked })}
              label={<span className="font-black text-slate-600">Hiệu ứng thẻ bay vào vị trí (Snap)</span>}
            />
            <Checkbox
              checked={localSettings.showCorrectAnswer}
              onChange={(checked) => handleUpdateField({ showCorrectAnswer: checked })}
              label={<span className="font-black text-slate-600">Hiển thị đáp án đúng sau khi nộp</span>}
            />
            <Checkbox
              checked={localSettings.autoCheck}
              onChange={(checked) => handleUpdateField({ autoCheck: checked })}
              label={<span className="font-black text-slate-600">Tự động kiểm tra thẻ khi được thả</span>}
            />
            <Checkbox
              checked={localSettings.multipleCorrect}
              onChange={(checked) => handleUpdateField({ multipleCorrect: checked })}
              label={<span className="font-black text-slate-600">Cho phép thả nhiều thẻ vào cùng 1 vùng</span>}
            />
            <Checkbox
              checked={localSettings.randomOrder}
              onChange={(checked) => handleUpdateField({ randomOrder: checked })}
              label={<span className="font-black text-slate-600">Cho phép thẻ sắp xếp thứ tự ngẫu nhiên trong vùng</span>}
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
                    type="button"
                    onClick={() => handleUpdateField({ themeColor: color.value })}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition cursor-pointer ${isSelected
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-100 hover:border-slate-200'
                      }`}
                  >
                    <span
                      style={{ backgroundColor: color.value }}
                      className="w-4 h-4 rounded-full shadow-inner border border-black/5"
                    />
                    <span className="text-[8px] font-black text-slate-500">{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 font-black rounded-xl transition cursor-pointer select-none"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateSettings(localSettings);
              onClose();
            }}
            style={{ backgroundColor: localSettings.themeColor }}
            className="px-4 py-2 text-white font-black rounded-xl transition cursor-pointer select-none shadow-md"
          >
            Áp dụng
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
};
