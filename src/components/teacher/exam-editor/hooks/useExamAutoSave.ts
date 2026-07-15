import { useState, useEffect, useRef } from 'react';
import { draftService } from '../../../../services/draftService';

export const DEFAULT_EXAM_CODE = `{
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

interface UseExamAutoSaveProps {
  examJsonCode: string;
  setExamJsonCode: (code: string) => void;
  examTab: 'code' | 'quick' | 'bank';
  lastValidMetadata: any;
}

export const useExamAutoSave = ({
  examJsonCode,
  setExamJsonCode,
  examTab,
  lastValidMetadata,
}: UseExamAutoSaveProps) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showConfirmNewDialog, setShowConfirmNewDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);
  const [isCrossTabConflict, setIsCrossTabConflict] = useState(false);

  const tabInstanceId = useRef<string>(Math.random().toString(36).substring(2, 9));

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

  const resetEditorToDefault = () => {
    setExamJsonCode(DEFAULT_EXAM_CODE);
    setSaveStatus('idle');
    setLastSavedTime(null);
    setIsCrossTabConflict(false);
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

  // Debounced auto-save effect
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
      const title = lastValidMetadata?.title || 'Đề thi chưa có tiêu đề';
      const subject = lastValidMetadata?.subject || 'Sinh học';

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
  }, [examJsonCode, examTab, lastValidMetadata?.title, lastValidMetadata?.subject]);

  return {
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
    handleRestoreDraft,
    handleDiscardRestore,
    handleCreateNewExamClick,
    handleConfirmNewExam,
    resetEditorToDefault,
  };
};
