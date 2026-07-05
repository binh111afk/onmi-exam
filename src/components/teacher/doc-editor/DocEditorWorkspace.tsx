import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Send, 
  FileCheck2, 
  Brain, 
  Image as ImageIcon, 
  Table, 
  Activity, 
  HelpCircle, 
  Award, 
  FolderOpen, 
  Video,
  X as CloseIcon
} from 'lucide-react';
import { DocSidebar } from './DocSidebar';
import { DocToolbar } from './DocToolbar';
import { DocPreviewSimulator } from './DocPreviewSimulator';
import type { DocBlock } from './DocPreviewSimulator';

interface DocEditorWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
}

const initialBlocks: Record<string, DocBlock[]> = {
  water: [
    {
      id: 'w1',
      type: 'heading',
      level: 1,
      text: '1. Nguyên tố hóa học và Nước',
      align: 'left',
      indent: 0
    },
    {
      id: 'w2',
      type: 'paragraph',
      text: 'Có khoảng 25 nguyên tố cần thiết cấu tạo nên cơ thể sống. Đại lượng carbon là nguyên tố cốt lõi vì cấu tạo liên kết hóa học đa dạng. Nước đóng vai trò dung môi hòa tan, môi trường phản ứng sinh hóa, giúp điều hòa nhiệt độ tế bào.',
      align: 'left',
      indent: 0
    },
    {
      id: 'w3',
      type: 'callout',
      text: 'Chiếm khoảng 70 - 90% khối lượng tế bào, tham gia vào hầu hết các quá trình sinh học quan trọng.',
      align: 'left',
      indent: 0
    }
  ],
  macromolecules: [
    {
      id: 'm1',
      type: 'heading',
      level: 1,
      text: '2. Các đại phân tử hữu cơ',
      align: 'left',
      indent: 0
    },
    {
      id: 'm2',
      type: 'paragraph',
      text: 'Tế bào gồm 4 nhóm đại phân tử chính:',
      align: 'left',
      indent: 0
    },
    {
      id: 'm3',
      type: 'bullet-list',
      text: 'Carbohydrate (Đường): cung cấp năng lượng và cấu trúc thành tế bào.',
      align: 'left',
      indent: 0
    },
    {
      id: 'm4',
      type: 'bullet-list',
      text: 'Lipid (Chất béo): dự trữ năng lượng dài hạn, cấu tạo màng sinh chất.',
      align: 'left',
      indent: 0
    },
    {
      id: 'm5',
      type: 'bullet-list',
      text: 'Protein: đảm nhiệm mọi chức năng sống (xúc tác, vận chuyển, cấu trúc).',
      align: 'left',
      indent: 0
    },
    {
      id: 'm6',
      type: 'bullet-list',
      text: 'Axit nucleic (DNA, RNA): lưu trữ và truyền đạt thông tin di truyền.',
      align: 'left',
      indent: 0
    }
  ]
};

// Local helper to calculate nested list index
const getNumberedIndex = (blocks: DocBlock[], index: number): string => {
  const currentBlock = blocks[index];
  if (!currentBlock || currentBlock.type !== 'numbered-list') return '1.';
  
  let count = 1;
  const currentIndent = currentBlock.indent || 0;
  
  for (let i = index - 1; i >= 0; i--) {
    const prev = blocks[i];
    if (prev.type !== 'numbered-list') {
      if (prev.type !== 'bullet-list' && prev.type !== 'todo-list') {
        break;
      }
      continue;
    }
    const prevIndent = prev.indent || 0;
    if (prevIndent === currentIndent) {
      count++;
    } else if (prevIndent < currentIndent) {
      break;
    }
  }
  return `${count}.`;
};

