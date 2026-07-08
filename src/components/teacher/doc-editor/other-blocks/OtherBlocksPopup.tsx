import React from 'react';
import { X, Clock, Workflow, Layers } from 'lucide-react';
import { OtherBlockCard } from './OtherBlockCard';

interface OtherBlocksPopupProps {
  onClose: () => void;
  onSelectBlock: (type: 'timeline' | 'flow' | 'tabs') => void;
}

export const OtherBlocksPopup: React.FC<OtherBlocksPopupProps> = ({
  onClose,
  onSelectBlock,
}) => {
  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-100 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition cursor-pointer"
        >
          <X size={16} />
        </button>

        <h3 className="text-sm font-black text-[#1E293B] mb-2 text-center select-none">
          Khối mở rộng
        </h3>
        <p className="text-[10px] text-slate-500 font-bold text-center mb-6 select-none">
          Chọn khối chức năng bạn muốn chèn thêm vào tài liệu.
        </p>

        <div className="flex flex-col gap-3">
          <OtherBlockCard
            onClick={() => onSelectBlock('timeline')}
            icon={<Clock size={18} />}
            title="Timeline"
            description="Dòng thời gian trực quan"
          />

          <OtherBlockCard
            onClick={() => onSelectBlock('flow')}
            icon={<Workflow size={18} />}
            title="Quy trình"
            description="Các bước và luồng xử lý"
          />

          <OtherBlockCard
            onClick={() => onSelectBlock('tabs')}
            icon={<Layers size={18} />}
            title="Tabs"
            description="Hiển thị nội dung theo tab"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-[10px] rounded-xl cursor-pointer transition select-none"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
