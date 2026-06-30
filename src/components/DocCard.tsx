import React from 'react';
import { Bookmark, Eye, Download, Calendar } from 'lucide-react';
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
  // Format badge classes
  const formatBadges = {
    'PDF': 'bg-red-55 text-red-600',
    'DOCX': 'bg-blue-55 text-blue-600',
    'Slide': 'bg-amber-55 text-amber-600',
    'Tóm tắt': 'bg-emerald-55 text-emerald-600',
    'Đề cương': 'bg-indigo-55 text-indigo-600',
  };

  const badgeClass = formatBadges[doc.format as keyof typeof formatBadges] || 'bg-slate-100 text-slate-600';

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle(doc.id);
    }
  };

  // Helper to render realistic document exam paper preview
  const renderThumbnail = (subject: string) => {
    const isMath = subject === 'Toán học';
    const isPhys = subject === 'Vật lý';
    const isChem = subject === 'Hóa học';

    return (
      <div className="w-full h-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.04)] border border-slate-100 rounded-lg p-3 text-[4px] leading-tight select-none overflow-hidden relative flex flex-col justify-between">
        
        {/* Header of paper */}
        <div className="flex justify-between items-center border-b-[0.5px] border-slate-200 pb-1 mb-1">
          <div className="font-extrabold text-slate-700 uppercase tracking-[0.05em] scale-75 origin-left">
            {isMath ? 'SỞ GD&ĐT BẮC NINH' : isPhys ? 'SỞ GD&ĐT THANH HÓA' : 'SỞ GD&ĐT NGHỆ AN'}
          </div>
          <div className="font-semibold text-slate-500 scale-75 origin-right">MÃ ĐỀ: 101</div>
        </div>

        {/* Paper Title */}
        <div className="text-center my-1">
          <div className="font-black text-slate-800 scale-90 uppercase">ĐỀ KHẢO SÁT CHẤT LƯỢNG</div>
          <div className="font-medium text-slate-500 scale-75">Môn: {subject} - Lớp 12</div>
        </div>

        {/* Questions block */}
        <div className="space-y-2 flex-1 mt-1 text-slate-600">
          <div>
            <span className="font-bold text-slate-800">PHẦN I.</span> Câu hỏi trắc nghiệm khách quan.
          </div>

          {/* Render diagrams depending on subject */}
          {isMath && (
            <div className="my-2 h-14 w-full flex items-center justify-center bg-slate-50 border border-slate-100 rounded-md">
              <svg viewBox="0 0 100 65" className="h-full text-primary" stroke="currentColor" fill="none" strokeWidth="1">
                {/* 3D Pyramid diagram */}
                <path d="M50 8 L18 48 L82 48 Z" strokeWidth="1.2" />
                <path d="M50 8 L46 52 L82 48" strokeDasharray="2 2" />
                <line x1="18" y1="48" x2="46" y2="52" strokeDasharray="2 2" />
                <line x1="50" y1="8" x2="46" y2="52" strokeDasharray="2 2" />
                
                {/* Math Labels */}
                <text x="48" y="5" fill="#6C5DD3" fontSize="5" fontWeight="bold">S</text>
                <text x="12" y="52" fill="#475569" fontSize="4">A</text>
                <text x="84" y="52" fill="#475569" fontSize="4">C</text>
                <text x="44" y="58" fill="#475569" fontSize="4">B</text>
              </svg>
            </div>
          )}

          {isPhys && (
            <div className="my-2 h-14 w-full flex items-center justify-center bg-slate-50 border border-slate-100 rounded-md">
              <svg viewBox="0 0 100 65" className="h-full text-emerald-600" stroke="currentColor" fill="none" strokeWidth="1">
                {/* Sine wave graph */}
                <path d="M10 32 Q28 8, 46 32 T82 32 T100 32" strokeWidth="1.2" />
                {/* Axis lines */}
                <line x1="10" y1="32" x2="90" y2="32" stroke="#64748B" strokeWidth="0.8" />
                <line x1="15" y1="8" x2="15" y2="55" stroke="#64748B" strokeWidth="0.8" />
                {/* Axis arrows */}
                <path d="M13 12 L15 8 L17 12" fill="#64748B" stroke="none" />
                <path d="M88 30 L92 32 L88 34" fill="#64748B" stroke="none" />
                <text x="9" y="8" fill="#475569" fontSize="4">y</text>
                <text x="91" y="38" fill="#475569" fontSize="4">x</text>
              </svg>
            </div>
          )}

          {isChem && (
            <div className="my-2 h-14 w-full flex items-center justify-center bg-slate-50 border border-slate-100 rounded-md">
              <svg viewBox="0 0 100 65" className="h-full text-amber-600" stroke="currentColor" fill="none" strokeWidth="1">
                {/* Benzene Ring */}
                <polygon points="50,12 70,22 70,44 50,54 30,44 30,22" strokeWidth="1.2" />
                <polygon points="50,15 67,24 67,41 50,50 33,41 33,24" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                {/* Chemical substituent */}
                <line x1="50" y1="12" x2="50" y2="4" strokeWidth="1.2" />
                <text x="46" y="3" fill="#B45309" fontSize="4.5" fontWeight="bold">OH</text>
              </svg>
            </div>
          )}

          {!isMath && !isPhys && !isChem && (
            <div className="space-y-1 my-1 pl-1">
              <div className="h-1.5 w-11/12 bg-slate-100 rounded"></div>
              <div className="h-1.5 w-10/12 bg-slate-100 rounded"></div>
              <div className="h-1.5 w-8/12 bg-slate-100 rounded"></div>
              <div className="h-1.5 w-9/12 bg-slate-100 rounded"></div>
            </div>
          )}

          <div className="mt-1 leading-normal scale-95 origin-left">
            <span className="font-extrabold text-slate-800">Câu 1.</span> Cho hàm số y = f(x) liên tục và có bảng biến thiên...
          </div>
        </div>

        {/* Footer lines */}
        <div className="border-t-[0.5px] border-slate-100 pt-1 flex justify-between text-slate-400 scale-75 origin-bottom">
          <span>Trang 1/4</span>
          <span>© Onmi Exam</span>
        </div>

      </div>
    );
  };

  return (
    <div
      onClick={() => onSelect(doc.id)}
      className="group bg-white border border-slate-100 rounded-card p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 select-none cursor-pointer"
    >
      <div>
        {/* Top bar: Format badge & Save Button */}
        <div className="flex items-center justify-between mb-3.5">
          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>
            • {doc.format}
          </span>
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-full border transition-default shrink-0 cursor-pointer ${
              isBookmarked
                ? 'border-primary/20 bg-primary-light text-primary'
                : 'border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-500'
            }`}
            title="Đánh dấu tài liệu"
          >
            <Bookmark size={13} className={isBookmarked ? 'fill-primary' : ''} />
          </button>
        </div>

        {/* Center: Interactive Simulated Thumbnail */}
        <div className="aspect-[4/3] bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-center mb-4 overflow-hidden relative shadow-inner">
          {renderThumbnail(doc.subject)}
        </div>

        {/* Tag row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-orange-55 text-orange-700">
            • {doc.grade}
          </span>
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-55 text-accent">
            • Đề thi THPT
          </span>
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-55 text-success">
            • Có lời giải
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xs font-black text-text-primary group-hover:text-primary transition-colors leading-relaxed line-clamp-2 h-10 mb-4">
          {doc.title}
        </h3>
      </div>

      {/* Footer: Author & Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        
        {/* Author details */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary-light text-primary font-bold text-[9px] flex items-center justify-center border border-primary/10">
            {doc.author.split(' ').pop()?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-[10px] font-bold text-text-secondary truncate max-w-[80px]">
            {doc.author}
          </span>
        </div>

        {/* Stats metrics */}
        <div className="flex items-center gap-2 text-[9px] text-text-muted font-bold">
          <div className="flex items-center gap-0.5" title="Lượt xem">
            <Eye size={12} className="stroke-[2.5]" />
            <span>{doc.views >= 1000 ? `${(doc.views / 1000).toFixed(1)}K` : doc.views}</span>
          </div>
          <div className="flex items-center gap-0.5" title="Lượt tải">
            <Download size={12} className="stroke-[2.5]" />
            <span>{doc.downloads >= 1000 ? `${(doc.downloads / 1000).toFixed(1)}K` : doc.downloads}</span>
          </div>
          <div className="flex items-center gap-0.5" title="Ngày cập nhật">
            <Calendar size={12} className="stroke-[2.5]" />
            <span>{doc.updatedAt.split('-').reverse().slice(0, 2).join('/')}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
