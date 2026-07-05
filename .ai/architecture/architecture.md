# Architecture — Onmi

## Overall Architecture

Onmi is a **client-side React SPA** (Single Page Application). There is no separate backend server at present. All data is served via:
- **Mock data** (`src/data/mockData.ts`) — static exam, document, user, and leaderboard data
- **LocalStorage** — user auth state, draft exams, preferences
- **URL routing** — react-router-dom v7

The future architecture will add Supabase as the backend (PostgreSQL + Row Level Security + Edge Functions).

```
Browser
  └── React SPA (Vite/HMR)
        ├── App.tsx (BrowserRouter + Routes)
        │     ├── Shared Layout (Navbar + Sidebar + Footer)
        │     └── Page Routes
        │           ├── Student Pages (/, /exams, /documents, ...)
        │           ├── Teacher Pages (/teacher, /teacher/exam-editor)
        │           └── Auth Pages (/login, /register)
        ├── src/components/ (reusable UI)
        ├── src/services/ (localStorage, API wrappers)
        ├── src/types/ (TypeScript type definitions)
        └── src/data/ (mock data)
```

---

## Module Relationships

```
App.tsx
├── Shared Components
│   ├── Navbar.tsx — top navigation, user auth status, view routing
│   ├── Sidebar.tsx — student left sidebar navigation
│   └── Footer.tsx — global footer
│
├── Student Modules
│   ├── Home.tsx — hero, featured content, quick links
│   ├── Exams.tsx → ExamDetail.tsx → ActiveExam.tsx
│   │     └── Question rendering (from mockData)
│   ├── Documents.tsx → DocReader.tsx
│   │     └── Chapter navigation, bookmarks, notes
│   ├── Leaderboard.tsx — ranking tables
│   ├── Roadmap.tsx — learning path visualization
│   ├── AssessmentTest.tsx — MBTI test + results
│   └── Profile.tsx — user profile, stats, history
│
└── Teacher Modules
    ├── Teacher.tsx — entry + sub-view state management
    └── TeacherDashboard.tsx — dashboard home
          └── ExamEditorWorkspace.tsx — editor (examSubView state)
                ├── ExamSidebar.tsx — tab navigation + question list
                ├── OmlGuideModal.tsx — OML reference modal
                ├── QuestionBankWorkspace.tsx — question picker
                ├── ExamLivePreview.tsx — live OML preview
                └── OmlRenderer/
                      ├── parser.ts — OML JSON parsing + validation
                      ├── OmlBlockRouter.tsx — block type → component
                      ├── OmlPreviewPaper.tsx — paper layout wrapper
                      └── blocks/ — individual block renderers
                            ├── QuestionBlock.tsx
                            ├── HeadingBlock.tsx
                            ├── ParagraphBlock.tsx
                            ├── FormulaBlock.tsx
                            ├── TableBlock.tsx
                            ├── ImageBlocks.tsx
                            ├── QuestionGroupBlock.tsx
                            ├── CalloutBlock.tsx
                            ├── ListBlock.tsx
                            ├── QuoteBlock.tsx
                            └── DividerBlock.tsx
```

---

## Data Flow

### Student Exam Flow
```
User opens /exams
  → Exams.tsx reads mockExams from mockData.ts
  → Filter/search by subject, grade, difficulty
  → Navigate to /exams/:id → ExamDetail.tsx
  → Click "Bắt đầu" → Navigate to /exams/:id/take → ActiveExam.tsx
  → ActiveExam manages: timer, current question, answers, submission
  → On submit: score calculated, XP added to user state
  → Results shown inline
  → User state saved to localStorage (omni_auth_user)
```

### Teacher Exam Creation Flow
```
Teacher opens /teacher
  → Teacher.tsx manages: mode state ('dashboard' | 'exam-editor' | ...)
  → TeacherDashboard shows past exams, 3 action cards
  → Click "Tạo đề thi" → mode = 'exam-editor'
  → ExamEditorWorkspace mounts
  → draftService.hasDraft() checked → restore or start fresh dialog
  → examSubView state: 'edit' | 'config' | 'publish'
  
  [Edit Tab]
    → examTab: 'code' | 'quick' | 'bank'
    → Code tab: OML JSON editor + real-time parser + live preview
    → Auto-save to localStorage via draftService every 2s (debounced)
    
  [Config Tab]
    → Form inputs update JSON fields directly
    → No question list in sidebar
    → Only "Xuất bản" button in top nav
    
  [Publish Tab]
    → Final review before publishing
    → No top navigation bar
    → Publish button triggers handlePublishExam
```

### OML Parse Flow
```
User types in code editor (examJsonCode state)
  → setExamJsonCode() called
  → useEffect [examJsonCode] triggers after 500ms debounce
  → parseOML(examJsonCode) called:
      1. JSON.parse() — syntax check
      2. validateOmlSchema() — schema check
      3. collectQuestionBlocksCount() — metadata extraction
  → OmlParseResult returned:
      { success, data, errors, warnings, metadata }
  → If success:
      → setLastValidOml(data)
      → setLastValidMetadata(metadata)
      → Live preview rerenders with new OmlPreviewPaper
  → If errors:
      → Error messages shown in status bar
      → Previous valid preview preserved
```

