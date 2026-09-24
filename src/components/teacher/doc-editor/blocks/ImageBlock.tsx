import React, { useState, useRef, useEffect, useContext } from 'react';
import { Image as ImageIcon, AlertTriangle, RefreshCw, Type, X, ImagePlus } from 'lucide-react';
import type { DocBlock, GalleryImage } from '../../../../types/doc-editor';
import { uploadImageFile } from '../../../../services/imageUploadService';
import { useAlert } from '../../../common/Alert';
import { BlockWrapperContext } from '../BlockWrapper';
import { containsLatexDelimiter, LatexText } from './common/LatexText';

interface ImageBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

export const ImageBlockComponent: React.FC<ImageBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const wrapperContext = useContext(BlockWrapperContext);
  const isPreview = wrapperContext?.isPreviewMode ?? false;
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState(block.caption || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [captionEditingIdx, setCaptionEditingIdx] = useState<number | null>(null);
  // R1 (Gatekeeper): key theo src — xóa ảnh không gây stale index
  const [galleryErrors, setGalleryErrors] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Ảnh suy dẫn: images nếu có, không thì [src] — block cũ 1 ảnh không cần migration
  const gallery: GalleryImage[] = block.images?.length
    ? block.images
    : block.src
      ? [{ src: block.src, caption: block.caption }]
      : [];

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

  /** Validate thuần (alert khi sai định dạng/dung lượng) — dùng chung mọi luồng upload */
  const validateFile = async (file: File): Promise<boolean> => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      await showAlert({
        type: 'error',
        title: 'Định dạng không hỗ trợ',
        description: 'Định dạng tệp không hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF, WEBP hoặc SVG.'
      });
      return false;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      await showAlert({
        type: 'error',
        title: 'Tệp quá lớn',
        description: 'Dung lượng tệp vượt quá 20MB. Vui lòng chọn tệp nhỏ hơn.'
      });
      return false;
    }
    return true;
  };

  // Luồng cũ: thay 1 ảnh ở mode đơn — giữ nguyên behavior
  const validateAndUploadFile = async (file: File) => {
    if (!(await validateFile(file))) return;

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

  /** Upload nhiều file: block trống + 1 file → luồng cũ; còn lại → append gallery
   * (R5 — Gatekeeper: file lỗi thì skip, giữ phần thành công, không rollback) */
  const handleFilesUpload = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    if (arr.length === 1 && !block.images && !block.src) {
      await validateAndUploadFile(arr[0]);
      return;
    }

    setIsLoading(true);
    const uploaded: GalleryImage[] = [];
    let failCount = 0;
    for (const file of arr) {
      if (!(await validateFile(file))) {
        failCount++;
        continue;
      }
      try {
        const url = await uploadImageFile(file);
        uploaded.push({ src: url, caption: file.name });
      } catch {
        failCount++;
      }
    }
    setIsLoading(false);

    if (uploaded.length === 0) {
      if (failCount > 0) {
        await showAlert({
          type: 'error',
          title: 'Tải ảnh thất bại',
          description: 'Không có ảnh nào được thêm (định dạng không hỗ trợ hoặc vượt 20MB).'
        });
      }
      return;
    }
    const base: GalleryImage[] = block.images?.length
      ? block.images
      : block.src
        ? [{ src: block.src, caption: block.caption }]
        : [];
    // Chuyển 1 lần sang images, gọn dual-source
    onUpdateBlock(idx, { ...block, src: undefined, caption: undefined, images: [...base, ...uploaded] });
    if (failCount > 0) {
      await showAlert({
        type: 'warning',
        title: 'Một số ảnh bỏ qua',
        description: `${failCount}/${arr.length} ảnh không hợp lệ hoặc tải lỗi — các ảnh còn lại đã được thêm.`
      });
    }
  };

  /** Ghi gallery: 1 mục (mode legacy) → về src; ≥2 → images; rỗng → placeholder */
  const writeGallery = (next: GalleryImage[]) => {
    if (next.length === 0) {
      onUpdateBlock(idx, { ...block, src: undefined, caption: undefined, images: undefined });
    } else if (next.length === 1 && !block.images) {
      onUpdateBlock(idx, { ...block, src: next[0].src, caption: next[0].caption, images: undefined });
    } else {
      onUpdateBlock(idx, { ...block, src: undefined, caption: undefined, images: next });
    }
  };

  const handleDeleteImage = (gi: number) => {
    if (!block.images) return;
    writeGallery(gallery.filter((_, i) => i !== gi));
  };

  const handleCaptionSave = () => {
    setCaptionEditingIdx(null);
    setIsEditingCaption(false);
    if (block.images?.length && captionEditingIdx !== null) {
      writeGallery(gallery.map((g, i) => (i === captionEditingIdx ? { ...g, caption: captionText } : g)));
    } else {
      onUpdateBlock(idx, { ...block, caption: captionText });
    }
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCaptionSave();
    } else if (e.key === 'Escape') {
      setCaptionText(block.images?.length && captionEditingIdx !== null ? gallery[captionEditingIdx]?.caption || '' : block.caption || '');
      setCaptionEditingIdx(null);
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
      await handleFilesUpload(files);
    }
  };

  // Drag to resize handler (mode đơn — gallery dùng width presets cho cả khối)
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

  useEffect(() => {
    if (wrapperContext && isActive) {
      if (block.images?.length) {
        // Mode gallery: per-image caption/delete nằm trên từng ảnh
        wrapperContext.registerCustomActions([
          {
            label: 'Thêm ảnh',
            icon: <ImagePlus size={11} />,
            onTrigger: () => appendInputRef.current?.click()
          },
          {
            label: '33%',
            onTrigger: () => onUpdateBlock(idx, { ...block, width: '33%' })
          },
          {
            label: '66%',
            onTrigger: () => onUpdateBlock(idx, { ...block, width: '66%' })
          },
          {
            label: '100%',
            onTrigger: () => onUpdateBlock(idx, { ...block, width: '100%' })
          }
        ]);
      } else {
        wrapperContext.registerCustomActions([
          {
            label: 'Thay ảnh',
            icon: <RefreshCw size={11} />,
            onTrigger: triggerReplace
          },
          {
            label: 'Thêm ảnh',
            icon: <ImagePlus size={11} />,
            onTrigger: () => appendInputRef.current?.click()
          },
          {
            label: 'Chú thích',
            icon: <Type size={11} />,
            onTrigger: () => setIsEditingCaption(true)
          },
          {
            label: '33%',
            onTrigger: () => onUpdateBlock(idx, { ...block, width: '33%' })
          },
          {
            label: '66%',
            onTrigger: () => onUpdateBlock(idx, { ...block, width: '66%' })
          },
          {
            label: '100%',
            onTrigger: () => onUpdateBlock(idx, { ...block, width: '100%' })
          }
        ]);
      }
    }
  }, [wrapperContext, isActive, idx, block.width, block.images]);

  const justifyClass = block.align === 'left'
    ? 'justify-start'
    : block.align === 'right'
      ? 'justify-end'
      : 'justify-center';

  const defaultSrc = 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=500';
  const widthStyle = block.width || '100%';

  // ---------- Placeholder: chưa có ảnh nào ----------
  if (gallery.length === 0) {
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
            multiple
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/svg+xml"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleFilesUpload(files);
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
                : 'border-slate-300 bg-slate-50/50 text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-50'
            }`}
          >
            <ImageIcon size={22} className="stroke-[2]" />
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black">Chọn hình ảnh</span>
              <span className="text-[8px] font-normal text-slate-400 mt-0.5">Hoặc kéo thả ảnh vào đây (Tối đa 20MB) — chọn nhiều ảnh để tạo bộ sưu tập</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Grid gallery: ≥2 ảnh ----------
  if (gallery.length >= 2) {
    return (
      <div
        onClick={() => setActiveBlockIndex(idx)}
        className={`flex-1 flex ${justifyClass} py-2`}
      >
        <div
          ref={containerRef}
          style={{ width: widthStyle }}
          className="max-w-full font-sans"
        >
          <input
            ref={appendInputRef}
            type="file"
            multiple
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/svg+xml"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleFilesUpload(files);
              }
              e.target.value = '';
            }}
            className="hidden"
          />

          <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            {gallery.map((img, gi) => (
              <div key={`${img.src}-${gi}`} className="relative flex flex-col gap-1 min-w-0 group/gi">
                <div className="relative rounded-xl overflow-hidden border border-slate-200/50">
                  {galleryErrors.has(img.src) ? (
                    <div className="h-40 flex items-center justify-center text-slate-400 text-[10px] font-bold bg-slate-50 gap-1.5">
                      <AlertTriangle size={16} /> Lỗi tải ảnh
                    </div>
                  ) : (
                    <img
                      src={img.src}
                      alt={img.caption || 'Ảnh minh họa'}
                      loading="lazy"
                      onError={() => setGalleryErrors(prev => new Set(prev).add(img.src))}
                      className="w-full h-40 object-cover cursor-pointer"
                      onClick={() => setIsToolbarOpen(!isToolbarOpen)}
                    />
                  )}
                  {!isPreview && (
                    <button
                      type="button"
                      title="Xóa ảnh"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(gi);
                      }}
                      className="absolute top-1.5 right-1.5 h-6 w-6 bg-white/90 border border-slate-200/60 rounded-full shadow-sm items-center justify-center text-slate-500 hover:text-red-500 hover:scale-110 transition hidden group-hover/gi:flex cursor-pointer z-10"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="text-center text-[8px] font-bold text-slate-400 min-h-[14px]">
                  {captionEditingIdx === gi ? (
                    <input
                      type="text"
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      onBlur={handleCaptionSave}
                      onKeyDown={handleCaptionKeyDown}
                      onFocus={() => setCaptionText(img.caption || '')}
                      placeholder="Chú thích cho ảnh..."
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-center bg-slate-50/50 border border-slate-200/50 rounded px-1.5 py-0.5 outline-none font-bold text-slate-600 focus:ring-1 focus:ring-primary focus:border-primary text-[8px]"
                    />
                  ) : (
                    <span
                      onClick={() => {
                        if (isPreview) return;
                        setCaptionEditingIdx(gi);
                        setCaptionText(img.caption || '');
                      }}
                      className={`${isPreview ? '' : 'cursor-text hover:text-slate-600 transition'} italic`}
                    >
                      {img.caption && containsLatexDelimiter(img.caption)
                        ? <LatexText value={img.caption} />
                        : img.caption || 'Thêm chú thích...'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Mode đơn: 1 ảnh (layout legacy nguyên vẹn) ----------
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
        <input
          ref={appendInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/svg+xml"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFilesUpload(files);
            }
            e.target.value = '';
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
            src={gallery[0].src || defaultSrc}
            alt={gallery[0].caption || 'Document Illustration'}
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

          {!isPreview && (
            <div
              onMouseDown={handleResizeStart}
              className="absolute bottom-2.5 right-2.5 w-4 h-4 bg-white/90 border border-slate-200/60 rounded shadow-sm hover:scale-110 active:scale-95 flex items-center justify-center cursor-se-resize select-none opacity-0 group-hover/img-container:opacity-100 transition z-20"
            >
              <span className="text-[9px] font-black text-slate-500">↘</span>
            </div>
          )}
        </div>

        <div className="mt-1.5 text-center text-[8px] font-bold text-slate-400 min-h-[14px]">
          {isEditingCaption || captionEditingIdx !== null ? (
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
              onClick={() => {
                if (isPreview) return;
                if (block.images?.length) {
                  setCaptionEditingIdx(0);
                  setCaptionText(gallery[0].caption || '');
                } else {
                  setIsEditingCaption(true);
                  setCaptionText(block.caption || '');
                }
              }}
              className={`${isPreview ? '' : 'cursor-text hover:text-slate-600 transition'} italic`}
            >
              {gallery[0].caption && containsLatexDelimiter(gallery[0].caption)
                ? <LatexText value={gallery[0].caption} />
                : gallery[0].caption || 'Thêm chú thích hình ảnh...'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ImageBlock = React.memo(ImageBlockComponent);
