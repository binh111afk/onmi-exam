# OML — Onmi Markup Language Specification v2.0

## What is OML?

OML (Onmi Markup Language) is a **JSON-based proprietary document format** for describing educational exam content in the Onmi platform. It is the primary interchange format between the Teacher Studio (authoring) and the student exam engine (rendering).

**Current version:** `2.0`  
**Format:** Valid JSON  
**File encoding:** UTF-8

OML is **not** a general markup language. It is specifically designed for:
- Multiple-choice questions
- True/False questions
- Fill-in-the-blank questions
- Supporting context content (text, images, formulas, tables)

---

## Document Structure

An OML document is a JSON object with three top-level fields:

```json
{
  "version": "2.0",
  "info": { ... },
  "content": [ ... ]
}
```

### `version` (required)
String. Must be `"2.0"` or `"1.0"`. Any other value is rejected by the parser.

### `info` (required)
Object containing exam metadata.

### `content` (required)
Array of content blocks (questions, context, etc.).

---

## `info` Object Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | **Yes** | Exam title displayed at the top |
| `subject` | `string` | No | Subject (e.g., "Sinh học", "Toán học") |
| `grade` | `number \| string` | No | Grade level (e.g., `10`, `"10"`, `"Đại học"`) |
| `time` | `number` | No | Exam duration in minutes |
| `type` | `string` | No | Exam type: `"exam"`, `"practice"`, `"worksheet"` |
| `difficulty` | `string` | No | `"easy"`, `"medium"`, or `"hard"` |
| `description` | `string` | No | Short description of the exam |
| `author` | `string` | No | Author name |
| `allowReview` | `boolean` | No | Whether students can review answers |
| `shuffle` | `boolean` | No | Whether to shuffle question order |
| `totalQuestion` | `number` | No | Total question count override |

**Minimal valid `info`:**
```json
{
  "title": "Đề kiểm tra Sinh học 10"
}
```

**Full `info` example:**
```json
{
  "title": "Đề kiểm tra giữa kỳ I — Sinh học 10",
  "subject": "Sinh học",
  "grade": 10,
  "time": 45,
  "type": "exam",
  "difficulty": "medium",
  "author": "Nguyễn Văn A",
  "allowReview": true,
  "shuffle": false
}
```

---

## Content Block Types

All blocks in the `content` array must have a `type` field. The parser will report an error for any block missing `type`.

### Context Blocks (non-question content)

#### `heading`
```json
{
  "type": "heading",
  "level": 1,
  "text": "Phần I: Trắc nghiệm"
}
```
- `level`: `1`, `2`, or `3`
- `text`: heading text (required)

#### `paragraph`
```json
{
  "type": "paragraph",
  "text": "Đọc đoạn văn sau và trả lời các câu hỏi:"
}
```

#### `divider`
```json
{
  "type": "divider"
}
```
Renders a horizontal rule to separate sections.

#### `quote`
```json
{
  "type": "quote",
  "text": "Tế bào là đơn vị cơ bản của sự sống.",
  "cite": "Watson & Crick, 1953"
}
```

#### `callout`
```json
{
  "type": "callout",
  "variant": "info",
  "title": "Lưu ý",
  "content": "Mỗi câu hỏi chỉ có một đáp án đúng."
}
```
- `variant`: `"info"`, `"warning"`, `"success"`, `"error"`
- `title`: optional callout header
- `content`: callout body text (required)

#### `image`
```json
{
  "type": "image",
  "src": "https://example.com/cell-diagram.png",
  "alt": "Sơ đồ cấu trúc tế bào",
  "caption": "Hình 1: Cấu trúc tế bào nhân thực",
  "size": "medium"
}
```
- `src`: image URL (required)
- `alt`: accessibility text
- `caption`: visible caption below image
- `size`: `"small"`, `"medium"`, `"full"` (defaults to `"medium"`)

#### `image-group`
```json
{
  "type": "image-group",
  "layout": "horizontal",
  "items": [
    { "src": "https://example.com/img1.png", "alt": "Hình A" },
    { "src": "https://example.com/img2.png", "alt": "Hình B" }
  ]
}
```
- `layout`: `"horizontal"`, `"vertical"`, `"grid-2x2"`
- `items`: array of image objects (same fields as `image` minus `type`)

#### `formula`
```json
{
  "type": "formula",
  "latex": "E = mc^2",
  "display": "block"
}
```
- `latex`: LaTeX string (required)
- `display`: `"inline"` or `"block"` (defaults to `"block"`)

#### `table`
```json
{
  "type": "table",
  "caption": "Bảng so sánh tế bào nhân sơ và nhân thực",
  "headers": ["Đặc điểm", "Tế bào nhân sơ", "Tế bào nhân thực"],
  "rows": [
    ["Màng nhân", "Không có", "Có"],
    ["Kích thước", "1–10 μm", "10–100 μm"]
  ]
}
```

