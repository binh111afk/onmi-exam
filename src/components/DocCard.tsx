import React from 'react';
import { Eye, Download, FileText, ArrowRight } from 'lucide-react';
import type { Document } from '../types';

interface DocCardProps {
  doc: Document;
  onSelect: (id: string) => void;
}

export const DocCard: React.FC<DocCardProps> = ({ doc, onSelect }) => {
  // Format color indicators
  const formatColors = {
    'PDF': 'bg-red-50 text-red-600 border-red-100',
    'DOCX': 'bg-blue-50 text-blue-600 border-blue-100',
    'Slide': 'bg-amber-50 text-amber-600 border-amber-100',
    'Tóm tắt': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Đề cương': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  // Decorative vector styling based on subject
  const subjectThemes = {
    'Toán học': 'bg-blue-50 border-blue-100/50 text-blue-600',
    'Vật lý': 'bg-purple-50 border-purple-100/50 text-purple-600',
    'Hóa học': 'bg-teal-50 border-teal-100/50 text-teal-600',
    'Tiếng Anh': 'bg-orange-50 border-orange-100/50 text-orange-600',
    'Sinh học': 'bg-emerald-50 border-emerald-100/50 text-emerald-600',
  };

  const themeClass = subjectThemes[doc.subject as keyof typeof subjectThemes] || 'bg-slate-50 text-slate-600';

  return (
    <div
      onClick={() => onSelect(doc.id)}
      className="group bg-white border border-slate-100 rounded-card p-4 flex flex-col justify-between cursor-pointer notion-shadow notion-card-hover"
    >
      {/* Document layout representation / Thumbnail */}
      <div className={`w-full aspect-[4/3] rounded-lg border flex flex-col justify-between p-3.5 mb-4 select-none ${themeClass}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-bold px-2 py-0.5 border rounded uppercase ${formatColors[doc.format]}`}>
            {doc.format}
          </span>
          <FileText size={16} className="opacity-60" />
        </div>
        
        {/* Mock content lines */}
        <div className="space-y-1.5 my-2">
          <div className="h-2 bg-current opacity-20 rounded w-11/12"></div>
          <div className="h-2 bg-current opacity-15 rounded w-5/6"></div>
          <div className="h-2 bg-current opacity-10 rounded w-3/4"></div>
        </div>

        <div className="flex items-center justify-between text-[9px] font-semibold opacity-70">
          <span>{doc.subject}</span>
          <span>{doc.grade}</span>
        </div>
      </div>

      {/* Info details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold text-text-primary group-hover:text-primary transition-default line-clamp-2 h-8 mb-2 leading-relaxed">
            {doc.title}
          </h3>
          <p className="text-[10px] text-text-secondary mb-3">
            Tác giả: <span className="font-medium">{doc.author}</span>
          </p>
        </div>

        {/* Footer specifications */}
        <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-text-secondary">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{doc.pageCount} trang</span>
            <span className="text-slate-300">•</span>
            <span>{doc.fileSize}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5">
              <Eye size={10} />
              {doc.views >= 1000 ? `${(doc.views / 1000).toFixed(1)}k` : doc.views}
            </span>
            <span className="flex items-center gap-0.5">
              <Download size={10} />
              {doc.downloads >= 1000 ? `${(doc.downloads / 1000).toFixed(1)}k` : doc.downloads}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-50 pt-2.5 mt-2.5 flex justify-end">
          <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 opacity-90 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-default">
            Đọc tài liệu
            <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  );
};
