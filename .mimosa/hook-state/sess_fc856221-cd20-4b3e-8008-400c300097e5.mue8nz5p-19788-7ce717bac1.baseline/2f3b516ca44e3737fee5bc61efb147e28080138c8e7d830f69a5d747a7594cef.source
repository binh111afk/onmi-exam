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
      className="flex-1 p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <div className="flex items-center justify-between text-indigo-600 font-extrabold text-[8px] uppercase tracking-wide select-none">
        <span className="flex items-center gap-1.5">
          <Network size={10} className="stroke-[2.5]" /> Sơ đồ tư duy
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