#### `list`
```json
{
  "type": "list",
  "ordered": false,
  "items": [
    "Tế bào nhân sơ không có màng nhân.",
    "Tế bào nhân thực có hệ thống màng nội chất."
  ]
}
```

---

### Question Blocks

All question blocks have `"type": "question"` and a `subType` discriminator.

#### Common Fields (all question types)

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `"question"` | **Yes** | Block type identifier |
| `id` | `string \| number` | **Yes** | Unique question ID within the document |
| `question` | `string` | **Yes** | Question text/prompt |
| `subType` | `string` | No | `"choice"`, `"true-false"`, `"fill-blank"` (defaults to `"choice"`) |
| `points` | `number` | No | Point value for this question |
| `difficulty` | `string` | No | `"easy"`, `"medium"`, `"hard"` |
| `tags` | `string[]` | No | Topic tags |
| `image` | `OmlImageAsset` | No | Image attached to the question |
| `explanation` | `string` | No | Shown to students after answering |

#### `subType: "choice"` — Multiple Choice
```json
{
  "type": "question",
  "id": 1,
  "question": "Bào quan nào có chức năng tổng hợp protein?",
  "subType": "choice",
  "options": [
    { "id": "A", "content": "Ty thể" },
    { "id": "B", "content": "Ribosome" },
    { "id": "C", "content": "Lưới nội chất trơn" },
    { "id": "D", "content": "Bộ máy Golgi" }
  ],
  "answer": ["B"],
  "explanation": "Ribosome là nơi tổng hợp protein từ các axit amin.",
  "difficulty": "easy",
  "points": 0.25
}
```
- `options`: array of `{ id, content }` objects (required)
- `answer`: array of option IDs (usually 1, supports multiple correct answers)

#### `subType: "true-false"` — True/False (Vietnamese THPT style)
```json
{
  "type": "question",
  "id": 2,
  "subType": "true-false",
  "question": "Xét các phát biểu sau về tế bào nhân sơ:",
  "options": [
    { "id": "a", "content": "Tế bào nhân sơ không có màng nhân." },
    { "id": "b", "content": "Tế bào nhân sơ có ribosome 80S." },
    { "id": "c", "content": "Vi khuẩn là sinh vật nhân sơ." },
    { "id": "d", "content": "Tế bào nhân sơ luôn có thành tế bào." }
  ],
  "answer": ["a", "c"]
}
```
- Statements listed in `options`
- `answer`: IDs of statements that are **TRUE** (others are assumed FALSE)
- Standard format: 4 statements (a, b, c, d)

#### `subType: "fill-blank"` — Fill in the Blank
```json
{
  "type": "question",
  "id": 3,
  "subType": "fill-blank",
  "question": "Tốc độ ánh sáng trong chân không là [blank-1] m/s.",
  "answer": ["3×10⁸"],
  "unit": "m/s"
}
```
- `[blank-1]`, `[blank-2]` etc. in the `question` text mark blank positions
- `answer`: array of accepted strings, ordered by blank number
- `unit`: optional unit displayed after the input field
- `units`: per-blank units array for multi-blank questions
- `showAnswer`: `true` = answer mode (teacher preview), `false` = student input mode

---

### `question-group` Block

Groups a shared reading passage/context with multiple related questions:

```json
{
  "type": "question-group",
  "id": "qg-1",
  "context": [
    {
      "type": "paragraph",
      "text": "Đọc đoạn văn sau..."
    },
    {
      "type": "image",
      "src": "https://example.com/passage-image.png",
      "size": "full"
    }
  ],
  "questions": [
    {
      "type": "question",
      "id": 10,
      "question": "Tác giả muốn nói điều gì?",
      "subType": "choice",
      "options": [...],
      "answer": ["A"]
    },
    {
      "type": "question",
      "id": 11,
      "question": "...",
      "subType": "choice",
      "options": [...],
      "answer": ["C"]
    }
  ]
}
```
- `id`: unique identifier for the group (required)
- `context`: array of context blocks (paragraph, image, formula, etc.) — required
- `questions`: array of question blocks — required

---

## Complete OML Document Example

