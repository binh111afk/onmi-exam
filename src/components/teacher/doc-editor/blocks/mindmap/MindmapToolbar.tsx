import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  ChevronDown,
  GitBranchPlus,
  Lightbulb,
  LocateFixed,
  Minus,
  Network,
  Palette,
  Pin,
  Plus,
  Settings,
  SmilePlus,
  Star,
  StickyNote,
  Trash2,
  TriangleAlert,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { MindmapIconOption, MindmapLayout, MindmapNode } from './MindmapTypes';
import { MINDMAP_COLORS, MINDMAP_ZOOM_MAX, MINDMAP_ZOOM_MIN } from './MindmapUtils';

interface MindmapToolbarProps {
  selectedNode: MindmapNode;
  zoom: number;
  isReadOnly: boolean;
  onAddChild: () => void;
  onAddSibling: () => void;
  onColorChange: (color: string) => void;
  onIconChange: (icon?: string) => void;
  onOpenNote: () => void;
  onAutoLayout: (layout: MindmapLayout) => void;
  onToggleCollapse: () => void;
  onZoomChange: (zoom: number) => void;
  onCenterView: () => void;
  onDeleteNode: () => void;
}

const iconOptions: MindmapIconOption[] = [
  { id: 'book', label: 'Book', type: 'lucide', icon: BookOpen },
  { id: 'brain', label: 'Brain', type: 'lucide', icon: Brain },
  { id: 'settings', label: 'Settings', type: 'lucide', icon: Settings },
  { id: 'pin', label: 'Pin', type: 'lucide', icon: Pin },
  { id: 'star', label: 'Star', type: 'lucide', icon: Star },
  { id: 'warning', label: 'Warning', type: 'lucide', icon: TriangleAlert },
  { id: 'idea', label: 'Idea', type: 'lucide', icon: Lightbulb },
  { id: 'book-emoji', label: 'Book Emoji', type: 'emoji' },
  { id: 'brain-emoji', label: 'Brain Emoji', type: 'emoji' },
  { id: 'gear-emoji', label: 'Gear Emoji', type: 'emoji' },
  { id: 'pin-emoji', label: 'Pin Emoji', type: 'emoji' },
  { id: 'star-emoji', label: 'Star Emoji', type: 'emoji' },
  { id: 'warning-emoji', label: 'Warning Emoji', type: 'emoji' },
  { id: 'idea-emoji', label: 'Idea Emoji', type: 'emoji' },
];

const emojiValues: Record<string, string> = {
  'book-emoji': '📖',
  'brain-emoji': '🧠',
  'gear-emoji': '⚙️',
  'pin-emoji': '📌',
  'star-emoji': '⭐',
  'warning-emoji': '⚠️',
  'idea-emoji': '💡',
};

