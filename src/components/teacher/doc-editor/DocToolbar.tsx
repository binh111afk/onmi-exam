import React, { useState } from 'react';
import { 
  Undo,
  Redo, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Baseline,
  Highlighter,
  AlignLeft, 
  AlignCenter,
  AlignRight,
  AlignJustify,
  List, 
  ListOrdered,
  SquareCheck,
  ChevronDown,
  Sparkles,
  Indent,
  Outdent,
  Check
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import type { DocBlock } from '../../../types/doc-editor';

interface DocToolbarProps {
  onAiSuggest: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onColorChange: (color: string) => void;
  onHighlightChange: (color: string) => void;
  activeBlockType: DocBlock['type'];
  activeBlockLevel?: 1 | 2 | 3;
  onBlockTypeChange: (type: DocBlock['type'], level?: 1 | 2 | 3) => void;
  activeAlign: 'left' | 'center' | 'right' | 'justify';
  onAlignChange: (align: 'left' | 'center' | 'right' | 'justify') => void;
  onIndent: () => void;
  onOutdent: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  activeColor: string;
  activeHighlight: string;
  activeFontSize: string;
  onFontSizeChange: (size: string) => void;
}

const colorTextClasses: Record<string, string> = {
  '#1F2C3F': 'text-text-primary',
  '#EF4444': 'text-red-500',
  '#10B981': 'text-emerald-500',
  '#3B82F6': 'text-blue-500',
  '#6C5DD3': 'text-primary',
  '#FF758F': 'text-accent',
  '#F59E0B': 'text-amber-500',
};

const highlightBgClasses: Record<string, string> = {
  'transparent': 'bg-transparent border-slate-200',
  '#FEF08A': 'bg-yellow-100 border-yellow-350',
  '#BBF7D0': 'bg-emerald-100 border-emerald-355',
  '#BFDBFE': 'bg-blue-100 border-blue-355',
  '#E9D5FF': 'bg-purple-100 border-purple-355',
  '#FBCFE8': 'bg-pink-100 border-pink-355',
};

export const DocToolbar: React.FC<DocToolbarProps> = ({
  onAiSuggest,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onColorChange,
  onHighlightChange,
  activeBlockType,
  activeBlockLevel,
  onBlockTypeChange,
  activeAlign,
  onAlignChange,
  onIndent,
  onOutdent,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isBold,
  isItalic,
  isUnderline,
  isStrikethrough,
  activeColor,
  activeHighlight,
  activeFontSize,
  onFontSizeChange
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);

  const blockTypeLabels: Record<string, string> = {
    paragraph: 'Văn bản (P)',
    'bullet-list': 'Danh sách chấm',
    'numbered-list': 'Danh sách số',
    'todo-list': 'Công việc',
  };

  const getActiveBlockLabel = () => {
    if (activeBlockType === 'heading') {
      return `Heading ${activeBlockLevel || 1}`;
    }
    return blockTypeLabels[activeBlockType] || 'Văn bản';
  };

  const fontSizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64', '72'];

  const colors = [
    { name: 'Mặc định', value: '#1F2C3F' },
    { name: 'Đỏ', value: '#EF4444' },
    { name: 'Xanh lá', value: '#10B981' },
    { name: 'Xanh dương', value: '#3B82F6' },
    { name: 'Tím', value: '#6C5DD3' },
    { name: 'Hồng', value: '#FF758F' },
    { name: 'Cam', value: '#F59E0B' },
  ];

  const highlights = [
    { name: 'Không màu', value: 'transparent' },
    { name: 'Vàng', value: '#FEF08A' },
    { name: 'Xanh lá', value: '#BBF7D0' },
    { name: 'Xanh dương', value: '#BFDBFE' },
    { name: 'Tím', value: '#E9D5FF' },
    { name: 'Hồng', value: '#FBCFE8' },
  ];

  const normalizedActiveColor = activeColor.toUpperCase();
  const normalizedActiveHighlight = activeHighlight.toLowerCase();

  return (
    <div className="h-11 border-b border-slate-100 px-4 flex items-center gap-1 overflow-visible shrink-0 select-none bg-slate-50/20 relative z-20">
      {/* Undo/Redo */}
      <Tooltip content="Hoàn tác (Ctrl+Z)">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={onUndo} 
          disabled={!canUndo}
          className={`p-1.5 rounded transition ${canUndo ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : 'text-slate-300'}`}
        >
          <Undo size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Làm lại (Ctrl+Shift+Z / Ctrl+Y)">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRedo} 
          disabled={!canRedo}
          className={`p-1.5 rounded transition ${canRedo ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : 'text-slate-300'}`}
        >
          <Redo size={13} />
        </button>
      </Tooltip>
      
      <div className="h-4 w-px bg-slate-200 mx-1" />
      
      {/* Block Type Dropdown */}
      <div className="relative">
        <Tooltip content="Loại văn bản">
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowTypeDropdown(!showTypeDropdown);
              setShowSizeDropdown(false);
              setShowColorDropdown(false);
              setShowHighlightDropdown(false);
            }}
            className="px-2 py-1 text-[10px] font-black text-slate-655 hover:bg-slate-100 rounded transition flex items-center gap-1 cursor-pointer"
          >
            <span>{getActiveBlockLabel()}</span>
            <ChevronDown size={10} />
          </button>
        </Tooltip>

        {showTypeDropdown && (
          <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-1.5 flex flex-col gap-0.5 animate-fadeIn">
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onBlockTypeChange('heading', 1); setShowTypeDropdown(false); }}
              className={`px-3 py-1.5 text-left text-[10px] font-black rounded-lg cursor-pointer flex items-center justify-between ${
                activeBlockType === 'heading' && activeBlockLevel === 1 ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Heading 1</span>
              {activeBlockType === 'heading' && activeBlockLevel === 1 && <Check size={10} />}
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onBlockTypeChange('heading', 2); setShowTypeDropdown(false); }}
              className={`px-3 py-1.5 text-left text-[10px] font-black rounded-lg cursor-pointer flex items-center justify-between ${
                activeBlockType === 'heading' && activeBlockLevel === 2 ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Heading 2</span>
              {activeBlockType === 'heading' && activeBlockLevel === 2 && <Check size={10} />}
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onBlockTypeChange('heading', 3); setShowTypeDropdown(false); }}
              className={`px-3 py-1.5 text-left text-[10px] font-black rounded-lg cursor-pointer flex items-center justify-between ${
                activeBlockType === 'heading' && activeBlockLevel === 3 ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Heading 3</span>
              {activeBlockType === 'heading' && activeBlockLevel === 3 && <Check size={10} />}
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onBlockTypeChange('paragraph'); setShowTypeDropdown(false); }}
              className={`px-3 py-1.5 text-left text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-between ${
                activeBlockType === 'paragraph' ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Văn bản (Paragraph)</span>
              {activeBlockType === 'paragraph' && <Check size={10} />}
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onBlockTypeChange('bullet-list'); setShowTypeDropdown(false); }}
              className={`px-3 py-1.5 text-left text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-between ${
                activeBlockType === 'bullet-list' ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Danh sách chấm (Bullet)</span>
              {activeBlockType === 'bullet-list' && <Check size={10} />}
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onBlockTypeChange('numbered-list'); setShowTypeDropdown(false); }}
              className={`px-3 py-1.5 text-left text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-between ${
                activeBlockType === 'numbered-list' ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Danh sách số (Numbered)</span>
              {activeBlockType === 'numbered-list' && <Check size={10} />}
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onBlockTypeChange('todo-list'); setShowTypeDropdown(false); }}
              className={`px-3 py-1.5 text-left text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-between ${
                activeBlockType === 'todo-list' ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Danh sách công việc (Todo)</span>
              {activeBlockType === 'todo-list' && <Check size={10} />}
            </button>
          </div>
        )}
      </div>

      {/* Font Size Dropdown */}
      <div className="relative">
        <Tooltip content="Cỡ chữ">
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowSizeDropdown(!showSizeDropdown);
              setShowTypeDropdown(false);
              setShowColorDropdown(false);
              setShowHighlightDropdown(false);
            }}
            className="px-2 py-1 text-[10px] font-black text-slate-655 hover:bg-slate-100 rounded transition flex items-center gap-1 cursor-pointer"
          >
            <span>{activeFontSize}</span>
            <ChevronDown size={10} />
          </button>
        </Tooltip>

        {showSizeDropdown && (
          <div className="absolute left-0 top-full mt-1 w-20 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-1 flex flex-col gap-0.5 animate-fadeIn">
            {fontSizes.map(size => (
              <button 
                key={size}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onFontSizeChange(size);
                  setShowSizeDropdown(false);
                }}
                className={`px-3 py-1.5 text-center text-[10px] font-black rounded-lg cursor-pointer flex items-center justify-between ${
                  activeFontSize === size ? 'bg-primary-light text-primary font-black' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{size}</span>
                {activeFontSize === size && <Check size={10} />}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="h-4 w-px bg-slate-200 mx-1" />

      {/* Font styles */}
      <Tooltip content="In đậm (Ctrl+B)">
        <button 
          onMouseDown={(e) => e.preventDefault()} 
          onClick={onBold} 
          className={`p-1.5 rounded transition cursor-pointer ${isBold ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`} 
        >
          <Bold size={13} />
        </button>
      </Tooltip>

      <Tooltip content="In nghiêng (Ctrl+I)">
        <button 
          onMouseDown={(e) => e.preventDefault()} 
          onClick={onItalic} 
          className={`p-1.5 rounded transition cursor-pointer ${isItalic ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`} 
        >
          <Italic size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Gạch chân (Ctrl+U)">
        <button 
          onMouseDown={(e) => e.preventDefault()} 
          onClick={onUnderline} 
          className={`p-1.5 rounded transition cursor-pointer ${isUnderline ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`} 
        >
          <Underline size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Gạch đè">
        <button 
          onMouseDown={(e) => e.preventDefault()} 
          onClick={onStrikethrough} 
          className={`p-1.5 rounded transition cursor-pointer ${isStrikethrough ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`} 
        >
          <Strikethrough size={13} />
        </button>
      </Tooltip>
      
      {/* Text Color Picker */}
      <div className="relative">
        <Tooltip content="Màu chữ">
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowColorDropdown(!showColorDropdown);
              setShowHighlightDropdown(false);
              setShowTypeDropdown(false);
              setShowSizeDropdown(false);
            }}
            className="p-1.5 text-slate-655 hover:bg-slate-100 rounded transition cursor-pointer flex items-center gap-0.5" 
          >
            <span className="flex flex-col items-center justify-center relative">
              <Baseline size={13} className={colorTextClasses[normalizedActiveColor] || 'text-slate-655'} />
              <span className={`w-3.5 h-[2px] mt-0.5 rounded-full ${colorTextClasses[normalizedActiveColor] ? 'bg-current' : 'bg-slate-400'}`} />
            </span>
            <ChevronDown size={8} />
          </button>
        </Tooltip>
        {showColorDropdown && (
          <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-1 flex flex-col gap-0.5 animate-fadeIn">
            {colors.map(c => (
              <button
                key={c.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onColorChange(c.value); setShowColorDropdown(false); }}
                className={`px-2.5 py-1 text-left text-[10px] font-bold rounded-lg flex items-center justify-between cursor-pointer ${
                  normalizedActiveColor === c.value.toUpperCase() ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-100" style={{ backgroundColor: c.value }} />
                  <span>{c.name}</span>
                </div>
                {normalizedActiveColor === c.value.toUpperCase() && <Check size={10} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text Highlight Picker */}
      <div className="relative">
        <Tooltip content="Màu nền chữ">
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowHighlightDropdown(!showHighlightDropdown);
              setShowColorDropdown(false);
              setShowTypeDropdown(false);
              setShowSizeDropdown(false);
            }}
            className="p-1.5 text-slate-655 hover:bg-slate-100 rounded transition cursor-pointer flex items-center gap-0.5" 
          >
            <span className="flex flex-col items-center justify-center relative">
              <Highlighter size={13} className={normalizedActiveHighlight !== 'transparent' ? 'text-primary' : 'text-slate-655'} />
              <span className={`w-3.5 h-1 border rounded-sm mt-0.5 ${highlightBgClasses[normalizedActiveHighlight] || 'bg-transparent border-slate-300'}`} />
            </span>
            <ChevronDown size={8} />
          </button>
        </Tooltip>
        {showHighlightDropdown && (
          <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-1 flex flex-col gap-0.5 animate-fadeIn">
            {highlights.map(h => (
              <button
                key={h.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onHighlightChange(h.value); setShowHighlightDropdown(false); }}
                className={`px-2.5 py-1 text-left text-[10px] font-bold rounded-lg flex items-center justify-between cursor-pointer ${
                  normalizedActiveHighlight === h.value.toLowerCase() ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded border border-slate-200" style={{ backgroundColor: h.value === 'transparent' ? '#FFFFFF' : h.value }} />
                  <span>{h.name}</span>
                </div>
                {normalizedActiveHighlight === h.value.toLowerCase() && <Check size={10} />}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="h-4 w-px bg-slate-200 mx-1" />

      {/* Alignment */}
      <Tooltip content="Căn trái">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAlignChange('left')}
          className={`p-1.5 rounded transition cursor-pointer ${activeAlign === 'left' ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`}
        >
          <AlignLeft size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Căn giữa">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAlignChange('center')}
          className={`p-1.5 rounded transition cursor-pointer ${activeAlign === 'center' ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`}
        >
          <AlignCenter size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Căn phải">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAlignChange('right')}
          className={`p-1.5 rounded transition cursor-pointer ${activeAlign === 'right' ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`}
        >
          <AlignRight size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Căn đều">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAlignChange('justify')}
          className={`p-1.5 rounded transition cursor-pointer ${activeAlign === 'justify' ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`}
        >
          <AlignJustify size={13} />
        </button>
      </Tooltip>
      
      <div className="h-4 w-px bg-slate-200 mx-1" />

      {/* List actions */}
      <Tooltip content="Danh sách chấm (Ctrl+Shift+8)">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onBlockTypeChange('bullet-list')}
          className={`p-1.5 rounded transition cursor-pointer ${activeBlockType === 'bullet-list' ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`}
        >
          <List size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Danh sách số (Ctrl+Shift+7)">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onBlockTypeChange('numbered-list')}
          className={`p-1.5 rounded transition cursor-pointer ${activeBlockType === 'numbered-list' ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`}
        >
          <ListOrdered size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Danh sách công việc (Ctrl+Shift+9)">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onBlockTypeChange('todo-list')}
          className={`p-1.5 rounded transition cursor-pointer ${activeBlockType === 'todo-list' ? 'bg-primary-light text-primary' : 'text-slate-655 hover:bg-slate-100'}`}
        >
          <SquareCheck size={13} />
        </button>
      </Tooltip>

      {/* Indentation */}
      <Tooltip content="Lùi lề trái (Shift+Tab)">
        <button onMouseDown={(e) => e.preventDefault()} onClick={onOutdent} className="p-1.5 text-slate-655 hover:bg-slate-100 rounded transition cursor-pointer">
          <Outdent size={13} />
        </button>
      </Tooltip>

      <Tooltip content="Thụt lề (Tab)">
        <button onMouseDown={(e) => e.preventDefault()} onClick={onIndent} className="p-1.5 text-slate-655 hover:bg-slate-100 rounded transition cursor-pointer">
          <Indent size={13} />
        </button>
      </Tooltip>
      
      <div className="h-4 w-px bg-slate-200 mx-1" />

      <Tooltip content="AI Gợi ý">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={onAiSuggest}
          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[9px] font-black rounded-lg flex items-center gap-1.5 transition select-none cursor-pointer"
        >
          <Sparkles size={11} /> AI Gợi ý
        </button>
      </Tooltip>
    </div>
  );
};
