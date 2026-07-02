import React, { useState } from 'react';
import { TeacherDashboard } from '../components/teacher/TeacherDashboard';
import { MethodSelectionModal } from '../components/teacher/MethodSelectionModal';
import { DocEditorWorkspace } from '../components/teacher/doc-editor/DocEditorWorkspace';
import { FileUploaderWorkspace } from '../components/teacher/file-uploader/FileUploaderWorkspace';
import { ExamEditorWorkspace } from '../components/teacher/exam-editor/ExamEditorWorkspace';

export const Teacher: React.FC = () => {
  // Mode: 'dashboard', 'editor', 'upload', or 'exam-editor'
  const [mode, setMode] = useState<'dashboard' | 'editor' | 'upload' | 'exam-editor'>('dashboard');

  // Sub-view within exam editor: 'edit', 'config', 'publish'
  const [examSubView, setExamSubView] = useState<'edit' | 'config' | 'publish'>('edit');

  // Exam editor states
  const [examTab, setExamTab] = useState<'code' | 'quick' | 'bank'>('code');
  const [examJsonCode, setExamJsonCode] = useState(
`{
  "info": {
    "title": "Đề cương ôn tập Sinh học 10 học kỳ 2",
    "subject": "Sinh học",
    "grade": 10,
    "time": 90,
    "totalQuestion": 50,
    "type": "trac_nghiem"
  },
  "questions": [
    {
      "id": 1,
      "question": "Phát biểu nào sau đây đúng về nước?",
      "options": [
        { "key": "A", "content": "Nước là dung môi phân cực cực tốt" },
        { "key": "B", "content": "Nước không tham gia phản ứng sinh hóa" },
        { "key": "C", "content": "Nước được cấu tạo từ 3 nguyên tử H và 1 nguyên tử O" },
        { "key": "D", "content": "Nước không có khả năng điều hòa nhiệt độ" }
      ],
      "answer": "A",
      "explanation": "Nước là dung môi phân cực cực tốt nên hòa tan được nhiều chất phân cực trong tế bào.",
      "level": "easy",
      "tags": ["nước", "thành phần hóa học"]
    },
    {
      "id": 2,
      "question": "Cho hình vẽ cấu trúc của phân tử nước. Góc liên kết H-O-H là bao nhiêu?",
      "options": [
        { "key": "A", "content": "104.5°" },
        { "key": "B", "content": "90°" },
        { "key": "C", "content": "120°" },
        { "key": "D", "content": "180°" }
      ],
      "answer": "A",
      "explanation": "Do 2 cặp electron tự do trên nguyên tử O đẩy nhau làm góc liên kết nhỏ hơn 109.5°, giá trị thực tế là 104.5°.",
      "level": "medium",
      "tags": ["nước", "cấu trúc"]
    }
  ]
}`
  );
  
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(1);
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

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
