export interface User {
  name: string;
  email: string;
  loggedIn: boolean;
  xp: number;
  streak: number;
  lastActiveDate?: string;
  badges: string[];
  completedExams: Record<string, { score: number; completedAt: string }>;
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
