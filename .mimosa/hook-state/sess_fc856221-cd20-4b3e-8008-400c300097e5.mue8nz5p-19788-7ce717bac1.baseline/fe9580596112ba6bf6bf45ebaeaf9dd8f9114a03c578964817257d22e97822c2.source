import React from 'react';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  Minus, 
  MessageSquare, 
  ImageIcon, 
  Table, 
  Activity, 
  HelpCircle, 
  Award, 
  Video,
  Code2,
} from 'lucide-react';

export interface DocCommand {
  type: 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'divider' | 'callout' | 'image' | 'table' | 'formula' | 'code' | 'quiz' | 'flashcard' | 'mindmap' | 'media' | 'fillblank' | 'dragdrop' | 'sortorder';
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export const BLOCK_COMMANDS: DocCommand[] = [
  { 
    type: 'paragraph', 
    label: 'Văn bản (Paragraph)', 
    desc: 'Văn bản thường', 
    icon: <Type size={14} className="text-slate-500" /> 
  },
  { 
    type: 'heading-1', 
    label: 'Tiêu đề 1 (Heading 1)', 
    desc: 'Tiêu đề lớn cỡ 1', 
    icon: <Heading1 size={14} className="text-slate-500" /> 
  },
  { 
    type: 'heading-2', 
    label: 'Tiêu đề 2 (Heading 2)', 
    desc: 'Tiêu đề vừa cỡ 2', 
    icon: <Heading2 size={14} className="text-slate-500" /> 
  },
  { 
    type: 'heading-3', 
    label: 'Tiêu đề 3 (Heading 3)', 
    desc: 'Tiêu đề nhỏ cỡ 3', 
    icon: <Heading3 size={14} className="text-slate-500" /> 
  },
  { 
    type: 'divider', 
    label: 'Dấu phân cách (Divider)', 
    desc: 'Đường gạch ngang phân cách', 
    icon: <Minus size={14} className="text-slate-500" /> 
  },
  { 
    type: 'callout', 
    label: 'Hộp lưu ý (Callout)', 
    desc: 'Tạo hộp lưu ý nổi bật', 
    icon: <MessageSquare size={14} className="text-slate-500" /> 
  },
  { 
    type: 'image', 
    label: 'Hình ảnh (Image)', 
    desc: 'Chèn ảnh tải lên hoặc liên kết', 
    icon: <ImageIcon size={14} className="text-slate-500" /> 
  },
  { 
    type: 'table', 
    label: 'Bảng (Table)', 
    desc: 'Chèn bảng dữ liệu hàng cột', 
    icon: <Table size={14} className="text-slate-500" /> 
  },
  { 
    type: 'formula', 
    label: 'Công thức (Formula)', 
    desc: 'Chèn công thức toán học LaTeX', 
    icon: <Activity size={14} className="text-slate-500" /> 
  },
  { 
    type: 'quiz', 
    label: 'Trắc nghiệm (Quiz)', 
    desc: 'Chèn câu hỏi trắc nghiệm ôn tập', 
    icon: <HelpCircle size={14} className="text-slate-500" /> 
  },
  { 
    type: 'flashcard', 
    label: 'Flashcard', 
    desc: 'Chèn thẻ ghi nhớ ôn từ vựng', 
    icon: <Award size={14} className="text-slate-500" /> 
  },
  { 
    type: 'media', 
    label: 'Phương tiện (Media)', 
    desc: 'Chèn video hoặc tệp âm thanh', 
    icon: <Video size={14} className="text-slate-500" /> 
  },
  { 
    type: 'code', 
    label: 'Mã nguồn (Code)', 
    desc: 'Chèn khối code với tô màu cú pháp', 
    icon: <Code2 size={14} className="text-slate-500" /> 
  },
];
