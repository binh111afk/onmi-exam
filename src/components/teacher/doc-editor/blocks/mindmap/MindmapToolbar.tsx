import React, { useState } from 'react';
import {
  GitBranchPlus,
  Network,
  Palette,
  Plus,
} from 'lucide-react';
import type { MindmapLayout, MindmapNode } from './MindmapTypes';
import { MINDMAP_COLORS } from './MindmapUtils';

interface MindmapToolbarProps {
  selectedNode: MindmapNode;
  isReadOnly: boolean;
  onAddChild: () => void;
  onAddSibling: () => void;
  onColorChange: (color: string) => void;
  onAutoLayout: (layout: MindmapLayout) => void;
}

const ToolbarButton: React.FC<{
  label: string;
  disabled?: boolean;
  active?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ label, disabled, active, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-bold transition cursor-pointer ${
      disabled
        ? 'cursor-not-allowed text-slate-300'
        : active
          ? 'bg-primary-light text-primary'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const MindmapToolbar: React.FC<MindmapToolbarProps> = ({
  selectedNode,
  isReadOnly,
  onAddChild,
  onAddSibling,
  onColorChange,
  onAutoLayout,
}) => {
  const [openPanel, setOpenPanel] = useState<'color' | 'layout' | null>(null);

  if (isReadOnly) return null;

  return (
    <div className="absolute left-3 right-3 top-3 z-10 flex h-9 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white/95 px-2 py-1 shadow-2xs select-none">
      <div className="flex items-center gap-1">
        <ToolbarButton
          label="Thêm nhánh con"
          icon={<Plus size={12} />}
          onClick={onAddChild}
        />
        <div className="w-px h-3 bg-slate-200 mx-0.5" />
        <ToolbarButton
          label="Thêm nhánh ngang"
          icon={<GitBranchPlus size={12} />}
          onClick={onAddSibling}
          disabled={!selectedNode.parentId}
        />
        <div className="w-px h-3 bg-slate-200 mx-0.5" />
        
        {/* Màu sắc dropdown */}
        <div className="relative">
          <ToolbarButton
            label="Màu sắc"
            icon={<Palette size={12} />}
            onClick={() => setOpenPanel(openPanel === 'color' ? null : 'color')}
            active={openPanel === 'color'}
          />
          {openPanel === 'color' && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenPanel(null)} />
              <div className="absolute left-0 top-8 z-20 w-44 rounded-lg border border-slate-200 bg-white p-2.5 shadow-md animate-fadeIn">
                <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Màu sắc nhánh</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {MINDMAP_COLORS.map(color => (
                    <button
                      key={color.id}
                      type="button"
                      title={color.label}
                      onClick={() => {
                        onColorChange(color.value);
                        setOpenPanel(null);
                      }}
                      className={`h-5.5 w-5.5 rounded-full border-2 ${selectedNode.color === color.value ? 'border-slate-800' : 'border-white'} ${color.className} cursor-pointer shadow-3xs`}
                    />
                  ))}
                </div>
                <label className="mt-2.5 flex items-center justify-between gap-2 text-[9px] font-bold text-slate-500">
                  Tùy chỉnh
                  <input
                    type="color"
                    value={selectedNode.color}
                    onChange={(event) => onColorChange(event.target.value)}
                    className="h-5 w-9 cursor-pointer rounded border border-slate-200 bg-white p-0"
                  />
                </label>
              </div>
            </>
          )}
        </div>
        <div className="w-px h-3 bg-slate-200 mx-0.5" />

        {/* Bố cục dropdown */}
        <div className="relative">
          <ToolbarButton
            label="Bố cục"
            icon={<Network size={12} />}
            onClick={() => setOpenPanel(openPanel === 'layout' ? null : 'layout')}
            active={openPanel === 'layout'}
          />
          {openPanel === 'layout' && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenPanel(null)} />
              <div className="absolute left-0 top-8 z-20 flex w-32 flex-col gap-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-md animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    onAutoLayout('horizontal');
                    setOpenPanel(null);
                  }}
                  className="rounded px-2 py-1 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Bố cục ngang
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAutoLayout('vertical');
                    setOpenPanel(null);
                  }}
                  className="rounded px-2 py-1 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Bố cục dọc
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
