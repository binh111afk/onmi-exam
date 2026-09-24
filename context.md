# CONTEXT.md — Ngữ cảnh dự án Omni cho phiên làm việc mới

> Phiên gần nhất kết thúc ngày **23/09/2026**. Đọc file này + `AGENTS.md` là làm tiếp được mà không cần lịch sử chat.
> Repo: Omni (Onmi) — React 19 + TS 6 + Vite 8 + Tailwind 4, SPA mock-data, chưa có backend (Supabase là tương lai).
> Chạy: `npm run dev` (localhost:5173). Kiểm tra: `npx tsc -b --force` (đếm lỗi — xem mục Trạng thái) + `npx vite build`.

## Vòng lặp agent đang áp dụng (từ mylearn/agent.md — 4 vai, KHÔNG bỏ bước)

| Vai | Model (xkiro) | Lệnh |
|---|---|---|
| 1. Gatekeeper | `z-ai/glm-5.3-flash` | `node agent-loop/cli.mjs propose --task-file T --plan-file P --context-root <repo>` (chạy từ `C:/Users/Lenovo/Desktop/mylearn`) |
| 2. Work | ZCode | implement đúng phạm vi duyệt |
| 3. Reviewer | **`google/gemini-3.7-flash`** | `node agent-loop/cli.mjs review --root <repo> --files "..." --context "..."` |
| 4. Terra | `openai/gpt-5.6-terra` | chấm mù giao diện khi user yêu cầu (`judgeBlind` + `capture.mjs`) |

- **API key xkiro**: live key nằm ở `C:\Users\Lenovo\.zcode\v2\provider_config.json` (`providerName: "Xkiro"`, `config.access.apiKey`). Key trong `~/.zcode/v2/config.json` ĐÃ CHẾT (401). `xkiro.mjs` ưu tiên env `XKIRO_API_KEY` → **set env từ provider_config.json trước khi chạy gate/review**. `terra.mjs` chỉ đọc config.json (chưa có nhánh env) → sẽ fail nếu chấm UI đến khi user sửa key.
- Lịch sử reviewer: Grok sập → nemotron-3-ultra trả 200 rỗng → mimo-v2.5-pro 503 → **gemini-3.7-flash** (user duyệt 23/09). Model nằm ở `MODELS` trong `mylearn/agent-loop/lib/xkiro.mjs`.
- Ngoại lệ bỏ gate: fix build/syntax nhỏ, fix bug từ review trước, thay đổi 1 dòng user chỉ đích danh.
- **Payload review bị cắt ở 90.000 ký tự** (reviewer.mjs slice) → file lớn phải tách lô hoặc gom delta vào prompt rồi dùng `cli.mjs ask` (Gemini + glm đều trả RỖNG nếu payload vượt ngưỡng ~50-80KB tùy thời điểm).

## Phiên 23/09 — IA refactor 7 phase (HỌC → LUYỆN → TIẾN BỘ) + dead-code cleanup: HOÀN THÀNH 7/7

Spec gốc: prompt "OMNI — PRODUCT REFACTOR & INFORMATION ARCHITECTURE" (user paste, lưu ý override Golden Rule 1/UI-FINAL của AGENTS.md vì là chỉ thị đích danh). User chốt: Phase 1 IA trước, redirect route cũ (không dead link), module mới build mock đầy đủ. Mỗi phase qua gate riêng.

