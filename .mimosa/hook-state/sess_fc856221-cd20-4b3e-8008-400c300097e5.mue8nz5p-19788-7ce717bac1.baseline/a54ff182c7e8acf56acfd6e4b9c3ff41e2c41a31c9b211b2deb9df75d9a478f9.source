# AGENTS.md — AI Agent Instructions for Onmi

> **This is the primary instruction file for every AI agent working on the Onmi project.**
> Read this file in full before making ANY change to the codebase.

---

## 1. Project Identity

**Onmi** is a modern AI-powered education platform for Vietnamese students (primary school through university). The platform hosts:

- Online Exam Engine
- Teacher Studio (Exam authoring + Document publishing)
- OML (Onmi Markup Language) — proprietary exam format
- Document Reader
- OCR Upload
- Learning Roadmap
- MBTI Career Assessment
- EXP & Gamification System
- Leaderboard / Ranking
- AI Assistant
- Question Bank
- Blog

**Stack:**
- React 19 + TypeScript 6 + Vite 8
- TailwindCSS 4 (utility-first, no Shadcn, no MUI)
- React Router DOM 7
- lucide-react (icons only — no emojis)
- Zod (schema validation)
- LocalStorage (persistence before Supabase integration)

**Dev server:** `npm run dev` → `http://localhost:5173`

---

## 2. Golden Rules

These rules are **absolute** and cannot be overridden unless the user explicitly confirms:

1. **Never redesign existing UI.** Existing screens are FINAL. Only change what the user explicitly asks.
2. **Never rename files or folders** unless the user explicitly requests it.
3. **Never move components between folders** unless explicitly requested.
4. **Never duplicate state.** State must live in exactly one place.
5. **Never invent OML syntax.** Only use block types and fields defined in `src/types/oml.ts`.
6. **Never modify student-facing pages** when working on teacher features, and vice versa.
7. **Never install new dependencies** without explicit user approval.
8. **Never write `// TODO` comments.** Either implement it or leave it out.
9. **Never use inline styles** (`style={{}}`). Use Tailwind utility classes only.
10. **Never use emojis or Unicode symbols** in UI. Use `lucide-react` exclusively.
11. **Never use `display: none`** to hide components — use conditional rendering (`{condition && <Component />}`).
12. **Never run `git commit` or `git push`** unless the user explicitly instructs it.

---

## 3. Editing Philosophy

- **Surgical edits.** Change only what was requested. Leave everything else untouched.
- **Preserve existing comments and docstrings** that are unrelated to your change.
- **No speculative refactoring.** Only refactor if explicitly asked.
- **No unsolicited improvements.** Do not "clean up" code while fixing a bug.
- **Verify always.** Run `npx tsc --noEmit` before declaring work complete.

---

## 4. Git Philosophy

- **Never run `git commit` or `git push`** without explicit user instruction.
- **Never run `git reset --hard`.** Use `git checkout <file>` to revert individual files.
- Keep changes minimal and targeted to reduce merge conflict risk.
- If you need to restore a file: `git checkout src/path/to/file.tsx`

---

## 5. Code Modification Rules

### Before editing
1. Read all relevant files in full. Understand structure before touching anything.
2. Run `npx tsc --noEmit` to see the baseline error state.
3. Identify the exact lines to change — never replace large blocks unnecessarily.

### During editing
- Use `multi_replace_file_content` for non-contiguous changes in the same file.
- Use `replace_file_content` for a single contiguous block.
- Target the **smallest** possible range. Never replace 200 lines to change 5.
- When replacing JSX, count opening/closing tags to maintain balance.
- Edit from **bottom to top** in the file when making multiple multi-line changes to avoid line number drift.

### After editing
- Run `npx tsc --noEmit` — zero NEW errors is required before declaring done.
- Verify HMR updated in the running dev server (browser at `localhost:5173`).

---

## 6. Architecture Rules

