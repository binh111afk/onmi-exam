import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TeacherDashboard } from '../components/teacher/TeacherDashboard';
import { MethodSelectionModal } from '../components/teacher/MethodSelectionModal';
import { DocEditorWorkspace } from '../components/teacher/doc-editor/DocEditorWorkspace';
import { FileUploaderWorkspace } from '../components/teacher/file-uploader/FileUploaderWorkspace';
import { ExamEditorWorkspace } from '../components/teacher/exam-editor/ExamEditorWorkspace';

type TeacherMode = 'dashboard' | 'editor' | 'upload' | 'exam-editor';
type ExamSubView = 'edit' | 'config' | 'publish';
type ExamTab = 'code' | 'quick' | 'bank';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

const TEACHER_EXAM_WORKSPACE_KEY = 'omni_teacher_exam_workspace';

const isTeacherMode = (mode: string | undefined): mode is TeacherMode =>
  mode === 'editor' || mode === 'upload' || mode === 'exam-editor' || mode === 'dashboard';

const loadTeacherExamWorkspace = () => {
  try {
    const saved = localStorage.getItem(TEACHER_EXAM_WORKSPACE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(TEACHER_EXAM_WORKSPACE_KEY);
    return null;
  }
};

export const Teacher: React.FC = () => {
  const navigate = useNavigate();
  const { mode: routeMode } = useParams();
  const initialMode = isTeacherMode(routeMode) ? routeMode : 'dashboard';

  // Mode is mirrored to the URL so refresh keeps the current Teacher workspace.
  const [mode, setModeState] = useState<TeacherMode>(initialMode);

  const setMode = (nextMode: TeacherMode) => {
    setModeState(nextMode);
    navigate(nextMode === 'dashboard' ? '/teacher' : `/teacher/${nextMode}`);
  };

  useEffect(() => {
    setModeState(isTeacherMode(routeMode) ? routeMode : 'dashboard');
  }, [routeMode]);

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

  // Modal selection state
  const [showMethodModal, setShowMethodModal] = useState(false);

  // Render workspace based on active mode
  if (mode === 'editor') {
    return <DocEditorWorkspace setMode={setMode} />;
  }

  if (mode === 'upload') {
    return <FileUploaderWorkspace setMode={setMode} />;
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

  // Dashboard landing view (2 action cards)
  return (
    <>
      <TeacherDashboard 
        setMode={setMode} 
        setShowMethodModal={setShowMethodModal} 
      />

      {showMethodModal && (
        <MethodSelectionModal 
          onClose={() => setShowMethodModal(false)}
          onSelectEditor={() => {
            setMode('editor');
            setShowMethodModal(false);
          }}
          onSelectUpload={() => {
            setMode('upload');
            setShowMethodModal(false);
          }}
        />
      )}
    </>
  );
};
