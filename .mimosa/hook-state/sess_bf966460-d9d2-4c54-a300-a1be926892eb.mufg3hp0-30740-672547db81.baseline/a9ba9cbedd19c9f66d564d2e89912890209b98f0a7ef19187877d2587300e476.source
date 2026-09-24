import type { OmlContextBlock } from './oml';

export interface ExamMistake {
  examId: string;
  topic: string;
  lastWrongAt: string;
  wrongCount: number;
  mastered?: true;
}

export type MistakeWithId = ExamMistake & { questionId: string };

export interface User {
  name: string;
  email: string;
  loggedIn: boolean;
  xp: number;
  streak: number;
  lastActiveDate?: string;
  badges: string[];
  completedExams: Record<string, { score: number; completedAt: string }>;
  completedLessons: Record<string, true>; // lessonId -> true (nguồn duy nhất của tiến độ bài học)
  lastExamResult?: {
    examId: string;
    answers: Record<string, number>; // questionId -> optionIndex (đã sanitize, chỉ giữ đáp án có thật)
    score: number;
    xpGained: number;
    completedAt: string;
  };
  examMistakes: Record<string, ExamMistake>; // key = questionId — nguồn duy nhất của Mistake Book
  savedExams: string[]; // List of Exam IDs
  savedDocs: string[]; // List of Doc IDs
  bookmarks: Record<string, number[]>; // docId -> list of chapter indexes
  notes: Record<string, string>; // docId or examId -> user note content
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  questionCount: number;
  durationMinutes: number;
  tries: number;
  rating: number;
  isPremium: boolean;
  tag?: string;
  questions: Question[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string; // HTML-like string with standard headings
}

export interface Document {
  id: string;
  title: string;
  subject: string;
  grade: string;
  fileSize: string;
  pageCount: number;
  views: number;
  downloads: number;
  format: 'PDF' | 'DOCX' | 'Slide' | 'Tóm tắt' | 'Đề cương';
  thumbnailUrl?: string;
  author: string;
  updatedAt: string;
  readingTimeMinutes: number;
  chapters: Chapter[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  school: string;
  grade: string;
  xp: number;
  streak: number;
  badges: string[];
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  blocks: OmlContextBlock[];
}

export interface CourseChapter {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  practiceCount: number;
  examCount: number;
  chapters: CourseChapter[];
}