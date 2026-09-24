import React, { useState, useEffect } from 'react';
import { GitCommit, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { BlockEmptyState } from '../common/BlockEmptyState';
import { EditableText } from '../common/EditableText';
import { FlowToolbar } from './FlowToolbar';
import { FlowSettings } from './FlowSettings';
import { useFlow } from './hooks/useFlow';
import { createNewFlowContent } from './FlowUtils';

const FLOW_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

interface FlowBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  showUniversalToolbar?: boolean;
}

export const FlowBlockComponent: React.FC<FlowBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    steps,
    settings,
    addStep,
    deleteStep,
    duplicateStep,
    moveStep,
    updateStep,
    updateSettings,
  } = useFlow(block, idx, onUpdateBlock);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeColorPickerId, setActiveColorPickerId] = useState<string | null>(null);

  useEffect(() => {
    if (!block.flowContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        flowContent: createNewFlowContent(),
      });
    }
  }, [block, idx, isActive, onUpdateBlock]);

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<GitCommit size={10} className="stroke-[2.5]" />} label="Quy trình / Luồng xử lý" />

      <FlowToolbar
        isBlockActive={isActive}
        settings={settings}
        onAddStep={addStep}
        onUpdateSettings={updateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-col gap-3 mt-1 w-full">
        {steps.length === 0 ? (
          <BlockEmptyState
            text="Quy trình chưa có bước nào."
            actionLabel="Thêm bước"
            onAction={addStep}
            icon={<GitCommit size={20} />}
          />
        ) : (
          steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-sm transition flex flex-col gap-3 group relative animate-fadeIn"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    style={{ backgroundColor: step.color }}
                    className="text-[8px] font-black text-white px-2 py-0.5 rounded-full select-none"
                  >
                    Bước {index + 1}
                  </span>

                  {/* Color Picker Toggle */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveColorPickerId(activeColorPickerId === step.id ? null : step.id)}
                      style={{ backgroundColor: step.color }}
                      className="w-4 h-4 rounded-full border border-white shadow-2xs cursor-pointer hover:scale-110 transition"
                      title="Chọn màu"
                    />

                    {activeColorPickerId === step.id && (
                      <div className="absolute top-6 left-0 z-20 bg-white border border-slate-200 rounded-xl p-1.5 shadow-lg flex gap-1 animate-fadeIn">
                        {FLOW_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              updateStep(step.id, { ...step, color: c });
                              setActiveColorPickerId(null);
                            }}
                            style={{ backgroundColor: c }}
                            className="w-4.5 h-4.5 rounded-full border border-white shadow-3xs cursor-pointer hover:scale-110 transition"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition duration-150">
                  <button
                    onClick={() => moveStep(step.id, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => moveStep(step.id, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    onClick={() => duplicateStep(step.id)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="Nhân bản"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => deleteStep(step.id)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-655 cursor-pointer"
                    title="Xóa bước"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Edit inputs */}
              <div>
                <EditableText
                  mode="input"
                  value={step.title}
                  onChange={(val) => updateStep(step.id, { ...step, title: val })}
                  placeholder="Nhập tên bước..."
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-black text-slate-855 outline-none transition"
                />
              </div>

              <div>
                <EditableText
                  mode="textarea"
                  rows={2}
                  value={step.description}
                  onChange={(val) => updateStep(step.id, { ...step, description: val })}
                  placeholder="Mô tả các công việc ở bước này..."
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-655 outline-none transition resize-none leading-relaxed"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <FlowSettings
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export const FlowBlock = React.memo(FlowBlockComponent);
