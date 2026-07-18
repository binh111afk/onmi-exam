import React, { useState, useRef, useEffect } from 'react';
import {
  Edit,
  Save,
  Eye,
  Code,
  Database,
  Check,
  HelpCircle,
  File,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  RefreshCw,
  Link,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Send,
} from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';

import { ExamSidebar } from './ExamSidebar';
import { QuestionBankWorkspace } from './QuestionBankWorkspace';
import { OmlPreviewPaper } from '../../ExamEditor/OmlRenderer/OmlPreviewPaper';
import { OmlGuideModal } from './OmlGuideModal';

// Hooks & Sub-components
import { useExamOmlCompiler } from './hooks/useExamOmlCompiler';
import { useExamAutoSave } from './hooks/useExamAutoSave';
import { useExamViewportZoom } from './hooks/useExamViewportZoom';
import { ExamConfigPanel } from './ExamConfigPanel';
import { ExamQuickOcrStep } from './ExamQuickOcrStep';
import { draftService } from '../../../services/draftService';

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

  // Local OCR upload file state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; file?: File } | null>(null);

  const [creationMethod, setCreationMethod] = useState<'none' | 'code' | 'ocr' | 'bank'>('none');
  const [pendingCreationMethod, setPendingCreationMethod] = useState<'code' | 'ocr' | 'bank' | null>(null);
  const [isDraftResolved, setIsDraftResolved] = useState(false);
  const [ocrTempCode, setOcrTempCode] = useState('');
  const handleApplyOcrCode = (ocrCode: string) => {
    applyOcrCodeToWorkspace(ocrCode);
  };

  const activateCreationMethod = (method: 'code' | 'ocr' | 'bank') => {
    setCreationMethod(method);
    setExamTab(method === 'ocr' ? 'quick' : method);
    setQuickStep(1);
    if (method === 'ocr') setOcrTempCode('');
  };

  const applyOcrCodeToWorkspace = (ocrCode: string) => {
    setExamJsonCode(ocrCode);

    // Save draft immediately to localStorage
    const now = new Date().toISOString();
    let title = 'Đề thi chưa có tiêu đề';
    let subject = 'Sinh học';
    try {
      const parsed = JSON.parse(ocrCode);
      if (parsed.info?.title) title = parsed.info.title;
      if (parsed.info?.subject) subject = parsed.info.subject;
    } catch(e) {}

    draftService.saveDraft({
      version: '1.0',
      editorMode: 'json',
      rawJson: ocrCode,
      lastSaved: now,
      examTitle: title,
      subject: subject,
      draftId: tabInstanceId.current,
    });

    // Switch to config view
    setCreationMethod('code');
    setExamTab('code');
    setExamSubView('config');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const quickLineNumbersRef = useRef<HTMLDivElement>(null);
  const quickTextareaRef = useRef<HTMLTextAreaElement>(null);

  const highlightedCode = React.useMemo(() => {
    if (!examJsonCode) return '';
    try {
      let html = Prism.highlight(examJsonCode, Prism.languages.json, 'json');
      html = html.replace(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g, (match) => {
        return `<span class="token-latex">${match}</span>`;
      });
      return html;
    } catch (e) {
      return examJsonCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [examJsonCode]);

  const handleHorizontalScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
      preRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Hooks integration
  const {
    isPreviewFullscreenOpen,
    setIsPreviewFullscreenOpen,
    isPreviewFullscreenClosing,
    setIsPreviewFullscreenClosing,
    previewZoom,
    setPreviewZoom,
    isPreviewFitWidth,
    setIsPreviewFitWidth,
    previewScrollRef,
    fullscreenPreviewScrollRef,
    openPreviewFullscreen,
    closePreviewFullscreen,
    applyPreviewZoom,
    stepPreviewZoom,
  } = useExamViewportZoom();

  const {
    lastValidOml,
    lastValidMetadata,
    validationErrors,
    isJsonInvalid,
    compileStatus,
    validationDialog,
    setValidationDialog,
    getErrorNumberSymbol,
    highlightLineInTextarea,
    handleCheckCode,
  } = useExamOmlCompiler({
    examJsonCode,
    setExamJsonCode,
    textareaRef,
    quickTextareaRef,
  });

  const {
    saveStatus,
    setSaveStatus,
    lastSavedTime,
    setLastSavedTime,
    showRestoreDialog,
    setShowRestoreDialog,
    showConfirmNewDialog,
    setShowConfirmNewDialog,
    pendingDraft,
    isCrossTabConflict,
    setIsCrossTabConflict,
    tabInstanceId,
    formatSavedTime,
    formatFullSavedTime,
    checkForDraft,
    handleRestoreDraft,
    dismissRestoreDraft,
    handleDiscardRestore,
    handleCreateNewExamClick,
    handleConfirmNewExam,
  } = useExamAutoSave({
    examJsonCode,
    setExamJsonCode,
    examTab,
    isCodeEditorActive: creationMethod === 'code',
    lastValidMetadata,
  });

  const onConfirmNewExam = () => {
    handleConfirmNewExam();
    setIsDraftResolved(true);
    if (pendingCreationMethod) activateCreationMethod(pendingCreationMethod);
    setPendingCreationMethod(null);
  };

  const onDiscardRestore = () => {
    handleDiscardRestore();
  };

  const onRestoreDraft = () => {
    if (pendingCreationMethod === 'ocr' && pendingDraft) {
      setOcrTempCode(pendingDraft.rawJson);
      tabInstanceId.current = pendingDraft.draftId;
      setLastSavedTime(pendingDraft.lastSaved);
      setSaveStatus('saved');
      dismissRestoreDraft();
      setIsDraftResolved(true);
      setCreationMethod('ocr');
      setExamTab('quick');
      setQuickStep(2);
      setPendingCreationMethod(null);
      return;
    }

    handleRestoreDraft();
    setIsDraftResolved(true);
    setCreationMethod('code');
    setExamTab('code');
    setPendingCreationMethod(null);
  };

  const handleSelectCreationMethod = (method: 'code' | 'ocr' | 'bank') => {
    const draft = draftService.loadDraft();
    const shouldRestoreDraft = (
      (method === 'code' && draft?.editorMode !== 'ocr')
      || (method === 'ocr' && draft?.editorMode === 'ocr')
    );

    if (!isDraftResolved && shouldRestoreDraft && checkForDraft()) {
      setPendingCreationMethod(method);
      return;
    }

    activateCreationMethod(method);
    setPendingCreationMethod(null);
  };

  useEffect(() => {
    if (creationMethod !== 'ocr' || !ocrTempCode.trim()) return;

    const savedDraft = draftService.loadDraft();
    if (savedDraft?.editorMode === 'ocr' && savedDraft.rawJson === ocrTempCode) return;

    const handler = window.setTimeout(() => {
      const now = new Date().toISOString();
      let title = 'Đề thi chưa có tiêu đề';
      let subject = 'Không rõ';

      try {
        const parsed = JSON.parse(ocrTempCode);
        title = parsed.info?.title || title;
        subject = parsed.info?.subject || subject;
      } catch (error) {
        console.error('Không thể đọc metadata của bản nháp OCR:', error);
      }

      const success = draftService.saveDraft({
        version: '1.0',
        editorMode: 'ocr',
        rawJson: ocrTempCode,
        lastSaved: now,
        examTitle: title,
        subject,
        draftId: tabInstanceId.current,
      });

      setSaveStatus(success ? 'saved' : 'error');
      if (success) setLastSavedTime(now);
    }, 500);

    return () => window.clearTimeout(handler);
  }, [creationMethod, ocrTempCode, setLastSavedTime, setSaveStatus, tabInstanceId]);

  const handleBackFromEditor = () => {
    if (examSubView === 'edit' && creationMethod !== 'none') {
      setCreationMethod('none');
      setQuickStep(1);
      return;
    }

    setMode('dashboard');
  };

  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // KaTeX Script Loader
  const [katexLoaded, setKatexLoaded] = useState(!!(window as any).katex);

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
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleQuickScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (quickLineNumbersRef.current) {
      quickLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

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
        ) : examJsonCode.trim() === '' ? (
          <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-white/70 p-12 text-center text-xs font-bold text-slate-400 font-sans">
            Đề thi trống
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
                  className="p-1.5 hover:bg-white text-slate-500 hover:text-slate-770 rounded-lg transition cursor-pointer"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[9px] font-black text-slate-600 min-w-[36px] text-center font-mono">
                  {previewZoom}%
                </span>
                <button
                  onClick={() => stepPreviewZoom(1)}
                  className="p-1.5 hover:bg-white text-slate-500 hover:text-slate-770 rounded-lg transition cursor-pointer"
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
              {examJsonCode.trim() === '' ? (
                <div className="w-full max-w-[840px] rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-400 font-sans">
                  Đề thi trống
                </div>
              ) : (
                <OmlPreviewPaper
                  omlBlocks={omlBlocks}
                  infoMeta={infoMeta}
                  selectedQuestionId={selectedQuestionId}
                  setSelectedQuestionId={setSelectedQuestionId}
                  style={{ width: paperWidth }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const codeLines = examJsonCode.split('\n');

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
        size: `${sizeMB} MB`,
        file
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
        size: `${sizeMB} MB`,
        file
      });
    }
  };

  const handleOcrJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setOcrTempCode(event.target.result as string);
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex overflow-hidden font-sans text-text-primary select-none animate-fadeIn min-h-0">
      {/* LEFT SIDEBAR */}
      <ExamSidebar
        examSubView={examSubView}
        setExamSubView={setExamSubView}
        onBack={handleBackFromEditor}
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
              <h1 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
                Soạn thảo đề thi OML
              </h1>
            </div>

            {/* Actions buttons - Edit tab only */}
            <div className="flex items-center gap-2">
              {/* Auto Save Status Indicator */}
              {creationMethod !== 'none' && creationMethod !== 'ocr' && saveStatus !== 'idle' && (
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
                className="px-3.5 py-1.5 border border-slate-200 text-slate-650 hover:bg-slate-55 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm"
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

        {examSubView === 'edit' && creationMethod !== 'none' && (
          <div className="h-12 bg-white border-b border-slate-100 px-6 flex items-center shrink-0 z-10">
            <button
              onClick={() => setCreationMethod('none')}
              className="flex items-center gap-1.5 text-xs font-black text-text-secondary hover:text-primary transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Quay lại chọn phương thức
            </button>
          </div>
        )}

        {/* Main workspace layout */}
        {examSubView === 'edit' && creationMethod === 'none' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
            <section className="mx-auto flex min-h-full max-w-6xl flex-col justify-center py-[30px]">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-text-primary">Chọn phương thức soạn đề</h2>
                <p className="mt-2 text-sm font-medium text-text-secondary">Bắt đầu theo cách phù hợp nhất với nội dung đề thi của bạn.</p>
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <button onClick={() => handleSelectCreationMethod('code')} className="group rounded-[24px] border border-slate-100 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-md cursor-pointer">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary"><Code size={30} className="stroke-[2.5]" /></div>
                  <h3 className="text-lg font-black text-text-primary">Soạn bằng mã OML</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary">Soạn trực tiếp mã nguồn OML và xem trước đề thi theo thời gian thực.</p>
                </button>
                <button onClick={() => handleSelectCreationMethod('ocr')} className="group rounded-[24px] border border-slate-100 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-md cursor-pointer">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-primary"><Edit size={30} className="stroke-[2.5]" /></div>
                  <h3 className="text-lg font-black text-text-primary">Soạn nhanh</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary">Tải file PDF hoặc ảnh để AI nhận diện OCR, sau đó kiểm tra và hiệu chỉnh.</p>
                </button>
                <button onClick={() => handleSelectCreationMethod('bank')} className="group rounded-[24px] border border-slate-100 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-md cursor-pointer">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Database size={30} className="stroke-[2.5]" /></div>
                  <h3 className="text-lg font-black text-text-primary">Ngân hàng câu hỏi</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary">Chọn và tổ chức các câu hỏi có sẵn từ ngân hàng của hệ thống.</p>
                </button>
              </div>
            </section>
          </div>
        )}

        {examSubView === 'edit' && creationMethod === 'code' && (
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
                    className="px-2 py-1 bg-amber-100 hover:bg-amber-205 text-amber-900 rounded-lg transition cursor-pointer text-[9px] font-black font-sans"
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
                <div className="flex-1 flex font-mono text-[11px] bg-slate-50/50 border border-slate-100 rounded-2xl overflow-y-auto min-h-0 relative oml-editor-theme">
                  {/* Embedded Theme CSS */}
                  <style>{`
                    .oml-editor-theme .token.punctuation {
                      color: #4338CA !important;
                      font-weight: bold;
                    }
                    .oml-editor-theme .token.property {
                      color: #1E1B4B !important;
                      font-weight: 600;
                    }
                    .oml-editor-theme .token.string {
                      color: #6D28D9 !important;
                    }
                    .oml-editor-theme .token.number,
                    .oml-editor-theme .token.boolean {
                      color: #BE185D !important;
                      font-weight: bold;
                    }
                    .oml-editor-theme .token-latex {
                      color: #047857 !important;
                      font-weight: 600;
                    }
                    .oml-editor-theme .oml-editor-pre,
                    .oml-editor-theme textarea {
                      white-space: pre !important;
                      word-wrap: normal !important;
                      word-break: keep-all !important;
                    }
                    .oml-editor-theme .oml-editor-pre::-webkit-scrollbar {
                      display: none !important;
                      height: 0 !important;
                      width: 0 !important;
                    }
                    .oml-editor-theme .oml-editor-pre {
                      scrollbar-width: none !important;
                    }
                  `}</style>

                  {/* Line numbers */}
                  <div
                    ref={lineNumbersRef}
                    className="bg-slate-100/50 text-[#A3AED0] select-none text-right px-3 py-4 border-r border-slate-200/50 flex flex-col font-mono text-[11px] leading-[18px] tracking-wide shrink-0 overflow-hidden min-h-0"
                  >
                    {codeLines.map((_, idx) => (
                      <span key={idx} className="min-w-[24px] h-[18px] block">{idx + 1}</span>
                    ))}
                  </div>

                  <div className="flex-1 relative overflow-hidden min-h-0">
                    <pre
                      ref={preRef}
                      className="absolute inset-0 p-4 m-0 border-none outline-none font-mono text-[11px] leading-[18px] tracking-wide pointer-events-none overflow-hidden select-none text-slate-800 bg-transparent box-border shadow-none oml-editor-pre"
                      dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                    <textarea
                      ref={textareaRef}
                      value={examJsonCode}
                      onChange={(e) => setExamJsonCode(e.target.value)}
                      onScroll={handleHorizontalScroll}
                      className="absolute inset-0 p-4 m-0 border-none outline-none resize-none leading-[18px] font-mono text-[11px] tracking-wide text-transparent caret-[#6C5DD3] focus:ring-0 focus:outline-none overflow-auto z-10 box-border shadow-none"
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>

              {/* Editor Footer Status */}
              <div className="h-11 border-t border-slate-50 px-4 flex items-center justify-between shrink-0 bg-white">
                {/* LEFT: Action Button */}
                {compileStatus === 'compiling' ? (
                  <button
                    disabled
                    className="px-3 py-1.5 bg-slate-100 text-slate-405 text-[10px] font-bold rounded-xl flex items-center gap-1.5 select-none"
                  >
                    <RefreshCw size={12} className="animate-spin text-slate-400" />
                    <span>Đang biên dịch...</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCheckCode}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-xl transition cursor-pointer font-sans shadow-sm text-center"
                  >
                    Kiểm tra mã
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
                      <div className="text-[8px] text-slate-404 font-bold -mt-0.5">Có thay đổi chưa được kiểm tra.</div>
                    </div>
                  </div>
                )}

                {compileStatus === 'compiling' && (
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-[10px] font-black text-slate-500 flex items-center gap-1 justify-end">
                        <RefreshCw size={10} className="animate-spin text-slate-404" />
                        Đang biên dịch...
                      </div>
                      <div className="text-[8px] text-slate-404 font-bold -mt-0.5">Đang xử lý dữ liệu OML...</div>
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
                      <div className="text-[8px] text-slate-404 font-bold -mt-0.5">Không phát hiện lỗi.</div>
                    </div>
                  </div>
                )}

                {compileStatus === 'error' && (
                  <button
                    onClick={() => setValidationDialog((prev: any) => ({ ...prev, isOpen: true }))}
                    className="flex items-center gap-2 text-right hover:opacity-90 active:scale-[0.98] transition cursor-pointer border-none bg-transparent p-0 outline-none"
                  >
                    <div>
                      <div className="text-[10px] font-black text-red-550 flex items-center gap-1 justify-end">
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
        {examSubView === 'edit' && creationMethod === 'bank' && (
          <QuestionBankWorkspace />
        )}

        {/* Soạn nhanh tab view */}
        {examSubView === 'edit' && creationMethod === 'ocr' && (
          <ExamQuickOcrStep
            quickStep={quickStep}
            setQuickStep={setQuickStep}
            isOcrLoading={isOcrLoading}
            setIsOcrLoading={setIsOcrLoading}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            examJsonCode={ocrTempCode}
            setExamJsonCode={setOcrTempCode}
            isJsonInvalid={isJsonInvalid}
            showLeftSidebar={showLeftSidebar}
            setShowLeftSidebar={setShowLeftSidebar}
            showLivePreview={showLivePreview}
            fileInputRef={fileInputRef}
            jsonFileInputRef={jsonFileInputRef}
            quickLineNumbersRef={quickLineNumbersRef}
            quickTextareaRef={quickTextareaRef}
            handleFileChange={handleFileChange}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleJsonUpload={handleOcrJsonUpload}
            handleQuickScroll={handleQuickScroll}
            renderExamPreviewColumn={renderExamPreviewColumn}
            onApplyOcrCode={handleApplyOcrCode}
          />
        )}

        {/* Cấu hình đề thi */}
        {examSubView === 'config' && (
          <ExamConfigPanel
            infoMeta={infoMeta}
            updateJsonField={updateJsonField}
            lastSavedTime={lastSavedTime}
            formatSavedTime={formatSavedTime}
            handlePublishExam={handlePublishExam}
            previewQuestions={previewQuestions}
            questionTypesCount={questionTypesCount}
            counts={counts}
          />
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
                    <div>Số câu hỏi: <span className="text-text-primary">{lastValidMetadata?.questionCount ?? 0} câu</span></div>
                    <div>Độ khó: <span className="text-text-primary font-black uppercase text-primary text-[8px] px-1.5 py-0.5 rounded bg-primary-light border border-primary/10">{infoMeta.difficulty === 'easy' ? 'Dễ' : infoMeta.difficulty === 'hard' ? 'Khó' : 'Trung bình'}</span></div>
                    <div>Điểm mỗi câu: <span className="text-text-primary font-mono">{lastValidMetadata?.questionCount ? (10 / lastValidMetadata.questionCount).toFixed(2) : '0.00'} đ</span></div>
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
                <div className="mt-2 inline-block rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-400">
                  Lưu lần cuối: <span className="font-bold text-slate-655">{formatFullSavedTime(pendingDraft.lastSaved)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={onDiscardRestore}
                className="w-full sm:flex-1 py-2.5 border border-slate-200 hover:bg-slate-55 text-slate-655 text-xs font-black rounded-xl transition cursor-pointer"
              >
                Tạo đề mới
              </button>
              <button
                onClick={onRestoreDraft}
                className="w-full sm:flex-1 py-2.5 bg-[#6C5DD3] hover:bg-[#5a4db8] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-indigo-150"
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
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-black rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={onConfirmNewExam}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-red-500/30 text-center flex items-center justify-center"
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
                  <div className="text-[11px] text-slate-550 font-bold space-y-1">
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
                      {validationDialog.errors?.map((err: any, idx: number) => (
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
