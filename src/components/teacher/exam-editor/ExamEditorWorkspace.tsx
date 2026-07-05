import React, { useState, useRef, useEffect } from 'react';
import {
  Edit,
  Cloud,
  Save,
  Eye,
  Code,
  Database,
  Check,
  HelpCircle,
  File,
  CheckCircle2,
  X,
  Sparkles,
  ChevronDown,
  Send,
  Link,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlignLeft,
  RefreshCw,
  Upload,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeft,
  Sliders,
  Shuffle,
  Timer,
  Trophy,
  ClipboardList,
  Grid,
  Image,
  Calculator,
  BookOpen,
  ShieldCheck,
  FileText,
  CheckSquare
} from 'lucide-react';

import { ExamSidebar } from './ExamSidebar';
import { QuestionBankWorkspace } from './QuestionBankWorkspace';
import { draftService } from '../../../services/draftService';
import { OmlPreviewPaper } from '../../ExamEditor/OmlRenderer/OmlPreviewPaper';
import { parseOML } from '../../ExamEditor/OmlRenderer/parser';
import { OmlGuideModal } from './OmlGuideModal';


interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ id, checked, onChange }) => {
  return (
    <button
      type="button"
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${checked ? 'bg-[#6C5DD3]' : 'bg-[#E2E8F0]'
        }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'
          }`}
      />
    </button>
  );
};

interface ExamEditorWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  examSubView: 'edit' | 'config' | 'publish';
  setExamSubView: (v: 'edit' | 'config' | 'publish') => void;
  examTab: 'code' | 'quick' | 'bank';
  setExamTab: (t: 'code' | 'quick' | 'bank') => void;
  examJsonCode: string;
  setExamJsonCode: (code: string) => void;
  selectedQuestionId: number;
  setSelectedQuestionId: (id: number) => void;
  examSearchQuery: string;
  setExamSearchQuery: (q: string) => void;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const ExamEditorWorkspace: React.FC<ExamEditorWorkspaceProps> = ({
  setMode,
  examSubView,
  setExamSubView,
  examTab,
  setExamTab,
  examJsonCode,
  setExamJsonCode,
  selectedQuestionId,
  setSelectedQuestionId,
  examSearchQuery,
  setExamSearchQuery,
  // viewportMode,
  // setViewportMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [quickStep, setQuickStep] = useState<1 | 2>(1);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [isPreviewFullscreenOpen, setIsPreviewFullscreenOpen] = useState(false);
  const [isPreviewFullscreenClosing, setIsPreviewFullscreenClosing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<50 | 75 | 100 | 125 | 150 | 200>(100);
  const [isPreviewFitWidth, setIsPreviewFitWidth] = useState(false);

  // Local OCR upload file state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>({
    name: 'Đề cương ôn tập Sinh học 10 học kỳ 2.pdf',
    size: '2.45 MB'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quickLineNumbersRef = useRef<HTMLDivElement>(null);
  const quickTextareaRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const fullscreenPreviewScrollRef = useRef<HTMLDivElement>(null);
  const savedPreviewScrollTopRef = useRef(0);
  const previewCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-Save States & Unique Tab Instance ID
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showConfirmNewDialog, setShowConfirmNewDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);
  const [isCrossTabConflict, setIsCrossTabConflict] = useState(false);

  const tabInstanceId = useRef<string>(Math.random().toString(36).substring(2, 9));

  // Parser and validation states
  const [lastValidOml, setLastValidOml] = useState<any>(() => {
    const result = parseOML(examJsonCode);
    return result.success ? result.data : null;
  });
  const [lastValidMetadata, setLastValidMetadata] = useState<any>(() => {
    const result = parseOML(examJsonCode);
    return result.metadata;
  });
  const [validationErrors, setValidationErrors] = useState<any[]>(() => {
    const result = parseOML(examJsonCode);
    return result.success ? [] : result.errors;
  });
  const [isJsonInvalid, setIsJsonInvalid] = useState<boolean>(() => {
    const result = parseOML(examJsonCode);
    return !result.success;
  });
  const [validationDialog, setValidationDialog] = useState<any>({
    isOpen: false,
    title: '',
    success: false,
    type: 'success',
  });
  const [compileStatus, setCompileStatus] = useState<'unchecked' | 'compiling' | 'success' | 'error'>(() => {
    const result = parseOML(examJsonCode);
    return result.success ? 'success' : 'error';
  });
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  const getErrorNumberSymbol = (idx: number): string => {
    const symbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
    return symbols[idx] ?? `${idx + 1}.`;
  };

  const highlightLineInTextarea = (lineNum: number) => {
    const textarea = textareaRef.current || quickTextareaRef.current;
    if (!textarea) return;
    const lines = textarea.value.split('\n');
    if (lineNum > lines.length) return;
    let startOffset = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      startOffset += lines[i].length + (textarea.value.includes('\r\n') ? 2 : 1);
    }
    const endOffset = startOffset + lines[lineNum - 1].length;
    textarea.focus();
    textarea.setSelectionRange(startOffset, endOffset);
    const rowHeight = 20;
    textarea.scrollTop = Math.max(0, (lineNum - 5) * rowHeight);
  };

  // Real-time parsed OML sync with Debounce (300-500ms)
  useEffect(() => {
    setCompileStatus('unchecked');

    const handler = setTimeout(() => {
      const result = parseOML(examJsonCode);
      if (result.success) {
        setLastValidOml(result.data);
        setLastValidMetadata(result.metadata);
        setValidationErrors([]);
        setIsJsonInvalid(false);
      } else {
        setValidationErrors(result.errors);
        setIsJsonInvalid(true);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [examJsonCode]);

  const DEFAULT_EXAM_CODE = `{
  "version": "1.0",
  "info": {
    "title": "Đề kiểm tra 1 tiết Sinh học 10 — Chương I",
    "subject": "Sinh học",
    "grade": 10,
    "time": 45,
    "type": "exam",
    "difficulty": "medium",
    "description": "Kiểm tra kiến thức về thành phần hóa học của tế bào.",
    "author": "Nguyễn Thị Bình",
    "allowReview": true,
    "shuffle": false
  },
  "content": [
    {
      "type": "heading",
      "level": 1,
      "text": "PHẦN I: TRẮC NGHIỆM (3.0 điểm)"
    },
    {
      "type": "callout",
      "variant": "info",
      "icon": "info",
      "title": "Hướng dẫn",
      "content": "Chọn **một** đáp án đúng cho mỗi câu. Mỗi câu đúng được **0.25 điểm**."
    },
    {
      "type": "question",
      "id": 1,
      "question": "Phát biểu nào sau đây đúng về nước trong tế bào?",
      "points": 0.25,
      "difficulty": "easy",
      "tags": ["nước", "thành phần hóa học"],
      "options": [
        { "id": "A", "content": "Nước là dung môi phân cực cực tốt" },
        { "id": "B", "content": "Nước không tham gia phản ứng sinh hóa" },
        { "id": "C", "content": "Nước được cấu tạo từ 3 nguyên tử H và 1 nguyên tử O" },
        { "id": "D", "content": "Nước không có khả năng điều hòa nhiệt độ" }
      ],
      "answer": ["A"],
      "explanation": "Nước là dung môi phân cực cực tốt nên hòa tan được nhiều chất phân cực trong tế bào."
    },
    {
      "type": "question",
      "id": 2,
      "question": "Góc liên kết H-O-H trong phân tử nước là bao nhiêu?",
      "points": 0.25,
      "difficulty": "medium",
      "tags": ["nước", "cấu trúc"],
      "options": [
        { "id": "A", "content": "104.5°" },
        { "id": "B", "content": "90°" },
        { "id": "C", "content": "120°" },
        { "id": "D", "content": "180°" }
      ],
      "answer": ["A"],
      "explanation": "Do 2 cặp electron tự do trên nguyên tử O đẩy nhau làm góc liên kết nhỏ hơn 109.5°, giá trị thực tế là **104.5°**."
    },
    {
      "type": "divider"
    },
    {
      "type": "heading",
      "level": 1,
      "text": "PHẦN II: TỰ LUẬN (7.0 điểm)"
    },
    {
      "type": "paragraph",
      "text": "Dựa vào bảng dữ liệu và kiến thức đã học, trả lời câu hỏi từ **câu 3** trở đi."
    },
    {
      "type": "table",
      "caption": "Bảng 1. So sánh tế bào nhân sơ và nhân thực",
      "headers": ["Đặc điểm", "Tế bào nhân sơ", "Tế bào nhân thực"],
      "rows": [
        ["Màng nhân", "Không có", "Có"],
        ["Kích thước", "1–10 µm", "10–100 µm"],
        ["Ribosome", "70S", "80S"]
      ]
    },
    {
      "type": "question",
      "id": 3,
      "question": "Nêu **3 điểm khác biệt** cơ bản giữa tế bào nhân sơ và tế bào nhân thực.",
      "points": 3,
      "difficulty": "medium",
      "tags": ["tế bào nhân sơ", "tế bào nhân thực"],
      "options": [],
      "answer": [],
      "explanation": "Học sinh cần nêu đủ: màng nhân, kích thước, ribosome."
    },
    {
      "type": "formula",
      "latex": "\\\\text{Hiệu suất} = \\\\frac{\\\\text{Năng lượng tích lũy}}{\\\\text{Năng lượng ánh sáng}} \\\\times 100\\\\%",
      "display": "block"
    },
    {
      "type": "question",
      "id": 4,
      "question": "Giải thích tại sao nước được gọi là *\"dung môi của sự sống\"*. Nêu **ít nhất 2 vai trò** của nước trong tế bào.",
      "points": 4,
      "difficulty": "hard",
      "tags": ["nước", "tự luận"],
      "options": [],
      "answer": [],
      "explanation": "Học sinh cần: (1) giải thích tính phân cực → hòa tan được nhiều chất; (2) nêu vai trò: dung môi, tham gia phản ứng hóa học, điều hòa nhiệt."
    }
  ]
}`;

  // Time format helpers
  const formatSavedTime = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatFullSavedTime = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (draftService.hasDraft()) {
      const draft = draftService.loadDraft();
      if (draft) {
        setPendingDraft(draft);
        setShowRestoreDialog(true);
      }
    }
  }, []);


  // Sync draft edits across multiple tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'onmi.teacherstudio.exam.draft') {
        const newDraft = draftService.loadDraft();
        if (newDraft && newDraft.draftId !== tabInstanceId.current) {
          setIsCrossTabConflict(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRestoreDraft = () => {
    if (pendingDraft) {
      setExamJsonCode(pendingDraft.rawJson);
      tabInstanceId.current = pendingDraft.draftId;
      setLastSavedTime(pendingDraft.lastSaved);
      setSaveStatus('saved');
    }
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const handleDiscardRestore = () => {
    draftService.deleteDraft();
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const handleCreateNewExamClick = () => {
    if (draftService.hasDraft() || examJsonCode !== DEFAULT_EXAM_CODE) {
      setShowConfirmNewDialog(true);
    } else {
      resetEditorToDefault();
    }
  };

  const handleConfirmNewExam = () => {
    draftService.deleteDraft();
    resetEditorToDefault();
    setShowConfirmNewDialog(false);
  };

  const resetEditorToDefault = () => {
    setExamJsonCode(DEFAULT_EXAM_CODE);
    setSaveStatus('idle');
    setLastSavedTime(null);
    setIsCrossTabConflict(false);
  };

  const [katexLoaded, setKatexLoaded] = useState(!!(window as any).katex);

  // Use state variable to trigger component re-render when script loads
  if (katexLoaded) {
    // KaTeX is initialized and ready for rendering
  }

  useEffect(() => {
    if ((window as any).katex) return;

    // Load stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    document.head.appendChild(link);

    // Load script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
    script.async = true;
    script.onload = () => {
      setKatexLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleQuickScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (quickLineNumbersRef.current) {
      quickLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const previewZoomLevels = [50, 75, 100, 125, 150, 200] as const;

  const openPreviewFullscreen = () => {
    savedPreviewScrollTopRef.current = previewScrollRef.current?.scrollTop ?? savedPreviewScrollTopRef.current;
    if (previewCloseTimerRef.current) clearTimeout(previewCloseTimerRef.current);
    setIsPreviewFullscreenClosing(true);
    setIsPreviewFullscreenOpen(true);
    requestAnimationFrame(() => {
      setIsPreviewFullscreenClosing(false);
      if (fullscreenPreviewScrollRef.current) {
        fullscreenPreviewScrollRef.current.scrollTop = savedPreviewScrollTopRef.current;
      }
    });
  };

  const closePreviewFullscreen = () => {
    savedPreviewScrollTopRef.current = fullscreenPreviewScrollRef.current?.scrollTop ?? savedPreviewScrollTopRef.current;
    setIsPreviewFullscreenClosing(true);
    if (previewCloseTimerRef.current) clearTimeout(previewCloseTimerRef.current);
    previewCloseTimerRef.current = setTimeout(() => {
      setIsPreviewFullscreenOpen(false);
      setIsPreviewFullscreenClosing(false);
      requestAnimationFrame(() => {
        if (previewScrollRef.current) {
          previewScrollRef.current.scrollTop = savedPreviewScrollTopRef.current;
        }
      });
    }, 200);
  };

  const applyPreviewZoom = (zoom: typeof previewZoomLevels[number]) => {
    setPreviewZoom(zoom);
    setIsPreviewFitWidth(false);
  };

  const stepPreviewZoom = (direction: -1 | 1) => {
    const currentIndex = previewZoomLevels.indexOf(previewZoom);
    const nextIndex = Math.min(previewZoomLevels.length - 1, Math.max(0, currentIndex + direction));
    applyPreviewZoom(previewZoomLevels[nextIndex]);
  };

  useEffect(() => {
    return () => {
      if (previewCloseTimerRef.current) clearTimeout(previewCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPreviewFullscreenOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePreviewFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewFullscreenOpen]);

  // ── OML v1.0 PARSER ────────────────────────────────────────────
  let parsedData: any = null;
  let parseError: string | null = null;
  try {
    parsedData = JSON.parse(examJsonCode);
  } catch (e: any) {
    parseError = e.message;
  }

  // Extract blocks array from OML content[] or fall back to legacy questions[]
  const omlBlocks: any[] = lastValidOml?.content ?? [];

  const collectQuestionBlocks = (blocks: any[]): any[] => {
    return blocks.flatMap((block: any) => {
      if (block?.type === 'question') return [block];
      if (block?.type === 'question-group') return block.questions ?? [];
      return [];
    });
  };

  // Collect all question blocks from content[] for stats / sidebar
  const previewQuestions: any[] = lastValidOml
    ? (lastValidOml.content ? collectQuestionBlocks(lastValidOml.content) : (lastValidOml.questions ?? []))
    : [];

  const infoMeta = lastValidOml?.info ?? {
    title: 'Đề thi chưa có tiêu đề',
    subject: 'Không rõ',
    grade: 10,
    time: 45,
    type: 'exam',
    difficulty: 'medium',
  };

  // Debounced auto-save effect (placed here to safely read infoMeta)
  useEffect(() => {
    if (examTab !== 'code') return;

    const saved = draftService.loadDraft();
    if (saved && saved.rawJson === examJsonCode) {
      setLastSavedTime(saved.lastSaved);
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('saving');

    const handler = setTimeout(() => {
      const now = new Date().toISOString();
      const title = lastValidMetadata.title || 'Đề thi chưa có tiêu đề';
      const subject = lastValidMetadata.subject || 'Sinh học';

      const success = draftService.saveDraft({
        version: '1.0',
        editorMode: 'json',
        rawJson: examJsonCode,
        lastSaved: now,
        examTitle: title,
        subject: subject,
        draftId: tabInstanceId.current,
      });

      if (success) {
        setSaveStatus('saved');
        setLastSavedTime(now);
      } else {
        setSaveStatus('error');
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [examJsonCode, examTab, infoMeta.title, infoMeta.subject]);

  // Render OML Preview Paper is now handled by the modular OmlPreviewPaper component.

  const renderExamPreviewColumn = (title = 'Xem trước đề thi') => (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC] transition-all duration-300">
      <div className="h-10 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <span className="text-[10px] font-black text-text-primary uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          {lastValidMetadata?.version && (
            <span className="text-[8px] font-black text-primary bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">OML v{lastValidMetadata.version}</span>
          )}
          <button
            type="button"
            title="Phóng to Preview"
            aria-label="Phóng to Preview"
            onClick={openPreviewFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 transition cursor-pointer"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
      <div ref={previewScrollRef} className="flex-1 overflow-y-auto p-5 flex justify-center items-start">
        {isPreviewFullscreenOpen ? (
          <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-[10px] font-bold text-slate-400">
            Preview đang mở ở chế độ phóng to
          </div>
        ) : (
          <OmlPreviewPaper
            omlBlocks={omlBlocks}
            infoMeta={infoMeta}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
          />
        )}
      </div>
    </div>
  );

  const renderPreviewFullscreenOverlay = () => {
    if (!isPreviewFullscreenOpen) return null;

    const paperWidth = isPreviewFitWidth ? '105%' : `${Math.round(840 * previewZoom / 100)}px`;

    return (
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm transition-opacity duration-200 ${isPreviewFullscreenClosing ? 'opacity-0' : 'opacity-100'}`}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closePreviewFullscreen();
        }}
      >
        <div
          className={`flex h-[94vh] w-[96vw] flex-col overflow-hidden rounded-[18px] bg-white shadow-2xl transition-all duration-200 ${isPreviewFullscreenClosing ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'}`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0 bg-slate-50/20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">
                Xem trước đề thi phóng to
              </span>
              {lastValidMetadata?.version && (
                <span className="text-[8px] font-black text-primary bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  OML v{lastValidMetadata.version}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Zoom controls */}
              <div className="flex items-center bg-slate-100/80 rounded-xl p-0.5 border border-slate-200/40">
                <button
                  onClick={() => stepPreviewZoom(-1)}
                  className="p-1.5 hover:bg-white text-slate-500 hover:text-slate-700 rounded-lg transition cursor-pointer"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[9px] font-black text-slate-600 min-w-[36px] text-center font-mono">
                  {previewZoom}%
                </span>
                <button
                  onClick={() => stepPreviewZoom(1)}
                  className="p-1.5 hover:bg-white text-slate-500 hover:text-slate-700 rounded-lg transition cursor-pointer"
                >
                  <ZoomIn size={13} />
                </button>
                <div className="w-px h-3.5 bg-slate-250 mx-1" />
                <button
                  onClick={() => setIsPreviewFitWidth(!isPreviewFitWidth)}
                  className={`px-2 py-1 rounded-lg text-[8px] font-black transition cursor-pointer ${isPreviewFitWidth
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-slate-700'
                    }`}
                >
                  Vừa trang
                </button>
              </div>

              <button
                onClick={closePreviewFullscreen}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div ref={fullscreenPreviewScrollRef} className="flex-1 overflow-auto bg-slate-100/80 p-6">
            <div className="flex min-h-full justify-center items-start">
              <OmlPreviewPaper
                omlBlocks={omlBlocks}
                infoMeta={infoMeta}
                selectedQuestionId={selectedQuestionId}
                setSelectedQuestionId={setSelectedQuestionId}
                style={{ width: paperWidth }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const codeLines = examJsonCode.split('\n');

  const handleCheckCode = () => {
    if (compileStatus === 'compiling') return;
    setCompileStatus('compiling');

    setTimeout(() => {
      const result = parseOML(examJsonCode);
      if (result.success) {
        setCompileStatus('success');
        setLastValidOml(result.data);
        setLastValidMetadata(result.metadata);
        setValidationErrors([]);
        setIsJsonInvalid(false);
        setValidationDialog({
          isOpen: true,
          title: 'Kiểm tra thành công',
          success: true,
          type: 'success',
          errors: [],
          metadata: result.metadata,
        });

        setTimeout(() => {
          setValidationDialog((prev: any) => ({ ...prev, isOpen: false }));
        }, 2000);
      } else {
        setCompileStatus('error');
        setValidationErrors(result.errors);
        setIsJsonInvalid(true);
        setValidationDialog({
          isOpen: true,
          title: 'Không thể biên dịch OML',
          success: false,
          type: result.errors[0]?.type === 'syntax' ? 'syntax' : 'schema',
          errors: result.errors,
          metadata: result.metadata,
        });
      }
    }, 600);
  };

  const handleSaveExam = () => {
    alert('Đã lưu nháp đề thi thành công!');
  };

  const handlePublishExam = () => {
    alert('Đăng tải đề thi thành công!');
    draftService.deleteDraft();
    setMode('dashboard');
  };

  const updateJsonField = (key: string, value: any) => {
    try {
      const data = JSON.parse(examJsonCode);
      if (!data.info) data.info = {};
      data.info[key] = value;
      setExamJsonCode(JSON.stringify(data, null, 2));
    } catch (e) {
      // Ignore if JSON is currently invalid
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const questionsList = previewQuestions
    .map((question: any) => Number(question.id))
    .filter((id: number) => Number.isFinite(id));
  const filteredQuestions = questionsList.filter(qNum =>
    examSearchQuery === '' || `Câu ${qNum}`.toLowerCase().includes(examSearchQuery.toLowerCase())
  );

  // Configuration helper calculations
  const getDifficultyLabel = (diff?: string) => {
    if (!diff) return 'Trung bình';
    const d = diff.toLowerCase();
    if (d === 'easy') return 'Dễ';
    if (d === 'hard') return 'Khó';
    return 'Trung bình';
  };

  const questionTypesCount = {
    choice: 0,
    'true-false': 0,
    'fill-blank': 0,
    essay: 0,
  };

  previewQuestions.forEach((q) => {
    const subType = q?.subType ?? 'choice';
    if (subType === 'choice') {
      questionTypesCount.choice++;
    } else if (subType === 'true-false') {
      questionTypesCount['true-false']++;
    } else if (subType === 'fill-blank') {
      questionTypesCount['fill-blank']++;
    } else {
      questionTypesCount.essay++;
    }
  });

  const countContentElements = () => {
    let images = 0;
    let tables = 0;
    let formulas = 0;
    let paragraphs = 0;

    omlBlocks.forEach((block) => {
      if (!block) return;
      if (block.type === 'table') tables++;
      else if (block.type === 'formula') formulas++;
      else if (block.type === 'paragraph') paragraphs++;

      if ((block as any).image?.src) images++;

      if (block.type === 'question-group' && Array.isArray((block as any).questions)) {
        (block as any).questions.forEach((q: any) => {
          if (q?.image?.src) images++;
        });
      }
    });

    return { images, tables, formulas, paragraphs };
  };

  const counts = countContentElements();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeMB} MB`
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeMB} MB`
      });
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setExamJsonCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex overflow-hidden font-sans text-text-primary select-none animate-fadeIn min-h-0">
      {/* LEFT SIDEBAR */}
      <ExamSidebar
        examSubView={examSubView}
        setExamSubView={setExamSubView}
        setMode={setMode}
        selectedQuestionId={selectedQuestionId}
        setSelectedQuestionId={setSelectedQuestionId}
        examSearchQuery={examSearchQuery}
        setExamSearchQuery={setExamSearchQuery}
        filteredQuestions={filteredQuestions}
      />

      {/* MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top Header Bar - only shown for Edit tab */}
        {examSubView === 'edit' && (
          <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black text-[#1E293B] truncate max-w-xs sm:max-w-md">
                  Tạo đề: {lastValidMetadata.title}
                </h1>
                <button className="p-1 text-slate-400 hover:text-slate-655 rounded transition cursor-pointer font-sans">
                  <Edit size={12} />
                </button>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-sans">
                <Cloud size={14} className="stroke-[2.5]" />
                <span>Chưa lưu</span>
              </div>
            </div>

            {/* Actions buttons - Edit tab only */}
            <div className="flex items-center gap-2">
              {/* Auto Save Status Indicator */}
              {examTab === 'code' && saveStatus !== 'idle' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-555 select-none mr-1">
                  {saveStatus === 'saving' && (
                    <>
                      <RefreshCw size={11} className="text-primary animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle2 size={11} className="text-emerald-500 stroke-[2.5]" />
                      <span className="text-slate-600">Đã lưu lúc {formatSavedTime(lastSavedTime)}</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <span className="text-red-500">⚠️</span>
                      <span className="text-red-500">Không thể lưu bản nháp</span>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={handleCreateNewExamClick}
                className="px-3.5 py-1.5 border border-red-200 text-red-555 hover:bg-red-50 text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer font-sans bg-white shadow-sm"
              >
                <File size={12} /> Tạo đề mới
              </button>
              <button
                onClick={handleSaveExam}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm"
              >
                <Save size={12} /> Lưu
              </button>
              <button
                onClick={() => setShowLivePreview(!showLivePreview)}
                className={`px-3.5 py-1.5 border text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm ${showLivePreview
                  ? 'bg-primary-light border-primary/20 text-primary hover:bg-primary-light/80'
                  : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
              >
                <Eye size={12} /> Xem thử đề
              </button>
            </div>
          </header>
        )}

        {/* Sub-header Tab Bar */}
        {examSubView === 'edit' && (
          <div className="h-12 bg-white border-b border-slate-100 px-6 flex items-center gap-6 shrink-0 select-none z-10">
            <button
              onClick={() => { setExamSubView('edit'); setExamTab('code'); setQuickStep(1); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${examSubView === 'edit' && examTab === 'code'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <Code size={14} /> Soạn bằng mã
            </button>
            <button
              onClick={() => { setExamSubView('edit'); setExamTab('quick'); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${examSubView === 'edit' && examTab === 'quick'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <Edit size={14} /> Soạn nhanh
            </button>
            <button
              onClick={() => { setExamSubView('edit'); setExamTab('bank'); setQuickStep(1); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${examSubView === 'edit' && examTab === 'bank'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <Database size={14} /> Ngân hàng câu hỏi
            </button>
          </div>
        )}

        {/* Main workspace layout */}
        {examSubView === 'edit' && examTab === 'code' && (
          <div className="flex-1 flex overflow-hidden animate-fadeIn min-h-0">
            {/* LEFT COLUMN: Code Editor */}
            <div className={`${showLivePreview ? 'w-1/2 border-r border-slate-100' : 'w-full'} bg-white flex flex-col overflow-hidden transition-all duration-300 min-h-0`}>
              {/* CROSS TAB CONFLICT BANNER */}
              {isCrossTabConflict && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-amber-800 text-[10px] font-bold shrink-0 animate-fadeIn select-none">
                  <div className="flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Bản nháp đã được cập nhật ở một cửa sổ khác.</span>
                  </div>
                  <button
                    onClick={() => {
                      const draft = draftService.loadDraft();
                      if (draft) {
                        setExamJsonCode(draft.rawJson);
                        tabInstanceId.current = draft.draftId;
                        setLastSavedTime(draft.lastSaved);
                        setIsCrossTabConflict(false);
                        setSaveStatus('saved');
                      }
                    }}
                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition cursor-pointer text-[9px] font-black font-sans"
                  >
                    Tải lại bản nháp
                  </button>
                </div>
              )}
              <div className="h-10 px-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/20">
                <span className="text-[10px] font-black text-text-primary uppercase tracking-wider">Soạn đề bằng mã</span>
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 transition cursor-pointer"
                >
                  <HelpCircle size={12} /> Hướng dẫn
                </button>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 px-4 pt-4 bg-slate-50/10 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 flex font-mono text-[11px] bg-slate-50/70 border border-slate-100 rounded-2xl overflow-hidden min-h-0 relative">
                  {/* Line numbers */}
                  <div
                    ref={lineNumbersRef}
                    className="bg-slate-100/50 text-[#A3AED0] select-none text-right px-3 py-4 border-r border-slate-200/50 flex flex-col font-mono leading-[20px] tracking-wide shrink-0 overflow-hidden"
                  >
                    {codeLines.map((_, idx) => (
                      <span key={idx} className="min-w-[24px] h-[20px] block">{idx + 1}</span>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={examJsonCode}
                    onChange={(e) => setExamJsonCode(e.target.value)}
                    onScroll={handleScroll}
                    className="flex-1 p-4 bg-transparent outline-none border-none resize-none leading-[20px] font-mono text-slate-800 focus:ring-0 focus:outline-none overflow-y-auto"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Editor Footer Status */}
              <div className="h-11 border-t border-slate-50 px-4 flex items-center justify-between shrink-0 bg-white">
                {/* LEFT: Action Button */}
                {compileStatus === 'compiling' ? (
                  <button
                    disabled
                    className="px-3 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-xl flex items-center gap-1.5 select-none"
                  >
                    <RefreshCw size={12} className="animate-spin text-slate-400" />
                    <span>Đang biên dịch...</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCheckCode}
                    className="px-3 py-1.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-success text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer font-sans"
                  >
                    <Check size={12} /> Kiểm tra mã
                  </button>
                )}

                {/* RIGHT: Status Badge */}
                {compileStatus === 'unchecked' && (
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-[10px] font-black text-slate-500 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Chưa biên dịch
                      </div>
                      <div className="text-[8px] text-slate-400 font-bold -mt-0.5">Có thay đổi chưa được kiểm tra.</div>
                    </div>
                  </div>
                )}

                {compileStatus === 'compiling' && (
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-[10px] font-black text-slate-500 flex items-center gap-1 justify-end">
                        <RefreshCw size={10} className="animate-spin text-slate-400" />
                        Đang biên dịch...
                      </div>
                      <div className="text-[8px] text-slate-400 font-bold -mt-0.5">Đang xử lý dữ liệu OML...</div>
                    </div>
                  </div>
                )}

                {compileStatus === 'success' && (
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-[10px] font-black text-emerald-600 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        ✓ Biên dịch thành công
                      </div>
                      <div className="text-[8px] text-slate-400 font-bold -mt-0.5">Không phát hiện lỗi.</div>
                    </div>
                  </div>
                )}

                {compileStatus === 'error' && (
                  <button
                    onClick={() => setValidationDialog((prev) => ({ ...prev, isOpen: true }))}
                    className="flex items-center gap-2 text-right hover:opacity-90 active:scale-[0.98] transition cursor-pointer border-none bg-transparent p-0 outline-none"
                  >
                    <div>
                      <div className="text-[10px] font-black text-red-500 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        ✕ Không thể biên dịch
                      </div>
                      <div className="text-[8px] text-red-400 font-bold -mt-0.5">
                        {validationErrors.length} lỗi {validationErrors[0]?.type === 'syntax' ? 'cú pháp JSON' : 'cấu trúc OML'} (Click xem chi tiết)
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: OML Live Preview */}
            {showLivePreview && renderExamPreviewColumn('Xem trước đề thi')}
          </div>
        )}

        {/* Ngân hàng câu hỏi workspace layout */}
        {examSubView === 'edit' && examTab === 'bank' && (
          <QuestionBankWorkspace />
        )}

        {/* Soạn nhanh tab view */}
        {examSubView === 'edit' && examTab === 'quick' && (
          <>
            {quickStep === 1 ? (
              <div className="flex-1 p-6 overflow-y-auto flex flex-col md:flex-row gap-6 bg-[#F8FAFC] animate-fadeIn">
                {/* Left Column */}
                <div className="flex-[3] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[480px]">
                  <div className="space-y-6">
                    <h2 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
                      BƯỚC 1: TẢI FILE ĐỀ THI
                    </h2>

                    {uploadedFile ? (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="p-4 border border-emerald-100 bg-emerald-50/10 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-655 flex flex-col items-center justify-center text-[9px] font-black font-sans shrink-0">
                              <File size={16} className="stroke-[2.5]" />
                              <span className="-mt-0.5">PDF</span>
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-text-primary truncate max-w-[200px] sm:max-w-md">
                                {uploadedFile.name}
                              </h4>
                              <p className="text-[9px] text-[#7E8B9B] font-bold mt-0.5">
                                {uploadedFile.size}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                              <CheckCircle2 size={14} className="stroke-[2.5]" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedFile(null);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-655 rounded-lg transition cursor-pointer"
                            >
                              <X size={14} className="stroke-[2.5]" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => setQuickStep(2)}
                          className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm font-sans"
                        >
                          Tới bước 2 <ChevronRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-indigo-100 hover:border-primary/45 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50/20 hover:bg-primary-light/10 transition cursor-pointer group"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.docx,.doc,.pptx,.png,.jpg,.jpeg"
                        />
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-primary flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm shadow-indigo-100/50">
                          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                            <path d="M12 12v9" />
                            <path d="m9 15 3-3 3 3" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-slate-800 text-center">
                          Kéo và thả file đề thi vào đây
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold text-center mt-1">
                          hoặc
                        </p>
                        <span className="mt-2.5 px-6 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer shadow-sm">
                          Chọn file từ máy tính
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold text-center mt-3">
                          Hỗ trợ: PDF, DOCX, DOC, PPTX, PNG, JPG (Dưới 50MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sparkle callout */}
                  <div className="p-4 border border-[#ECE9FE] bg-[#F5F3FF]/70 rounded-2xl flex gap-3 items-center mt-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md shadow-indigo-100/30 shrink-0 text-primary">
                      <Sparkles size={14} className="text-primary-hover" />
                    </div>
                    <div className="text-xs leading-relaxed text-slate-655 font-medium font-sans">
                      <span className="font-bold text-[#1E293B]">Hệ thống sẽ tự động nhận diện nội dung (OCR) và chuyển đổi thành cấu trúc đề thi.</span>
                      <p className="text-[10px] text-slate-400 font-bold">Đảm bảo file rõ nét để nhận diện chính xác hơn.</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex-[2] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-4">
                      HƯỚNG DẪN
                    </h2>
                    <ol className="space-y-3 text-xs text-slate-555 font-bold list-decimal pl-4 leading-relaxed font-sans">
                      <li>Tải lên file đề thi của bạn (PDF, DOCX, DOC, ảnh rõ nét).</li>
                      <li>Hệ thống sẽ tự động nhận diện nội dung bằng OCR.</li>
                      <li>Kiểm tra và chỉnh sửa lại cấu trúc đề nếu cần.</li>
                      <li>Lưu và chuyển sang bước cấu hình đề thi.</li>
                    </ol>
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                    <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-3">
                      MẸO:
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-555 font-bold list-disc pl-4 leading-relaxed font-sans">
                      <li>File PDF text hoặc DOCX sẽ cho kết quả tốt nhất.</li>
                      <li>Ảnh chụp đề thi nên rõ nét, không bị nghiêng.</li>
                      <li>Kiểm tra kỹ các câu hỏi sau khi hệ thống nhận diện.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              // STEP 2: Hiệu chỉnh kết quả nhận diện (3-column layout)
              <div className="flex-1 flex overflow-hidden bg-white border-t border-slate-200 animate-fadeIn relative select-text">

                {/* Simulated OCR loading overlay */}
                {isOcrLoading && (
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-30 flex items-center justify-center animate-fadeIn">
                    <div className="bg-white px-8 py-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-3">
                      <RefreshCw size={24} className="text-primary animate-spin" />
                      <span className="text-xs font-black text-text-primary">Đang chạy nhận diện OCR...</span>
                    </div>
                  </div>
                )}

                {/* COLUMN 1: File Info & OCR summary (≈22%) */}
                <div className={`${showLeftSidebar ? 'w-[22%] border-r' : 'w-0 border-none'} bg-slate-50/30 border-slate-200 flex flex-col justify-between shrink-0 overflow-y-auto relative transition-all duration-300`}>
                  <div className={`${showLeftSidebar ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
                    {/* Header */}
                    <div className="h-11 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-slate-50/50">
                      <span className="text-[10px] font-black text-slate-700 tracking-wider">FILE ĐÃ TẢI</span>
                      <button
                        onClick={() => setShowLeftSidebar(false)}
                        className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-755 rounded transition cursor-pointer"
                        title="Đóng bảng thông tin"
                      >
                        <ChevronLeft size={14} className="stroke-[2.5]" />
                      </button>
                    </div>

                    <div className="p-4 space-y-5">
                      {/* File item info */}
                      {uploadedFile && (
                        <div className="p-3 border border-slate-200 bg-white rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-655 flex flex-col items-center justify-center text-[7px] font-black font-sans shrink-0">
                              <File size={12} className="stroke-[2.5]" />
                              <span className="-mt-0.5">PDF</span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[10px] font-black text-text-primary truncate max-w-[90px]">
                                {uploadedFile.name}
                              </h4>
                              <p className="text-[8px] text-[#7E8B9B] font-bold mt-0.5">
                                {uploadedFile.size}
                              </p>
                            </div>
                          </div>
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0 stroke-[2.5]" />
                        </div>
                      )}

                      {/* Kết quả nhận diện block */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">KẾT QUẢ OCR</h3>
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-extrabold uppercase">Thành công</span>
                        </div>

                        <div className="space-y-2.5 font-sans">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                            <span>Tổng số câu hỏi</span>
                            <span className="text-text-primary font-black">50</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                            <span>Câu trắc nghiệm</span>
                            <span className="text-text-primary font-black">50</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                            <span>Câu tự luận</span>
                            <span className="text-text-primary font-black">0</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                            <span>Độ chính xác ước tính</span>
                            <span className="text-emerald-500 font-black">98%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 space-y-2 border-t border-slate-100 bg-slate-50/50 ${showLeftSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                      onClick={() => {
                        setIsOcrLoading(true);
                        setTimeout(() => {
                          setIsOcrLoading(false);
                          alert('Đã chạy nhận diện lại đề thi thành công!');
                        }, 1500);
                      }}
                      className="w-full py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-55 text-slate-655 text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer font-sans bg-white shadow-sm"
                    >
                      <RefreshCw size={12} className="stroke-[2.5]" />
                      Nhận diện lại
                    </button>
                    <button
                      onClick={() => setQuickStep(1)}
                      className="w-full py-1.5 text-[#7E8B9B] hover:text-slate-655 text-[9px] font-bold rounded-lg text-center transition cursor-pointer font-sans"
                    >
                      ← Quay lại Bước 1
                    </button>
                  </div>
                </div>

                {/* COLUMN 2: JSON Editor */}
                <div className={`${showLivePreview
                  ? (showLeftSidebar ? 'w-[38%] shrink-0 border-r border-slate-200' : 'w-[60%] shrink-0 border-r border-slate-200')
                  : 'flex-1'
                  } flex flex-col overflow-hidden bg-white transition-all duration-300`}>
                  {/* Header bar */}
                  <div className="h-11 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-slate-50/50">
                    <div className="flex items-center">
                      {!showLeftSidebar && (
                        <button
                          onClick={() => setShowLeftSidebar(true)}
                          className="p-1 hover:bg-slate-200 text-slate-550 hover:text-slate-755 rounded transition cursor-pointer mr-2 shrink-0"
                          title="Mở bảng thông tin"
                        >
                          <ChevronRight size={14} className="stroke-[2.5]" />
                        </button>
                      )}
                      <span className="text-[10px] font-black text-slate-700 tracking-wider">DỮ LIỆU ĐỀ THI (JSON)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          try {
                            const formatted = JSON.stringify(JSON.parse(examJsonCode), null, 2);
                            setExamJsonCode(formatted);
                          } catch (e: any) {
                            alert('Không thể format: Cú pháp JSON không hợp lệ!');
                          }
                        }}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[9px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm"
                      >
                        <AlignLeft size={11} /> Format JSON
                      </button>

                      <input
                        type="file"
                        ref={jsonFileInputRef}
                        onChange={handleJsonUpload}
                        className="hidden"
                        accept=".json"
                      />
                      <button
                        onClick={() => jsonFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-55 text-slate-600 text-[9px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm"
                      >
                        <Upload size={11} /> Tải lên JSON
                      </button>
                    </div>
                  </div>

                  {/* JSON Editor body */}
                  <div className="flex-1 flex font-mono text-[11px] bg-white overflow-hidden relative min-h-0">
                    <div
                      ref={quickLineNumbersRef}
                      className="bg-slate-50/60 text-[#A3AED0] select-none text-right px-2.5 py-4 border-r border-slate-100 flex flex-col leading-[18px] shrink-0 font-mono overflow-hidden h-full"
                    >
                      {codeLines.map((_, idx) => (
                        <span key={idx} className="min-w-[20px] h-[18px] block">{idx + 1}</span>
                      ))}
                    </div>
                    <textarea
                      ref={quickTextareaRef}
                      value={examJsonCode}
                      onChange={(e) => setExamJsonCode(e.target.value)}
                      onScroll={handleQuickScroll}
                      className="flex-1 p-4 bg-transparent outline-none border-none resize-none leading-[18px] font-mono text-slate-800 focus:ring-0 focus:outline-none overflow-y-auto h-full"
                      spellCheck={false}
                    />
                  </div>

                  {/* Footer message */}
                  <div className="h-8 border-t border-slate-150 shrink-0 flex items-center justify-between text-[9px] font-bold px-4 bg-slate-50/20">
                    {isJsonInvalid ? (
                      <span className="text-red-500 font-black">🔴 JSON đang có lỗi cú pháp</span>
                    ) : (
                      <span className="text-emerald-500 font-black">🟢 OML hợp lệ. Tự động lưu bản nháp.</span>
                    )}
                  </div>
                </div>

                {/* COLUMN 3: OML Live Preview (≈40%) */}
                {showLivePreview && renderExamPreviewColumn('XEM TRƯỚC ĐỀ THI')}
              </div>
            )}
          </>
        )}

        {/* Cấu hình đề thi */}
        {examSubView === 'config' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#F8FAFC] animate-fadeIn">
            {/* Config Header */}
            <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-4">
                {/* Title & Subtitle */}
                <div>
                  <h1 className="text-sm font-black text-slate-800 leading-tight">
                    Cấu hình đề thi
                  </h1>
                  <p className="text-[10px] text-slate-400 font-bold -mt-0.5 font-sans">
                    Thiết lập thông tin và quy tắc cho đề thi của bạn
                  </p>
                </div>
              </div>

              {/* Right side status & action */}
              <div className="flex items-center gap-2.5">
                {/* Auto Save Status */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] font-sans mr-2">
                  <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                  <span>Đã tự động lưu {lastSavedTime ? formatSavedTime(lastSavedTime) : 'mới đây'}</span>
                </div>

                {/* Publish Button - only action needed in config */}
                <button
                  onClick={handlePublishExam}
                  className="px-5 py-2 bg-[#6C5DD3] hover:bg-[#5C4DB3] text-white text-[10px] font-black rounded-xl flex items-center gap-2 transition cursor-pointer font-sans shadow-md shadow-indigo-150"
                >
                  <Send size={13} className="stroke-[2.5]" />
                  Xuất bản đề thi
                </button>
              </div>
            </header>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Column - Configurations (2/3) */}
                <div className="flex-1 lg:flex-[2.1] w-full space-y-6">

                  {/* Card 1: Thông tin cơ bản */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-sm space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6C5DD3] flex items-center justify-center shrink-0">
                        <FileText size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide font-sans">
                          1. Thông tin cơ bản
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold -mt-0.5 font-sans">
                          Nhập thông tin chính của đề thi
                        </p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      {/* Tên đề thi */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                          Tên đề thi
                        </label>
                        <input
                          type="text"
                          value={infoMeta.title || ''}
                          onChange={(e) => updateJsonField('title', e.target.value)}
                          className="w-full bg-white border border-[#E2E8F0] focus:border-[#6C5DD3] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none transition cursor-text placeholder:text-slate-400 focus:ring-2 focus:ring-[#6C5DD3]/10"
                          placeholder="Nhập tên đề thi..."
                        />
                      </div>

                      {/* 4 Dropdowns Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Môn học */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                            Môn học
                          </label>
                          <div className="relative">
                            <select
                              value={infoMeta.subject || 'Sinh học'}
                              onChange={(e) => updateJsonField('subject', e.target.value)}
                              className="w-full bg-white border border-[#E2E8F0] focus:border-[#6C5DD3] rounded-2xl px-3.5 py-3 text-xs font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-[#6C5DD3]/10 transition cursor-pointer pr-10"
                            >
                              <option value="Sinh học">Sinh học</option>
                              <option value="Toán học">Toán học</option>
                              <option value="Vật lý">Vật lý</option>
                              <option value="Hóa học">Hóa học</option>
                              <option value="Tiếng Anh">Tiếng Anh</option>
                              <option value="Ngữ văn">Ngữ văn</option>
                              <option value="Lịch sử">Lịch sử</option>
                              <option value="Địa lý">Địa lý</option>
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>

                        {/* Khối lớp */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                            Khối lớp
                          </label>
                          <div className="relative">
                            <select
                              value={infoMeta.grade || 10}
                              onChange={(e) => updateJsonField('grade', parseInt(e.target.value) || e.target.value)}
                              className="w-full bg-white border border-[#E2E8F0] focus:border-[#6C5DD3] rounded-2xl px-3.5 py-3 text-xs font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-[#6C5DD3]/10 transition cursor-pointer pr-10"
                            >
                              <option value={6}>Khối 6</option>
                              <option value={7}>Khối 7</option>
                              <option value={8}>Khối 8</option>
                              <option value={9}>Khối 9</option>
                              <option value={10}>Khối 10</option>
                              <option value={11}>Khối 11</option>
                              <option value={12}>Khối 12</option>
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>

                        {/* Thời gian làm bài */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                            Thời gian làm bài
                          </label>
                          <div className="relative">
                            <select
                              value={infoMeta.time || 60}
                              onChange={(e) => updateJsonField('time', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-[#E2E8F0] focus:border-[#6C5DD3] rounded-2xl px-3.5 py-3 text-xs font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-[#6C5DD3]/10 transition cursor-pointer pr-10"
                            >
                              <option value={15}>15 phút</option>
                              <option value={30}>30 phút</option>
                              <option value={45}>45 phút</option>
                              <option value={60}>60 phút</option>
                              <option value={90}>90 phút</option>
                              <option value={120}>120 phút</option>
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>

                        {/* Độ khó */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                            Độ khó
                          </label>
                          <div className="relative">
                            <select
                              value={infoMeta.difficulty || 'medium'}
                              onChange={(e) => updateJsonField('difficulty', e.target.value)}
                              className="w-full bg-white border border-[#E2E8F0] focus:border-[#6C5DD3] rounded-2xl px-3.5 py-3 text-xs font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-[#6C5DD3]/10 transition cursor-pointer pr-10"
                            >
                              <option value="easy">Dễ (Easy)</option>
                              <option value="medium">Trung bình (Medium)</option>
                              <option value="hard">Khó (Hard)</option>
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Chế độ làm bài */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-sm space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6C5DD3] flex items-center justify-center shrink-0">
                        <Sliders size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide font-sans">
                          2. Chế độ làm bài
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold -mt-0.5 font-sans">
                          Thiết lập các tùy chọn khi học sinh làm bài
                        </p>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="divide-y divide-slate-100/60">
                      {/* Row 1 */}
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                            <Shuffle size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              Xáo trộn thứ tự câu hỏi
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                              Mỗi học sinh sẽ nhận đề với thứ tự câu hỏi khác nhau
                            </p>
                          </div>
                        </div>
                        <Toggle
                          id="shuffle-questions"
                          checked={infoMeta.shuffle !== false}
                          onChange={(checked) => updateJsonField('shuffle', checked)}
                        />
                      </div>

                      {/* Row 2 */}
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                            <RefreshCw size={13} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              Xáo trộn thứ tự đáp án
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                              Mỗi học sinh sẽ nhận đề với thứ tự đáp án khác nhau
                            </p>
                          </div>
                        </div>
                        <Toggle
                          id="shuffle-answers"
                          checked={infoMeta.shuffleAnswers !== false}
                          onChange={(checked) => updateJsonField('shuffleAnswers', checked)}
                        />
                      </div>

                      {/* Row 3 */}
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                            <Timer size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              Hiển thị đồng hồ đếm ngược
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                              Học sinh có thể theo dõi thời gian còn lại khi làm bài
                            </p>
                          </div>
                        </div>
                        <Toggle
                          id="show-countdown"
                          checked={infoMeta.showCountdown !== false}
                          onChange={(checked) => updateJsonField('showCountdown', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Hiển thị kết quả */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-sm space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6C5DD3] flex items-center justify-center shrink-0">
                        <Eye size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide font-sans">
                          3. Hiển thị kết quả
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold -mt-0.5 font-sans">
                          Thiết lập những gì học sinh có thể xem sau khi nộp bài
                        </p>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="divide-y divide-slate-100/60">
                      {/* Row 1 */}
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                            <CheckSquare size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              Hiển thị đáp án đúng
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                              Cho phép học sinh xem đáp án sau khi nộp bài
                            </p>
                          </div>
                        </div>
                        <Toggle
                          id="show-answers"
                          checked={infoMeta.allowReview !== false}
                          onChange={(checked) => updateJsonField('allowReview', checked)}
                        />
                      </div>

                      {/* Row 2 */}
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                            <BookOpen size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              Hiển thị lời giải
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                              Cho phép học sinh xem lời giải chi tiết sau khi nộp bài
                            </p>
                          </div>
                        </div>
                        <Toggle
                          id="show-explanation"
                          checked={infoMeta.showExplanation !== false}
                          onChange={(checked) => updateJsonField('showExplanation', checked)}
                        />
                      </div>

                      {/* Row 3 */}
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                            <Trophy size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              Hiển thị bảng xếp hạng
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                              Hiển thị bảng xếp hạng khi kết thúc bài làm (chỉ áp dụng với đề luyện tập)
                            </p>
                          </div>
                        </div>
                        <Toggle
                          id="show-leaderboard"
                          checked={infoMeta.showLeaderboard === true}
                          onChange={(checked) => updateJsonField('showLeaderboard', checked)}
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column - Summary Sidebar (1/3) */}
                <div className="w-full lg:flex-1 space-y-6 lg:sticky lg:top-0">

                  {/* Overview Card */}
                  <div className="bg-gradient-to-b from-[#5E51E8] to-[#6C5DD3] rounded-[24px] p-6 text-white shadow-xl flex flex-col justify-between">

                    <div>
                      {/* Card Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                          <ClipboardList size={16} />
                        </div>
                        <h3 className="text-xs font-black tracking-wider uppercase font-sans">
                          Tổng quan đề thi
                        </h3>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-1 text-center mt-6 select-none border-b border-white/15 pb-5">
                        <div>
                          <div className="text-lg font-black">{previewQuestions.length}</div>
                          <div className="text-[8px] opacity-75 font-semibold uppercase mt-0.5 tracking-wider font-sans">Câu hỏi</div>
                        </div>
                        <div className="border-r border-white/20 h-7 self-center" />
                        <div>
                          <div className="text-lg font-black">{infoMeta.time || 60} phút</div>
                          <div className="text-[8px] opacity-75 font-semibold uppercase mt-0.5 tracking-wider font-sans">Thời gian</div>
                        </div>
                        <div className="border-r border-white/20 h-7 self-center" />
                        <div>
                          <div className="text-lg font-black">10.00</div>
                          <div className="text-[8px] opacity-75 font-semibold uppercase mt-0.5 tracking-wider font-sans">Điểm</div>
                        </div>
                        <div className="border-r border-white/20 h-7 self-center" />
                        <div>
                          <div className="text-lg font-black">
                            {getDifficultyLabel(infoMeta.difficulty)}
                          </div>
                          <div className="text-[8px] opacity-75 font-semibold uppercase mt-0.5 tracking-wider font-sans">Độ khó</div>
                        </div>
                      </div>

                      {/* Section 1: Question Type Distribution */}
                      <div className="mt-5">
                        <h4 className="text-[9px] font-black uppercase tracking-wider opacity-85 mb-3 font-sans">
                          Phân bố câu hỏi
                        </h4>

                        <div className="space-y-2.5">
                          {/* Trắc nghiệm */}
                          <div className="flex items-center justify-between text-xs font-bold font-sans">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C3B8FF]" />
                              <span className="opacity-95 font-semibold">Trắc nghiệm</span>
                            </div>
                            <span className="font-bold">{questionTypesCount.choice}</span>
                          </div>

                          {/* Đúng / Sai */}
                          <div className="flex items-center justify-between text-xs font-bold font-sans">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F43]" />
                              <span className="opacity-95 font-semibold">Đúng / Sai</span>
                            </div>
                            <span className="font-bold">{questionTypesCount['true-false']}</span>
                          </div>

                          {/* Điền khuyết */}
                          <div className="flex items-center justify-between text-xs font-bold font-sans">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F]" />
                              <span className="opacity-95 font-semibold">Điền khuyết</span>
                            </div>
                            <span className="font-bold">{questionTypesCount['fill-blank']}</span>
                          </div>

                          {/* Tự luận */}
                          <div className="flex items-center justify-between text-xs font-bold font-sans">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455]" />
                              <span className="opacity-95 font-semibold">Tự luận</span>
                            </div>
                            <span className="font-bold">{questionTypesCount.essay}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Content Breakdown */}
                      <div className="mt-6 pt-5 border-t border-white/15">
                        <h4 className="text-[9px] font-black uppercase tracking-wider opacity-85 mb-3 font-sans">
                          Nội dung đề thi
                        </h4>

                        <div className="space-y-2.5">
                          {/* Hình ảnh */}
                          <div className="flex items-center gap-2.5 text-xs font-bold font-sans opacity-95">
                            <Image size={14} className="opacity-80" />
                            <span>{counts.images} hình ảnh</span>
                          </div>

                          {/* Bảng biểu */}
                          <div className="flex items-center gap-2.5 text-xs font-bold font-sans opacity-95">
                            <Grid size={14} className="opacity-80" />
                            <span>{counts.tables} bảng biểu</span>
                          </div>

                          {/* Công thức */}
                          <div className="flex items-center gap-2.5 text-xs font-bold font-sans opacity-95">
                            <Calculator size={14} className="opacity-80" />
                            <span>{counts.formulas} công thức</span>
                          </div>

                          {/* Đoạn văn bản */}
                          <div className="flex items-center gap-2.5 text-xs font-bold font-sans opacity-95">
                            <BookOpen size={14} className="opacity-80" />
                            <span>{counts.paragraphs} đoạn văn bản</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Action validation card */}
                    <div className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 mt-6 transition duration-150 flex items-center gap-3 cursor-pointer select-none">
                      <ShieldCheck size={20} className="text-white shrink-0" />
                      <div className="flex-1">
                        <h5 className="text-[10px] font-black text-white font-sans leading-tight">
                          Kiểm tra trước khi xuất bản
                        </h5>
                        <p className="text-[8px] opacity-75 font-semibold font-sans mt-0.5 leading-none">
                          Đảm bảo đề thi hợp lệ và sẵn sàng
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>



          </div>
        )}

        {/* Xem và xuất bản */}
        {examSubView === 'publish' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-6 animate-fadeIn">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wide border-b border-slate-100 pb-3 mb-6 font-sans">
              Xem và xuất bản đề thi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Publish Info summary */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-[#10B981] uppercase tracking-wider">Đề thi sẵn sàng xuất bản</span>
                </div>

                <div className="space-y-3.5">
                  <h3 className="text-sm font-black text-text-primary leading-tight font-sans">
                    {infoMeta.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-text-secondary font-sans border-t border-b border-slate-50 py-3">
                    <div>Môn học: <span className="text-text-primary">{infoMeta.subject}</span></div>
                    <div>Khối lớp: <span className="text-text-primary">Khối {infoMeta.grade || 10}</span></div>
                    <div>Thời gian: <span className="text-text-primary">{infoMeta.time || 90} phút</span></div>
                    <div>Số câu hỏi: <span className="text-text-primary">{lastValidMetadata.questionCount} câu</span></div>
                    <div>Độ khó: <span className="text-text-primary font-black uppercase text-primary text-[8px] px-1.5 py-0.5 rounded bg-primary-light border border-primary/10">{infoMeta.level === 'easy' ? 'Dễ' : infoMeta.level === 'hard' ? 'Khó' : 'Trung bình'}</span></div>
                    <div>Điểm mỗi câu: <span className="text-text-primary font-mono">{(10 / lastValidMetadata.questionCount).toFixed(2)} đ</span></div>
                  </div>

                  <p className="text-[10px] text-text-secondary leading-relaxed font-medium font-sans">
                    Nhấp vào nút **Xuất bản đề thi** dưới đây để lưu tất cả dữ liệu đề thi lên máy chủ và kích hoạt liên kết cho học sinh tham gia kiểm tra.
                  </p>
                  <button
                    onClick={handlePublishExam}
                    className="w-full mt-3 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100 font-sans"
                  >
                    <Send size={14} /> Xuất bản đề thi
                  </button>
                </div>
              </div>

              {/* Share link card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between min-h-[250px]">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-primary flex items-center justify-center shadow-sm">
                    <Link size={18} />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">Đường liên kết tới đề thi</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal font-sans">
                      Học sinh có thể truy cập liên kết này để làm bài kiểm tra trực tuyến.
                    </p>
                  </div>

                  {/* Copy Link field container */}
                  <div className="flex gap-2 items-center bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                    <input
                      type="text"
                      readOnly
                      value={`http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`}
                      className="bg-transparent border-none text-[10px] font-mono text-primary font-bold focus:ring-0 p-0 flex-1 select-all cursor-text overflow-x-auto"
                    />
                    <button
                      onClick={() => {
                        const linkText = `http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`;
                        navigator.clipboard.writeText(linkText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`p-2 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${copied
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                        : 'bg-white hover:bg-slate-50 text-slate-655 border border-slate-200 shadow-sm'
                        }`}
                      title="Sao chép liên kết"
                    >
                      {copied ? <Check size={14} className="stroke-[2.5]" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100 font-sans"
                  >
                    <ExternalLink size={14} /> Mở liên kết đề thi
                  </a>
                </div>
              </div>
            </div>

            {/* Copy toast indicator */}
            {copied && (
              <div className="fixed bottom-6 right-6 bg-[#10B981] text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-100/20 text-xs font-black flex items-center gap-2 animate-bounce z-50">
                <CheckCircle2 size={16} className="stroke-[2.5]" />
                <span>Đã sao chép liên kết vào bộ nhớ tạm!</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── RESTORE DRAFT DIALOG ── */}
      {showRestoreDialog && pendingDraft && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity duration-300" onClick={handleRestoreDraft} />
          <div className="bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100 animate-scaleUp text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mx-auto shadow-sm">
              <RefreshCw size={22} className="text-primary animate-spin" />
            </div>

            <div className="space-y-2 leading-relaxed">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Khôi phục bản nháp?</h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Chúng tôi phát hiện bạn còn một bản nháp chưa hoàn thành. Bạn muốn tiếp tục chỉnh sửa hay tạo đề mới?
              </p>
              {pendingDraft.lastSaved && (
                <div className="text-[10px] text-slate-400 font-semibold bg-slate-50 py-1.5 px-3 rounded-lg inline-block mt-2">
                  Lưu lần cuối: <span className="font-bold text-slate-655">{formatFullSavedTime(pendingDraft.lastSaved)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleDiscardRestore}
                className="w-full sm:flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black rounded-xl transition cursor-pointer"
              >
                Tạo đề mới
              </button>
              <button
                onClick={handleRestoreDraft}
                className="w-full sm:flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-indigo-150"
              >
                Tiếp tục chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM NEW EXAM DIALOG ── */}
      {showConfirmNewDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowConfirmNewDialog(false)} />
          <div className="bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100 animate-scaleUp text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm">
              <X size={22} className="stroke-[2.5]" />
            </div>

            <div className="space-y-2 leading-relaxed">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Tạo đề mới?</h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Bạn có chắc muốn tạo đề mới? Bản nháp hiện tại sẽ bị xóa.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmNewDialog(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmNewExam}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-red-100"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {validationDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setValidationDialog((prev: any) => ({ ...prev, isOpen: false }))}
          />
          <div className="bg-white rounded-3xl w-full max-w-[460px] p-6 shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100 animate-scaleUp text-left space-y-5">
            {validationDialog.success ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} className="stroke-[2.5]" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                    {validationDialog.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-bold space-y-1">
                    <p className="text-emerald-600 font-black">✓ JSON hợp lệ</p>
                    <p className="text-emerald-600 font-black">✓ OML hợp lệ</p>
                    <p className="text-slate-700">{validationDialog.metadata?.questionCount ?? 0} câu hỏi</p>
                    <p className="text-slate-400">0 lỗi</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm">
                  <X size={24} className="stroke-[2.5]" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide text-center">
                    {validationDialog.title}
                  </h3>

                  <div className="text-[11px] text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <p className="font-bold text-red-600">Đã phát hiện {validationDialog.errors?.length ?? 0} lỗi:</p>

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {validationDialog.errors?.map((err, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-150 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="font-black text-red-500 text-xs shrink-0">{getErrorNumberSymbol(idx)}</span>
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800 leading-snug">{err.message}</p>
                              {err.type === 'syntax' ? (
                                <div className="flex gap-3 font-mono text-[9px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                                  <span>Dòng: <strong className="text-slate-700">{err.line}</strong></span>
                                  <span>Cột: <strong className="text-slate-700">{err.column}</strong></span>
                                </div>
                              ) : (
                                err.path && (
                                  <div className="text-[9px] font-mono text-slate-400 font-bold">
                                    Đường dẫn: <span className="text-primary font-black bg-indigo-50/50 px-1.5 py-0.5 rounded">{err.path}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setValidationDialog((prev: any) => ({ ...prev, isOpen: false }))}
                    className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-655 text-xs font-black rounded-xl transition cursor-pointer text-center font-sans"
                  >
                    Đóng
                  </button>
                  {validationDialog.errors?.[0]?.line && (
                    <button
                      onClick={() => {
                        const line = validationDialog.errors?.[0]?.line;
                        if (line) {
                          highlightLineInTextarea(line);
                          setValidationDialog((prev: any) => ({ ...prev, isOpen: false }));
                        }
                      }}
                      className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black rounded-xl transition cursor-pointer text-center border border-red-150 font-sans"
                    >
                      Đi tới lỗi đầu tiên
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <OmlGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {renderPreviewFullscreenOverlay()}
    </div>
  );
};