### Draft Auto-Save Flow
```
examJsonCode changes
  → 2 second debounce timer starts (useEffect)
  → setSaveStatus('saving')
  → draftService.saveDraft({ rawJson, lastSaved, examTitle, ... })
  → localStorage key: 'onmi.teacherstudio.exam.draft'
  → setSaveStatus('saved') + setLastSavedTime(now)
  
Cross-tab conflict detection:
  → BroadcastChannel 'onmi-draft' watches for other tab saves
  → If another tab saves: setIsCrossTabConflict(true)
  → Warning banner shown in editor
  → User can click "Tải lại bản nháp" to sync
```

---

## Teacher Studio Layout Architecture

The Teacher Studio uses **conditional per-tab rendering** (not CSS hiding):

```
examSubView = 'edit' | 'config' | 'publish'

[edit tab]:
  ExamSidebar (full: back button + nav + question list)
  + Top Navigation (title + save status + "Tạo đề mới" + "Lưu" + "Xem thử đề")
  + Sub-tab bar (Soạn bằng mã / Soạn nhanh / Ngân hàng câu hỏi)
  + Editor content

[config tab]:
  ExamSidebar (minimal: back button + nav only — NO question list)
  + Config-specific Top Navigation (auto-save status + "Xuất bản" only)
  + Config form content

[publish tab]:
  ExamSidebar (minimal: back button + nav only — NO question list)
  + NO top navigation
  + Publish review content
```

Key rule: **Use `{examSubView === 'edit' && <Component />}` — never `display: none`**

---

## Rendering Flow (OML → HTML)

```
OML JSON string
  → parseOML() → OmlParseResult { data: OmlDocumentV2 }
  → OmlPreviewPaper({ document: OmlDocumentV2 })
      → document.info → exam header (title, subject, grade, time)
      → document.content.map() → OmlBlockRouter({ block })
          → block.type === 'question' → QuestionBlock
          → block.type === 'question-group' → QuestionGroupBlock
                → context.map() → OmlBlockRouter (recursive for context)
                → questions.map() → QuestionBlock
          → block.type === 'heading' → HeadingBlock
          → block.type === 'paragraph' → ParagraphBlock
          → block.type === 'formula' → FormulaBlock
          → block.type === 'table' → TableBlock
          → block.type === 'image' → ImageBlocks
          → block.type === 'image-group' → ImageBlocks (group variant)
          → block.type === 'callout' → CalloutBlock
          → block.type === 'list' → ListBlock
          → block.type === 'quote' → QuoteBlock
          → block.type === 'divider' → DividerBlock
          → unknown → fallback div
```

---

## State Management Strategy

Onmi does NOT use Redux, MobX, or Zustand. State is managed with:

| Pattern | Used For |
|---|---|
| `useState` | Local component state (form values, UI toggles, loading states) |
| `useRef` | DOM references, stable values that don't trigger re-render (timer IDs, tab instance IDs) |
| `useEffect` | Side effects: auto-save, parse, scroll sync, BroadcastChannel listeners |
| Prop drilling (max 2 levels) | Passing state down to direct children |
| State lifting | Shared state moved to nearest common ancestor |
| `localStorage` | User auth, exam drafts, preferences |
| URL/route params | Which page is active |

**No global React Context** is currently used. If cross-cutting state grows beyond prop drilling tolerance, introduce a minimal Context.

---

## File Organization

```
src/
├── App.tsx                  — Router, auth state, shared layout
├── main.tsx                 — React.createRoot entry point
├── index.css                — Design tokens + global styles
├── types/
│   ├── index.ts             — User, Exam, Document, Question types
│   └── oml.ts               — All OML block type definitions
├── data/
│   └── mockData.ts          — Static mock data for all modules
├── services/
│   └── draftService.ts      — LocalStorage draft CRUD
├── pages/                   — One file per route
│   ├── Home.tsx
│   ├── Exams.tsx
│   ├── ExamDetail.tsx
│   ├── ActiveExam.tsx       — 52KB — most complex student page
│   ├── DocReader.tsx        — 65KB — complex doc reader
│   ├── AssessmentTest.tsx   — 67KB — MBTI engine
│   └── ...
└── components/
    ├── Navbar.tsx
    ├── Sidebar.tsx
    ├── Footer.tsx
    ├── ExamCard.tsx
    ├── DocCard.tsx
    ├── ExamEditor/
    │   └── OmlRenderer/     — OML rendering pipeline
    └── teacher/
        ├── TeacherDashboard.tsx
        ├── MethodSelectionModal.tsx
        ├── exam-editor/     — Teacher exam authoring
        ├── doc-editor/      — Teacher document publishing
        └── file-uploader/   — OCR upload flow
```