- **State lifting:** State lives in the nearest common ancestor, not in siblings.
- **Props drilling limit:** Max 2 levels. Use React Context beyond that.
- **No new global context** without discussing with the user first.
- **Services** (`src/services/`) handle localStorage, API calls, and data persistence.
- **Types** (`src/types/`) are the single source of truth for data shapes. Update types BEFORE implementations.
- **Data** (`src/data/mockData.ts`) contains all mock data used until Supabase is integrated.
- **Routing** is managed entirely in `src/App.tsx`. Never create routes elsewhere.

---

## 7. UI Preservation Rules

The following UI is considered **FINAL** and must not be altered unless explicitly requested:

| Area | Files |
|---|---|
| Student Home | `src/pages/Home.tsx` |
| Exam List + Detail | `src/pages/Exams.tsx`, `ExamDetail.tsx` |
| Active Exam Engine | `src/pages/ActiveExam.tsx` |
| Document Reader | `src/pages/DocReader.tsx` |
| MBTI Assessment | `src/pages/AssessmentTest.tsx` |
| Leaderboard | `src/pages/Leaderboard.tsx` |
| Global Navbar/Footer | `src/components/Navbar.tsx`, `Footer.tsx` |
| Teacher Dashboard | `src/components/teacher/TeacherDashboard.tsx` |
| Exam Editor Workspace | `src/components/teacher/exam-editor/ExamEditorWorkspace.tsx` |
| Exam Sidebar | `src/components/teacher/exam-editor/ExamSidebar.tsx` |
| OML Renderer | `src/components/ExamEditor/OmlRenderer/` |

**Scope boundaries:**
- Teacher Studio work → touch only `src/components/teacher/` and `src/pages/Teacher.tsx`
- OmlRenderer work → touch only `src/components/ExamEditor/OmlRenderer/` and `src/types/oml.ts`
- Student work → touch only `src/pages/` files for student pages and `src/components/` shared components

---

## 8. Forbidden Operations

| Operation | Why |
|---|---|
| `display: none` / `visibility: hidden` on components | Use `{cond && <Comp />}` instead |
| Adding Supabase calls without defined schema | Will break in production |
| Using `any` type without justification comment | Defeats TypeScript |
| Importing packages not in `package.json` | Will not compile |
| `console.log` in production code | Use `console.error` only for caught errors |
| Creating pages without route in `App.tsx` | Page will be unreachable |
| `Math.random()` for stable IDs | Use deterministic IDs |
| Modifying `src/index.css` design tokens | Requires explicit approval |
| Using arbitrary hex colors in Tailwind classes | Use design token class names |

---

## 9. Required Workflow

When a user asks you to make a change:

1. **Read** all relevant files before writing anything
2. **Plan** — identify files to touch and the minimal diff required
3. **Check baseline** — run `npx tsc --noEmit` before changing anything
4. **Implement** — smallest possible edit
5. **Verify** — run `npx tsc --noEmit` again. No new errors.
6. **Report** — what changed, which file, which lines, why

---

## 10. How to Read Project Documentation

The AI Knowledge Base lives in `.ai/` at the project root. Recommended reading order:

1. `AGENTS.md` ← **You are here**
2. `.ai/project/overview.md` — project purpose, modules, users
3. `.ai/architecture/architecture.md` — module relationships, data flow
4. `.ai/oml/oml-spec.md` — OML language specification
5. `.ai/ui/design-system.md` — colors, typography, spacing tokens
6. `.ai/teacher/teacher-studio.md` — Teacher Studio architecture
7. `.ai/coding/rules.md` — code style and patterns
8. Domain-specific file for the current task (see `.ai/docs/index.md`)

**Never skip steps 1–3** even for small tasks.

---

## 11. How to Respond After Finishing a Task

Structure your final response as:

```
## Summary
[1–2 sentences describing what was done]

## Files Changed
- `src/path/to/File.tsx` — [what changed and why]
- `src/path/to/other.ts` — [what changed and why]

## Verification
- TypeScript: ✅ 0 new errors (npx tsc --noEmit)
- [Any other checks performed]
```

Do NOT:
- Summarize unchanged code
- Paste entire file contents in your response
- Over-explain what the code does (let the code speak)
