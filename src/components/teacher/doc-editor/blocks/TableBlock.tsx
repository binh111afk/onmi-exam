import React from 'react';
import type { DocBlock } from '../DocPreviewSimulator';

interface TableBlockProps {
  block: DocBlock;
  idx: number;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

export const TableBlockComponent: React.FC<TableBlockProps> = ({
  block,
  idx,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const defaultRows = [
    ['Cột 1', 'Cột 2', 'Cột 3'],
    ['Dữ liệu 1', 'Dữ liệu 2', 'Dữ liệu 3'],
    ['Dữ liệu 4', 'Dữ liệu 5', 'Dữ liệu 6']
  ];
  const rows = block.rows || defaultRows;

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const updatedRows = rows.map((r, ri) => 
      ri === rIdx ? r.map((c, ci) => ci === cIdx ? val : c) : r
    );
    onUpdateBlock(idx, { ...block, rows: updatedRows });
  };

  return (
    <div 
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 bg-slate-50/50 border border-slate-200 rounded-xl p-3 select-none"
    >
      <table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden text-[9px] font-bold text-slate-700">
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="border border-slate-200 p-1.5 bg-white">
                  <input 
                    type="text" 
                    value={cell} 
                    onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-slate-700 font-bold focus:ring-0"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TableBlock = React.memo(TableBlockComponent);
