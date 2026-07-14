import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TeacherDashboard } from '../components/teacher/TeacherDashboard';
import { DocEditorWorkspace } from '../components/teacher/doc-editor/DocEditorWorkspace';
import type { Chapter, Lesson, DocSetupMetadata } from '../types/doc-editor';
import { FileUploaderWorkspace } from '../components/teacher/file-uploader/FileUploaderWorkspace';
import { ExamEditorWorkspace } from '../components/teacher/exam-editor/ExamEditorWorkspace';
import { useAlert } from '../components/common/Alert';
import { PublishModal } from '../components/teacher/doc-editor/PublishModal';

type TeacherMode = 'dashboard' | 'editor' | 'upload' | 'exam-editor';
type ExamSubView = 'edit' | 'config' | 'publish';
type ExamTab = 'code' | 'quick' | 'bank';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

const TEACHER_EXAM_WORKSPACE_KEY = 'omni_teacher_exam_workspace';

const loadTeacherExamWorkspace = () => {
  try {
    const saved = localStorage.getItem(TEACHER_EXAM_WORKSPACE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to load teacher exam workspace:', err);
  }
  return null;
};

export const Teacher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();

  const getModeFromPath = (path: string): TeacherMode => {
    if (path === '/teacher/document/new' || path === '/teacher/document/editor') return 'editor';
    if (path === '/teacher/upload') return 'upload';
    if (path === '/teacher/exam-editor') return 'exam-editor';
    return 'dashboard';
  };

  // Mode is mirrored to the URL so refresh keeps the current Teacher workspace.
  const [mode, setModeState] = useState<TeacherMode>(() => getModeFromPath(location.pathname));

  const setMode = (nextMode: TeacherMode) => {
    setModeState(nextMode);
    if (nextMode === 'dashboard') {
      navigate('/teacher');
    } else if (nextMode === 'editor') {
      navigate('/teacher/document/editor');
    } else {
      navigate(`/teacher/${nextMode}`);
    }
  };

  useEffect(() => {
    setModeState(getModeFromPath(location.pathname));
  }, [location.pathname]);

  // Sub-view within exam editor: 'edit', 'config', 'publish'
  const [examSubView, setExamSubView] = useState<ExamSubView>('edit');

  // Exam editor states
  const [examTab, setExamTab] = useState<ExamTab>('code');
  const [examJsonCode, setExamJsonCode] = useState(
`{
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
      "latex": "\\text{Hiệu suất} = \\frac{\\text{Năng lượng tích lũy}}{\\text{Năng lượng ánh sáng}} \\times 100\\%",
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
}`
  );

  
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(1);
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);

  useEffect(() => {
    const savedWorkspace = loadTeacherExamWorkspace();
    if (savedWorkspace) {
      setExamSubView(savedWorkspace.examSubView ?? 'edit');
      setExamTab(savedWorkspace.examTab ?? 'code');
      setExamJsonCode(savedWorkspace.examJsonCode ?? examJsonCode);
      setSelectedQuestionId(savedWorkspace.selectedQuestionId ?? 1);
      setExamSearchQuery(savedWorkspace.examSearchQuery ?? '');
      setViewportMode(savedWorkspace.viewportMode ?? 'desktop');
    }
    setWorkspaceLoaded(true);
  }, []);

  useEffect(() => {
    if (!workspaceLoaded) return;
    localStorage.setItem(TEACHER_EXAM_WORKSPACE_KEY, JSON.stringify({
      examSubView,
      examTab,
      examJsonCode,
      selectedQuestionId,
      examSearchQuery,
      viewportMode,
    }));
  }, [workspaceLoaded, examSubView, examTab, examJsonCode, selectedQuestionId, examSearchQuery, viewportMode]);

  // Custom document states for editor loading
  const [editorChapters, setEditorChapters] = useState<Chapter[] | undefined>(undefined);
  const [editorActiveLessonId, setEditorActiveLessonId] = useState<string | undefined>(undefined);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [editorMetadata, setEditorMetadata] = useState<DocSetupMetadata | undefined>(undefined);

  const handleStartSelfCompose = () => {
    const activeDraft = localStorage.getItem('omni_doc_active_draft');
    if (activeDraft) {
      try {
        const draftInfo = JSON.parse(activeDraft);
        if (draftInfo && draftInfo.metadata) {
          setEditorMetadata(draftInfo.metadata);
          setEditorChapters([]);
          setEditorActiveLessonId(undefined);
          setMode('editor');
          return;
        }
      } catch (err) {
        console.error('Failed to parse active draft metadata:', err);
      }
    }

    // Initialize with default metadata and bypass setup page directly to editor
    const defaultMeta: DocSetupMetadata = {
      name: 'Tài liệu chưa đặt tên',
      subject: '',
      grade: '',
      docType: '',
      description: '',
    };
    setEditorMetadata(defaultMeta);
    setEditorChapters([]);
    setEditorActiveLessonId(undefined);

    // Save active draft info immediately so F5 reload functions correctly
    try {
      localStorage.setItem('omni_doc_active_draft', JSON.stringify({
        documentId: 'tai_lieu_chua_dat_ten___',
        metadata: defaultMeta,
        lastSaved: new Date().toISOString()
      }));
    } catch (e) {
      console.error(e);
    }

    setMode('editor');
  };

  // Restore active document draft metadata on mount
  useEffect(() => {
    const activeDraft = localStorage.getItem('omni_doc_active_draft');
    if (activeDraft) {
      try {
        const draftInfo = JSON.parse(activeDraft);
        if (draftInfo && draftInfo.metadata) {
          setEditorMetadata(draftInfo.metadata);
          setEditorChapters([]);
        }
      } catch (err) {
        console.error('Failed to restore active draft metadata on mount:', err);
      }
    }
  }, []);

  const handleUploadFile = (file: File) => {
    setSelectedUploadFile(file);
    setMode('upload');
  };

  // Render workspace based on active mode
  if (mode === 'editor') {
    return (
      <DocEditorWorkspace 
        setMode={setMode} 
        initialChaptersData={editorChapters}
        initialActiveLessonId={editorActiveLessonId}
        metadata={editorMetadata}
        onChangeMetadata={(meta) => {
          setEditorMetadata(meta);
        }}
      />
    );
  }

  if (mode === 'upload') {
    return <FileUploaderWorkspace setMode={setMode} initialFile={selectedUploadFile} />;
  }

  if (mode === 'exam-editor') {
    return (
      <ExamEditorWorkspace 
        setMode={setMode}
        examSubView={examSubView}
        setExamSubView={setExamSubView}
        examTab={examTab}
        setExamTab={setExamTab}
        examJsonCode={examJsonCode}
        setExamJsonCode={setExamJsonCode}
        selectedQuestionId={selectedQuestionId}
        setSelectedQuestionId={setSelectedQuestionId}
        examSearchQuery={examSearchQuery}
        setExamSearchQuery={setExamSearchQuery}
        viewportMode={viewportMode}
        setViewportMode={setViewportMode}
      />
    );
  }

  // Dashboard landing view (3 action cards)
  return (
    <TeacherDashboard 
      setMode={setMode} 
      onStartSelfCompose={handleStartSelfCompose}
      onUploadFile={handleUploadFile}
    />
  );
};
