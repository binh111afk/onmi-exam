# Omni AI Context

Tài liệu này cung cấp ngữ cảnh kiến trúc cốt lõi của dự án Omni để các AI Agent có thể nhanh chóng nắm bắt cấu trúc và định hướng phát triển của hệ thống.

---

## 1. TẦM NHÌN HỆ THỐNG (SYSTEM VISION)

**Omni** là Siêu nền tảng Học tập & Khảo thí cá nhân hóa dành cho học sinh Việt Nam (từ tiểu học đến đại học). Hệ thống được chia thành hai phân hệ chính:

### A. Phân hệ Học sinh (Student Portal)
Cung cấp môi trường học tập, luyện đề và định hướng nghề nghiệp cá nhân hóa.
*   **Trạng thái hiện tại:** Đang ở dạng giao diện (UI) sơ khai, giả lập dữ liệu tĩnh qua LocalStorage.
*   **Các tính năng chính:**
    *   **Dashboard:** Quản lý tiến trình học tập, tích điểm EXP, gamification và bảng xếp hạng (Leaderboard).
    *   **Hệ thống Đề thi (Exam Engine):** Luyện tập và thi thử các bộ đề có cấu trúc đa dạng.
    *   **Trình đọc Tài liệu (Doc Reader):** Đọc tài liệu học tập, học liệu số hỗ trợ ghi chú và đánh dấu.
    *   **Lộ trình cá nhân (Personal Roadmap):** Gợi ý lộ trình học tập tùy biến theo năng lực.
    *   **Đánh giá MBTI:** Công cụ trắc nghiệm tính cách định hướng nghề nghiệp.

### B. Phân hệ Giáo viên (Teacher Studio)
Cung cấp bộ công cụ mạnh mẽ để giáo viên biên soạn, thiết kế đề thi và tài liệu học tập.
*   **Trạng thái hiện tại:** Trọng tâm phát triển hiện tại, đặc biệt là bộ soạn thảo nội dung phong phú (Rich Editor).
*   **Các tính năng chính:**
    *   **Exam Editor & Document Editor:** Cho phép biên soạn trực quan bằng cấu trúc khối (block-based), sau đó biên dịch và lưu trữ dưới dạng OML (Onmi Markup Language).
    *   **OCR Upload:** Trích xuất tự động văn bản từ hình ảnh hoặc PDF để tạo câu hỏi/tài liệu nhanh chóng.
    *   **Teacher Dashboard:** Quản lý kho câu hỏi, danh sách tài liệu và đề thi đã xuất bản.

---

## 2. BẢN ĐỒ THƯ MỤC CỐT LÕI (PROJECT STRUCTURE)