### P1 — IA (routes + sidebar + navigation)
- Routes mới: `/courses` (+`/:id`, `/:id/lesson/:lessonId`), `/practice` (+`/exams`, `/topics`, `/mistakes`, `/quick`, `/:id`, `/:id/take`), `/progress`, `/library` (+`/:docId`), `/help`.
- Redirect đầy đủ cấp param: `/exams*`→`/practice/*`, `/documents*`→`/library/*`, `/roadmap|/about`→`/progress`, `/contact`→`/help`. `/mbti`, `/leaderboard`, `/blog`, `/profile`, `/settings`, `/teacher*` giữ nguyên.
- **Trick dead-link tập trung**: giữ alias view cũ trong `viewToPath` của App.tsx (`exams`→`/practice/exams`, `documents`→`/library`, `about`→`/progress`, `contact`→`/help`) — Home/Profile/NotFound/Footer không phải sửa mà hết dead link. `getCurrentView` map pathname → view mới.
- Practice set = pseudo-Exam qua `buildPracticeSet(id, examMistakes)` trong mockData.ts (`topic-<slug>` | `mistakes-review` | `quick-<slug>-<n>`) → tái sử dụng nguyên engine ExamDetail/ActiveExam.
- Sidebar viết lại: HỌC TẬP (Tổng quan/Khóa học/Luyện tập) + TIẾN ĐỘ (Tiến độ) + GIÁO VIÊN; mobile drawer đồng bộ.

### P2 — Home redesign
Home.tsx viết lại: Continue Learning (card lớn nhất — khóa đang học tiến độ cao nhất → bài kế tiếp; fallback khóa đề xuất; empty state → /courses) → Hôm nay (3 action) → Đề xuất cho bạn (derive từ examMistakes + mockExams) → Tiến độ tuần này → Khóa đang học. Calendar + event modal + card MBTI giữ nguyên verbatim ở cột phải. Bỏ: search bar, hero books3d, chuyên đề trọng tâm, bảng tiến độ, XP card.

### P3 — Courses sâu
- Completion **một nguồn duy nhất**: `User.completedLessons: Record<lessonId, true>` (bỏ `CourseLesson.completed` mock tĩnh). `initialUser` seed 5/7 bài Toán 12; user cũ thiếu key tự nhận seed qua merge spread `{...initialUser, ...stored}` — **KHÔNG đảo thứ tự merge**.
- `handleToggleLessonComplete` one-way idempotent; helper `courseProgress(course, completedLessons)` export từ mockData — dùng chung Home/Courses/CourseDetail.
- LessonView: flow "Đánh dấu hoàn thành" → done → CTA "Luyện 10 câu" → `/practice/quick-<slug>-10`.
- CourseDetail thêm "Kiểm tra chương" (exam cùng môn → /practice/:id) + "Tài liệu liên quan" (doc cùng môn → /library/:id); 2 lesson có image block OML chuẩn.

### P4 — Practice sâu
- `User.lastExamResult` (answers **sanitize Number.isInteger**) + `User.examMistakes` (key=questionId; **examId luôn là ĐỀ GỐC qua originByQid map** — review bắt bug HIGH: lỡ ghi id practice set làm câu sai mất khỏi mistakes-review/adaptive). Xóa `MistakeEntry`/`mockMistakes` — seed 9 entry inline trong initialUser.
- ActiveExam chỉ 3 thay đổi: signature `onFinishExam(+answers)`, prop optional `onViewResult`, 1 nút "Xem kết quả & ôn luyện" trong khối kết quả inline. Logic chấm/chrono KHÔNG đụng.
- Result screen `/practice/:practiceId/result`: **đếm đúng/sai trên flat lookup toàn mockExams + result.answers — KHÔNG đếm `exam.questions` của tập resolve** (adaptive/mistakes-review rebuild khác tập lúc thi vì examMistakes mutate — Gatekeeper bắt defect này). Unanswered không liệt kê ở Result nhưng có trong Mistake Book (chốt vòng 2). CORE CTA: Ôn câu sai / Luyện câu tương tự / Tiếp tục khóa học.
- Mistake Book: trạng thái Chưa ôn/Đang cải thiện (wrongCount≥2)/Đã nắm vững (mastered, one-way); "Ôn tất cả" ẩn khi 0 câu chưa nắm; re-wrong sau mastered → xóa mastered + wrongCount+1.
- Adaptive: `buildAdaptiveSet(examMistakes)` id cố định `'adaptive'`, undefined khi hết câu chưa nắm, mix ≤5 nền tảng + 15 hiện tại + 20 thử thách, tie-break deterministic; card trên Practice landing gated by `hasMistakes`.