```json
{
  "version": "2.0",
  "info": {
    "title": "Đề kiểm tra Sinh học 10 — Chương 1",
    "subject": "Sinh học",
    "grade": 10,
    "time": 45,
    "difficulty": "medium"
  },
  "content": [
    {
      "type": "heading",
      "level": 1,
      "text": "PHẦN I: TRẮC NGHIỆM (7 điểm)"
    },
    {
      "type": "callout",
      "variant": "info",
      "content": "Mỗi câu hỏi có một đáp án đúng. Khoanh tròn chữ cái đứng trước đáp án đúng."
    },
    {
      "type": "question",
      "id": 1,
      "question": "Đơn vị cấu trúc và chức năng cơ bản của cơ thể sống là gì?",
      "subType": "choice",
      "options": [
        { "id": "A", "content": "Phân tử" },
        { "id": "B", "content": "Tế bào" },
        { "id": "C", "content": "Mô" },
        { "id": "D", "content": "Cơ quan" }
      ],
      "answer": ["B"],
      "explanation": "Tế bào là đơn vị cấu trúc và chức năng cơ bản của mọi cơ thể sống.",
      "difficulty": "easy",
      "points": 0.25
    },
    {
      "type": "question-group",
      "id": "qg-1",
      "context": [
        {
          "type": "paragraph",
          "text": "Dựa vào hình ảnh sau, trả lời câu hỏi từ câu 5 đến câu 7:"
        },
        {
          "type": "image",
          "src": "https://example.com/cell.png",
          "alt": "Cấu trúc tế bào nhân thực",
          "size": "medium"
        }
      ],
      "questions": [
        {
          "type": "question",
          "id": 5,
          "question": "Bào quan được đánh dấu số 1 trong hình là:",
          "subType": "choice",
          "options": [
            { "id": "A", "content": "Ty thể" },
            { "id": "B", "content": "Nhân tế bào" },
            { "id": "C", "content": "Ribosome" },
            { "id": "D", "content": "Lưới nội chất" }
          ],
          "answer": ["B"]
        }
      ]
    }
  ]
}
```

---

## Parser Behavior

The parser (`src/components/ExamEditor/OmlRenderer/parser.ts`) performs two-pass validation:

### Pass 1: JSON Syntax
- Calls `JSON.parse(input)`
- If fails: translates error to Vietnamese, reports line/column number
- Returns `success: false` with syntax error details

### Pass 2: Schema Validation
- Checks `version` field
- Checks `info` object presence and `info.title` existence
- Checks `content` array existence
- For each block: validates `type` field presence
- For `question` blocks: validates `id`, `question`, `options`, `answer`
- For `question-group` blocks: validates `id`, `context`, `questions`

### `OmlParseResult` Shape
```typescript
interface OmlParseResult {
  success: boolean;
  data: OmlDocumentV2 | null;       // null if any error
  errors: OmlValidationError[];     // array of error objects
  warnings: string[];               // non-blocking warnings
  metadata: {
    title: string;
    subject: string;
    grade: number | string;
    time: number;
    questionCount: number;          // total questions (including groups)
    version: string;
  };
}
```

---

## Common Mistakes

### 1. Missing `id` on questions
```json
// WRONG
{ "type": "question", "question": "What is..." }

// CORRECT
{ "type": "question", "id": 1, "question": "What is..." }
```

### 2. `answer` must be an array
```json
// WRONG
{ "answer": "A" }

// CORRECT
{ "answer": ["A"] }
```

### 3. `options` items must have `id` and `content`
```json
// WRONG
{ "options": ["Option A", "Option B"] }

// CORRECT
{ "options": [{ "id": "A", "content": "Option A" }, { "id": "B", "content": "Option B" }] }
```

### 4. `fill-blank` questions: answer must be array of strings
```json
// WRONG
{ "subType": "fill-blank", "answer": 42 }

// CORRECT
{ "subType": "fill-blank", "answer": ["42"] }
```

### 5. `question-group` requires both `context` and `questions`
Both fields must be present as arrays, even if empty.

### 6. Trailing commas
OML is strict JSON — no trailing commas allowed.

### 7. Single quotes
JSON requires double quotes for all strings.

### 8. Inventing new block types
Only use block types defined in `src/types/oml.ts`. The parser will silently render unknown types as fallback divs.

---

## Best Practices

1. **Always set `id` fields as sequential integers** (1, 2, 3...) for readability.
2. **Use `explanation` fields** — they enhance student learning.
3. **Keep `question` text concise** — long question text wraps poorly in the exam paper.
4. **Use `heading` blocks** to separate sections (Phần I, Phần II).
5. **Use `callout` with `variant: "info"`** for exam instructions.
6. **Group related questions** with `question-group` to provide shared context.
7. **Set `difficulty`** per question to enable analytics.
8. **Test the document** using the OML validator before publishing.

---

## Version History

| Version | Status | Notes |
|---|---|---|
| `1.0` | Supported (legacy) | Simple flat question list in `questions` array |
| `2.0` | **Current** | `content` array with mixed block types, `question-group` support |

The parser accepts both versions. Version `2.0` is required for all new exams.