const ToolbarButton: React.FC<{
  label: string;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ label, disabled, active, danger, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-[10px] font-black transition ${
      disabled
        ? 'cursor-not-allowed text-slate-300'
        : danger
          ? 'cursor-pointer text-danger hover:bg-danger-light'
          : active
            ? 'cursor-pointer bg-primary-light text-primary'
            : 'cursor-pointer text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {icon}
    <span className="hidden xl:inline">{label}</span>
  </button>
);

export const MindmapToolbar: React.FC<MindmapToolbarProps> = ({
  selectedNode,
  zoom,
  isReadOnly,
  onAddChild,
  onAddSibling,
  onColorChange,
  onIconChange,
  onOpenNote,
  onAutoLayout,
  onToggleCollapse,
  onZoomChange,
  onCenterView,
  onDeleteNode,
}) => {
  const [openPanel, setOpenPanel] = useState<'color' | 'icon' | 'layout' | null>(null);
  const activeIconLabel = useMemo(() => {
    if (!selectedNode.icon) return 'No icon';
    if (selectedNode.icon.startsWith('lucide:')) return selectedNode.icon.replace('lucide:', '');
    return selectedNode.icon;
  }, [selectedNode.icon]);

  return (
    <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-lg shadow-slate-200/70 backdrop-blur-md">
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        {!isReadOnly && (
          <>
            <ToolbarButton label="Add Child" icon={<Plus size={14} />} onClick={onAddChild} />
            <ToolbarButton label="Add Sibling" icon={<GitBranchPlus size={14} />} onClick={onAddSibling} />
            <div className="relative">
              <ToolbarButton label="Color" icon={<Palette size={14} />} onClick={() => setOpenPanel(openPanel === 'color' ? null : 'color')} active={openPanel === 'color'} />
              {openPanel === 'color' && (
                <div className="absolute left-0 top-11 z-20 w-52 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                  <div className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Node Colors</div>
                  <div className="grid grid-cols-6 gap-2">
                    {MINDMAP_COLORS.map(color => (
                      <button
                        key={color.id}
                        type="button"
                        title={color.label}
                        onClick={() => onColorChange(color.value)}
                        className={`h-7 w-7 rounded-full border-2 ${selectedNode.color === color.value ? 'border-slate-800' : 'border-white'} ${color.className} cursor-pointer shadow-sm`}
                      />
                    ))}
                  </div>
                  <label className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold text-slate-500">
                    Custom
                    <input
                      type="color"
                      value={selectedNode.color}
                      onChange={(event) => onColorChange(event.target.value)}
                      className="h-8 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white"
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="relative">
              <ToolbarButton label="Icon" icon={<SmilePlus size={14} />} onClick={() => setOpenPanel(openPanel === 'icon' ? null : 'icon')} active={openPanel === 'icon'} />
              {openPanel === 'icon' && (
                <div className="absolute left-0 top-11 z-20 w-64 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Node Icon</span>
                    <button type="button" onClick={() => onIconChange(undefined)} className="text-[9px] font-black text-slate-400 hover:text-danger">
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {iconOptions.map(option => {
                      const Icon = option.icon;
                      const iconValue = option.type === 'lucide' ? `lucide:${option.id}` : emojiValues[option.id];
                      return (
                        <button
                          key={option.id}
                          type="button"
                          title={option.label}
                          onClick={() => onIconChange(iconValue)}
                          className={`flex h-8 w-8 items-center justify-center rounded-xl border text-slate-600 transition ${
                            activeIconLabel === option.id || activeIconLabel === iconValue
                              ? 'border-primary bg-primary-light text-primary'
                              : 'border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          {Icon ? <Icon size={14} /> : <span className="text-sm">{iconValue}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <ToolbarButton label="Note" icon={<StickyNote size={14} />} onClick={onOpenNote} active={Boolean(selectedNode.note)} />
            <div className="relative">
              <ToolbarButton label="Auto Layout" icon={<Network size={14} />} onClick={() => setOpenPanel(openPanel === 'layout' ? null : 'layout')} active={openPanel === 'layout'} />
              {openPanel === 'layout' && (
                <div className="absolute left-0 top-11 z-20 flex w-40 flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                  <button type="button" onClick={() => onAutoLayout('horizontal')} className="rounded-xl px-3 py-2 text-left text-[10px] font-black text-slate-600 hover:bg-slate-50">
                    Horizontal
                  </button>
                  <button type="button" onClick={() => onAutoLayout('vertical')} className="rounded-xl px-3 py-2 text-left text-[10px] font-black text-slate-600 hover:bg-slate-50">
                    Vertical
                  </button>
                </div>
              )}
            </div>
            <ToolbarButton label="Collapse" icon={<ChevronDown size={14} />} onClick={onToggleCollapse} disabled={selectedNode.children.length === 0} />
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton label="Zoom Out" icon={<ZoomOut size={14} />} onClick={() => onZoomChange(Math.max(MINDMAP_ZOOM_MIN, zoom - 10))} />
        <input
          aria-label="Mindmap zoom"
          type="range"
          min={MINDMAP_ZOOM_MIN}
          max={MINDMAP_ZOOM_MAX}
          value={zoom}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          className="w-24 accent-primary"
        />
        <ToolbarButton label="Zoom In" icon={<ZoomIn size={14} />} onClick={() => onZoomChange(Math.min(MINDMAP_ZOOM_MAX, zoom + 10))} />
        <span className="w-12 text-center text-[10px] font-black text-slate-600">{zoom}%</span>
        <ToolbarButton label="Center View" icon={<LocateFixed size={14} />} onClick={onCenterView} />
        {!isReadOnly && (
          <ToolbarButton label="Delete Node" icon={<Trash2 size={14} />} onClick={onDeleteNode} disabled={!selectedNode.parentId} danger />
        )}
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => onZoomChange(100)}
            className="hidden h-9 items-center rounded-xl px-2 text-[10px] font-black text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:flex"
          >
            <Minus size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