Dưới đây là cấu đồ các thư mục và file quan trọng trong thư mục [src](file:///c:/Users/Lenovo/Desktop/omniexam/src) của dự án Omni:

```text
src/
├── assets/          # Chứa tài nguyên tĩnh như logo, hình ảnh minh họa
├── components/      # Các component tái sử dụng trong hệ thống
│   ├── common/      # Component dùng chung (nút bấm, input, modal...)
│   ├── ExamEditor/  # Bộ renderer cho định dạng OML
│   └── teacher/     # Phân hệ Teacher Studio
│       ├── doc-editor/   # Trình soạn thảo tài liệu (Document Rich Editor)
│       ├── exam-editor/  # Trình soạn thảo đề thi (Exam Editor)
│       └── file-uploader/# Component xử lý upload file và OCR
├── data/            # Mock data phục vụ cho quá trình demo và chạy thử (mockData.ts)
├── pages/           # Các trang chính tương ứng với các route trong hệ thống
│   ├── Home.tsx     # Trang chủ phân hệ học sinh
│   ├── Exams.tsx    # Danh sách đề thi cho học sinh
│   ├── ActiveExam.tsx# Giao diện làm bài thi thực tế của học sinh
│   ├── DocReader.tsx# Trình đọc tài liệu của học sinh
│   ├── Teacher.tsx  # Cổng vào Dashboard của Giáo viên
│   └── ...          # Các trang MBTI, Lộ trình, Blog, Profile, v.v.
├── schemas/         # Thư mục chứa các schema kiểm định dữ liệu (sử dụng Zod)
├── services/        # Các service tương tác với LocalStorage hoặc gọi API bên ngoài
│   ├── draftService.ts       # Quản lý bản nháp đề thi và tài liệu
│   └── imageUploadService.ts # Xử lý tải ảnh tạm thời lên máy chủ
└── types/           # Định nghĩa kiểu dữ liệu TypeScript (Single Source of Truth)
    ├── doc-editor.ts# Kiểu dữ liệu cho trình soạn thảo tài liệu
    ├── oml.ts       # Cấu trúc cú pháp của Onmi Markup Language
    └── index.ts     # Các kiểu dữ liệu chung (User, Exam, Question, v.v.)
```

### Chi tiết vai trò các thư mục chính:
*   [src/components/teacher/doc-editor](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor): Trọng tâm phát triển hiện tại, chứa các Editor Block (Text, Image, Table, Question) hỗ trợ kéo thả và định dạng chuyên sâu.
*   [src/components/ExamEditor](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/ExamEditor): Chứa các thành phần phụ trách phân tích cú pháp (Parser) và hiển thị trực quan (Renderer) định dạng OML từ mã nguồn thô sang UI trực quan cho học sinh làm bài.
*   [src/types/oml.ts](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/oml.ts): Định nghĩa đặc tả kỹ thuật của ngôn ngữ đánh dấu Onmi Markup Language dùng cho bộ máy khảo thí. Mọi thay đổi về cấu trúc đề thi phải bắt đầu từ file này.
*   [src/App.tsx](file:///c:/Users/Lenovo/Desktop/omniexam/src/App.tsx): File cấu hình định tuyến (React Router DOM) tập trung của toàn bộ ứng dụng. Không cấu hình route ở nơi khác.

---

## 3. KIẾN TRÚC DỮ LIỆU VÀ QUẢN LÝ STATE (CORE DATA & STATE MANAGEMENT)

Phân hệ Document Editor quản lý dữ liệu tài liệu theo cấu trúc phân cấp (Chương -> Bài học/Thư mục con -> Các khối nội dung). Dưới đây là các định nghĩa kiểu dữ liệu và cơ chế quản lý state tương ứng.

### A. Định nghĩa các Interface cốt lõi
Các interface này được định nghĩa tại file [src/types/doc-editor.ts](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/doc-editor.ts):

#### 1. Interface đại diện trên Client/UI
Dành cho việc render cây thư mục lồng nhau (nested tree) và hiển thị trực quan:

*   [Chapter](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/doc-editor.ts#L155-L159): Đại diện cho một Chương lớn chứa danh sách các bài học.
    ```typescript
    export interface Chapter {
      id: string;
      title: string;
      lessons: Lesson[];
    }
    ```
*   [Lesson](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/doc-editor.ts#L147-L153): Đại diện cho một Bài học hoặc một Thư mục chứa các bài học con.
    ```typescript
    export interface Lesson {
      id: string;
      title: string;
      blocks: DocBlock[];
      isFolder?: boolean;
      subLessons?: Lesson[];
    }
    ```
*   [DocBlock](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/doc-editor.ts#L10-L82): Đơn vị nội dung nhỏ nhất (khối văn bản, ảnh, bảng, câu hỏi quiz...).
    ```typescript
    export interface DocBlock {
      id: string;
      type: 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'todo-list' | 'callout' | 'quote' | 'divider' | 'image' | 'table' | 'formula' | 'code' | 'quiz' | 'flashcard' | 'mindmap' | 'media' | 'timeline' | 'flow' | 'tabs' | 'compare' | 'diagram' | 'matching' | 'fillblank' | 'dragdrop' | 'sortorder';
      order?: number;
      content?: {
        text?: string;
        align?: 'left' | 'center' | 'right' | 'justify';
        indent?: number;
        checked?: boolean;
        src?: string;
        caption?: string;
        latex?: string;
        display?: 'inline' | 'block';
        language?: string;
        rows?: string[][];
        width?: string;
        alt?: string;
        hasHeaderRow?: boolean;
        hasHeaderColumn?: boolean;
        columnWidths?: number[];
        rowHeights?: number[];
        cellStyles?: TableCellStyle[][];
        quizContent?: QuizContent;
        flashcardContent?: FlashcardContent;
        mindmapContent?: MindmapData;
        timelineContent?: TimelineContent;
        flowContent?: FlowContent;
        tabsContent?: TabsContent;
        compareContent?: CompareContent;
        diagramContent?: DiagramContent;
        matchingContent?: MatchingContent;
        fillblankContent?: FillBlankContent;
        dragdropContent?: DragDropContent;
        sortorderContent?: SortOrderContent;
        level?: 1 | 2 | 3;
        url?: string;
        sourceType?: 'upload' | 'embed';
      };
      
      // Tương thích ngược:
      level?: 1 | 2 | 3;
      indent?: number;
      text: string;
      align?: 'left' | 'center' | 'right' | 'justify';
      checked?: boolean;
      src?: string;
      caption?: string;
      latex?: string;
      display?: 'inline' | 'block';
      language?: string;
      rows?: string[][];
      width?: string;
      alt?: string;
      hasHeaderRow?: boolean;
      hasHeaderColumn?: boolean;
      columnWidths?: number[];
      rowHeights?: number[];
      cellStyles?: TableCellStyle[][];
      quizContent?: QuizContent;
      flashcardContent?: FlashcardContent;
      mindmapContent?: MindmapData;
      timelineContent?: TimelineContent;
      flowContent?: FlowContent;
      tabsContent?: TabsContent;
      compareContent?: CompareContent;
      diagramContent?: DiagramContent;
      matchingContent?: MatchingContent;
      fillblankContent?: FillBlankContent;
      dragdropContent?: DragDropContent;
      sortorderContent?: SortOrderContent;
      url?: string;
      sourceType?: 'upload' | 'embed';
    }
    ```

#### 2. Interface đại diện trong Database (DB)
Thiết kế phẳng để lưu trữ tối ưu dưới cơ sở dữ liệu quan hệ (Supabase/PostgreSQL):

*   [DbChapter](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/doc-editor.ts#L161-L166):
    ```typescript
    export interface DbChapter {
      id: string;
      title: string;
      document_id: string;
      order: number;
    }
    ```
*   [DbLesson](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/doc-editor.ts#L168-L175):
    ```typescript
    export interface DbLesson {
      id: string;
      title: string;
      chapter_id: string | null;
      parent_lesson_id: string | null;
      is_folder: boolean;
      order: number;
    }
    ```
*   [DbBlock](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/doc-editor.ts#L177-L183):
    ```typescript
    export interface DbBlock {
      id: string;
      lesson_id: string;
      type: string;
      order: number;
      content: Record<string, any>;
    }
    ```

---

### B. Cơ chế Quản lý Cây Thư mục (useDocumentTree)
Cơ chế quản lý cây thư mục được định nghĩa và triển khai thông qua custom hook [useDocumentTree](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor/useDocumentTree.ts):

#### 1. Quản lý bằng "Mảng phẳng" (Flatten Array / Nodes Map)
*   **Cách thức hoạt động:** Thay vì lưu trữ trực tiếp cấu trúc cây đệ quy đắt đỏ, [useDocumentTree](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor/useDocumentTree.ts) sử dụng một `nodesMap` có kiểu `Record<string, FlatNode>` để theo dõi tất cả các chương và bài học. Mỗi `FlatNode` sẽ lưu trữ ID của nút cha thông qua thuộc tính `parent` và thứ tự hiển thị thông qua thuộc tính `order`.
*   **Lợi ích:**
    *   Các thao tác cập nhật (thêm, sửa tên, xóa, kéo thả di chuyển nút `moveLesson`, thay đổi thứ tự `reorderChapter`) chỉ cần sửa đổi trực tiếp các thuộc tính của node đích và cập nhật lại thuộc tính `parent` hoặc `order` của các node liền kề mà không cần duyệt cây đệ quy phức tạp.
    *   Dễ dàng chuyển đổi hai chiều: Dùng hàm `toNodesMap` để phẳng hóa cây dữ liệu đầu vào và hàm `buildNestedChapters` để dựng lại cây lồng nhau trước khi hiển thị lên UI.

#### 2. Tách biệt UI State độc lập khỏi Data State
*   **Cách thức hoạt động:** Trạng thái mở rộng (đóng/mở các chương hoặc thư mục) của Sidebar được quản lý độc lập thông qua state [expandedNodeIds](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor/useDocumentTree.ts#L154) (kiểu `Record<string, boolean>`). Nó hoàn toàn tách biệt khỏi dữ liệu cấu trúc thực tế `nodesMap`.
*   **Lý do (Tránh lỗi hoàn tác - Undo/Redo):**
    *   Khi tích hợp tính năng Hoàn tác (Undo/Redo) cho tài liệu, hệ thống chỉ cần ghi nhận các thay đổi cấu trúc dữ liệu thực tế (`nodesMap`).
    *   Nếu gộp trạng thái đóng/mở thư mục (UI State) vào chung một cây dữ liệu, mỗi khi giáo viên đóng/mở một thư mục trên Sidebar, hệ thống sẽ hiểu đó là một sự thay đổi dữ liệu và đẩy vào lịch sử Undo/Redo. Điều này gây nhiễu lịch sử sửa đổi nội dung thực tế.
    *   Ngược lại, khi giáo viên thực hiện Undo một thao tác soạn thảo (như sửa text), việc khôi phục Data State cũ sẽ vô tình làm thay đổi/reset toàn bộ trạng thái đóng mở Sidebar mà giáo viên đã thiết lập trước đó, gây trải nghiệm người dùng rất tệ và dễ dẫn đến lỗi đồng bộ.

### C. Cấu trúc Quản lý Soạn đề (Exam Editor)
*   **Cách thức hoạt động:** Phân hệ soạn đề thi sử dụng [ExamEditorWorkspace.tsx](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/exam-editor/ExamEditorWorkspace.tsx) làm không gian làm việc trung tâm, phối hợp với [ExamSidebar.tsx](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/exam-editor/ExamSidebar.tsx) để quản lý danh sách và cấu trúc câu hỏi trắc nghiệm (Quiz Engine).
*   **Ràng buộc OML:** Cấu trúc đề thi và các câu hỏi trong phân hệ này tuân thủ nghiêm ngặt theo đặc tả của ngôn ngữ đánh dấu Onmi Markup Language định nghĩa tại [src/types/oml.ts](file:///c:/Users/Lenovo/Desktop/omniexam/src/types/oml.ts). Mọi AI Agent sau này khi can thiệp vào logic chấm điểm, parser, hoặc hiển thị đề thi của học sinh đều phải bám sát đặc tả OML này để đảm bảo tính nhất quán dữ liệu của bộ máy khảo thí.

---

## 4. LUỒNG ĐỒNG BỘ DỮ LIỆU (DATA FLOW)

Quá trình chuyển hóa dữ liệu giữa Giao diện người dùng (Client State) và Cơ sở dữ liệu (Database Payload) được thực hiện thông qua hai hàm chuyển đổi dữ liệu (Adapter) định nghĩa tại [src/components/teacher/doc-editor/DocEditorWorkspace.tsx](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor/DocEditorWorkspace.tsx):

### A. Cơ chế Hoạt động của hai hàm Adapter
*   **Hàm chuyển đổi dữ liệu DB sang Client State - [transformDbToClientState](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor/DocEditorWorkspace.tsx#L2232-L2287):**
    *   **Nguyên lý:** Nhận mảng dữ liệu phẳng từ DB bao gồm `DbChapter[]`, `DbLesson[]`, và `DbBlock[]`. Để đảm bảo tính nhất quán và đúng trình tự trước khi hiển thị, hàm tự động thực hiện sao chép và sắp xếp tăng dần theo thuộc tính `order` bằng `.sort((a, b) => a.order - b.order)`.
    *   **Tách dữ liệu:** Nhóm các block theo `lesson_id`, sau đó trải các thuộc tính từ cột `content` JSONB ra ngoài (`...dbBlock.content`) nhằm tương thích ngược với client mà vẫn giữ nguyên cấu trúc `content` lồng. Cuối cùng, dựng đệ quy thành cấu trúc cây lồng nhau `Lesson` và `Chapter` để hiển thị trên UI.
*   **Hàm đóng gói dữ liệu Client sang DB Payload - [transformClientToDbPayload](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor/DocEditorWorkspace.tsx#L2289-L2311):**
    *   **Nguyên lý:** Nhận danh sách các block client `DocBlock[]`. Với mỗi block, tiến hành bóc tách các trường metadata hệ thống (`id`, `type`, `order`, `content`) ra ngoài.
    *   **Gom dữ liệu phẳng:** Gom toàn bộ các trường phẳng/thuộc tính đặc thù còn lại (`specificProperties`) của block đó đóng gói chung vào một object JSONB duy nhất gọi là `content` để lưu trữ tối ưu trong database (Autosave). Chỉ số mảng `idx` được ánh xạ trực tiếp thành giá trị thuộc tính `order`.

### B. Cấu trúc Dữ liệu Media Block
Cấu trúc dữ liệu trong thuộc tính `content` của Media Block (sử dụng video tải lên hoặc mã nhúng) được định nghĩa và khởi tạo bởi [createDefaultBlock](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor/blocks/BlockFactory.ts#L11-L18) và render tại [MediaBlockComponent](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/doc-editor/blocks/MediaBlock.tsx#L34-L40):
```typescript
{
  url: string;                 // Đường dẫn URL đến tệp video tải lên hoặc link nhúng YouTube / Google Drive
  sourceType: 'upload' | 'embed'; // Nguồn phát video: tải lên trực tiếp hoặc nhúng qua mã iframe
  caption: string;             // Phụ đề, mô tả hoặc tên tệp video hiển thị dưới player
}
```

### C. Module Xử lý Tệp tin (File Uploader) & Định hướng Tích hợp OCR
*   **Quản lý tệp tin đầu vào:** Phân hệ [FileUploaderWorkspace.tsx](file:///c:/Users/Lenovo/Desktop/omniexam/src/components/teacher/file-uploader/FileUploaderWorkspace.tsx) quản lý luồng dữ liệu tệp tin học liệu tải lên. Nó tiếp nhận mảng Files, kiểm định định dạng (validate), và gọi service [imageUploadService.ts](file:///c:/Users/Lenovo/Desktop/omniexam/src/services/imageUploadService.ts) để sinh URL tạm thời cho tài nguyên trước khi lưu trữ chính thức.
*   **Ràng buộc kiến trúc OCR trong tương lai:**
    *   Để hỗ trợ tính năng tự động nhận diện chữ và bóc tách câu hỏi từ hình ảnh hoặc PDF đề thi in giấy, các hàm xử lý dữ liệu lõi của File Uploader và Exam Editor phải được thiết kế dưới dạng hàm thuần khiết (Pure Functions) nhận `Image`/`Blob` đầu vào và trả ra dữ liệu JSON có cấu trúc sạch.
    *   Toàn bộ logic quét ảnh và thực hiện thuật toán OCR nặng phải chạy độc lập hoàn toàn trong Custom Hooks hoặc Web Workers, quản lý trạng thái UI qua biến `isProcessingOCR` (kiểu `boolean`) để hiển thị loading. Tuyệt đối không được nhét trực tiếp logic xử lý tệp tin nặng vào component UI để tránh gây hiện tượng treo/đơ trình duyệt (Main Thread blocking).

---

## 5. QUY TẮC SỐNG CÒN CHO AI (CRITICAL RULES)

Để tránh phá vỡ hệ thống dữ liệu và gây lỗi trải nghiệm người dùng, mọi AI Agent khi thao tác trên codebase này phải tuân thủ nghiêm ngặt các quy tắc dưới đây:

1.  **KHÔNG sửa đổi cấu trúc phẳng của Dữ liệu Database:**
    *   Giữ nguyên cách thiết kế phẳng của các bảng `DbChapter`, `DbLesson`, `DbBlock`. Mọi thay đổi liên quan đến cấu trúc quan hệ phải được thông qua và tương thích với hai hàm adapter chuyển đổi dữ liệu.
2.  **KHÔNG cập nhật thời gian thực vào object lồng khi người dùng đang gõ:**
    *   **Hậu quả:** Cập nhật trực tiếp dữ liệu dạng lồng phức tạp vào state chính của React trong quá trình gõ phím (`onChange`) sẽ kích hoạt quá trình re-render toàn bộ Workspace, dẫn đến việc mất tiêu điểm và mất vị trí con trỏ chuột của người dùng (Caret loss/Focus loss).
    *   **Giải pháp:** Chỉ cập nhật State nội bộ của Component Block hoặc sử dụng cơ chế trì hoãn (Debounce), chỉ đồng bộ ngược lại Data State chính khi có sự kiện `onBlur`, nhấn `Enter` hoặc sau khi hoàn tất hành động chỉnh sửa.
3.  **BẮT BUỘC kiểm tra tĩnh trước khi bàn giao công việc:**
    *   Trước khi đánh dấu công việc hoàn thành và phản hồi cho người dùng, bắt buộc phải chạy lệnh kiểm tra TypeScript tại terminal gốc:
        ```bash
        npx tsc --noEmit
        ```
    *   Đảm bảo kết quả trả về là **0 new errors** (không phát sinh bất kỳ lỗi biên dịch mới nào).
