import React, { useState, useEffect, useContext } from 'react';
import { Pencil } from 'lucide-react';
import { BlockSelectionContext } from '../BlockSelectionProvider';

interface InteractiveBlockShellProps {
  /** Student-face rendering (Preview component) — mặt mặc định */
  preview: React.ReactNode;
  /** Teacher editing form — chỉ mount khi đang sửa */
  editor: React.ReactNode;
  /** id của block — để kích hoạt selection trước khi mở form (editors phụ thuộc isActive) */
  blockId: string;
  isActive: boolean;
  isPreviewMode: boolean;
}

// Một nguồn render: block tương tác nhìn như thành phẩm (bản student), teacher bấm "Sửa" mới vào form.
// previewMode (Xem như học sinh) khóa luôn chip Sửa — canvas thuần đọc.
export const InteractiveBlockShell: React.FC<InteractiveBlockShellProps> = ({
  preview,
  editor,
  blockId,
  isActive,
  isPreviewMode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const selection = useContext(BlockSelectionContext);

  // Rời block (click nơi khác) → tự thoát form soạn, về lại preview
  useEffect(() => {
    if (!isActive) setIsEditing(false);
  }, [isActive]);

  if (isPreviewMode) return <>{preview}</>;
  if (isEditing) return <>{editor}</>;

  return (
    <div className="relative group/shell">
      {preview}
      <button
        type="button"
        onMouseDown={(e) => { e.stopPropagation(); selection?.selectBlock(blockId); }}
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
        className="absolute top-2 right-2 opacity-0 group-hover/shell:opacity-100 transition flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 text-[11px] font-bold rounded-lg shadow-sm cursor-pointer z-10"
      >
        <Pencil size={11} /> Sửa
      </button>
    </div>
  );
};
