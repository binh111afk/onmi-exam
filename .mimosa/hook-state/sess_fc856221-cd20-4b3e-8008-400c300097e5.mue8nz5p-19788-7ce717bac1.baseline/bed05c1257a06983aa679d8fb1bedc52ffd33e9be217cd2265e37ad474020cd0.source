import React, { useState, useCallback } from 'react';
import { useAlert } from '../../../common/Alert';
import { createDefaultBlock, generateBlockId } from '../blocks/BlockFactory';
import { uploadImageFile } from '../../../../services/imageUploadService';
import type { Chapter, Lesson, DocBlock } from '../../../../types/doc-editor';

export const useEditorBlockMutations = ({
  chapters,
  setChapters,
  activeLessonId,
  currentBlocks,
  patchLessonFn,
  pushHistoryState,
  activeBlockId,
  selectedBlockIds,
  editorMode,
  activeBlockIndex,
  setActiveBlockIndex,
  activeBlock,
  focusBlock,
  syncBlockCommandState,
  updateBlockText,
  tableCellAlignRef,
  syncFormattingRef,
  setTableInsertIndex,
  setTableInsertMode,
  setShowTableModal,
}: {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  activeLessonId: string;
  currentBlocks: DocBlock[];
  patchLessonFn: (lessonMapper: (lesson: Lesson) => Lesson) => (lesson: Lesson) => Lesson;
  pushHistoryState: (newChapters: Chapter[], isDebounced?: boolean, activeIndexOverride?: number) => void;
  activeBlockId: string | null;
  selectedBlockIds: string[];
  editorMode: 'block' | 'text';
  activeBlockIndex: number;
  setActiveBlockIndex: (index: number | ((prev: number) => number)) => void;
  activeBlock: DocBlock;
  focusBlock: (index: number) => void;
  syncBlockCommandState: (nextActiveId: string | null, nextSelectedIds?: string[]) => void;
  updateBlockText: (index: number, newHtml: string) => void;
  tableCellAlignRef: React.MutableRefObject<((align: 'left' | 'center' | 'right' | 'justify') => void) | null>;
  syncFormattingRef: React.MutableRefObject<(() => void) | null>;
  setTableInsertIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setTableInsertMode: React.Dispatch<React.SetStateAction<'replace' | 'insert' | null>>;
  setShowTableModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { showConfirm } = useAlert();
  const [showOtherBlocksPopup, setShowOtherBlocksPopup] = useState(false);

  const toggleBlockType = useCallback((type: DocBlock['type'], level?: 1 | 2 | 3) => {
    if (type === 'table') {
      setTableInsertIndex(activeBlockIndex);
      setTableInsertMode('replace');
      setShowTableModal(true);
      return;
    }
    const targetBlockIds = editorMode === 'block' && selectedBlockIds.length > 0
      ? selectedBlockIds
      : [currentBlocks[activeBlockIndex]?.id].filter((id): id is string => Boolean(id));
    const shouldResetType = targetBlockIds.length > 0 && targetBlockIds.every(id => {
      const block = currentBlocks.find(item => item.id === id);
      return block?.type === type && (type !== 'heading' || block.level === level);
    });

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map(block => targetBlockIds.includes(block.id)
                ? { ...block, type: shouldResetType ? 'paragraph' : type, level: shouldResetType || type !== 'heading' ? undefined : level }
                : block)
            };
          }
          return lesson;
        }))
      }));
      pushHistoryState(nextChapters, false, activeBlockIndex);
      return nextChapters;
    });
    syncFormattingRef.current?.();
  }, [activeBlockIndex, activeLessonId, currentBlocks, editorMode, patchLessonFn, pushHistoryState, selectedBlockIds, setChapters, syncFormattingRef, setTableInsertIndex, setTableInsertMode, setShowTableModal]);

  const applyBlockAlignment = useCallback((blockIds: string[], align: DocBlock['align']) => {
    const validIds = currentBlocks
      .filter(block => blockIds.includes(block.id))
      .map(block => block.id);
    if (validIds.length === 0) return;

    const nextActiveId = activeBlockId && validIds.includes(activeBlockId)
      ? activeBlockId
      : validIds[0];
    const nextActiveIndex = currentBlocks.findIndex(block => block.id === nextActiveId);

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map(b =>
            validIds.includes(b.id) ? { ...b, align } : b
          )
        })))
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId, validIds);
  }, [activeBlockId, activeBlockIndex, currentBlocks, patchLessonFn, pushHistoryState, setChapters, syncBlockCommandState]);

  const toggleBlockAlign = useCallback((align: 'left' | 'center' | 'right' | 'justify') => {
    if (activeBlock.type === 'table' && tableCellAlignRef.current) {
      tableCellAlignRef.current(align);
      return;
    }

    if (editorMode === 'text') {
      const command = align === 'left' ? 'justifyLeft' :
        align === 'center' ? 'justifyCenter' :
          align === 'right' ? 'justifyRight' : 'justifyFull';
      document.execCommand(command, false, '');

      const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
      if (activeEl) {
        updateBlockText(activeBlockIndex, activeEl.innerHTML);
      }
      syncFormattingRef.current?.();
    } else {
      const targetIds = selectedBlockIds.length > 0
        ? selectedBlockIds
        : activeBlockId ? [activeBlockId] : [];
      applyBlockAlignment(targetIds, align);
    }
  }, [activeBlock.type, activeBlockId, activeBlockIndex, editorMode, selectedBlockIds, updateBlockText, applyBlockAlignment, tableCellAlignRef, syncFormattingRef]);

  const indentBlock = useCallback((index?: number) => {
    const targetIndex = index !== undefined ? index : activeBlockIndex;
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map((b, idx) =>
            idx === targetIndex ? { ...b, indent: Math.min(5, (b.indent || 0) + 1) } : b
          )
        })))
      }));
      pushHistoryState(nextChapters, false, targetIndex);
      return nextChapters;
    });
  }, [activeBlockIndex, patchLessonFn, pushHistoryState, setChapters]);

  const outdentBlock = useCallback((index?: number) => {
    const targetIndex = index !== undefined ? index : activeBlockIndex;
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map((b, idx) =>
            idx === targetIndex ? { ...b, indent: Math.max(0, (b.indent || 0) - 1) } : b
          )
        })))
      }));
      pushHistoryState(nextChapters, false, targetIndex);
      return nextChapters;
    });
  }, [activeBlockIndex, patchLessonFn, pushHistoryState, setChapters]);

  const toggleTodoChecked = useCallback((index: number) => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map((b, idx) =>
            idx === index ? { ...b, checked: !b.checked } : b
          )
        })))
      }));
      pushHistoryState(nextChapters, false, index);
      return nextChapters;
    });
  }, [patchLessonFn, pushHistoryState, setChapters]);

  const deleteBlock = useCallback((index: number) => {
    if (currentBlocks.length <= 1) return;
    setChapters(prev => {
      const nextPages = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.filter((_, idx) => idx !== index)
        })))
      }));
      const targetIdx = Math.max(0, index - 1);
      pushHistoryState(nextPages, false, targetIdx);
      setActiveBlockIndex(targetIdx);
      focusBlock(targetIdx);
      return nextPages;
    });
  }, [currentBlocks.length, patchLessonFn, pushHistoryState, setChapters, setActiveBlockIndex, focusBlock]);

  const handleDeleteBlockWithConfirm = useCallback(async (index: number) => {
    const ok = await showConfirm({
      type: 'danger',
      title: 'Xóa block',
      description: 'Bạn có chắc chắn muốn xóa block này không?'
    });
    if (ok) {
      deleteBlock(index);
    }
  }, [deleteBlock, showConfirm]);

  const insertBlockBelow = useCallback((index: number) => {
    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => {
        const newBlock = createDefaultBlock('paragraph', undefined, 'left', lesson.blocks[index]?.indent || 0);
        return {
          ...lesson,
          blocks: [...lesson.blocks.slice(0, index + 1), newBlock, ...lesson.blocks.slice(index + 1)],
        };
      })),
    }));
    pushHistoryState(nextChapters, false, index + 1);
    setChapters(nextChapters);
    setActiveBlockIndex(index + 1);
    focusBlock(index + 1);
  }, [chapters, patchLessonFn, pushHistoryState, setChapters, setActiveBlockIndex, focusBlock]);

  const deleteBlocks = useCallback((ids: string[]) => {
    const validIds = currentBlocks
      .filter(block => ids.includes(block.id))
      .map(block => block.id);
    if (validIds.length === 0) return;

    const firstDeletedIndex = currentBlocks.findIndex(block => block.id === validIds[0]);
    const remainingBlocks = currentBlocks.filter(block => !validIds.includes(block.id));
    const fallbackBlock = remainingBlocks.length === 0 ? createDefaultBlock('paragraph') : null;
    const finalBlocks = fallbackBlock ? [fallbackBlock] : remainingBlocks;
    const nextActiveIndex = Math.min(firstDeletedIndex, finalBlocks.length - 1);
    const nextActiveId = finalBlocks[nextActiveIndex]?.id ?? null;

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({ ...lesson, blocks: finalBlocks })))
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId);
  }, [currentBlocks, patchLessonFn, pushHistoryState, setChapters, syncBlockCommandState]);

  const duplicateBlocks = useCallback((ids: string[]) => {
    const validIds = currentBlocks
      .filter(block => ids.includes(block.id))
      .map(block => block.id);
    if (validIds.length === 0) return;

    const duplicateIds = new Map(validIds.map(id => [id, generateBlockId()]));
    const nextBlocks: DocBlock[] = [];
    currentBlocks.forEach(block => {
      nextBlocks.push(block);
      const duplicateId = duplicateIds.get(block.id);
      if (duplicateId) {
        nextBlocks.push({
          ...block,
          id: duplicateId,
        });
      }
    });

    const nextSelectedIds = validIds
      .map(id => duplicateIds.get(id))
      .filter((id): id is string => Boolean(id));
    const nextActiveId = activeBlockId && duplicateIds.has(activeBlockId)
      ? duplicateIds.get(activeBlockId) ?? nextSelectedIds[0]
      : nextSelectedIds[0];
    const nextActiveIndex = nextBlocks.findIndex(block => block.id === nextActiveId);

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({ ...lesson, blocks: nextBlocks })))
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId ?? null, nextSelectedIds);
  }, [activeBlockId, activeBlockIndex, currentBlocks, patchLessonFn, pushHistoryState, setChapters, syncBlockCommandState]);

  const pasteBlocks = useCallback((pasted: DocBlock[], targetBlockId: string | null) => {
    if (pasted.length === 0) return;
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => {
          const idx = targetBlockId ? lesson.blocks.findIndex(b => b.id === targetBlockId) : -1;
          const insertIdx = idx !== -1 ? idx + 1 : lesson.blocks.length;

          const freshBlocks = pasted.map(b => ({
            ...b,
            id: generateBlockId(),
          }));

          const updated = [
            ...lesson.blocks.slice(0, insertIdx),
            ...freshBlocks,
            ...lesson.blocks.slice(insertIdx)
          ];
          return { ...lesson, blocks: updated };
        }))
      }));
      pushHistoryState(nextChapters, false, activeBlockIndex);
      return nextChapters;
    });
  }, [activeBlockIndex, patchLessonFn, pushHistoryState, setChapters]);

  const duplicateBlock = useCallback((index: number) => {
    const currentBlock = currentBlocks[index];
    if (!currentBlock) return;
    const newBlock: DocBlock = {
      ...currentBlock,
      id: generateBlockId(),
    };
    setChapters(prev => {
      const nextPages = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: [
            ...lesson.blocks.slice(0, index + 1),
            newBlock,
            ...lesson.blocks.slice(index + 1)
          ]
        })))
      }));
      pushHistoryState(nextPages, false, index + 1);
      return nextPages;
    });
  }, [currentBlocks, patchLessonFn, pushHistoryState, setChapters]);

  const convertBlockType = useCallback((index: number, type: DocBlock['type'], level?: 1 | 2 | 3) => {
    if (type === 'mindmap') return;
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map((b, idx) => {
            if (idx === index) {
              return createDefaultBlock(type, b.id, b.align, b.indent, level, b.text);
            }
            return b;
          })
        })))
      }));
      pushHistoryState(nextChapters, false, index);
      return nextChapters;
    });
  }, [patchLessonFn, pushHistoryState, setChapters]);

  const handleUpdateBlock = useCallback((index: number, updatedBlock: DocBlock, isDebounced = false) => {
    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => ({
        ...lesson,
        blocks: lesson.blocks.map((block, blockIndex) =>
          blockIndex === index ? updatedBlock : block
        ),
      })))
    }));
    pushHistoryState(nextChapters, isDebounced, index);
    setChapters(nextChapters);
  }, [chapters, patchLessonFn, pushHistoryState, setChapters]);

  const moveBlocks = useCallback((ids: string[], direction: 'up' | 'down') => {
    const validIds = currentBlocks
      .filter(block => ids.includes(block.id))
      .map(block => block.id);
    if (validIds.length === 0) return;

    const selected = new Set(validIds);
    const selectedIndexes = currentBlocks
      .map((block, index) => selected.has(block.id) ? index : -1)
      .filter(index => index !== -1);
    if (selectedIndexes.length === 0) return;

    const firstIndex = Math.min(...selectedIndexes);
    const lastIndex = Math.max(...selectedIndexes);
    if ((direction === 'up' && firstIndex === 0) || (direction === 'down' && lastIndex === currentBlocks.length - 1)) {
      return;
    }

    const selectedBlocks = currentBlocks.filter(block => selected.has(block.id));
    const remainingBlocks = currentBlocks.filter(block => !selected.has(block.id));
    const adjacentId = direction === 'up'
      ? currentBlocks[firstIndex - 1]?.id
      : currentBlocks[lastIndex + 1]?.id;
    const adjacentIndex = remainingBlocks.findIndex(block => block.id === adjacentId);
    const insertIndex = direction === 'up' ? adjacentIndex : adjacentIndex + 1;
    const nextBlocks = [
      ...remainingBlocks.slice(0, insertIndex),
      ...selectedBlocks,
      ...remainingBlocks.slice(insertIndex)
    ];

    const nextActiveId = activeBlockId && selected.has(activeBlockId) ? activeBlockId : validIds[0];
    const nextActiveIndex = nextBlocks.findIndex(block => block.id === nextActiveId);

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({ ...lesson, blocks: nextBlocks })))
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId, validIds);
    focusBlock(nextActiveIndex);
  }, [activeBlockId, activeBlockIndex, currentBlocks, patchLessonFn, pushHistoryState, setChapters, syncBlockCommandState, focusBlock]);

  const handleBackspaceAtStart = useCallback((index: number) => {
    setChapters(prev => {
      let nextPages = prev;
      for (const ch of prev) {
        const lesson = ch.lessons.find(l => l.id === activeLessonId);
        if (lesson) {
          const block = lesson.blocks[index];
          if (!block) return prev;

          if (block.indent && block.indent > 0) {
            nextPages = prev.map(c => ({
              ...c,
              lessons: c.lessons.map(l => {
                if (l.id === activeLessonId) {
                  return {
                    ...l,
                    blocks: l.blocks.map((b, idx) =>
                      idx === index ? { ...b, indent: Math.max(0, (b.indent || 0) - 1) } : b
                    )
                  };
                }
                return l;
              })
            }));
            pushHistoryState(nextPages, false, index);
            break;
          }

          if (block.type !== 'paragraph') {
            nextPages = prev.map(c => ({
              ...c,
              lessons: c.lessons.map(l => {
                if (l.id === activeLessonId) {
                  return {
                    ...l,
                    blocks: l.blocks.map((b, idx) =>
                      idx === index ? { ...b, type: 'paragraph' as const, level: undefined } : b
                    )
                  };
                }
                return l;
              })
            }));
            pushHistoryState(nextPages, false, index);
            break;
          }

          if (index > 0) {
            const prevBlock = lesson.blocks[index - 1];
            nextPages = prev.map(c => ({
              ...c,
              lessons: c.lessons.map(l => {
                if (l.id === activeLessonId) {
                  const updatedBlocks = l.blocks.filter((_, idx) => idx !== index);
                  updatedBlocks[index - 1] = {
                    ...prevBlock,
                    text: prevBlock.text + block.text
                  };
                  return { ...l, blocks: updatedBlocks };
                }
                return l;
              })
            }));
            pushHistoryState(nextPages, false, index - 1);
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
            break;
          }
        }
      }
      return nextPages;
    });
  }, [activeLessonId, pushHistoryState, setChapters, setActiveBlockIndex]);

  const handleDeleteAtEnd = useCallback((index: number) => {
    setChapters(prev => {
      const chs = prev.map(ch => {
        const lesson = ch.lessons.find(l => l.id === activeLessonId);
        if (lesson) {
          if (index < lesson.blocks.length - 1) {
            const currentBlock = lesson.blocks[index];
            const nextBlock = lesson.blocks[index + 1];
            const updatedBlocks = lesson.blocks.filter((_, idx) => idx !== index + 1);
            updatedBlocks[index] = {
              ...currentBlock,
              text: currentBlock.text + nextBlock.text
            };
            return { ...ch, lessons: ch.lessons.map(l => l.id === activeLessonId ? { ...l, blocks: updatedBlocks } : l) };
          }
        }
        return ch;
      });
      pushHistoryState(chs, false, index);
      return chs;
    });
  }, [activeLessonId, pushHistoryState, setChapters]);

  const insertBlockAbove = useCallback((index: number) => {
    setChapters(prev => {
      let nextPages = prev;
      for (const ch of prev) {
        const lesson = ch.lessons.find(l => l.id === activeLessonId);
        if (lesson) {
          const newBlock = createDefaultBlock('paragraph', undefined, 'left', lesson.blocks[index]?.indent || 0);
          nextPages = prev.map(c => ({
            ...c,
            lessons: c.lessons.map(l => {
              if (l.id === activeLessonId) {
                return {
                  ...l,
                  blocks: [
                    ...l.blocks.slice(0, index),
                    newBlock,
                    ...l.blocks.slice(index)
                  ]
                };
              }
              return l;
            })
          }));
          break;
        }
      }
      pushHistoryState(nextPages, false, index);
      setActiveBlockIndex(index);
      focusBlock(index);
      return nextPages;
    });
  }, [activeLessonId, pushHistoryState, setChapters, setActiveBlockIndex, focusBlock]);

  const handleSelectOtherBlock = useCallback((type: 'timeline' | 'flow' | 'tabs' | 'compare' | 'diagram' | 'matching' | 'fillblank' | 'dragdrop' | 'sortorder') => {
    setShowOtherBlocksPopup(false);
    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => {
        const newBlock = createDefaultBlock(type);
        return { ...lesson, blocks: [...lesson.blocks.slice(0, activeBlockIndex + 1), newBlock, ...lesson.blocks.slice(activeBlockIndex + 1)] };
      })),
    }));
    pushHistoryState(nextChapters, false, activeBlockIndex + 1);
    setChapters(nextChapters);
  }, [activeBlockIndex, chapters, patchLessonFn, pushHistoryState, setChapters]);

  const handleSideToolClick = useCallback((label: string) => {
    if (label === 'Khác') {
      setShowOtherBlocksPopup(true);
      return;
    }
    if (label === 'Bảng') {
      setTableInsertIndex(activeBlockIndex);
      setTableInsertMode('insert');
      setShowTableModal(true);
      return;
    }
    let targetType: DocBlock['type'] = 'paragraph';
    if (label === 'Ảnh') targetType = 'image';
    else if (label === 'Bảng') targetType = 'table';
    else if (label === 'Công thức') targetType = 'formula';
    else if (label === 'Quiz') targetType = 'quiz';
    else if (label === 'Flashcard') targetType = 'flashcard';
    else if (label === 'Mindmap') return;
    else if (label === 'Media') targetType = 'media';
    else if (label === 'Code') targetType = 'code';

    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => {
        const newBlock = createDefaultBlock(targetType);
        return { ...lesson, blocks: [...lesson.blocks.slice(0, activeBlockIndex + 1), newBlock, ...lesson.blocks.slice(activeBlockIndex + 1)] };
      }))
    }));

    pushHistoryState(nextChapters, false, activeBlockIndex + 1);
    setChapters(nextChapters);
    setActiveBlockIndex(prev => typeof prev === 'number' ? prev + 1 : prev);
    focusBlock(activeBlockIndex + 1);
  }, [chapters, activeBlockIndex, patchLessonFn, pushHistoryState, setChapters, setActiveBlockIndex, setTableInsertIndex, setTableInsertMode, setShowTableModal, focusBlock]);

  const handleBodyDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        e.stopPropagation();

        try {
          const uploadedUrl = await uploadImageFile(file);
          const nextChapters = chapters.map(ch => ({
            ...ch,
            lessons: ch.lessons.map(patchLessonFn(lesson => {
              if (lesson.id === activeLessonId) {
                const newBlock: DocBlock = {
                  id: generateBlockId(),
                  type: 'image',
                  text: '',
                  src: uploadedUrl,
                  caption: file.name,
                  align: 'center',
                  width: '100%'
                };

                const currentIdx = activeBlockIndex;
                const updatedBlocks = [
                  ...lesson.blocks.slice(0, currentIdx + 1),
                  newBlock,
                  ...lesson.blocks.slice(currentIdx + 1)
                ];
                return { ...lesson, blocks: updatedBlocks };
              }
              return lesson;
            }))
          }));

          pushHistoryState(nextChapters, false, activeBlockIndex + 1);
          setChapters(nextChapters);
          setActiveBlockIndex(activeBlockIndex + 1);
          focusBlock(activeBlockIndex + 1);
        } catch {
          // Ignore
        }
      }
    }
  }, [chapters, activeLessonId, activeBlockIndex, patchLessonFn, pushHistoryState, setChapters, setActiveBlockIndex, focusBlock]);

  return {
    showOtherBlocksPopup,
    setShowOtherBlocksPopup,
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
    insertBlockAbove,
    handleSelectOtherBlock,
    handleSideToolClick,
    handleBodyDrop,
  };
};
