import React from 'react';
import type { OmlTableBlock } from '../../../../types/oml';
import { renderInlineMarkdown } from '../utils';

interface TableBlockProps {
  block: OmlTableBlock;
}

export const TableBlock: React.FC<TableBlockProps> = ({ block }) => {
  return (
    <figure className="my-3">
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-indigo-50/60 border-b border-indigo-100">
              {(block.headers ?? []).map((header, headerIdx) => (
                <th
                  key={headerIdx}
                  className="px-4 py-2.5 text-left font-semibold text-slate-800 border border-indigo-100/70"
                >
                  {renderInlineMarkdown(String(header))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(block.rows ?? []).map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-1.5 text-slate-600 font-medium border border-slate-100">
                    {renderInlineMarkdown(String(cell))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-center text-sm font-medium text-gray-500">
          {renderInlineMarkdown(block.caption)}
        </figcaption>
      )}
    </figure>
  );
};
