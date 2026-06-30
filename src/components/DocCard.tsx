import React from 'react';
import { Bookmark, FileText } from 'lucide-react';
import type { Document } from '../types';

interface DocCardProps {
  doc: Document;
  onSelect: (id: string) => void;
  onBookmarkToggle?: (docId: string) => void;
  isBookmarked?: boolean;
}

export const DocCard: React.FC<DocCardProps> = ({ 
  doc, 
  onSelect,
  onBookmarkToggle,
  isBookmarked = false
}) => {
  // Color code file extensions
  const formatBadges = {
    'PDF': 'bg-red-50 text-red-600 border-red-100',
    'DOCX': 'bg-blue-50 text-blue-600 border-blue-100',
    'Slide': 'bg-amber-50 text-amber-600 border-amber-100',
    'Tóm tắt': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Đề cương': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const badgeClass = formatBadges[doc.format] || 'bg-slate-50 text-slate-600 border-slate-100';

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle(doc.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(doc.id)}
      className="group w-full flex items-center justify-between gap-3.5 p-3.5 bg-white border border-slate-200/80 hover:border-slate-350 hover:bg-slate-50/50 transition-default cursor-pointer select-none"
    >
      {/* Left: Extension Badge */}
      <div className={`h-11 w-11 rounded border flex flex-col items-center justify-center shrink-0 font-black text-[9px] uppercase tracking-wider ${badgeClass}`}>
        <FileText size={14} className="opacity-80 mb-0.5" />
        <span>{doc.format}</span>
      </div>

      {/* Middle: Title & Meta Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-default leading-normal line-clamp-1">
          {doc.title}
        </h4>
        <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-text-secondary font-semibold">
          <span className="text-slate-400 capitalize">{doc.subject}</span>
          <span>•</span>
          <span>{doc.pageCount} trang</span>
          <span>•</span>
          <span>{doc.fileSize}</span>
          <span>•</span>
          <span>{doc.downloads >= 1000 ? `${(doc.downloads / 1000).toFixed(1)}K` : doc.downloads} lượt tải</span>
        </div>
      </div>

      {/* Right: Bookmark pin */}
      <button
        onClick={handleBookmark}
        className={`p-1.5 rounded-full border transition-default shrink-0 ${
          isBookmarked
            ? 'border-primary/20 bg-primary-light text-primary'
            : 'border-transparent text-slate-350 hover:border-slate-200 hover:text-slate-500'
        }`}
        title="Đánh dấu tài liệu"
      >
        <Bookmark size={13} className={isBookmarked ? 'fill-primary' : ''} />
      </button>

    </div>
  );
};
