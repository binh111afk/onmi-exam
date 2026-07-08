import React, { useEffect, useMemo } from 'react';
import { Network } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { MindmapCanvas } from './MindmapCanvas';
import { normalizeMindmapData } from './MindmapSchema';

interface MindmapBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  showUniversalToolbar?: boolean;
}

export const MindmapBlockComponent: React.FC<MindmapBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const mindmapData = useMemo(() => normalizeMindmapData(block.mindmapContent), [block.mindmapContent]);

  useEffect(() => {
    if (!block.mindmapContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        mindmapContent: mindmapData,
      });
    }
  }, [block, idx, isActive, mindmapData, onUpdateBlock]);

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 rounded-3xl border border-indigo-100 bg-indigo-50/20 p-3 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-primary">
        <span className="flex items-center gap-1.5">
          <Network size={12} className="stroke-[2.5]" /> Sơ đồ tư duy
        </span>
        <span className="rounded-lg border border-indigo-100 bg-white px-2 py-1 text-[8px] text-slate-400">
          Mindmap Block
        </span>
      </div>
      <MindmapCanvas
        data={mindmapData}
        mode="editor"
        isActive={isActive}
        onChange={(nextData, isDebounced) => onUpdateBlock(idx, {
          ...block,
          mindmapContent: nextData,
          text: nextData.nodes[nextData.rootId]?.title || block.text,
        }, isDebounced)}
      />
    </div>
  );
};

export const MindmapBlock = React.memo(MindmapBlockComponent);