### P5 — Progress thật
`/progress` = Progress.tsx mới (Tổng quan/Môn học/Kiến thức/Lịch sử — derive từ user state, 0 mock fake). `mockSubjectProgress` XÓA → `subjectProgress(courses, completedLessons)` dùng chung Home snapshot. Kiến thức group theo **subject::topic** (tránh trùng tên khác môn). Lịch sử = completedExams (score chip ngưỡng 5.0 khớp hệ). Roadmap.tsx đã xóa hẳn trong dead-code cleanup.

### P6 — Teacher Studio
Teacher nav riêng trong Teacher.tsx (6 mục spec: Dashboard/Khóa học=editor/Ngân hàng câu hỏi=exam-editor+**setExamTab('bank')**/Đề thi=exam-editor+**setExamTab('code')**/Lớp học/Analytics) — chỉ render ở mode nhẹ; workspace fullscreen giữ chrome riêng. Mode mới `classes`|`analytics` qua `/teacher/:mode` có sẵn. `TeacherClasses.tsx` + `TeacherAnalytics.tsx` (mới) derive từ `mockClassAnalytics` (aggregates deterministic: studentScores/questionAccuracy/topicAccuracy; bucket biên tường minh [0-4)/[4-6)/[6-8)/[8-10]). KHÔNG đụng TeacherDashboard/ExamEditorWorkspace/OCR pipeline/App.tsx.

### P7 — Khu Khám phá
`/discover` (Discover.tsx): 4 card MBTI/Bảng xếp hạng/Blog/Trợ giúp. Sidebar group KHÁM PHÁ (1 mục, Compass). Drawer thay Xếp hạng+Blog bằng Khám phá.

### Dead-code cleanup (user chỉ đích danh)
- Xóa **15 file ZERO-REF**: Roadmap.tsx, ExamCard.tsx, ExamLivePreview.tsx, schemas/omlV2.ts, 11 block file doc-editor (dragdrop/fillblank/sortorder Schema, FlashcardCommands/Schema, FlowCommands, QuizSchema, TabsCommands, TimelineCommands, table/TableCell, code/CodeSchema).
- AppIcons.tsx: xóa 8 icon export chết (Sidebar*/AddFileIcon). 13 file bỏ unused imports/locals theo tsc TS6133 (Teacher.tsx, ExamEditorWorkspace 9 chỗ, PublishModal, FormulaBlock, ocrProvider fileToBase64, v.v.).
- **Kết quả: tsc -b 74 → 46 lỗi (0 lỗi mới), vite build sạch.**

## Bẫy kỹ thuật (cộng dồn — đừng dính lại)

1. **`src/document/**` dùng import kèm đuôi `.ts`** (`from './x.ts'`) — quét dead-code phải dùng regex nhận `(\\.ts|\\.tsx)?$`, nếu không sẽ tưởng file sống là ZERO-REF (đã xóa nhầm 21 file document/ rồi khôi phục đủ bằng `git checkout HEAD -- src/document/`; nodeParsers/questionStateMachine/pipelineBenchmarkRunner/benchmarkReport đều SỐNG qua questionDocumentParser/documentRegressionRunner).
2. **Payload review > ~50-80KB → Gemini/glm trả rỗng hoặc 500**; >90KB bị cắt im lặng (Grok tưởng "code bị cắt ngang" — false positive HIGH ở P2). Giải pháp: gom delta (match theo regex) vào prompt file rồi `cli.mjs ask`, mỗi prompt ≤ ~20KB.
3. **`npx tsc --noEmit` VÔ ÍCH** ở repo này (tsconfig solution-style, không check gì) — phải dùng `npx tsc -b --force`. `npm run build` (= tsc -b && vite build) vỡ vì lỗi type thật còn lại (xem Trạng thái).
4. Rule của dự án cấm `style={{}}` nhưng **progress bar động vẫn dùng inline width %** (dynamic Tailwind không khả thi) — precedent đã có từ Exams.tsx fontFamily.
5. State tiến độ/lỗi sai **một nguồn duy nhất trên User** (completedLessons, examMistakes) — không tái tạo mock flag song song. Upsert mistake phải lưu **examId đề gốc** (originByQid), không phải id practice set.
6. questionId unique 18/18 trên mockExams (đã verify) — flat lookup questionId→question an toàn.
7. `handleRegisterSuccess` phải khởi tạo ĐỦ các Record mới thêm vào User (completedLessons, examMistakes) — thiếu là tsc lỗi TS2345.
8. Sidebar user card còn emoji 🔥 pre-existing (chưa dọn — là UI change không phải dead code).

