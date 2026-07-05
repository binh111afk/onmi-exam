# Onmi — Project Overview

## What is Onmi?

Onmi (Onmi Exam) is a modern AI-powered education platform designed for Vietnamese students from primary school through university. It combines exam taking, document reading, teacher authoring tools, gamification, and learning roadmaps in a single cohesive product.

The name "Onmi" reflects the platform's goal: an **all-in-one** (omni) learning environment.

---

## Mission

> **Learning should feel rewarding.**

Onmi exists to:
- Build long-term learning habits
- Reduce exam anxiety through practice
- Increase student motivation through gamification
- Make quality educational materials accessible to all Vietnamese students

---

## Vision

Onmi will become the primary digital learning companion for Vietnamese K-12 and university students, powered by AI-driven personalization, teacher-authored content, and community learning.

---

## Target Users

### Students
- Primary school (grades 1–5)
- Middle school (grades 6–9)
- High school (grades 10–12)
- University students

### Teachers
- Subject teachers who want to create and publish exams
- Content creators publishing study documents
- Educators using the Question Bank

---

## Core Principles

1. **Never sacrifice usability for aesthetics**
2. **Accessibility first** — keyboard navigation, screen reader support, contrast ratios
3. **Mobile responsive** — all pages work on mobile, though desktop is primary
4. **Vietnamese-first** — all UI copy is Vietnamese, RTL not needed

---

## Main Modules

### 1. Online Exam Engine (`/exams`, `/exams/:id/take`)
Students browse, filter, and take timed exams. Results are scored instantly with explanations. Completed exams grant XP and contribute to leaderboard rankings.

**Files:**
- `src/pages/Exams.tsx` — exam listing and filtering
- `src/pages/ExamDetail.tsx` — exam info + start button
- `src/pages/ActiveExam.tsx` — live exam-taking interface (50,000+ bytes, most complex page)

### 2. Teacher Studio (`/teacher`, `/teacher/exam-editor`)
Teachers can create exams using:
- **OML Code Editor** — JSON-based authoring with live preview
- **Quick Editor** — step-by-step form-based creation
- **Question Bank** — pick from existing questions
- **OCR Upload** — scan physical exam papers

**Files:**
- `src/pages/Teacher.tsx` — entry page, routing to sub-views
- `src/components/teacher/TeacherDashboard.tsx` — dashboard with exam history
- `src/components/teacher/exam-editor/ExamEditorWorkspace.tsx` — main editor (110KB+)
- `src/components/teacher/exam-editor/ExamSidebar.tsx` — navigation sidebar
- `src/components/teacher/exam-editor/OmlGuideModal.tsx` — OML language reference
- `src/components/teacher/exam-editor/QuestionBankWorkspace.tsx` — question picker

### 3. OML — Onmi Markup Language
OML is a JSON-based proprietary format for describing exam content. Version 2.0 is current.

**Files:**
- `src/types/oml.ts` — TypeScript type definitions (source of truth)
- `src/components/ExamEditor/OmlRenderer/parser.ts` — JSON parse + schema validation
- `src/components/ExamEditor/OmlRenderer/OmlBlockRouter.tsx` — renders blocks by type
- `src/components/ExamEditor/OmlRenderer/OmlPreviewPaper.tsx` — exam paper preview
- `src/components/ExamEditor/OmlRenderer/blocks/` — 11 block renderer components

### 4. Document Reader (`/documents`, `/documents/:id`)
Students can browse and read study documents in a book-like interface with chapter navigation, bookmarks, notes, and read-time tracking.

**Files:**
- `src/pages/Documents.tsx` — document listing
- `src/pages/DocReader.tsx` — reader UI (65KB+)

### 5. MBTI / Career Assessment (`/mbti`)
A full MBTI-style personality and career aptitude test with 60+ questions, scoring engine, and type profiles.

**Files:**
- `src/pages/AssessmentTest.tsx` (67KB)

### 6. Learning Roadmap (`/roadmap`)
Visual learning path with subject tracks, milestones, and progress tracking.

**Files:**
- `src/pages/Roadmap.tsx` (35KB)

### 7. EXP & Gamification System
- XP earned from completing exams
- Streak tracking (consecutive daily active days)
- Badges for achievements
- Level progression

**Data shape:** `src/types/index.ts` → `User` interface

### 8. Leaderboard (`/leaderboard`)
Weekly and all-time ranking boards. Shows student name, school, grade, XP, streak, and badges.

**Files:**
- `src/pages/Leaderboard.tsx`

### 9. AI Assistant
Integrated contextual AI help (planned, UI placeholder exists). Will provide:
- Exam question hints
- Explanation expansion
- Document summarization

### 10. Question Bank
Repository of pre-authored questions that teachers can add to exams.

**Files:**
- `src/components/teacher/exam-editor/QuestionBankWorkspace.tsx`

### 11. Blog (`/blog`)
Educational articles, platform announcements, subject-specific content.

**Files:**
- `src/pages/Blog.tsx` (33KB)

---

## Routing Architecture

All routes are defined in `src/App.tsx`:

| Path | Component | Auth Required |
|---|---|---|
| `/` | `Home` | No |
| `/exams` | `Exams` | No |
| `/exams/:id` | `ExamDetail` | No |
| `/exams/:id/take` | `ActiveExam` | Yes |
| `/documents` | `Documents` | No |
| `/documents/:id` | `DocReader` | No |
| `/leaderboard` | `Leaderboard` | No |
| `/roadmap` | `Roadmap` | No |
| `/mbti` | `AssessmentTest` | No |
| `/teacher` | `Teacher` | Yes |
| `/teacher/exam-editor` | `Teacher` → ExamEditorWorkspace | Yes |
| `/blog` | `Blog` | No |
| `/contact` | `Contact` | No |
| `/profile` | `Profile` | Yes |
| `/login` | `Login` | No |
| `/register` | `Register` | No |

---

## Current Status

**Phase:** Active Development — Frontend-first (mock data)

**What works:**
- Complete student exam flow (browse → take → score)
- Complete Teacher Studio exam authoring flow
- OML parser and renderer
- Document reader with chapters
- MBTI test with full scoring
- Gamification (XP, streaks, badges) — frontend only
- Leaderboard — mock data
- OCR UI (simulation only)

**What is planned:**
- Supabase backend integration (auth, database, storage)
- Real OCR processing
- AI Assistant (real AI responses)
- Teacher analytics dashboard
- Student learning recommendations

---

## Future Roadmap

1. **Q3 2026:** Supabase auth + user persistence
2. **Q4 2026:** Real question bank with teacher submissions
3. **Q1 2027:** AI exam analysis and recommendations
4. **Q2 2027:** Mobile app (React Native)
5. **Q3 2027:** School/institution accounts
6. **2028+:** API for third-party LMS integration
