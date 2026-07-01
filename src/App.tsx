import { useState } from 'react';
import { initialUser, mockExams, mockDocuments, mockLeaderboard } from './data/mockData';
import type { User } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Exams } from './pages/Exams';
import { ExamDetail } from './pages/ExamDetail';
import { ActiveExam } from './pages/ActiveExam';
import { Documents } from './pages/Documents';
import { DocReader } from './pages/DocReader';
import { Leaderboard } from './pages/Leaderboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Roadmap } from './pages/Roadmap';
import { Contact } from './pages/Contact';
import { Blog } from './pages/Blog';
import { Profile } from './pages/Profile';
import { Teacher } from './pages/Teacher';

function App() {
  // Global States
  const [view, setView] = useState<string>('home');
  const [user, setUser] = useState<User>(initialUser);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication handlers
  const handleLoginSuccess = (name: string, email: string) => {
    setUser((prev) => ({
      ...prev,
      name,
      email,
      loggedIn: true,
      // Default to initialUser stats for simulation
      xp: prev.xp === 0 ? 1420 : prev.xp,
      streak: prev.streak === 0 ? 5 : prev.streak,
    }));
  };

  const handleLogout = () => {
    setUser((prev) => ({
      ...prev,
      loggedIn: false,
    }));
    setView('login');
  };

  const handleRegisterSuccess = (name: string, email: string) => {
    setUser({
      name,
      email,
      loggedIn: true,
      xp: 100, // starting bonus
      streak: 1,
      badges: ['Tân binh'],
      completedExams: {},
      savedExams: [],
      savedDocs: [],
      bookmarks: {},
      notes: {},
    });
  };

  // Content annotations handlers
  const handleSaveNotes = (docId: string, notes: string) => {
    setUser((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [docId]: notes,
      },
    }));
  };

  const handleBookmarkToggle = (docId: string, chapterIdx: number) => {
    setUser((prev) => {
      const currentBookmarks = prev.bookmarks[docId] || [];
      const updated = currentBookmarks.includes(chapterIdx)
        ? currentBookmarks.filter((x) => x !== chapterIdx)
        : [...currentBookmarks, chapterIdx];

      return {
        ...prev,
        bookmarks: {
          ...prev.bookmarks,
          [docId]: updated,
        },
      };
    });
  };

  const handleSaveExamToggle = (examId: string) => {
    setUser((prev) => {
      const currentSaved = prev.savedExams || [];
      const updated = currentSaved.includes(examId)
        ? currentSaved.filter((id) => id !== examId)
        : [...currentSaved, examId];

      return {
        ...prev,
        savedExams: updated,
      };
    });
  };

  // Exam completion scoring reward
  const handleFinishExam = (examId: string, score: number, xpGained: number) => {
    setUser((prev) => {
      const isNewCompletion = !prev.completedExams[examId];
      const newXp = prev.xp + xpGained;
      const newStreak = isNewCompletion ? prev.streak + 1 : prev.streak;

      return {
        ...prev,
        xp: newXp,
        streak: newStreak,
        completedExams: {
          ...prev.completedExams,
          [examId]: {
            score,
            completedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  // View routers
  const handleSelectExam = (id: string) => {
    setSelectedExamId(id);
    setView('exam-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    setView('doc-reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = (id: string) => {
    setSelectedExamId(id);
    setView('active-exam');
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active data records based on state IDs
  const activeExam = mockExams.find((x) => x.id === selectedExamId) || mockExams[0];
  const activeDoc = mockDocuments.find((x) => x.id === selectedDocId) || mockDocuments[0];

  // Retrieve matching related resources
  const relatedExams = mockExams.filter((x) => x.subject === activeDoc.subject);
  const relatedDocs = mockDocuments.filter((x) => x.subject === activeExam.subject && x.id !== selectedDocId);

  // Hide Top Navigation and Footer inside the CBT Test Simulator and auth pages
  const showHeaderFooter = view !== 'active-exam' && view !== 'login' && view !== 'register';

  return (
    <div className="min-h-screen flex flex-col bg-bg-base transition-colors duration-default selection:bg-primary-light selection:text-primary">
      {showHeaderFooter && (
        <Navbar
          currentView={view}
          onViewChange={handleViewChange}
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Main Container: Split sidebar + viewport */}
      <div className="flex-1 w-full flex overflow-hidden">
        {showHeaderFooter && (
          <Sidebar currentView={view} onViewChange={handleViewChange} user={user} />
        )}

        {/* Viewport with its own scrollbar */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
          <div className="flex-1">
            {view === 'home' && (
              <Home
                user={user}
                onViewChange={handleViewChange}
                onSelectDoc={handleSelectDoc}
              />
            )}

            {view === 'exams' && (
              <Exams
                exams={mockExams}
                onSelectExam={handleSelectExam}
                onStartExam={handleStartExam}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}

            {view === 'exam-detail' && (
              <ExamDetail
                exam={activeExam}
                user={user}
                onBack={() => handleViewChange('exams')}
                onStartExam={handleStartExam}
                onSaveToggle={handleSaveExamToggle}
                isSaved={user.savedExams.includes(activeExam.id)}
              />
            )}

            {view === 'active-exam' && (
              <ActiveExam
                exam={activeExam}
                user={user}
                onFinishExam={handleFinishExam}
                onExit={() => handleSelectExam(activeExam.id)}
              />
            )}

            {view === 'documents' && (
              <Documents
                documents={mockDocuments}
                onSelectDoc={handleSelectDoc}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}

            {view === 'doc-reader' && (
              <DocReader
                doc={activeDoc}
                user={user}
                onBack={() => handleViewChange('documents')}
                onSaveNotes={handleSaveNotes}
                onBookmarkToggle={handleBookmarkToggle}
                relatedExams={relatedExams}
                relatedDocs={relatedDocs}
                onSelectDoc={handleSelectDoc}
                onSelectExam={handleSelectExam}
              />
            )}

            {view === 'leaderboard' && <Leaderboard entries={mockLeaderboard} />}

            {view === 'login' && <Login onLoginSuccess={handleLoginSuccess} onViewChange={handleViewChange} />}

            {view === 'register' && <Register onRegisterSuccess={handleRegisterSuccess} onViewChange={handleViewChange} />}

            {view === 'about' && <Roadmap user={user} onStartExam={handleStartExam} />}

            {view === 'teacher' && <Teacher />}

            {view === 'contact' && <Contact />}

            {view === 'blog' && <Blog />}

            {view === 'profile' && (
              <Profile
                user={user}
                onUpdateProfile={handleUpdateProfile}
                onViewChange={handleViewChange}
                onLogout={handleLogout}
              />
            )}
          </div>

          {showHeaderFooter && <Footer onViewChange={handleViewChange} />}
        </div>
      </div>
    </div>
  );
}

export default App;
