import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { Checkbox } from '../../../../Checkbox';
import type { SortOrderSettings as SortOrderSettingsType } from './Types';

interface SettingsDialogProps {
  isOpen: boolean;
  settings: SortOrderSettingsType;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<SortOrderSettingsType>) => void;
}

const THEME_COLORS = [
  { name: 'Xanh lá', value: '#10b981' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Xanh dương', value: '#3b82f6' },
  { name: 'Tím', value: '#8b5cf6' },
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
  const [localSettings, setLocalSettings] = useState<SortOrderSettingsType>({
    shuffleInitialOrder: settings.shuffleInitialOrder ?? true,
    order: settings.order ?? 'ascending',
    allowRetry: settings.allowRetry ?? true,
    showExplanation: settings.showExplanation ?? false,
    explanationText: settings.explanationText ?? '',
    autoCheck: settings.autoCheck ?? false,
    score: settings.score ?? 1,
    themeColor: settings.themeColor ?? '#10b981',
  });

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        shuffleInitialOrder: settings.shuffleInitialOrder ?? true,
        order: settings.order ?? 'ascending',
        allowRetry: settings.allowRetry ?? true,
        showExplanation: settings.showExplanation ?? false,
        explanationText: settings.explanationText ?? '',
        autoCheck: settings.autoCheck ?? false,
        score: settings.score ?? 1,
        themeColor: settings.themeColor ?? '#10b981',
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateField = (fields: Partial<SortOrderSettingsType>) => {
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
        aria-label="Cấu hình Sắp xếp"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary border border-emerald-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Sắp xếp</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập bài tập thứ tự</p>
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
              checked={localSettings.shuffleInitialOrder}
              onChange={(checked) => handleUpdateField({ shuffleInitialOrder: checked })}
              label={<span className="font-black text-slate-600">Trộn thứ tự ngẫu nhiên khi bắt đầu</span>}
            />
            <Checkbox
              checked={localSettings.allowRetry}
              onChange={(checked) => handleUpdateField({ allowRetry: checked })}
              label={<span className="font-black text-slate-600">Cho phép học sinh làm lại bài</span>}
            />
            <Checkbox
              checked={localSettings.autoCheck}
              onChange={(checked) => handleUpdateField({ autoCheck: checked })}
              label={<span className="font-black text-slate-600">Tự động kiểm tra sau mỗi lượt kéo</span>}
            />
            <Checkbox
              checked={localSettings.showExplanation}
              onChange={(checked) => handleUpdateField({ showExplanation: checked })}
              label={<span className="font-black text-slate-600">Hiển thị lời giải thích sau khi nộp</span>}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-black text-slate-600 uppercase tracking-wider block">Chiều sắp xếp đúng</label>
            <select
              value={localSettings.order}
              onChange={(e) => handleUpdateField({ order: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="ascending">Tăng dần (Ascending)</option>
              <option value="descending">Giảm dần (Descending)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-black text-slate-600 uppercase tracking-wider block">Điểm số bài tập</label>
            <input
              type="number"
              min={1}
              value={localSettings.score}
              onChange={(e) => handleUpdateField({ score: parseInt(e.target.value, 10) || 1 })}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {localSettings.showExplanation && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-black text-slate-600 uppercase tracking-wider block">Lời giải thích</label>
              <textarea
                value={localSettings.explanationText || ''}
                onChange={(e) => handleUpdateField({ explanationText: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white resize-none"
                placeholder="Nhập lời giải thích..."
              />
            </div>
          )}

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