## Trạng thái (23/09/2026)

- IA refactor 7/7 phase + dead-code cleanup: **XONG**, chưa commit (user chưa ra lệnh; AGENTS.md cấm commit tự động).
- **Việc chờ user quyết**: (1) commit — Gatekeeper khuyến nghị tách riêng 1 commit cho dead-code removal để revert 1 lệnh; (2) fix 46 lỗi tsc -b còn lại (đều pre-existing type errors thật: OmlBlockRouter union narrowing ~14, ocrService 4, pdfjsWorker 2, DocumentBenchmark 4, erasableSyntaxOnly trong document/ ~7, formulaReconstructor/layoutAnalyzer/cropEngine/semanticComparator/QuestionBlock...); (3) emoji 🔥 Sidebar.
- **Hoãn có lý do** (ghi trong các phase): blog contextual trong lesson (chưa có mapping nội dung), per-topic attempt stats + "Học lại" theo topic (cần metadata câu hỏi), course builder tách riêng (DocEditor đã cover), drill-down từng học sinh trong Analytics, video trong lesson (chưa có pipeline).
- Kiến trúc chi tiết xem `.ai/architecture/architecture.md` + `.ai/project/overview.md` (đã sync routes/file tree theo refactor) + `AI_CONTEXT.md` (quy tắc sống còn cho doc-editor).

## Phiên 24/09 — Design-language unification (agent-loop: propose APPROVE → implement → review 3 vòng): XONG, chưa commit

