import React from 'react';
import { Plus, Settings, Shuffle } from 'lucide-react';
import type { FlashcardSettings as FlashcardSettingsType } from './FlashcardTypes';
import { FlashcardSettings } from './FlashcardSettings';

interface FlashcardToolbarProps {
  isBlockActive: boolean;
  settings: FlashcardSettingsType;
  onAddCard: () => void;
  onShuffleCards: () => void;
  onUpdateSettings: (settings: Partial<FlashcardSettingsType>) => void;
}

const SEP = () => <div className="w-px h-3.5 bg-slate-200 mx-0.5" />;

export const FlashcardToolbar: React.FC<FlashcardToolbarProps> = ({
  isBlockActive,
  settings,
  onAddCard,
  onShuffleCards,
  onUpdateSettings,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  if (!isBlockActive) return null;

  return (
    <div className="mb-2 animate-fadeIn select-none">
      <div className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onAddCard}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
        >
          <Plus size={12} className="stroke-[2.5]" /> Thêm thẻ
        </button>

        <SEP />

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onShuffleCards}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
          title="Trộn thẻ"
        >
          <Shuffle size={11} /> Trộn thẻ
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
          title="Cấu hình Flashcard"
        >
          <Settings size={11} /> Cấu hình
        </button>
      </div>

      <FlashcardSettings
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={onUpdateSettings}
      />
    </div>
  );
};
