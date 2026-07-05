# Teacher Studio — Architecture & Developer Guide

## Overview

The Teacher Studio is the authoring environment where teachers create and publish exam content. It is a full-screen overlay workspace accessible at `/teacher/exam-editor`.

**Entry point:** `src/pages/Teacher.tsx`  
**Main workspace:** `src/components/teacher/exam-editor/ExamEditorWorkspace.tsx`

---

## Component Hierarchy

```
Teacher.tsx (page + mode routing)
└── TeacherDashboard.tsx (mode = 'dashboard')
    └── ExamEditorWorkspace.tsx (mode = 'exam-editor')
          ├── ExamSidebar.tsx (always visible, content varies by examSubView)
          ├── ExamLivePreview.tsx (optional right panel)
          ├── OmlGuideModal.tsx (modal, shown on demand)
          ├── QuestionBankWorkspace.tsx (examTab = 'bank')
          └── OmlRenderer/
                ├── OmlPreviewPaper.tsx
                ├── OmlBlockRouter.tsx
                └── blocks/ (11 block renderer components)
```

---

## State Architecture

### Mode State (in `Teacher.tsx`)
```typescript
type TeacherMode = 'dashboard' | 'editor' | 'upload' | 'exam-editor';
const [mode, setMode] = useState<TeacherMode>('dashboard');
```

### Sub-View State (in `ExamEditorWorkspace.tsx`)
```typescript
type ExamSubView = 'edit' | 'config' | 'publish';
// Passed down as props from Teacher.tsx
```

### Editor Tab State (in `ExamEditorWorkspace.tsx`)
```typescript
type ExamTab = 'code' | 'quick' | 'bank';
const [examTab, setExamTab] = useState<ExamTab>('code');
```

### Important Internal State
| State | Type | Purpose |
|---|---|---|
| `examJsonCode` | `string` | Raw OML JSON string in the code editor |
| `showLivePreview` | `boolean` | Toggle right-side live preview panel |
| `lastValidOml` | `OmlDocumentV2 \| null` | Last successfully parsed OML data |
| `lastValidMetadata` | `{title, questionCount, ...}` | Metadata from last valid parse |
| `omlBlocks` | `OmlContentBlock[]` | Parsed content blocks |
| `previewQuestions` | `any[]` | Flat list of questions for sidebar |
| `saveStatus` | `'idle' \| 'saving' \| 'saved' \| 'error'` | Auto-save status display |
| `lastSavedTime` | `string \| null` | ISO timestamp of last save |
| `compileStatus` | `'unchecked' \| 'compiling' \| 'success' \| 'error'` | OML validation status |
| `isCrossTabConflict` | `boolean` | Another tab has saved a different draft |

---

## Layout Architecture (Per Tab)

The Teacher Studio uses **conditional rendering per tab**, not CSS hiding. Each `examSubView` value renders a different layout structure.

### Tab: `edit` (Soạn đề)
- **Sidebar:** Full (back button + nav menu + question list + add question button)
- **Top Navigation:** Full (title + save status + "Tạo đề mới" + "Lưu" + "Xem thử đề")
- **Sub-tab bar:** Code editor / Quick editor / Question bank
- **Content:** Selected editor view

### Tab: `config` (Cấu hình đề thi)
- **Sidebar:** Minimal (back button + nav menu only — NO question list)
- **Top Navigation:** Config-specific (auto-save status + "Xuất bản đề thi" only)
- **Content:** Configuration form with left/right column layout

### Tab: `publish` (Xem & Xuất bản)
- **Sidebar:** Minimal (back button + nav menu only — NO question list)
- **Top Navigation:** NONE
- **Content:** Publish review with exam info and share link

### Key Rule
```jsx
// CORRECT — conditional rendering
{examSubView === 'edit' && <QuestionList />}

// WRONG — CSS hiding
<QuestionList style={{ display: examSubView === 'edit' ? 'block' : 'none' }} />
```

---

## OML Code Editor Flow

1. User types in the code textarea (`examJsonCode` state)
2. `useEffect [examJsonCode]` fires with 500ms debounce
3. `parseOML(examJsonCode)` is called
4. If `success`: update `lastValidOml`, `omlBlocks`, `previewQuestions`, `lastValidMetadata`
5. If `error`: error details stored, previous valid data preserved
6. Separately, auto-save debounce (2s) calls `draftService.saveDraft()`

---

## Auto-Save System

```typescript
// Key: localStorage key
'onmi.teacherstudio.exam.draft'

// Structure saved:
interface ExamDraft {
  version: string;
  editorMode: string; // "json"
  rawJson: string;
  lastSaved: string; // ISO timestamp
  examTitle: string;
  subject: string;
  draftId: string; // unique per tab instance
}
```

**Cross-tab conflict detection:**
- Each tab has a unique `tabInstanceId` (UUID-like string generated on mount)
- BroadcastChannel `'onmi-draft'` broadcasts saves
- If another tab's ID saves, `isCrossTabConflict` is set to `true`
- User sees a banner with "Tải lại bản nháp" option

