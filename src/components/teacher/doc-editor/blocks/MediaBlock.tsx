import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Video, AlertTriangle, RefreshCw, Upload, Link as LinkIcon, X } from 'lucide-react';
import type { DocBlock } from '../../../../types/doc-editor';
import { useAlert } from '../../../common/Alert';
import { BlockWrapperContext } from '../BlockWrapper';
import { containsLatexDelimiter, LatexText } from './common/LatexText';

interface MediaBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  const gdRegExp = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const gdMatch = url.match(gdRegExp);
  if (gdMatch) {
    return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
  }

  return url;
};

export const MediaBlockComponent: React.FC<MediaBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const wrapperContext = useContext(BlockWrapperContext);
  const { showAlert } = useAlert();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'embed'>('upload');
  const [embedLink, setEmbedLink] = useState('');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState(block.caption || '');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync caption state
  useEffect(() => {
    setCaptionText(block.caption || '');
  }, [block.caption]);

  // Handle outside click to save caption
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsEditingCaption((prev) => {
          if (prev) {
            // Delay save to avoid race conditions with Blur
            setTimeout(() => {
              onUpdateBlock(idx, {
                ...block,
                caption: captionText,
                content: {
                  ...block.content,
                  caption: captionText
                }
              });
            }, 50);
          }
          return false;
        });
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [idx, block, captionText, onUpdateBlock]);

  const triggerUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      showAlert({
        type: 'error',
        title: 'Định dạng không hỗ trợ',
        description: 'Vui lòng chọn tệp video hợp lệ.'
      });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    onUpdateBlock(idx, {
      ...block,
      url: localUrl,
      sourceType: 'upload',
      caption: file.name,
      content: {
        ...block.content,
        url: localUrl,
        sourceType: 'upload',
        caption: file.name
      }
    });
    setShowModal(false);
  };

  const handleEmbedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!embedLink.trim()) return;

    const normalizedUrl = getEmbedUrl(embedLink.trim());
    onUpdateBlock(idx, {
      ...block,
      url: normalizedUrl,
      sourceType: 'embed',
      content: {
        ...block.content,
        url: normalizedUrl,
        sourceType: 'embed'
      }
    });
    setShowModal(false);
    setEmbedLink('');
  };

  const handleCaptionSave = () => {
    setIsEditingCaption(false);
    onUpdateBlock(idx, {
      ...block,
      caption: captionText,
      content: {
        ...block.content,
        caption: captionText
      }
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

  const triggerReplace = useCallback(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    if (wrapperContext && isActive) {
      wrapperContext.registerCustomActions([
        {
          label: 'Thay video',
          icon: <RefreshCw size={11} />,
          onTrigger: triggerReplace
        }
      ]);
    }
  }, [wrapperContext, isActive, idx, triggerReplace]);

  const blockUrl = block.url || block.content?.url || '';
  const blockSourceType = block.sourceType || block.content?.sourceType || 'upload';

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 flex justify-center py-2 animate-fadeIn"
    >
      <div
        ref={containerRef}
        className="relative flex flex-col group/video-container w-full max-w-lg font-sans"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleVideoFile(files[0]);
            }
          }}
          className="hidden"
        />

        {/* Video Preview */}
        {blockUrl ? (
          <div className="relative w-full rounded-2xl border border-slate-200/50 overflow-hidden bg-slate-950 aspect-video flex items-center justify-center shadow-sm">
            {blockSourceType === 'upload' ? (
              <video
                src={blockUrl}
                controls
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <iframe
                src={blockUrl}
                className="w-full h-full aspect-video rounded-lg border-0"
                allowFullScreen
                title="Embedded Video"
              />
            )}
          </div>
        ) : (
          <div
            onClick={() => setShowModal(true)}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                handleVideoFile(files[0]);
              }
            }}
            className={`w-full aspect-video rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer select-none transition ${
              isDragOver
                ? 'border-primary bg-primary-light/40 text-primary scale-[1.01]'
                : 'border-slate-300 bg-slate-50/50 text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-50'
            }`}
          >
            <Video size={24} className="stroke-[2]" />
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-[#1E293B]">Chọn phương tiện video</span>
              <span className="text-[8px] font-normal text-slate-400 mt-0.5">Bấm để tải video lên hoặc nhúng liên kết</span>
            </div>
          </div>
        )}

        {/* Caption Field */}
        <div className="mt-1.5 text-center text-[8px] font-bold text-slate-400 min-h-[14px]">
          {isEditingCaption ? (
            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              onBlur={handleCaptionSave}
              onKeyDown={handleCaptionKeyDown}
              placeholder="Viết chú thích cho video..."
              autoFocus
              className="w-full text-center bg-slate-50/50 border border-slate-200/50 rounded px-1.5 py-0.5 outline-none font-bold text-slate-600 focus:ring-1 focus:ring-primary focus:border-primary text-[8px]"
            />
          ) : (
            <span
              onClick={() => setIsEditingCaption(true)}
              className="cursor-text hover:text-slate-600 transition italic"
            >
              {block.caption && containsLatexDelimiter(block.caption)
                ? <LatexText value={block.caption} />
                : block.caption || 'Thêm chú thích video...'}
            </span>
          )}
        </div>

        {/* Modal Popup (2 Tabs) - Rendered using React Portal for root overlay stack stability */}
        {showModal && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative font-sans">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition"
              >
                <X size={16} />
              </button>

              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5">
                <Video size={16} className="text-primary" /> Cấu hình Video
              </h3>

              {/* Tabs list */}
              <div className="flex border-b border-slate-100 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 pb-2 text-[11px] font-bold text-center border-b-2 transition ${
                    activeTab === 'upload'
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Upload size={12} className="inline mr-1" /> Tải lên video
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('embed')}
                  className={`flex-1 pb-2 text-[11px] font-bold text-center border-b-2 transition ${
                    activeTab === 'embed'
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LinkIcon size={12} className="inline mr-1" /> Nhúng liên kết
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'upload' ? (
                <div className="space-y-4 py-2">
                  <div
                    onClick={triggerUploadClick}
                    className="border-2 border-dashed border-slate-200 hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-50/20 transition select-none"
                  >
                    <Upload size={20} className="text-slate-400 group-hover:text-primary" />
                    <span className="text-[10px] font-bold text-slate-500">Nhấp để chọn tệp video</span>
                    <span className="text-[8px] text-slate-400">Hỗ trợ các định dạng video phổ biến</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEmbedSubmit} className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Đường dẫn liên kết</label>
                    <input
                      type="url"
                      required
                      value={embedLink}
                      onChange={(e) => setEmbedLink(e.target.value)}
                      placeholder="Dán liên kết YouTube, Drive, v.v."
                      className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 outline-none rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black shadow-sm transition"
                  >
                    Xác nhận liên kết
                  </button>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export const MediaBlock = React.memo(MediaBlockComponent);
