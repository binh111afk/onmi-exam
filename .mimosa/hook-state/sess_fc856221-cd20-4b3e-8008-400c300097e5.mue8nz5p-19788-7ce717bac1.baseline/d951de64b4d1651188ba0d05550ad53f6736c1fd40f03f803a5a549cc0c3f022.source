import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FileCheck2,
  Brain,
  ImageIcon,
  Table as TableIcon,
  Activity,
  HelpCircle,
  Award,
  Video,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { DocSidebar } from './DocSidebar';
import { DocToolbar } from './DocToolbar';
import { DocPreviewSimulator } from './DocPreviewSimulator';
import { Tooltip } from './Tooltip';
import { useAlert } from '../../common/Alert';
import type { Chapter, Lesson, DocSetupMetadata } from '../../../types/doc-editor';
import { FormattingStateProvider } from './FormattingStateProvider';
import { BlockSelectionProvider } from './BlockSelectionProvider';
import { useDocumentTree } from './useDocumentTree';

// Sprint 5 Additions
import { PublishModal } from './PublishModal';
import { DocGuideModal } from './DocGuideModal';
import { matchKeyboardShortcut } from './KeyboardShortcutManager';

// Refactored Modules
import { transformDbToClientState, transformChaptersToDb } from './adapters/docDbAdapter';
import { DocEditorHeader } from './DocEditorHeader';
import { useEditorHistory } from './hooks/useEditorHistory';
import { useEditorBlocks } from './hooks/useEditorBlocks';
import { useEditorSidebarActions } from './hooks/useEditorSidebarActions';
import { useEditorDragAndDrop } from './hooks/useEditorDragAndDrop';
import { DocEditorBlockList } from './DocEditorBlockList';

interface DocEditorWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  initialChaptersData?: Chapter[];
  initialActiveLessonId?: string;
  metadata?: DocSetupMetadata;
  onChangeMetadata?: (metadata: DocSetupMetadata) => void;
}

const initialChapters: Chapter[] = [];

const findFirstLessonId = (list: Chapter[]): string => {
  const findInLessons = (lessons: Lesson[]): string => {
    for (const lesson of lessons) {
      if (lesson.blocks.length > 0) return lesson.id;
      const childId = lesson.subLessons ? findInLessons(lesson.subLessons) : '';
      if (childId) return childId;
    }
    return '';
  };

  for (const chapter of list) {
    const lessonId = findInLessons(chapter.lessons);
    if (lessonId) return lessonId;
  }

  return '';
};