---

## Draft Restore Flow

On mount, `ExamEditorWorkspace` checks for an existing draft:
1. `draftService.hasDraft()` → true?
2. Show restore dialog (`showRestoreDialog`)
3. User clicks "Khôi phục" → load draft into `examJsonCode`
4. User clicks "Tạo mới" → clear draft, start with template

---

## ExamSidebar Component

**File:** `src/components/teacher/exam-editor/ExamSidebar.tsx`

**Props:**
```typescript
interface ExamSidebarProps {
  examSubView: 'edit' | 'config' | 'publish';
  setExamSubView: (v: 'edit' | 'config' | 'publish') => void;
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  selectedQuestionId: number;
  setSelectedQuestionId: (id: number) => void;
  examSearchQuery: string;
  setExamSearchQuery: (q: string) => void;
  filteredQuestions: number[];
}
```

**Sidebar content:**
- Always shown: "Quay lại" button (calls `setMode('dashboard')`)
- Always shown: Navigation menu (Soạn đề / Cấu hình / Xem & Xuất bản)
- Only when `examSubView === 'edit'`: Question list, search input, "Thêm câu hỏi" button

---

## OML Live Preview

When `showLivePreview` is `true` in the Edit tab, a right-side preview column is rendered:

```
<OmlPreviewPaper document={lastValidOml} />
```

The preview:
- Updates whenever `lastValidOml` changes (on successful parse)
- Does NOT update on parse errors (shows last valid state)
- Has zoom controls (50% to 200%)
- Has fullscreen overlay mode
- Can be toggled with "Xem thử đề" button

---

## Quick Editor (Soạn nhanh)

A two-step wizard for teachers who prefer forms over code:

**Step 1:** Upload or drag-drop a PDF/DOCX file  
**Step 2:** Review OCR-extracted content in a 3-column view:
- Column 1: File info + OCR summary
- Column 2: Extracted OML JSON editor  
- Column 3: Live preview

---

## Question Bank Tab

**File:** `src/components/teacher/exam-editor/QuestionBankWorkspace.tsx`

Allows teachers to:
- Browse existing questions by subject, grade, type
- Filter and search
- Add selected questions to the current exam

---

## Config Tab Form Fields

The config tab edits the `info` object of the OML document. Fields:

| Field | Input Type | Maps to OML |
|---|---|---|
| Tên đề thi | text | `info.title` |
| Mô tả | textarea | `info.description` |
| Môn học | text/select | `info.subject` |
| Khối lớp | select | `info.grade` |
| Thời gian làm bài | number | `info.time` |
| Loại đề | select | `info.type` |
| Độ khó | select | `info.difficulty` |
| Phương thức thi | toggle | `info.type` |
| Xáo trộn câu hỏi | toggle | `info.shuffle` |
| Xem lại bài | toggle | `info.allowReview` |

Changes to form fields call `updateJsonField(fieldPath, value)` which updates the JSON string in `examJsonCode` via string manipulation/JSON.parse+modify+stringify.

---

## Publish Flow

1. Teacher clicks "Xuất bản đề thi" (from config or publish tab)
2. `handlePublishExam()` is called
3. Currently: shows success dialog with a generated share URL
4. Future: saves to Supabase exams table, sets status to 'published'

---

## Key Files Reference

| File | Size | Purpose |
|---|---|---|
| `ExamEditorWorkspace.tsx` | 110KB | Main editor, all state management |
| `OmlGuideModal.tsx` | 31KB | OML reference guide modal |
| `QuestionBankWorkspace.tsx` | 35KB | Question bank browser |
| `ExamSidebar.tsx` | 5KB | Navigation sidebar |
| `ExamLivePreview.tsx` | 8KB | Live preview component |

---

## Common Patterns

### Updating a JSON field from a form input
```typescript
const updateJsonField = (field: string, value: any) => {
  try {
    const obj = JSON.parse(examJsonCode);
    obj.info = { ...obj.info, [field]: value };
    setExamJsonCode(JSON.stringify(obj, null, 2));
  } catch {
    // Don't update if JSON is invalid
  }
};
```

### Reading info metadata from OML
```typescript
const infoMeta = lastValidOml?.info ?? {
  title: '', subject: '', grade: 10, time: 45
};
```

### Formatting saved time
```typescript
const formatSavedTime = (isoString: string | null) => {
  if (!isoString) return 'mới đây';
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
```

---

## Rules for Teacher Studio Development

1. **Never modify `OmlRenderer/`** when working on Teacher Studio UI.
2. **Never touch student pages** when working on teacher features.
3. When adding new form fields to the config tab, update `src/types/oml.ts` first.
4. When adding new auto-save fields, update `draftService.ts` `ExamDraft` interface.
5. The `ExamEditorWorkspace.tsx` is large (110KB). Use `view_file` with line ranges — never load the whole file at once.
6. Always test the OML parser still works after any config tab changes.
