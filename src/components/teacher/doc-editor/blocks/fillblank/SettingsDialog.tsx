import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { Checkbox } from '../../../../Checkbox';
import type { FillBlankSettings as FillBlankSettingsType } from './Types';

interface SettingsDialogProps {
  isOpen: boolean;
  settings: FillBlankSettingsType;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<FillBlankSettingsType>) => void;
}

const THEME_COLORS = [
  { name: 'Tím', value: '#8b5cf6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Xanh dương', value: '#3b82f6' },
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
  const [localSettings, setLocalSettings] = useState<FillBlankSettingsType>({
    shuffleBlanks: settings.shuffleBlanks ?? false,
    caseSensitive: settings.caseSensitive ?? false,
    showHints: settings.showHints ?? true,
    showAnswerAfterSubmit: settings.showAnswerAfterSubmit ?? true,
    partialScoring: settings.partialScoring ?? true,
    acceptMultipleAnswers: settings.acceptMultipleAnswers ?? true,
    blankStyle: settings.blankStyle ?? 'underline',
    maxAttempts: settings.maxAttempts ?? 3,
    themeColor: settings.themeColor ?? '#8b5cf6',
  });

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        shuffleBlanks: settings.shuffleBlanks ?? false,
        caseSensitive: settings.caseSensitive ?? false,
        showHints: settings.showHints ?? true,
        showAnswerAfterSubmit: settings.showAnswerAfterSubmit ?? true,
        partialScoring: settings.partialScoring ?? true,
        acceptMultipleAnswers: settings.acceptMultipleAnswers ?? true,
        blankStyle: settings.blankStyle ?? 'underline',
        maxAttempts: settings.maxAttempts ?? 3,
        themeColor: settings.themeColor ?? '#8b5cf6',
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateField = (fields: Partial<FillBlankSettingsType>) => {
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
        aria-label="Cấu hình Điền từ"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-primary border border-purple-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Điền từ</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập bài tập điền khuyết</p>
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
              checked={localSettings.shuffleBlanks}
              onChange={(checked) => handleUpdateField({ shuffleBlanks: checked })}
              label={<span className="font-black text-slate-600">Hiển thị từ gợi ý xáo trộn ở đầu</span>}
            />
            <Checkbox
              checked={localSettings.caseSensitive}
              onChange={(checked) => handleUpdateField({ caseSensitive: checked })}
              label={<span className="font-black text-slate-600">Phân biệt chữ hoa / chữ thường</span>}
            />
            <Checkbox
              checked={localSettings.showHints}
              onChange={(checked) => handleUpdateField({ showHints: checked })}
              label={<span className="font-black text-slate-600">Hiển thị gợi ý khi rê chuột</span>}
            />
            <Checkbox
              checked={localSettings.showAnswerAfterSubmit}
              onChange={(checked) => handleUpdateField({ showAnswerAfterSubmit: checked })}
              label={<span className="font-black text-slate-600">Hiển thị đáp án đúng sau khi nộp bài</span>}
            />
            <Checkbox
              checked={localSettings.partialScoring}
              onChange={(checked) => handleUpdateField({ partialScoring: checked })}
              label={<span className="font-black text-slate-600">Tính điểm riêng lẻ từng chỗ trống</span>}
            />
            <Checkbox
              checked={localSettings.acceptMultipleAnswers}
              onChange={(checked) => handleUpdateField({ acceptMultipleAnswers: checked })}
              label={<span className="font-black text-slate-600">Chấp nhận nhiều đáp án thay thế</span>}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-black text-slate-600 uppercase tracking-wider block">Kiểu ô nhập liệu</label>
            <select
              value={localSettings.blankStyle}
              onChange={(e) => handleUpdateField({ blankStyle: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-purple-500 focus:bg-white"
            >
              <option value="underline">Gạch chân (Underline)</option>
              <option value="box">Hộp viền liền (Box)</option>
              <option value="dashed">Viền nét đứt (Dashed)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-black text-slate-600 uppercase tracking-wider block">Số lần làm lại tối đa</label>
            <input
              type="number"
              min={1}
              max={20}
              value={localSettings.maxAttempts}
              onChange={(e) => handleUpdateField({ maxAttempts: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-purple-500 focus:bg-white"
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
            className="px-4 py-2 text-white font-black rounded-xl transition cursor-pointer select-none shadow-md shadow-purple-500/10"
          >
            Áp dụng
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
};
