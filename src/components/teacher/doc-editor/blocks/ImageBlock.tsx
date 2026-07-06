import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, AlertTriangle, AlignLeft, AlignCenter, AlignRight, RefreshCw, Type } from 'lucide-react';
import type { DocBlock } from '../../../../types/doc-editor';
import { uploadImageFile } from '../../../../services/imageUploadService';
import { Tooltip } from '../Tooltip';
import { useAlert } from '../../../common/Alert';

interface ImageBlockProps {
  block: DocBlock;
  idx: number;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

export const ImageBlockComponent: React.FC<ImageBlockProps> = ({
  block,
  idx,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState(block.caption || '');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sync caption state
  useEffect(() => {
    setCaptionText(block.caption || '');
  }, [block.caption]);

  // Handle outside click to close toolbar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsToolbarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Resolve cached image onLoad not firing gotcha
  useEffect(() => {
    if (block.src) {
      if (imageRef.current?.complete) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    }
  }, [block.src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const triggerReplace = () => {
    fileInputRef.current?.click();
  };

  const validateAndUploadFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      await showAlert({
        type: 'error',
        title: 'Định dạng không hỗ trợ',
        description: 'Định dạng tệp không hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF, WEBP hoặc SVG.'
      });
      return;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      await showAlert({
        type: 'error',
        title: 'Tệp quá lớn',
        description: 'Dung lượng tệp vượt quá 20MB. Vui lòng chọn tệp nhỏ hơn.'
      });
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      const localUrl = await uploadImageFile(file);
      onUpdateBlock(idx, {
        ...block,
        src: localUrl,
        caption: file.name
      });
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Drag to resize handler
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const parentContainer = containerRef.current?.parentElement;
    if (!parentContainer) return;
    
    const maxContainerWidth = parentContainer.clientWidth;
    const initialWidthPx = containerRef.current?.clientWidth || maxContainerWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidthPx = Math.max(120, Math.min(maxContainerWidth, initialWidthPx + deltaX * 2));
      const percentageWidth = `${Math.round((newWidthPx / maxContainerWidth) * 100)}%`;
      
      onUpdateBlock(idx, {
        ...block,
        width: percentageWidth
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCaptionSave = () => {
    setIsEditingCaption(false);
    onUpdateBlock(idx, {
      ...block,
      caption: captionText
    });
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCaptionSave();
    } else if (e.key === 'Escape') {
      setCaptionText(block.caption || '');
      setIsEditingCaption(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await validateAndUploadFile(files[0]);
    }
  };

  const justifyClass = block.align === 'left'
    ? 'justify-start'
    : block.align === 'right'
      ? 'justify-end'
      : 'justify-center';

  const defaultSrc = 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=500';
  const widthStyle = block.width || '100%';

  if (!block.src) {
    return (
      <div 
        onClick={() => setActiveBlockIndex(idx)}
        className={`flex-1 flex ${justifyClass} py-2`}
      >
        <div 
          ref={containerRef}
          style={{ width: widthStyle }}
          className="max-w-full"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/svg+xml" 
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                validateAndUploadFile(files[0]);
              }
            }}
            className="hidden" 
          />

          <div
            onClick={triggerReplace}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full py-10 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer select-none transition ${
              isDragOver 
                ? 'border-primary bg-primary-light/40 text-primary scale-[1.01]' 
                : 'border-slate-350 bg-slate-50/50 text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-50'
            }`}
          >
            <ImageIcon size={22} className="stroke-[2]" />
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black">Chọn hình ảnh</span>
              <span className="text-[8px] font-normal text-slate-400 mt-0.5">Hoặc kéo thả ảnh vào đây (Tối đa 20MB)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setActiveBlockIndex(idx)}
      className={`flex-1 flex ${justifyClass} py-2`}
    >
      <div 
        ref={containerRef}
        style={{ width: widthStyle }}
        className="relative flex flex-col group/img-container max-w-full font-sans"
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/svg+xml" 
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              validateAndUploadFile(files[0]);
            }
          }}
          className="hidden" 
        />

        {hasError && (
          <div 
            onClick={triggerReplace}
            className="w-full py-10 bg-rose-50/20 border border-rose-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-rose-500 font-bold text-[10px] cursor-pointer select-none gap-2 hover:bg-rose-50/50 transition"
          >
            <AlertTriangle size={20} />
            <span>Lỗi tải ảnh. Bấm vào đây để thay ảnh mới.</span>
          </div>
        )}

        <div className={`relative w-full rounded-2xl border border-slate-200/50 overflow-hidden ${hasError ? 'hidden' : 'block'}`}>
          <img 
            ref={imageRef}
            src={block.src || defaultSrc} 
            alt={block.alt || 'Document Illustration'}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="w-full h-auto object-contain cursor-pointer shadow-sm"
          />

          {isLoading && !hasError && (
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center animate-pulse text-slate-350 select-none z-10">
              <ImageIcon size={24} className="animate-bounce" />
            </div>
          )}

          <div 
            onMouseDown={handleResizeStart}
            className="absolute bottom-2.5 right-2.5 w-4 h-4 bg-white/90 border border-slate-200/60 rounded shadow-sm hover:scale-110 active:scale-95 flex items-center justify-center cursor-se-resize select-none opacity-0 group-hover/img-container:opacity-100 transition z-20"
          >
            <span className="text-[9px] font-black text-slate-500">↘</span>
          </div>
        </div>

        {isToolbarOpen && !hasError && (
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-[-36px] left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-slate-100 shadow-xl rounded-xl px-2 py-1 flex items-center gap-1.5 z-40 text-[9px] font-black text-slate-500 select-none animate-fadeIn"
          >
            <Tooltip content="Thay ảnh">
              <button 
                onClick={triggerReplace}
                className="p-1 hover:bg-slate-50 hover:text-slate-800 rounded transition cursor-pointer"
              >
                <RefreshCw size={11} />
              </button>
            </Tooltip>

            <span className="w-px h-3 bg-slate-100" />

            <Tooltip content="Đổi căn lề: Trái">
              <button 
                onClick={() => onUpdateBlock(idx, { ...block, align: 'left' })}
                className={`p-1 rounded transition cursor-pointer ${block.align === 'left' ? 'text-primary bg-primary-light' : 'hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <AlignLeft size={11} />
              </button>
            </Tooltip>
            <Tooltip content="Đổi căn lề: Giữa">
              <button 
                onClick={() => onUpdateBlock(idx, { ...block, align: 'center' })}
                className={`p-1 rounded transition cursor-pointer ${block.align === 'center' || !block.align ? 'text-primary bg-primary-light' : 'hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <AlignCenter size={11} />
              </button>
            </Tooltip>
            <Tooltip content="Đổi căn lề: Phải">
              <button 
                onClick={() => onUpdateBlock(idx, { ...block, align: 'right' })}
                className={`p-1 rounded transition cursor-pointer ${block.align === 'right' ? 'text-primary bg-primary-light' : 'hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <AlignRight size={11} />
              </button>
            </Tooltip>

            <span className="w-px h-3 bg-slate-100" />

            <button 
              onClick={() => onUpdateBlock(idx, { ...block, width: '33%' })}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${block.width === '33%' ? 'text-primary bg-primary-light' : 'hover:bg-slate-50 hover:text-slate-800'}`}
            >
              S
            </button>
            <button 
              onClick={() => onUpdateBlock(idx, { ...block, width: '66%' })}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${block.width === '66%' ? 'text-primary bg-primary-light' : 'hover:bg-slate-50 hover:text-slate-800'}`}
            >
              M
            </button>
            <button 
              onClick={() => onUpdateBlock(idx, { ...block, width: '100%' })}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${block.width === '100%' || !block.width ? 'text-primary bg-primary-light' : 'hover:bg-slate-50 hover:text-slate-800'}`}
            >
              L
            </button>

            <span className="w-px h-3 bg-slate-100" />

            <Tooltip content="Viết chú thích">
              <button 
                onClick={() => setIsEditingCaption(true)}
                className="p-1 hover:bg-slate-50 hover:text-slate-800 rounded transition cursor-pointer"
              >
                <Type size={11} />
              </button>
            </Tooltip>
          </div>
        )}

        <div className="mt-1.5 text-center text-[8px] font-bold text-slate-400 min-h-[14px]">
          {isEditingCaption ? (
            <input 
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              onBlur={handleCaptionSave}
              onKeyDown={handleCaptionKeyDown}
              placeholder="Viết chú thích cho hình ảnh..."
              autoFocus
              className="w-full text-center bg-slate-50/50 border border-slate-200/50 rounded px-1.5 py-0.5 outline-none font-bold text-slate-600 focus:ring-1 focus:ring-primary focus:border-primary text-[8px]"
            />
          ) : (
            <span 
              onClick={() => setIsEditingCaption(true)}
              className="cursor-text hover:text-slate-600 transition italic"
            >
              {block.caption || 'Thêm chú thích hình ảnh...'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ImageBlock = React.memo(ImageBlockComponent);