export const DocEditorWorkspace: React.FC<DocEditorWorkspaceProps> = ({ 
  setMode,
  initialChaptersData,
  initialActiveLessonId,
  metadata,
  onChangeMetadata
}) => {
  const { showAlert } = useAlert();
  const [showPreview, setShowPreview] = useState(true);
  const documentTree = useDocumentTree(initialChaptersData || initialChapters);
  
  // Derive a unique and stable documentId from metadata
  const documentId = useMemo(() => {
    if (!metadata?.name) return 'temp_doc';
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .trim();
    return `${slugify(metadata.name)}_${slugify(metadata.subject)}_${slugify(metadata.grade)}`;
  }, [metadata]);

  const lastSavedChaptersRef = useRef<Chapter[]>(initialChaptersData || initialChapters);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any | null>(null);

  const {
    chapters,
    setChapters,
    findLessonById,
    toggleExpand,
    expandedNodeIds,
  } = documentTree;

  // Sync isDirty state by comparing current chapters with the last saved state
  useEffect(() => {
    const isDiff = JSON.stringify(chapters) !== JSON.stringify(lastSavedChaptersRef.current);
    setIsDirty(isDiff);
  }, [chapters]);

  // Prompt user before leaving if there are unsaved changes (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn rời khỏi trang? Những thay đổi chưa lưu sẽ bị mất.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Debounced auto-save effect to localStorage
  useEffect(() => {
    if (!isDirty) return;

    const handler = setTimeout(() => {
      const { dbChapters, dbLessons, dbBlocks } = transformChaptersToDb(chapters, documentId);

      const draftPayload = {
        documentId,
        metadata,
        chapters: dbChapters,
        lessons: dbLessons,
        blocks: dbBlocks,
        lastSaved: new Date().toISOString(),
      };

      try {
        localStorage.setItem(`omni_doc_draft_${documentId}`, JSON.stringify(draftPayload));
        // Save active draft info so dashboard / parent component can restore or bypass setup
        localStorage.setItem('omni_doc_active_draft', JSON.stringify({
          documentId,
          metadata,
          lastSaved: draftPayload.lastSaved,
        }));
      } catch (err) {
        console.error('Failed to autosave draft:', err);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(handler);
  }, [chapters, isDirty, documentId, metadata]);

  // Load draft from localStorage on mount/load
  useEffect(() => {
    const draftKey = `omni_doc_draft_${documentId}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft && draft.chapters) {
          const restored = transformDbToClientState(draft.chapters, draft.lessons, draft.blocks);
          const original = initialChaptersData || initialChapters;
          // Only prompt if the draft differs from the original initial data
          if (JSON.stringify(restored) !== JSON.stringify(original)) {
            setPendingDraft({
              ...draft,
              restoredChapters: restored
            });
            setShowRestoreDialog(true);
          }
        }
      } catch (err) {
        console.error('Failed to load document draft:', err);
      }
    }
  }, [documentId, initialChaptersData]);

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

  const handleRestoreDraft = () => {
    if (pendingDraft && pendingDraft.restoredChapters) {
      setChapters(pendingDraft.restoredChapters);

      // Re-initialize history with restored draft chapters
      resetHistory(pendingDraft.restoredChapters);

      // Set active lesson to first valid lesson
      const firstLessonId = findFirstLessonId(pendingDraft.restoredChapters);
      if (firstLessonId) {
        setActiveLessonId(firstLessonId);
      }

      // Mark as dirty and update lastSavedTime if available
      setIsDirty(true);
      lastSavedChaptersRef.current = initialChaptersData || initialChapters;
      if (pendingDraft.lastSaved) {
        const date = new Date(pendingDraft.lastSaved);
        const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        setLastSavedTime(formattedTime);
      }
    }
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const handleDiscardRestore = () => {
    const draftKey = `omni_doc_draft_${documentId}`;
    localStorage.removeItem(draftKey);
    localStorage.removeItem('omni_doc_active_draft');
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const handleNext = () => {
    const { dbChapters, dbLessons, dbBlocks } = transformChaptersToDb(chapters, documentId);
    const draftPayload = {
      documentId,
      metadata,
      chapters: dbChapters,
      lessons: dbLessons,
      blocks: dbBlocks,
      lastSaved: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`omni_doc_draft_${documentId}`, JSON.stringify(draftPayload));
      localStorage.setItem('omni_doc_active_draft', JSON.stringify({
        documentId,
        metadata,
        lastSaved: draftPayload.lastSaved,
      }));
    } catch (err) {
      console.error('Failed to save draft on Next click:', err);
    }

    setShowPublishModal(true);
  };
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    return initialActiveLessonId || initialChaptersData?.[0]?.lessons?.[0]?.id || '';
  });

  const activeLesson = useMemo(() => findLessonById(activeLessonId), [activeLessonId, findLessonById]);
  const canEditActiveLesson = Boolean(activeLesson && !activeLesson.isFolder);
  const currentBlocks = useMemo(() => canEditActiveLesson && activeLesson ? activeLesson.blocks : [], [activeLesson, canEditActiveLesson]);

  const patchLessonFn = useCallback(
    (lessonMapper: (lesson: Lesson) => Lesson) => (lesson: Lesson): Lesson => {
      const mapped = lesson.id === activeLessonId ? lessonMapper(lesson) : lesson;
      return mapped.subLessons?.length
        ? { ...mapped, subLessons: mapped.subLessons.map(patchLessonFn(lessonMapper)) }
        : mapped;
    },
    [activeLessonId]
  );

  const findLessonByIdHistory = useCallback((lessonId: string, chaptersList?: Chapter[]) => {
    return findLessonById(lessonId, chaptersList) ?? undefined;
  }, [findLessonById]);

  // 1. History Hook
  const {
    history,
    historyIndex,
    pushHistoryState,
    handleUndo,
    handleRedo,
    resetHistory,
  } = useEditorHistory({
    chapters,
    setChapters,
    activeLessonId,
    findLessonById: findLessonByIdHistory,
    initialChaptersData: initialChaptersData || initialChapters,
  });

  // 2. Blocks Hook
  const blocksState = useEditorBlocks({
    chapters,
    setChapters,
    activeLessonId,
    currentBlocks,
    patchLessonFn,
    pushHistoryState,
  });

  const {
    activeBlockId,
    setActiveBlockId,
    selectedBlockIds,
    setSelectedBlockIds,
    editorMode,
    setEditorMode,
    liveTableResize,
    setLiveTableResize,
    liveTableActiveCell,
    setLiveTableActiveCell,
    showTableModal,
    setShowTableModal,
    showOtherBlocksPopup,
    setShowOtherBlocksPopup,
    setTableInsertIndex,
    setTableInsertMode,
    showSlashMenu,
    setShowSlashMenu,
    slashMenuIndex,
    setSlashMenuIndex,
    slashMenuCoords,
    setSlashMenuCoords,
    activeBlockIndex,
    setActiveBlockIndex,
    activeBlock,
    tableCellAlignRef,
    syncFormattingRef,
    syncBlockCommandState,
    updateBlockText,
    executeFormat,
    handleColorChange,
    handleHighlightChange,
    applyFontSize,
    createTableWithDimensions,
    toggleBlockType,
    applyBlockAlignment,
    toggleBlockAlign,
    indentBlock,
    outdentBlock,
    toggleTodoChecked,
    deleteBlock,
    handleDeleteBlockWithConfirm,
    insertBlockBelow,
    deleteBlocks,
    duplicateBlocks,
    pasteBlocks,
    duplicateBlock,
    convertBlockType,
    handleUpdateBlock,
    moveBlocks,
    handleBackspaceAtStart,
    handleDeleteAtEnd,
    filteredCommands,
    handleSelectSlashCommand,
    insertBlockAbove,
    handleSelectOtherBlock,
    handleSideToolClick,
    focusBlock,
    handleBodyDrop,
  } = blocksState;

  // 3. Selection / Directory States
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(() => {
    return initialChaptersData?.[0]?.id ?? initialChapters[0]?.id ?? null;
  });
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItems, setNewItems] = useState<string[]>([]);

  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [selectionMenuCoords, setSelectionMenuCoords] = useState({ x: 0, y: 0 });

  const handleScrollWrapperClick = useCallback((e: React.MouseEvent) => {
    setShowSlashMenu(false);
    if (e.target === e.currentTarget) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
        (activeEl as HTMLElement).blur();
      }
      window.getSelection()?.removeAllRanges();
      setEditorMode('block');
      if (activeBlockId) {
        setSelectedBlockIds([activeBlockId]);
      } else {
        setSelectedBlockIds([]);
      }
    }
  }, [activeBlockId, setEditorMode, setSelectedBlockIds, setShowSlashMenu]);

  // 4. Sidebar Actions Hook
  const {
    handleCreateChapter,
    handleDeleteChapter,
    handleCreateLesson,
    handleCreateSubLesson,
    handleCreateDocumentInFolder,
    handleDeleteSubLesson,
    handleDeleteLesson,
    handleSaveEdit,
    handleCancelEdit,
    handleMoveLesson,
    handleChapterReorder,
    handleDepthExceeded,
  } = useEditorSidebarActions({
    documentTree,
    activeLessonId,
    setActiveLessonId,
    pushHistoryState,
    setChapters,
    newItems,
    setNewItems,
    setEditingItemId,
    setActiveBlockIndex,
  });

  // 5. Drag and Drop Hook
  const {
    draggingIndex,
    dragPointerCoords,
    dragIndicatorTop,
    dragIndicatorVisible,
    handleBlockDragStart,
  } = useEditorDragAndDrop({
    chapters,
    setChapters,
    patchLessonFn,
    pushHistoryState,
    setActiveBlockIndex,
    focusBlock,
  });

  // Automatically expand parent folders/chapters of the active lesson
  useEffect(() => {
    if (!activeLessonId || !documentTree.nodesMap) return;

    const parentsToExpand: Record<string, boolean> = {};
    let currentId = activeLessonId;
    let node = documentTree.nodesMap[currentId];

    while (node && node.parent) {
      parentsToExpand[node.parent] = true;
      node = documentTree.nodesMap[node.parent];
    }

    if (Object.keys(parentsToExpand).length > 0) {
      documentTree.setExpandedNodeIds((prev) => {
        const needsUpdate = Object.keys(parentsToExpand).some((id) => !prev[id]);
        if (!needsUpdate) return prev;
        return {
          ...prev,
          ...parentsToExpand,
        };
      });
    }
  }, [activeLessonId, documentTree.nodesMap, documentTree.setExpandedNodeIds]);

  const handleLessonSelect = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveBlockIndex(0);
    resetHistory(chapters);
  }, [chapters, resetHistory, setActiveBlockIndex]);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    if (!canEditActiveLesson) {
      setActiveBlockId(null);
      setSelectedBlockIds([]);
      setEditorMode('block');
      setShowSlashMenu(false);
      // setShowSelectionMenu(false); // Deprecated
      setShowOtherBlocksPopup(false);
      setShowTableModal(false);
      setTableInsertIndex(null);
      setTableInsertMode(null);
    }
  }, [canEditActiveLesson]);

  // Track last saved chapters on initial load
  useEffect(() => {
    lastSavedChaptersRef.current = initialChaptersData || initialChapters;
  }, [initialChaptersData]);

  // Set coordinates for Slash Command menu popover
  useEffect(() => {
    if (showSlashMenu) {
      const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        const scrollParent = activeEl.closest('.overflow-y-auto') as HTMLElement;
        if (scrollParent) {
          const parentRect = scrollParent.getBoundingClientRect();
          const top = (rect.bottom - parentRect.top) + scrollParent.scrollTop + 6;
          const left = (rect.left - parentRect.left) + scrollParent.scrollLeft;
          setSlashMenuCoords({ top, left });
        }
      }
    }
  }, [showSlashMenu, activeBlockIndex]);

  // Clear liveTableActiveCell if active block is not a table
  useEffect(() => {
    if (!activeBlock || activeBlock.type !== 'table') {
      setLiveTableActiveCell(null);
    }
  }, [activeBlock]);



  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    // Guard: if the event originates from an INPUT or TEXTAREA, let it pass through
    // completely unmodified. Those elements (e.g. EditableText) stop propagation
    // themselves, but a second line of defence here avoids any race conditions.
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    // Guard: never intercept during IME composition (Vietnamese, CJK, etc.)
    if (e.nativeEvent.isComposing) return;

    // 1. Check combinations using matchKeyboardShortcut
    const shortcut = matchKeyboardShortcut(e);
    if (shortcut) {
      e.preventDefault();
      switch (shortcut) {
        case 'bold':
          executeFormat('bold');
          break;
        case 'italic':
          executeFormat('italic');
          break;
        case 'underline':
          executeFormat('underline');
          break;
        case 'ordered-list':
          toggleBlockType('numbered-list');
          break;
        case 'bullet-list':
          toggleBlockType('bullet-list');
          break;
        case 'heading-1':
          toggleBlockType('heading', 1);
          break;
        case 'heading-2':
          toggleBlockType('heading', 2);
          break;
        case 'heading-3':
          toggleBlockType('heading', 3);
          break;
        case 'undo':
          handleUndo(syncBlockCommandState);
          break;
        case 'redo':
          handleRedo(syncBlockCommandState);
          break;
        case 'duplicate':
          duplicateBlock(index);
          break;
      }
      return;
    }

    // 2. Intercept Slash Menu keys
    if (showSlashMenu && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashMenuIndex(prev => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashMenuIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectSlashCommand(filteredCommands[slashMenuIndex].type);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
        return;
      }
    }

    // 3. Handle Enter (insert block below)
    if (e.key === 'Enter') {
      e.preventDefault();
      insertBlockBelow(index);
      return;
    }

    // 4. Handle Backspace — only intercept at cursor offset 0 for contentEditable blocks
    // INPUT/TEXTAREA elements stop propagation themselves via EditableText
    if (e.key === 'Backspace') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const selection = window.getSelection();
      const cursorOffset = selection?.focusOffset ?? 0;
      if (cursorOffset === 0) {
        // Block is non-empty at start: merge with previous (normal editor behaviour)
        e.preventDefault();
        handleBackspaceAtStart(index);
        return;
      }
    }

    // 5. Handle Delete key — only intercept for contentEditable blocks
    if (e.key === 'Delete') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isAtEnd = range.collapsed &&
          (range.startContainer === e.currentTarget ||
            (range.startContainer.nodeType === Node.TEXT_NODE &&
              range.startOffset === range.startContainer.textContent?.length)
          );
        if (isAtEnd) {
          e.preventDefault();
          handleDeleteAtEnd(index);
          return;
        }
      }
    }

    // 6. Handle Tab for Indent/Outdent
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        outdentBlock(index);
      } else {
        indentBlock(index);
      }
      return;
    }
  }, [
    showSlashMenu,
    filteredCommands,
    slashMenuIndex,
    currentBlocks,
    activeLessonId,
    executeFormat,
    toggleBlockType,
    handleUndo,
    handleRedo,
    duplicateBlock,
    handleSelectSlashCommand,
    deleteBlock,
    handleBackspaceAtStart,
    handleDeleteAtEnd,
    insertBlockBelow,
    indentBlock,
    outdentBlock,
    pushHistoryState
  ]);

  const handlePublish = async () => {
    // Clear drafts from localStorage
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .trim();

    const initialDocId = `${slugify('Tài liệu chưa đặt tên')}_${slugify('')}_${slugify('')}`;
    localStorage.removeItem(`omni_doc_draft_${initialDocId}`);

    if (metadata) {
      const finalDocId = `${slugify(metadata.name)}_${slugify(metadata.subject)}_${slugify(metadata.grade)}`;
      localStorage.removeItem(`omni_doc_draft_${finalDocId}`);
    }

    localStorage.removeItem(`omni_doc_draft_${documentId}`);
    localStorage.removeItem('omni_doc_active_draft');
    
    setIsDirty(false);

    await showAlert({
      type: 'success',
      title: 'Thành công',
      description: 'Đăng tải tài liệu thành công!'
    });
    setMode('dashboard');
  };

  const handlePasteSelection = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand('insertHTML', false, text);
    } catch {
      // Fallback
    }
  }, []);

  const handleAiSuggest = useCallback(() => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            const updated = [...lesson.blocks];
            if (activeLessonId === 'water') {
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
            return { ...lesson, blocks: updated };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeLessonId, pushHistoryState]);

  // Explorer handlers - toggleExpand is now handled directly by onToggleNodeExpand



  const handleSave = async () => {
    lastSavedChaptersRef.current = chapters;
    setIsDirty(false);

    const draftKey = `omni_doc_draft_${documentId}`;
    localStorage.removeItem(draftKey);
    localStorage.removeItem('omni_doc_active_draft');

    const now = new Date();
    const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLastSavedTime(formattedTime);

    await showAlert({
      type: 'success',
      title: 'Thành công',
      description: 'Đã lưu nháp tài liệu thành công!'
    });
  };

  return (
    <BlockSelectionProvider
      blocks={currentBlocks}
      activeBlockId={activeBlockId}
      setActiveBlockId={setActiveBlockId}
      selectedBlockIds={selectedBlockIds}
      setSelectedBlockIds={setSelectedBlockIds}
      editorMode={editorMode}
      setEditorMode={setEditorMode}
      onDeleteBlocks={deleteBlocks}
      onDuplicateBlocks={duplicateBlocks}
      onPasteBlocks={pasteBlocks}
    >
      <FormattingStateProvider activeBlock={activeBlock} syncRef={syncFormattingRef}>
        <div className="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-[#F8FAFC] text-text-primary font-sans animate-fadeIn">

          {/* ========================================== */}
          {/* TOP BAR                                    */}
          {/* ========================================== */}
          <DocEditorHeader
            setMode={setMode}
            isDirty={isDirty}
            lastSavedTime={lastSavedTime}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            onOpenGuide={() => setIsGuideOpen(true)}
            onSave={handleSave}
            onNext={handleNext}
          />

          {/* ========================================== */}
          {/* MAIN BODY LAYOUT (Left, Center, Right)    */}
          {/* ========================================== */}
          <div className="flex-1 flex overflow-hidden w-full">

            {/* 1. LEFT SIDEBAR */}
            <DocSidebar
              chapters={chapters}
              activeLessonId={activeLessonId}
              onLessonSelect={handleLessonSelect}
              expandedNodeIds={expandedNodeIds}
              onToggleNodeExpand={toggleExpand}
              selectedChapterId={selectedChapterId}
              onSelectChapter={setSelectedChapterId}
              selectedLessonId={selectedLessonId}
              onSelectLesson={setSelectedLessonId}
              editingItemId={editingItemId}
              onStartEditing={setEditingItemId}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onCreateChapter={handleCreateChapter}
              onCreateLesson={handleCreateLesson}
              onCreateSubLesson={handleCreateSubLesson}
              onCreateDocumentInFolder={handleCreateDocumentInFolder}
              onDeleteChapter={handleDeleteChapter}
              onDeleteLesson={handleDeleteLesson}
              onDeleteSubLesson={handleDeleteSubLesson}
              onMoveLesson={handleMoveLesson}
              onChapterReorder={handleChapterReorder}
              onDepthExceeded={handleDepthExceeded}
              metadata={metadata}
            />

            {/* 2. CENTER PANEL: Rich Editor Workspace */}
            <main className="flex-1 bg-white border-r border-slate-100 flex flex-col overflow-hidden">

              {/* Rich Editor Toolbar */}
              {canEditActiveLesson && (
                <DocToolbar
                  onAiSuggest={handleAiSuggest}
                  onBold={() => executeFormat('bold')}
                  onItalic={() => executeFormat('italic')}
                  onUnderline={() => executeFormat('underline')}
                  onStrikethrough={() => executeFormat('strikeThrough')}
                  onColorChange={handleColorChange}
                  onHighlightChange={handleHighlightChange}
                  onBlockTypeChange={toggleBlockType}
                  onAlignChange={toggleBlockAlign}
                  onIndent={() => indentBlock()}
                  onOutdent={() => outdentBlock()}
                  onUndo={() => handleUndo(syncBlockCommandState)}
                  onRedo={() => handleRedo(syncBlockCommandState)}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                  onFontSizeChange={applyFontSize}
                />
              )}

              {canEditActiveLesson ? (
                <>
                  {/* Editable Block Content List */}
                  <DocEditorBlockList
                    currentBlocks={currentBlocks}
                    activeBlockIndex={activeBlockIndex}
                    setActiveBlockIndex={setActiveBlockIndex}
                    updateBlockText={updateBlockText}
                    handleKeyDown={handleKeyDown}
                    toggleTodoChecked={toggleTodoChecked}
                    handleDeleteBlockWithConfirm={handleDeleteBlockWithConfirm}
                    deleteBlocks={deleteBlocks}
                    duplicateBlocks={duplicateBlocks}
                    convertBlockType={convertBlockType}
                    handleUpdateBlock={handleUpdateBlock}
                    insertBlockAbove={insertBlockAbove}
                    insertBlockBelow={insertBlockBelow}
                    handleBlockDragStart={handleBlockDragStart}
                    moveBlocks={moveBlocks}
                    tableCellAlignRef={tableCellAlignRef}
                    liveTableResize={liveTableResize}
                    setLiveTableResize={setLiveTableResize}
                    liveTableActiveCell={liveTableActiveCell}
                    setLiveTableActiveCell={setLiveTableActiveCell}
                    applyBlockAlignment={applyBlockAlignment}
                    dragIndicatorTop={dragIndicatorTop}
                    dragIndicatorVisible={dragIndicatorVisible}
                    draggingIndex={draggingIndex}
                    dragPointerCoords={dragPointerCoords}
                    showSlashMenu={showSlashMenu}
                    setShowSlashMenu={setShowSlashMenu}
                    filteredCommands={filteredCommands}
                    slashMenuIndex={slashMenuIndex}
                    slashMenuCoords={slashMenuCoords}
                    handleSelectSlashCommand={handleSelectSlashCommand}
                    showSelectionMenu={showSelectionMenu}
                    setShowSelectionMenu={setShowSelectionMenu}
                    selectionMenuCoords={selectionMenuCoords}
                    setSelectionMenuCoords={setSelectionMenuCoords}
                    handlePasteSelection={handlePasteSelection}
                    executeFormat={executeFormat}
                    showTableModal={showTableModal}
                    setShowTableModal={setShowTableModal}
                    setTableInsertIndex={setTableInsertIndex}
                    setTableInsertMode={setTableInsertMode}
                    createTableWithDimensions={createTableWithDimensions}
                    showOtherBlocksPopup={showOtherBlocksPopup}
                    setShowOtherBlocksPopup={setShowOtherBlocksPopup}
                    handleSelectOtherBlock={handleSelectOtherBlock}
                    handleScrollWrapperClick={handleScrollWrapperClick}
                    handleBodyDrop={handleBodyDrop}
                  />

                  <div className="h-8 border-t border-slate-50 px-6 flex items-center text-[10px] text-slate-400 font-bold select-none bg-white">
                    Nhấn Enter để thêm dòng mới, Tab để thụt lề, Backspace để xóa/gộp dòng, "/" để mở menu block
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white text-[11px] font-bold text-text-muted select-none">
                  Chọn một file để soạn thảo nội dung
                </div>
              )}

              <PublishModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                activeLesson={activeLesson}
                onPublishConfirm={handlePublish}
                metadata={metadata}
                onChangeMetadata={onChangeMetadata}
              />

              <DocGuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
              />
            </main>

            {/* 3. RIGHT SIDEBAR: Live Student Preview Simulator */}
            {showPreview && (
              <DocPreviewSimulator
                documentTree={chapters}
                currentDocumentId={activeLessonId}
                documentTitle={metadata ? `${metadata.subject} ${metadata.grade.replace(/Lop\s+/i, '').replace(/L\u1edbp\s+/i, '')}` : ''}
                liveTableResize={liveTableResize}
              />
            )}

            {/* 4. FAR-RIGHT NARROW TOOLBAR */}
            {canEditActiveLesson && (
              <aside className="w-16 bg-white border-l border-slate-100 flex flex-col items-center py-4 justify-between shrink-0 select-none overflow-y-auto">
                <div className="w-full space-y-4 flex flex-col items-center">
                  {[
                    { icon: <FileCheck2 size={16} />, label: 'Block' },
                    { icon: <Brain size={16} />, label: 'AI' },
                    { icon: <ImageIcon size={16} />, label: 'Ảnh' },
                    { icon: <TableIcon size={16} />, label: 'Bảng' },
                    { icon: <Activity size={16} />, label: 'Công thức' },
                    { icon: <HelpCircle size={16} />, label: 'Quiz' },
                    { icon: <Award size={16} />, label: 'Flashcard' },
                    { icon: <Video size={16} />, label: 'Media' },
                    { icon: <Code2 size={16} />, label: 'Code' },
                    { icon: <HelpCircle size={16} />, label: 'Khác' },
                  ].map((tool, i) => (
                    <Tooltip key={i} content={tool.label}>
                      <button
                        onClick={() => handleSideToolClick(tool.label)}
                        className="w-12 h-12 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition cursor-pointer select-none"
                      >
                        {tool.icon}
                        <span className="text-[7px] font-bold mt-1 text-slate-500">{tool.label}</span>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </aside>
            )}

            {/* ── RESTORE DRAFT DIALOG ── */}
            {showRestoreDialog && pendingDraft && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity duration-300" onClick={handleRestoreDraft} />
                <div className="bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100 animate-scaleUp text-center space-y-5 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mx-auto shadow-sm">
                    <RefreshCw size={22} className="text-primary animate-spin" />
                  </div>

                  <div className="space-y-2 leading-relaxed">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Khôi phục bản nháp?</h3>
                    <p className="text-[11px] text-slate-500 font-bold">
                      Phát hiện bản nháp chưa được lưu từ phiên trước. Bạn có muốn khôi phục không?
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
                      Bỏ qua
                    </button>
                    <button
                      onClick={handleRestoreDraft}
                      className="w-full sm:flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-indigo-150"
                    >
                      Khôi phục
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>



        </div>
      </FormattingStateProvider>
    </BlockSelectionProvider>
  );
};




