import React from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { Checkbox } from '../../../../Checkbox';
import type { QuizSettings } from './QuizTypes';

interface QuizSettingsDialogProps {
  isOpen: boolean;
  settings: QuizSettings;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<QuizSettings>) => void;
}

export const QuizSettingsDialog: React.FC<QuizSettingsDialogProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const updatePassingScore = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    onUpdateSettings({ passingScore: Math.min(100, Math.max(0, parsed)) });
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
        aria-label="Cấu hình Quiz"
        className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn select-none"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary border border-indigo-100/50">
              <Settings size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">Cấu hình Quiz</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Thiết lập cách học sinh làm bài</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            aria-label="Đóng cấu hình Quiz"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col space-y-3">
            <Checkbox
              checked={settings.shuffleQuestions}
              onChange={(checked) => onUpdateSettings({ shuffleQuestions: checked })}
              label={<span className="text-[10px] font-black text-slate-600">Trộn thứ tự câu hỏi</span>}
            />
            <Checkbox
              checked={settings.shuffleOptions}
              onChange={(checked) => onUpdateSettings({ shuffleOptions: checked })}
              label={<span className="text-[10px] font-black text-slate-600">Trộn thứ tự phương án</span>}
            />
            <Checkbox
              checked={settings.showCorrectAnswers}
              onChange={(checked) => onUpdateSettings({ showCorrectAnswers: checked })}
              label={<span className="text-[10px] font-black text-slate-600">Hiển thị đáp án đúng</span>}
            />
          </div>

          <div className="h-px bg-slate-100" />

          <label className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-slate-655 uppercase tracking-wider">Điểm đạt</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={settings.passingScore}
                onChange={(event) => updatePassingScore(event.target.value)}
                className="w-20 text-center py-2 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-slate-800"
              />
              <span className="text-[10px] font-black text-slate-400">%</span>
            </div>
          </label>
        </div>
      </section>
    </div>,
    document.body
  );
};