export const DocEditorWorkspace: React.FC<DocEditorWorkspaceProps> = ({ setMode }) => {
  const [showPreview, setShowPreview] = useState(true);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [ch1Expanded, setCh1Expanded] = useState(true);
  const [selectedPage, setSelectedPage] = useState<'water' | 'macromolecules'>('water');

  // Pages Block state
  const [pagesData, setPagesData] = useState<Record<string, DocBlock[]>>(initialBlocks);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<Record<string, DocBlock[]>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize history
  useEffect(() => {
    setHistory([initialBlocks]);
    setHistoryIndex(0);
  }, []);

  const pushHistoryState = (newPagesData: Record<string, DocBlock[]>, isDebounced = false) => {
    setPagesData(newPagesData);

    const currentHistory = history.slice(0, historyIndex + 1);

    if (isDebounced) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setHistory(prev => {
          const nextHist = prev.slice(0, historyIndex + 1);
          return [...nextHist, newPagesData];
        });
        setHistoryIndex(prev => prev + 1);
      }, 400);
    } else {
      setHistory([...currentHistory, newPagesData]);
      setHistoryIndex(currentHistory.length);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setPagesData(history[nextIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setPagesData(history[nextIndex]);
    }
  };

  const currentBlocks = pagesData[selectedPage] || [];
  const activeBlock = currentBlocks[activeBlockIndex] || {
    type: 'paragraph',
    align: 'left',
    level: undefined,
    indent: 0
  };

  // Caret style state
  const [caretFormatting, setCaretFormatting] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    activeColor: '#1F2C3F',
    activeHighlight: 'transparent'
  });

  const rgbToHex = (colorVal: string): string => {
    if (!colorVal) return '#1F2C3F';
    const val = colorVal.trim().toLowerCase();
    if (val.startsWith('#')) return val.toUpperCase();
    if (val === 'transparent' || val === 'rgba(0, 0, 0, 0)' || val === 'rgba(0,0,0,0)') return 'transparent';
    
    const match = val.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    if (!match) return colorVal;
    
    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`.toUpperCase();
  };

  const syncCaretFormatting = () => {
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isStrikethrough = document.queryCommandState('strikeThrough');

      let activeColor = document.queryCommandValue('foreColor') || '#1F2C3F';
      let activeHighlight = document.queryCommandValue('backColor') || 'transparent';

      activeColor = rgbToHex(activeColor);
      activeHighlight = rgbToHex(activeHighlight);

      setCaretFormatting({
        isBold,
        isItalic,
        isUnderline,
        isStrikethrough,
        activeColor,
        activeHighlight
      });

      // Synchronize activeBlockIndex if anchorNode belongs to a block element
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let node: Node | null = selection.anchorNode;
        while (node && node !== document.body) {
          if (node instanceof HTMLElement && node.id && node.id.startsWith('block-editor-')) {
            const idxStr = node.id.replace('block-editor-', '');
            const idx = parseInt(idxStr, 10);
            if (!isNaN(idx) && idx !== activeBlockIndex) {
              setActiveBlockIndex(idx);
            }
            break;
          }
          node = node.parentNode;
        }
      }
    } catch {
      // Ignore errors when queryCommandState isn't available
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      syncCaretFormatting();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [activeBlockIndex, pagesData, selectedPage]);

  const executeFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
    if (activeEl) {
      updateBlockText(activeBlockIndex, activeEl.innerHTML);
    }
    syncCaretFormatting();
  };

  const updateBlockText = (index: number, newHtml: string) => {
    const updatedBlocks = currentBlocks.map((b, idx) => 
      idx === index ? { ...b, text: newHtml } : b
    );
    pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks }, true);
  };

  const toggleBlockType = (type: 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'todo-list', level?: 1 | 2 | 3) => {
    const updatedBlocks = currentBlocks.map((b, idx) => 
      idx === activeBlockIndex ? { ...b, type, level: level ?? undefined } : b
    );
    pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
  };

  const toggleBlockAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    const updatedBlocks = currentBlocks.map((b, idx) => 
      idx === activeBlockIndex ? { ...b, align } : b
    );
    pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
  };

  const indentBlock = (index = activeBlockIndex) => {
    const updatedBlocks = currentBlocks.map((b, idx) => 
      idx === index ? { ...b, indent: Math.min(5, (b.indent || 0) + 1) } : b
    );
    pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
  };

  const outdentBlock = (index = activeBlockIndex) => {
    const updatedBlocks = currentBlocks.map((b, idx) => 
      idx === index ? { ...b, indent: Math.max(0, (b.indent || 0) - 1) } : b
    );
    pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
  };

  const toggleTodoChecked = (index: number) => {
    const updatedBlocks = currentBlocks.map((b, idx) => 
      idx === index ? { ...b, checked: !b.checked } : b
    );
    pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
  };

  const deleteBlock = (index: number) => {
    if (currentBlocks.length <= 1) return; // Prevent deleting the only remaining block
    const updatedBlocks = currentBlocks.filter((_, idx) => idx !== index);
    pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
    const targetIdx = Math.max(0, index - 1);
    setActiveBlockIndex(targetIdx);
    focusBlock(targetIdx);
  };

  const insertBlockBelow = (index: number) => {
    const newBlock: DocBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'paragraph',
      text: '',
      align: 'left',
      indent: currentBlocks[index].indent || 0
    };
    const updatedBlocks = [
      ...currentBlocks.slice(0, index + 1),
      newBlock,
      ...currentBlocks.slice(index + 1)
    ];
    pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
    setActiveBlockIndex(index + 1);
    focusBlock(index + 1);
  };

  const handleBackspaceAtStart = (index: number) => {
    const block = currentBlocks[index];

    if (block.indent && block.indent > 0) {
      outdentBlock(index);
      return;
    }

    if (block.type !== 'paragraph') {
      const updatedBlocks = currentBlocks.map((b, idx) => 
        idx === index ? { ...b, type: 'paragraph' as const } : b
      );
      pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
      return;
    }

    if (index > 0) {
      const prevBlock = currentBlocks[index - 1];
      const updatedBlocks = currentBlocks.filter((_, idx) => idx !== index);
      updatedBlocks[index - 1] = {
        ...prevBlock,
        text: prevBlock.text + block.text
      };
      pushHistoryState({ ...pagesData, [selectedPage]: updatedBlocks });
      setActiveBlockIndex(index - 1);
      
      setTimeout(() => {
        const prevEl = document.getElementById(`block-editor-${index - 1}`);
        if (prevEl) {
          prevEl.focus();
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(prevEl);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 50);
    }
  };

  const focusBlock = (index: number) => {
    setTimeout(() => {
      const el = document.getElementById(`block-editor-${index}`);
      if (el) {
        el.focus();
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    // Shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Z, Ctrl+Y)
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        executeFormat('bold');
        return;
      }
      if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        executeFormat('italic');
        return;
      }
      if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        executeFormat('underline');
        return;
      }
      if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
    }

    // List Shortcuts (Ctrl+Shift+7, 8, 9)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      if (e.key === '7') {
        e.preventDefault();
        toggleBlockType('numbered-list');
        return;
      }
      if (e.key === '8') {
        e.preventDefault();
        toggleBlockType('bullet-list');
        return;
      }
      if (e.key === '9') {
        e.preventDefault();
        toggleBlockType('todo-list');
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      insertBlockBelow(index);
      return;
    }

    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      const cursorOffset = selection?.focusOffset ?? 0;
      
      if (cursorOffset === 0 && (e.currentTarget.innerText.trim() === '' || selection?.anchorNode?.parentNode === e.currentTarget || selection?.anchorNode === e.currentTarget)) {
        e.preventDefault();
        handleBackspaceAtStart(index);
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        outdentBlock(index);
      } else {
        indentBlock(index);
      }
      return;
    }
  };

  const handlePublish = () => {
    alert('Đăng tải tài liệu thành công!');
    setMode('dashboard');
  };

  const handleAiSuggest = () => {
    const updated = [...currentBlocks];
    if (selectedPage === 'water') {
      updated[1] = {
        ...updated[1],
        text: updated[1].text + ' Nước đóng vai trò là một dung môi vạn năng.'
      };
    } else {
      updated[1] = {
        ...updated[1],
        text: updated[1].text + ' Hãy chú ý đến cấu trúc đặc biệt của mỗi nhóm đại phân tử.'
      };
    }
    pushHistoryState({ ...pagesData, [selectedPage]: updated });
  };

  // Listen for global Undo/Redo keys
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [historyIndex, history]);

  return (
    <div className="w-full flex flex-col h-screen bg-[#F8FAFC] select-none text-text-primary overflow-hidden font-sans animate-fadeIn">
      
      {/* ========================================== */}
      {/* TOP BAR                                    */}
      {/* ========================================== */}
      <header className="h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setMode('dashboard')}
            className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
          >
            <ChevronLeft size={18} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-xs font-black text-[#1E293B] truncate max-w-sm sm:max-w-md">
              Tóm tắt lý thuyết Sinh học 10 học kỳ 2 - Đề cương ôn tập
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-primary text-[8px] font-extrabold uppercase">Sinh học</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-extrabold uppercase">Lớp 10</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 text-[8px] font-extrabold uppercase">Tài liệu lý thuyết</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[8px] font-extrabold uppercase">Nháp</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
            Đã lưu 10:30:45
          </div>

          <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-100 rounded-xl p-0.5 text-[10px] font-black text-slate-500">
            <button className="px-3 py-1 bg-white text-primary rounded-lg shadow-sm font-black">Soạn thảo</button>
            <button className="px-3 py-1 hover:text-slate-800 transition rounded-lg">Xem trước</button>
            <button className="px-3 py-1 hover:text-slate-800 transition rounded-lg">Responsive</button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert('Đã lưu nháp tài liệu thành công!')}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <Save size={12} /> Lưu
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 border text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer ${
                showPreview 
                  ? 'bg-primary-light border-primary/20 text-primary hover:bg-primary-light/80' 
                  : 'border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Eye size={12} /> Preview
            </button>
            <button 
              onClick={handlePublish}
              className="px-3 py-1.5 bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white text-[10px] font-black rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-100"
            >
              <Send size={12} /> Publish
            </button>
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* MAIN BODY LAYOUT (Left, Center, Right)    */}
      {/* ========================================== */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* 1. LEFT SIDEBAR */}
        <DocSidebar 
          selectedPage={selectedPage} 
          setSelectedPage={setSelectedPage} 
          ch1Expanded={ch1Expanded} 
          setCh1Expanded={setCh1Expanded} 
        />

        {/* 2. CENTER PANEL: Rich Editor Workspace */}
        <main className="flex-1 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
          
          {/* Rich Editor Toolbar */}
          <DocToolbar 
            onAiSuggest={handleAiSuggest} 
            onBold={() => executeFormat('bold')}
            onItalic={() => executeFormat('italic')}
            onUnderline={() => executeFormat('underline')}
            onStrikethrough={() => executeFormat('strikeThrough')}
            onColorChange={(color) => executeFormat('foreColor', color)}
            onHighlightChange={(color) => executeFormat('backColor', color)}
            activeBlockType={activeBlock.type}
            activeBlockLevel={activeBlock.level}
            onBlockTypeChange={toggleBlockType}
            activeAlign={activeBlock.align || 'left'}
            onAlignChange={toggleBlockAlign}
            onIndent={() => indentBlock()}
            onOutdent={() => outdentBlock()}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            isBold={caretFormatting.isBold}
            isItalic={caretFormatting.isItalic}
            isUnderline={caretFormatting.isUnderline}
            isStrikethrough={caretFormatting.isStrikethrough}
            activeColor={caretFormatting.activeColor}
            activeHighlight={caretFormatting.activeHighlight}
          />

          {/* Editable Block Content List */}
          <div className="flex-1 p-8 overflow-y-auto space-y-4 select-text">
            {currentBlocks.map((block, idx) => {
              const alignClass = block.align === 'center'
                ? 'text-center'
                : block.align === 'right'
                  ? 'text-right'
                  : block.align === 'justify'
                    ? 'text-justify'
                    : 'text-left';

              const indentStyle = { paddingLeft: `${(block.indent || 0) * 24}px` };

              return (
                <BlockRow 
                  key={block.id}
                  block={block}
                  idx={idx}
                  alignClass={alignClass}
                  indentStyle={indentStyle}
                  activeBlockIndex={activeBlockIndex}
                  setActiveBlockIndex={setActiveBlockIndex}
                  updateBlockText={updateBlockText}
                  handleKeyDown={handleKeyDown}
                  toggleTodoChecked={toggleTodoChecked}
                  deleteBlock={deleteBlock}
                  blocks={currentBlocks}
                />
              );
            })}
          </div>

          <div className="h-8 border-t border-slate-50 px-6 flex items-center text-[10px] text-slate-400 font-bold select-none bg-white">
            Nhấn Enter để thêm dòng mới, Tab để thụt lề, Backspace để xóa/gộp dòng
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR: Live Student Preview Simulator */}
        {showPreview && (
          <DocPreviewSimulator 
            viewport={viewport}
            setViewport={setViewport}
            selectedPage={selectedPage}
            blocks={currentBlocks}
          />
        )}

        {/* 4. FAR-RIGHT NARROW TOOLBAR */}
        <aside className="w-16 bg-white border-l border-slate-100 flex flex-col items-center py-4 justify-between shrink-0 select-none overflow-y-auto">
          <div className="w-full space-y-4 flex flex-col items-center">
            {[
              { icon: <FileCheck2 size={16} />, label: 'Block' },
              { icon: <Brain size={16} />, label: 'AI' },
              { icon: <ImageIcon size={16} />, label: 'Ảnh' },
              { icon: <Table size={16} />, label: 'Bảng' },
              { icon: <Activity size={16} />, label: 'Công thức' },
              { icon: <HelpCircle size={16} />, label: 'Quiz' },
              { icon: <Award size={16} />, label: 'Flashcard' },
              { icon: <FolderOpen size={16} />, label: 'Mindmap' },
              { icon: <Video size={16} />, label: 'Media' },
              { icon: <HelpCircle size={16} />, label: 'Khác' },
            ].map((tool, i) => (
              <button 
                key={i} 
                className="w-12 h-12 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition cursor-pointer select-none"
              >
                {tool.icon}
                <span className="text-[7px] font-bold mt-1 text-slate-500">{tool.label}</span>
              </button>
            ))}
          </div>
        </aside>

      </div>

      {/* ========================================== */}
      {/* FOOTER STATUS BAR                          */}
      {/* ========================================== */}
      <footer className="h-8 bg-white border-t border-slate-100 px-4 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-wide shrink-0 select-none">
        <div className="flex items-center gap-6">
          <span>Tổng số block: <strong>{currentBlocks.length}</strong></span>
          <span>Số chữ: <strong>{currentBlocks.reduce((acc, b) => acc + b.text.replace(/<[^>]*>/g, '').length, 0)}</strong></span>
          <span>Số công thức: <strong>0</strong></span>
          <span>Số hình ảnh: <strong>0</strong></span>
        </div>

        <div>Lần sửa cuối: 10:30 30/05/2024</div>

        <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
          Tự động lưu
        </div>
      </footer>

    </div>
  );
};

interface BlockRowProps {
  block: DocBlock;
  idx: number;
  alignClass: string;
  indentStyle: React.CSSProperties;
  activeBlockIndex: number;
  setActiveBlockIndex: (i: number) => void;
  updateBlockText: (i: number, val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, i: number) => void;
  toggleTodoChecked: (i: number) => void;
  deleteBlock: (i: number) => void;
  blocks: DocBlock[];
}

const BlockRow: React.FC<BlockRowProps> = ({
  block,
  idx,
  alignClass,
  indentStyle,
  activeBlockIndex,
  setActiveBlockIndex,
  updateBlockText,
  handleKeyDown,
  toggleTodoChecked,
  deleteBlock,
  blocks
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Sync content when modified externally (Undo/Redo)
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = block.text;
    }
  }, [block.text]);

  return (
    <div 
      style={indentStyle}
      className={`group relative flex items-start gap-2.5 transition rounded-xl ${activeBlockIndex === idx ? 'bg-slate-50/40 ring-1 ring-slate-100/50' : ''}`}
    >
      {/* Icon / List identifier prefix */}
      <div className="w-6 flex items-center justify-center shrink-0 select-none h-full pt-1.5 text-slate-400">
        {block.type === 'bullet-list' && (
          <span className="text-slate-400 font-bold text-xs">•</span>
        )}
        {block.type === 'numbered-list' && (
          <span className="text-primary font-black text-[11px]">{getNumberedIndex(blocks, idx)}</span>
        )}
        {block.type === 'todo-list' && (
          <input 
            type="checkbox" 
            checked={!!block.checked}
            onChange={() => toggleTodoChecked(idx)}
            className="w-3.5 h-3.5 rounded border-slate-350 accent-primary cursor-pointer"
          />
        )}
        {block.type === 'callout' && (
          <span className="text-sm">💧</span>
        )}
      </div>

      {/* Editable Block Content */}
      <div
        ref={ref}
        id={`block-editor-${idx}`}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setActiveBlockIndex(idx)}
        onInput={(e) => updateBlockText(idx, e.currentTarget.innerHTML)}
        onKeyDown={(e) => handleKeyDown(e, idx)}
        className={`flex-1 outline-none py-1 text-slate-800 min-h-[24px] cursor-text select-text ${alignClass} ${
          block.type === 'heading'
            ? block.level === 1
              ? 'text-lg font-black text-primary tracking-tight'
              : block.level === 2
                ? 'text-md font-bold text-slate-800'
                : 'text-sm font-bold text-slate-700'
            : block.type === 'todo-list' && block.checked
              ? 'text-xs text-slate-400 line-through font-medium'
              : 'text-xs text-text-secondary leading-relaxed font-bold'
        }`}
        dangerouslySetInnerHTML={{ __html: block.text }}
      />

      {/* Delete handle */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 select-none z-10">
        <button 
          onClick={() => deleteBlock(idx)}
          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded cursor-pointer"
          title="Xóa block"
        >
          <CloseIcon size={10} />
        </button>
      </div>
    </div>
  );
};
