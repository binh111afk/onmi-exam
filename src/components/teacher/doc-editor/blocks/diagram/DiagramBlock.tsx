import React, { useState, useEffect } from 'react';
import { Network, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { BlockEmptyState } from '../common/BlockEmptyState';
import { EditableText } from '../common/EditableText';
import { DiagramToolbar } from './DiagramToolbar';
import { DiagramSettings } from './DiagramSettings';
import { useDiagram } from './hooks/useDiagram';
import { createNewDiagramContent } from './DiagramUtils';

const DIAGRAM_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

interface DiagramBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  showUniversalToolbar?: boolean;
}

export const DiagramBlockComponent: React.FC<DiagramBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    nodes,
    settings,
    addNode,
    deleteNode,
    updateNode,
    moveNode,
    duplicateNode,
    updateSettings,
  } = useDiagram(block, idx, onUpdateBlock);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeColorPickerId, setActiveColorPickerId] = useState<string | null>(null);

  useEffect(() => {
    if (!block.diagramContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        diagramContent: createNewDiagramContent(),
      });
    }
  }, [block, idx, isActive, onUpdateBlock]);



  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<Network size={10} className="stroke-[2.5]" />} label="Sơ đồ khái niệm" />

      <DiagramToolbar
        isBlockActive={isActive}
        settings={settings}
        onAddNode={addNode}
        onUpdateSettings={updateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-col gap-3 mt-1 w-full">
        {nodes.length === 0 ? (
          <BlockEmptyState
            text="Chưa có sơ đồ."
            actionLabel="Thêm nút"
            onAction={addNode}
            icon={<Network size={20} />}
          />
        ) : (
          <div className="flex flex-col gap-3 w-full animate-fadeIn">
            {nodes.map((node, index) => (
              <div
                key={node.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-sm transition flex flex-col gap-3 group relative"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ backgroundColor: node.color }}
                      className="text-[8px] font-black text-white px-2 py-0.5 rounded-full select-none"
                    >
                      Nút {index + 1}
                    </span>

                    {/* Color Picker Toggle */}
                    <div className="relative select-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveColorPickerId(activeColorPickerId === node.id ? null : node.id);
                        }}
                        style={{ backgroundColor: node.color }}
                        className="w-4 h-4 rounded-full border border-white shadow-2xs cursor-pointer hover:scale-110 transition"
                        title="Chọn màu nút"
                      />

                      {activeColorPickerId === node.id && (
                        <div className="absolute top-6 left-0 z-20 bg-white border border-slate-200 rounded-xl p-1.5 shadow-lg flex gap-1 animate-fadeIn">
                          {DIAGRAM_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateNode(node.id, { ...node, color: c });
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

                  {/* Node Action Buttons */}
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition duration-150 select-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveNode(node.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Di chuyển lên"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveNode(node.id, 'down');
                      }}
                      disabled={index === nodes.length - 1}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Di chuyển xuống"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateNode(node.id);
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Nhân bản"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-655 cursor-pointer"
                      title="Xóa nút"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Edit fields using EditableText */}
                <div className="flex flex-col gap-2">
                  <EditableText
                    mode="input"
                    value={node.title}
                    onChange={(val) => updateNode(node.id, { ...node, title: val })}
                    placeholder="Tên nút (VD: Khái niệm A)..."
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-black text-slate-800 outline-none transition"
                  />
                  <EditableText
                    mode="textarea"
                    rows={2}
                    value={node.description}
                    onChange={(val) => updateNode(node.id, { ...node, description: val })}
                    placeholder="Mô tả hoặc chi tiết của nút..."
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-650 outline-none transition resize-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DiagramSettings
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export const DiagramBlock = React.memo(DiagramBlockComponent);
