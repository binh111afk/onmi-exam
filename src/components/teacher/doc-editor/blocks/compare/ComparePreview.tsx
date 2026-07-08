import React from 'react';
import type { CompareContent } from './CompareTypes';

interface ComparePreviewProps {
  content: CompareContent;
}

export const ComparePreview: React.FC<ComparePreviewProps> = ({ content }) => {
  const columns = content.columns || [];
  const settings = content.settings || {};
  const themeColor = settings.themeColor || '#6366f1';

  if (columns.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs font-bold select-none">
        Chưa có nội dung để so sánh.
      </div>
    );
  }

  // Card styles
  const cardStyleClass = {
    bordered: 'bg-white border border-slate-150',
    flat: 'bg-slate-50/50 border border-transparent shadow-none',
    shadow: 'bg-white border border-slate-100 shadow-md'
  }[settings.cardStyle || 'bordered'] || 'bg-white border border-slate-150';

  const borderClass = settings.showBorder !== false ? 'border border-slate-150' : 'border border-transparent';
  const heightClass = settings.equalHeight !== false ? 'items-stretch' : 'items-start';

  const spacingClass = {
    compact: 'gap-2',
    normal: 'gap-4',
    wide: 'gap-6'
  }[settings.columnSpacing || 'normal'] || 'gap-4';

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  }[Math.min(4, Math.max(1, columns.length))] || 'grid-cols-1';

  // Mobile layout responsiveness
  const containerClass = settings.responsiveMode === 'scroll'
    ? `flex overflow-x-auto pb-2 md:grid ${gridClass}`
    : `grid ${gridClass}`;

  const columnWidthClass = settings.responsiveMode === 'scroll'
    ? 'min-w-[200px] max-w-[280px] md:max-w-none flex-1 shrink-0'
    : '';

  return (
    <div className={`${containerClass} ${spacingClass} ${heightClass} w-full mt-1 animate-fadeIn`}>
      {columns.map((col, idx) => {
        // Header styles
        let headerStyleObj: React.CSSProperties = {};
        let headerClass = 'px-4 py-3 border-b flex items-center justify-between ';

        if (settings.headerStyle === 'minimal') {
          headerClass += 'bg-transparent border-transparent pt-4 pb-1';
        } else if (settings.headerStyle === 'accent') {
          headerClass += 'bg-white';
          headerStyleObj = { borderBottom: `2.5px solid ${themeColor}` };
        } else {
          // Default: filled
          headerClass += 'bg-slate-50/50 border-slate-150';
          headerStyleObj = { borderTop: `4px solid ${themeColor}` };
        }

        return (
          <div
            key={col.id || idx}
            className={`rounded-2xl overflow-hidden flex flex-col hover:shadow-xs transition duration-200 ${cardStyleClass} ${borderClass} ${columnWidthClass}`}
          >
            <div
              style={headerStyleObj}
              className={headerClass}
            >
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                {col.title || `Đối tượng ${idx + 1}`}
              </h4>
              <span
                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                className="text-[9px] font-black px-2 py-0.5 rounded-full select-none"
              >
                #{idx + 1}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col bg-white">
              <div className="text-slate-650 text-[10px] font-semibold leading-relaxed whitespace-pre-wrap flex-1">
                {col.content || 'Nhập nội dung so sánh...'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
