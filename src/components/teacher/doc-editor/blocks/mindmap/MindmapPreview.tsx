import React, { useMemo, useState } from 'react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { MindmapCanvas } from './MindmapCanvas';
import { normalizeMindmapData } from './MindmapSchema';

interface MindmapPreviewProps {
  block: DocBlock;
}

export const MindmapPreview: React.FC<MindmapPreviewProps> = ({ block }) => {
  const initialData = useMemo(() => normalizeMindmapData(block.mindmapContent), [block.mindmapContent]);
  const [previewData, setPreviewData] = useState(initialData);

  return (
    <div className="my-2.5 overflow-hidden rounded-3xl border border-indigo-100 bg-white p-2 shadow-sm">
      <MindmapCanvas
        data={previewData}
        mode="preview"
        onChange={setPreviewData}
      />
    </div>
  );
};

