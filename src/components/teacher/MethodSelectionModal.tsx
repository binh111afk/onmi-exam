import React from 'react';
import { X, Sparkles, Upload } from 'lucide-react';

interface MethodSelectionModalProps {
  onClose: () => void;
  onSelectEditor: () => void;
  onSelectUpload: () => void;
}

export const MethodSelectionModal: React.FC<MethodSelectionModalProps> = ({
  onClose,
  onSelectEditor,
  onSelectUpload,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full mx-4 shadow-2xl border border-slate-100 relative animate-fadeIn">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-full transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="text-base font-black text-[#1E293B] mb-2 text-center">
          Chọn phương thức soạn thảo
        </h3>
        <p className="text-[11px] text-slate-500 font-bold text-center mb-6 max-w-sm mx-auto">
          Hãy chọn cách thức tạo tài liệu phù hợp nhất với nhu cầu của bạn.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Tự soạn */}
          <div 
            onClick={onSelectEditor}
            className="border border-slate-100 hover:border-primary/20 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center group bg-slate-50/30 hover:bg-white"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Sparkles size={20} />
            </div>
            <h4 className="text-xs font-black text-[#1E293B] group-hover:text-primary transition-colors mb-1">
              Tự soạn tài liệu
            </h4>
            <p className="text-[10px] text-slate-500 font-bold leading-normal">
              Soạn lý thuyết trực tuyến với trình biên tập mạnh mẽ, hỗ trợ công thức và AI.
            </p>
          </div>

          {/* Option 2: Tải file */}
          <div 
            onClick={onSelectUpload}
            className="border border-slate-100 hover:border-primary/20 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center group bg-slate-50/30 hover:bg-white"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Upload size={20} />
            </div>
            <h4 className="text-xs font-black text-[#1E293B] group-hover:text-primary transition-colors mb-1">
              Tải file tài liệu
            </h4>
            <p className="text-[10px] text-slate-500 font-bold leading-normal">
              Tải lên tài liệu sẵn có (PDF, DOCX, DOC, PPTX...) để chia sẻ nhanh chóng.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] rounded-xl cursor-pointer transition"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};