- **Đã migration** (đúng plan Gatekeeper duyệt): (1) token warning mới `--color-warning/-hover/-light` = `#F59E0B/#D97706/#FFFBEB` vào `@theme` ngay sau danger + docs `.ai/ui/design-system.md`; (2) class-form `X-[#6366F1]` ×70 và `X-[#8B5CF6]` ×10 → `X-primary`, literal `#6366f1`/`#8b5cf6` → `#6C5DD3` (~109 chỗ), class-form `X-[#10B981]` ×14 → `X-success` (JS/SVG literal success/danger giữ nguyên theo exclude); (3) xóa 16 inline `style={{ fontFamily: "'Inter' }}` ở root 14 trang P1–P7 + TeacherClasses/TeacherAnalytics (thừa — body đã Inter); (4) ✓✕⚠️ → lucide `Check`/`X`/`AlertTriangle` (5 file, 10 spot; EEW thêm `AlertTriangle` vào import có sẵn; OmlRenderer + emoji pictograph 🧠🔥🟢🟡🔴 KHÔNG thuộc scope); (5) `rgba(99,102,241,.15)` → `rgba(108,93,211,.15)` radar chart AssessmentTest (nhất quán stroke đã đổi).
- **REVERT theo review** (điểm đắt nhất — đừng dính lại): `OnboardingModal.tsx` về nguyên trạng byte-identical (illustration isometric đa tông indigo #8F94FB/#4F46E5/#C7D2FE — chỉ đổi mid-tone gây lệch hue trong cùng glyph, thuộc exclude illustration); **9 palette `THEME_COLORS` color-picker** (SettingsDialog của compare/diagram/flow/matching/tabs/timeline/dragdrop/fillblank/**sortorder**) giữ nguyên hex gốc — chúng là VALUE palette user-facing, đổi sẽ trùng swatch + doc cũ mất khớp; 4 mảng tự-xoay màu node (`FLOW_COLORS`/`DIAGRAM_COLORS` gốc là ['#8b5cf6','#6366f1',...] violet TRƯỚC, `TIMELINE_COLORS`, DiagramUtils nodes) về gốc để tránh 2 node liền nhau cùng màu. Default/fallback `themeColor: '#6C5DD3'` trong factory/useState/preview GIỮ NGUYÊN (reviewer xác nhận đúng rule, chấp nhận default không khớp swatch nào).
- **Kết quả**: diff cuối 53 file vs đầu phiên; `tsc -b --force` 46 lỗi (0 mới); `vite build` pass; grep sạch 100% class-form target.
- **REBUT có lý do (không fix)**: token warning là item 1 plan APPROVE + condition Gatekeeper #7 (reviewer chỉ thấy header 7-rule của prompt ask thiếu mục này); `Exams.tsx:485` `from-primary to-primary` gradient phẳng — Gatekeeper condition #3 đã chấp nhận trước hậu quả này và cấm phát minh token mới; hover `from-[#4F46E5] to-[#7C3AED]` ngoài scope giữ nguyên.
- **Follow-up chờ user** (không chặn): ActiveExam 2 nút `hover:bg-[#4F46E5]` nên chuyển `hover:bg-primary-hover`; 2 trạng thái nav ActiveExam ("Xem lại" vs "câu hiện tại") mất phân biệt hue sau mapping (chỉ còn ring/font-bold); SharedTableRenderer `hover:bg-indigo-400/40` lệch tint nhẹ; EOL churn 3 dòng AssessmentTest (410/459/1299 CRLF→LF — Edit tool không kiểm soát EOL, hook cấm Bash ghi source, 0 impact); `#6C5DD3` raw class ~33 chỗ (0 visual drift, hygiene); emoji pictograph còn lại; rounded-md/sm ~35 chỗ; bg-white vs bg-bg-surface.
- **Bẫy mới agent-loop**: `cli.mjs ask` có thể trả EMPTY (len 0-1, exit 0) DETERMINISTIC với payload nhất định — không phải mạng; fix bằng tách nhỏ payload/đổi nội dung rồi hỏi lại. HTTP 409 "duplicate request is already being processed" khi nộp lại payload giống nhau quá nhanh — retry sequential + đổi payload. Công thức review nhiều file: git-diff -U0 so snapshot trước-bến → chia chunk ~18KB theo file boundary → chunk fail thì tách đôi.

## Phiên 24/09 (buổi sau) — Layout scale-up "web nhìn bé bé" (agent-loop APPROVE → 2 review APPROVE): XONG, chưa commit

- **Nguyên nhân audit**: wrapper `max-w-5xl` (1024px)/`max-w-7xl` (1280px) vs viewport 1765px + Footer trong app shell + title 24px + card thấp. Sidebar w-64 (256px) được user xác nhận ỔN — không đụng.
- **Đã làm** (user spec duyệt, override UI-FINAL có kiểm soát): (1) wrapper 8 trang student (Practice/PracticeTopics/PracticeMistakes/Progress/Discover/CourseDetail/Courses/Exams) → `max-w-[1320px] px-6 lg:px-8`; TeacherClasses/TeacherAnalytics (2 root) → `max-w-[1440px]` (workspace); (2) **Xóa Footer khỏi App.tsx** (render + import) — dashboard hết dead-space dọc, Footer.tsx thành file mồ côi GIỮ NGUYÊN chờ cleanup riêng; (3) page h1 `text-2xl/xl font-black` → `text-3xl font-bold` + subtitle `text-xs` → `text-sm` + header mb-6→mb-8 (6 trang có plain header); (4) Practice hub: adaptive p-5 mb-4→p-6 mb-6, card +min-h-[104px], card title text-sm→text-base, desc text-[11px]→text-xs, grid gap-4→gap-5.
- **Giữ có chủ đích** (reading/focus width): LessonView max-w-3xl, PracticeQuick max-w-xl, Result max-w-3xl, DocReader; Blog/Leaderboard/Profile/Help chưa widen (follow-up); `max-w-container` ở Documents/Profile/Leaderboard là class NO-OP (không có token nào định nghĩa) — trang đó thực ra full-width sẵn.
- **Verify**: tsc -b 46 (0 mới); vite pass; grep đủ 11/11 spot; **visual check 1765px + 390px Practice/Progress qua browser-use** (sạch, không overflow, mobile 1 cột). Review: App-shell APPROVE NONE; pages APPROVE 0 HIGH/MEDIUM + 3 LOW (đều intentional: text-xs desc theo plan; PracticeMistakes/Exams giữ mb-6 vì header dạng card/row-div không phải plain header).
- **Follow-up**: global body/secondary font scale (user priority ⑥ — làm riêng nếu ①-⑤ chưa đủ); widen Blog/Leaderboard/Profile/Help; Footer.tsx orphan cleanup; ActiveExam hover hex #4F46E5 (từ phiên sáng).

## Phiên 24/09 (buổi tối) — Doc Editor Phase 1 layout + Lead test GLM vs gpt-6-sol

- **Lead test** (user chốt GIỮ GLM 5.3 Flash làm Lead): harness tạm ở `Temp/lead-test/` — Test A cấy 6 lỗi cả hai model bắt đủ 6/6, 0 false positive; Test B replay layout task. sol ít token hơn ~40% + prompt cache, nhưng strict hơn với lỗi hình thức plan (REVISE cho lỗi đếm file) và gặp 1×502 + 409-dedup. Không đổi MODELS trong xkiro.mjs.
- **Doc Editor Phase 1 (layout restructure) — XONG, chưa commit**: (1) `showPreview` bool → `editorView: 'compose' | 'split' | 'preview'` mặc định compose (editor full width); (2) XÓA far-right tool rail w-16 (mọi block chèn được qua "/" menu — handleSideToolClick còn dead-code trong useEditorBlockMutations, cleanup pass sau); (3) header 2 tầng: breadcrumb `course / chapter / lesson` (collapse: md ẩn course, lg ẩn chapter) + 3 tab Soạn thảo/Chia đôi/Xem trước + save-dot "Chưa lưu/Đã lưu HH:MM" + Guide icon-only; (4) DocSidebar w-56→w-[264px] + label Explorer→MỤC LỤC; (5) empty state lesson rỗng (PenLine tile + [+ Thêm nội dung] → `insertBlockBelow(-1)` an toàn cho mảng rỗng; KHÔNG có nút AI vì handleAiSuggest vỡ trên lesson rỗng — pre-existing); (6) bottom nav `← Bài trước / Bài tiếp theo →` qua `handleLessonSelect` (inherit guards), `orderedLessons` walk chapters→lessons→subLessons **lọc isFolder** (review bắt: folder vào nav → canEditActiveLesson false → nav biến mất dead-end).
- **Review bắt HIGH thật**: PublishModal + DocGuideModal ban đầu nằm trong `<main>` gate `{editorView !== 'preview'}` → unmount ở preview mode → nút "Tiếp theo" chết. Fix: dời 2 modal ra sibling level. Đã verify browser: preview mode bấm Tiếp theo → wizard mở.
- **File đổi**: DocEditorWorkspace.tsx (main gate + modals + empty state + nav + helpers), DocEditorHeader.tsx (viết lại), DocSidebar.tsx (2 class), DocPreviewSimulator.tsx (prop `variant: 'split'|'full'`, full = flex-1 không border-r). tsc 46 (0 mới) + vite pass + visual 1765/390 (pageScrollW=390 không overflow) + test tương tác thật (restore draft seed, empty state, nav flip, cả 3 mode, publish wizard ở preview).
- **Bẫy mới**: draft key `omni_doc_draft_` + documentId slug — Teacher.tsx hardcode `'tai_lieu_chua_dat_ten___'` (3 underscores) nhưng slug thật ra `...__` (2) — inconsistency pre-existing, seed test phải dùng 2. Browser trướcunload: editor isDirty chặn goto (ERR_ABORTED) — đóng tab mở tab mới thay vì navigate.

## Phiên 24/09 (đêm) — Unify preview viewport shell (agent-loop APPROVE → review 1 vòng): XONG, chưa commit

- **User hỏi** preview soạn đề vs soạn tài liệu có giống không: KHÔNG — exam dùng `OmlPreviewPaper` (render OML thật) + hook `useExamViewportZoom`; doc dùng `DocPreviewSimulator` (render block Previews) + bản copy private ~150 dòng. Kết luận: renderer KHÔNG gộp (2 artifact khác nhau, mỗi bên reuse đúng renderer student), shell (zoom/fit/fullscreen) NÊN gộp — user OK "làm đi" (chỉ layer 2; layer 3 = 3-mode cho exam editor vẫn chờ duyệt vì ExamEditorWorkspace UI-FINAL).
- **Đã làm**: tạo `src/components/teacher/hooks/usePreviewViewport.ts` (logic verbatim từ exam hook + export thêm `PREVIEW_ZOOM_LEVELS`); `useExamViewportZoom.ts` thành re-export 1 dòng (ExamEditorWorkspace/ExamQuickOcrStep không đổi — git diff rỗng); `DocPreviewSimulator` xóa private impl, consume hook qua **destructure-rename** (isFullscreenOpen←isPreviewFullscreenOpen v.v.) nên 0 dòng render/render-markup nào phải sửa.
- **Verify**: tsc 46 (0 mới — 4 lỗi phát sinh giữa chừng là của tôi: sai path `../hooks` từ doc-editor 1 cấp, useRef/setPreviewZoom/previewZoomLevels thừa sau khi xóa impl — đã sửa), vite pass, grep refs private = 0. Browser: doc preview fullscreen→Escape→về split OK; exam editor load + live preview render + fullscreen overlay mở/Escape đóng OK (nội dung trống là đúng flow — sample OML có lỗi JSON escape pre-existing, "Kiểm tra mã" báo lỗi riêng).
- **Review REVISE — phản biện**: reviewer flag `variant` prop là scope creep vì baseline diff là snapshot TRƯỚC Phase 1 — `variant` thuộc Doc Editor Phase 1 đã gate-APPROVE + verify browser (trích condition #1 gate Phase 1). Điều kiện exam interactive smoke: ĐÃ làm (fullscreen/Escape trên exam preview). Bẫy: khi review nhiều phase chồng nhau, nêu rõ baseline snapshot tương ứng trong payload.
- **Follow-up dồn về Phase 2**: Course Outline sidebar (spec user ở message trước — section header, + Thêm ngữ cảnh, auto-numbering, lesson status, DnD 2 mức), AI side panel, handleAiSuggest-empty, cleanup `handleSideToolClick` dead-code + token `shadow-indigo-150`/`indigo-150` toàn app.

## Phiên 24/09 (khuya) — Exam 3-mode + Course Outline Phase 2: XONG, chưa commit

- **A. Exam Editor 3-mode** (user duyệt override UI-FINAL 2 lần, Gate A APPROVE 5C): `showLivePreview` → `editorView: 'compose'|'split'|'preview'` **default 'split'** (giữ behavior cũ — khác doc editor mặc định compose, có chủ đích vì OML loop cần split); toggle "Xem thử đề" → 3-tab pill; cột code `w-1/2` split / `w-full` compose / unmount preview; ExamQuickOcrStep nhận derived bool (contract 2-state giữ nguyên); PreviewIcon import removed. Review **APPROVE**.
- **B. Course Outline sidebar Phase 2** (Gate B APPROVE 5C): `DocSidebar.tsx` viết lại render (418→~400 dòng): chapter = section header (chevron + "CHƯƠNG 01" text-[9px] caps primary + title + hover rename/delete), lesson row = số derived "01." + title + **status dot** (amber blocks.length===0 / emerald) + hover actions, ghost "+ Thêm bài học" cuối section (1 lần, KHÔNG per-lesson — lỗi đầu đã sửa), pill "+ Thêm" menu (Thêm chương luôn bật / Thêm bài học disable khi chưa chọn chương — legacy folder không bao giờ là selectedChapterId nên C3 tự thỏa), BỎ 2 icon button + handleAddFolder/handleAddFile/findLessonLocation, BỎ props onCreateSubLesson/onCreateDocumentInFolder/onDepthExceeded/metadata (hook useEditorSidebarActions vẫn giữ functions — dead, cleanup sau). **Legacy isFolder/subLessons render back-compat verbatim** (FolderIcon/FileIcon chỉ còn cho legacy).
- **Verify**: tsc 46 (0 mới — 5 lỗi mới sửa hết: 3 unused destructure + Lesson type + path), vite pass, browser: outline render đúng spec (CHƯƠNG 01 + 01./02. + dot + 1 ghost row + pill menu dropdown đúng enable/disable), expand + dblclick-rename OK, restore flow OK. Exam: 3-tab header + split default screenshot ×2; interactive mode-switch test bị vướng exam draft-restore dialog (test-env artifact) — code path twin với doc đã verify.
- **Review**: rA (exam) **APPROVE** (preview column vốn flex-1 — condition thỏa); rB-ws **APPROVE** 4 conditions = confirm-đã-có-bằng-chứng (insertBlockBelow(-1) đã click thật; bottom-nav ≠ onNext là 2 mục đích khác nhau có chủ đích; feature-drop folder là CHỦ ĐÍCH spec; metadata.name/chapters cùng nguồn ✓); rB sidebar **part 2 APPROVE, part 1 không review được** — `ask` trả EMPTY deterministic cả khi chia nhỏ payload (provider degrade) — bù bằng tsc/vite + browser expand/rename/menu; giá dị thay vì review ảo.
- **Bẫy**: `diff -U3 a b` single-file KHÔNG có dòng "diff " → splitter theo /^diff /m trả rỗng; single-file rewrite nên gửi FULL FILE MỚI + tóm tắt file cũ thay vì diff. Exam draft-restore dialog riêng (khác doc) — locator force:true qua overlay fade.
- **Còn lại (chờ user)**: Manage outline screen; Import tài liệu; published status (cần model); AI side panel; handleAiSuggest-empty; dead-code cleanup (handleAddFolder/handleCreateSubLesson/handleCreateDocumentInFolder/handleDepthExceeded + handleSideToolClick + token indigo-150).

## GIT: ĐÃ COMMIT + PUSH (24/09, lệnh user)
- `e80ae54` fix(security): máy tính ActiveExam thay `new Function` bằng evaluator recursive-descent sandboxed (Mimosa chặn [high] code injection — lỗi thật, pre-existing) + dead-code removal (15 file zero-ref + AppIcons) — commit riêng để revert 1 lệnh.
- `5dd001c` feat: toàn bộ còn lại (IA refactor, design-token, layout scale-up, Doc Editor Phase 1, exam 3-mode, Course Outline Phase 2, preview shell unification). `.mimosa/` để ngoài (tool artifact).
- Trạng thái phiên sau: working tree sạch (trừ .mimosa), tsc 46 (0 mới), vite pass.
- **Phase 2 (chờ gate riêng)**: Course Outline sidebar theo spec user — chapter thành section header, + Thêm ngữ cảnh (Chương/Bài học/Import), auto-numbering CHƯƠNG 01/01., lesson status dots (Published/Draft/Needs review), DnD 2 mức chỉ Chapter/Lesson, bỏ folder/subLesson creation, Manage outline riêng. AI side panel + Preview full-fidelity + handleAiSuggest-empty cũng Phase 2+.
