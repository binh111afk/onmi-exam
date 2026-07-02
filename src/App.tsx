import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
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
import { AssessmentTest } from './pages/AssessmentTest';
import { OnboardingModal } from './components/OnboardingModal';

const AUTH_STORAGE_KEY = 'omni_auth_user';

const viewToPath: Record<string, string> = {
  home: '/',
  exams: '/exams',
  documents: '/documents',
  leaderboard: '/leaderboard',
  login: '/login',
  register: '/register',
  about: '/roadmap',
  teacher: '/teacher',
  contact: '/contact',
  blog: '/blog',
  profile: '/profile',
  'assessment-test': '/mbti',
};

const docAliases: Record<string, string> = {
  'biology-01': 'doc-bio-1',
};

const loadInitialUser = (): User => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      return { ...initialUser, ...JSON.parse(saved), loggedIn: true };
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return initialUser;
};

const getCurrentView = (pathname: string) => {
  if (pathname === '/') return 'home';
  if (pathname === '/login') return 'login';
  if (pathname === '/register') return 'register';
  if (pathname === '/mbti' || pathname === '/assessment-test') return 'assessment-test';
  if (pathname.startsWith('/exams/') && pathname.endsWith('/take')) return 'active-exam';
  if (pathname.startsWith('/exams/')) return 'exam-detail';
  if (pathname === '/exams') return 'exams';
  if (pathname.startsWith('/documents/')) return 'doc-reader';
  if (pathname === '/documents') return 'documents';
  if (pathname === '/roadmap' || pathname === '/about') return 'about';
  if (pathname.startsWith('/teacher')) return 'teacher';
  if (pathname === '/leaderboard') return 'leaderboard';
  if (pathname === '/contact') return 'contact';
  if (pathname === '/blog') return 'blog';
  if (pathname === '/profile' || pathname === '/settings') return 'profile';
  return 'home';
};

const isAuthPage = (pathname: string) => pathname === '/login' || pathname === '/register';

function ProtectedRoute({ user, children }: { user: User; children: React.ReactNode }) {
  const location = useLocation();

  if (!user.loggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User>(() => loadInitialUser());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const currentView = getCurrentView(location.pathname);
  const showHeaderFooter = !['active-exam', 'assessment-test', 'login', 'register'].includes(currentView);

  useEffect(() => {
    if (user.loggedIn) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  const navigateToView = (newView: string) => {
    navigate(viewToPath[newView] || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (name: string, email: string) => {
    setUser((prev) => ({
      ...prev,
      name,
      email,
      loggedIn: true,
      xp: prev.xp === 0 ? 1420 : prev.xp,
      streak: prev.streak === 0 ? 5 : prev.streak,
    }));

    const isCompleted = localStorage.getItem('omni_onboarding_completed') === 'true';
    const isDismissed = localStorage.getItem('omni_onboarding_dismissed') === 'true';
    if (!isCompleted && !isDismissed) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser((prev) => ({
      ...prev,
      loggedIn: false,
    }));
    navigate('/login');
  };

  const handleRegisterSuccess = (name: string, email: string) => {
    setUser({
      name,
      email,
      loggedIn: true,
      xp: 100,
      streak: 1,
      badges: ['Tan binh'],
      completedExams: {},
      savedExams: [],
      savedDocs: [],
      bookmarks: {},
      notes: {},
    });
    setShowOnboarding(true);
  };

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

  const handleSelectExam = (id: string) => {
    navigate(`/exams/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = (id: string) => {
    navigate(`/exams/${id}/take`);
  };

  const handleSelectDoc = (id: string) => {
    navigate(`/documents/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildLoginSuccessHandler = () => {
    const fromState = location.state as { from?: Location } | null;
    const fromPath = fromState?.from
      ? `${fromState.from.pathname}${fromState.from.search}${fromState.from.hash}`
      : '/';

    return (name: string, email: string) => {
      handleLoginSuccess(name, email);
      navigate(isAuthPage(fromPath) ? '/' : fromPath, { replace: true });
    };
  };

  const buildRegisterSuccessHandler = () => {
    const fromState = location.state as { from?: Location } | null;
    const fromPath = fromState?.from
      ? `${fromState.from.pathname}${fromState.from.search}${fromState.from.hash}`
      : '/';

    return (name: string, email: string) => {
      handleRegisterSuccess(name, email);
      navigate(isAuthPage(fromPath) ? '/' : fromPath, { replace: true });
    };
  };

  const ExamDetailRoute = () => {
    const { examId } = useParams();
    const activeExam = mockExams.find((x) => x.id === examId) || mockExams[0];

    return (
      <ExamDetail
        exam={activeExam}
        user={user}
        onBack={() => navigate('/exams')}
        onStartExam={handleStartExam}
        onSaveToggle={handleSaveExamToggle}
        isSaved={user.savedExams.includes(activeExam.id)}
      />
    );
  };

  const ActiveExamRoute = () => {
    const { examId } = useParams();
    const activeExam = mockExams.find((x) => x.id === examId) || mockExams[0];

    return (
      <ActiveExam
        exam={activeExam}
        user={user}
        onFinishExam={handleFinishExam}
        onExit={() => navigate(`/exams/${activeExam.id}`)}
      />
    );
  };

  const DocReaderRoute = () => {
    const { docId = '' } = useParams();
    const resolvedDocId = docAliases[docId] || docId;
    const activeDoc = mockDocuments.find((x) => x.id === resolvedDocId) || mockDocuments[0];
    const relatedExams = mockExams.filter((x) => x.subject === activeDoc.subject);
    const relatedDocs = mockDocuments.filter((x) => x.subject === activeDoc.subject && x.id !== activeDoc.id);

    return (
      <DocReader
        doc={activeDoc}
        user={user}
        onBack={() => navigate('/documents')}
        onSaveNotes={handleSaveNotes}
        onBookmarkToggle={handleBookmarkToggle}
        relatedExams={relatedExams}
        relatedDocs={relatedDocs}
        onSelectDoc={handleSelectDoc}
        onSelectExam={handleSelectExam}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base transition-colors duration-default selection:bg-primary-light selection:text-primary">
      {showHeaderFooter && (
        <Navbar
          currentView={currentView}
          onViewChange={navigateToView}
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      <div className="flex-1 w-full flex overflow-hidden">
        {showHeaderFooter && (
          <Sidebar currentView={currentView} onViewChange={navigateToView} user={user} />
        )}

        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
          <div className="flex-1">
            <Routes>
              <Route
                path="/"
                element={<Home user={user} onViewChange={navigateToView} onSelectDoc={handleSelectDoc} />}
              />
              <Route
                path="/exams"
                element={(
                  <Exams
                    exams={mockExams}
                    onSelectExam={handleSelectExam}
                    onStartExam={handleStartExam}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                )}
              />
              <Route path="/exams/:examId" element={<ExamDetailRoute />} />
              <Route
                path="/exams/:examId/take"
                element={(
                  <ProtectedRoute user={user}>
                    <ActiveExamRoute />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/documents"
                element={(
                  <Documents
                    documents={mockDocuments}
                    onSelectDoc={handleSelectDoc}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                )}
              />
              <Route path="/documents/:docId" element={<DocReaderRoute />} />
              <Route path="/leaderboard" element={<Leaderboard entries={mockLeaderboard} />} />
              <Route path="/login" element={<Login onLoginSuccess={buildLoginSuccessHandler()} onViewChange={navigateToView} />} />
              <Route path="/register" element={<Register onRegisterSuccess={buildRegisterSuccessHandler()} onViewChange={navigateToView} />} />
              <Route path="/roadmap" element={<Roadmap user={user} onStartExam={handleStartExam} />} />
              <Route path="/about" element={<Roadmap user={user} onStartExam={handleStartExam} />} />
              <Route
                path="/teacher"
                element={(
                  <ProtectedRoute user={user}>
                    <Teacher />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/teacher/:mode"
                element={(
                  <ProtectedRoute user={user}>
                    <Teacher />
                  </ProtectedRoute>
                )}
              />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route
                path="/profile"
                element={(
                  <ProtectedRoute user={user}>
                    <Profile user={user} onUpdateProfile={handleUpdateProfile} onViewChange={navigateToView} onLogout={handleLogout} />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/settings"
                element={(
                  <ProtectedRoute user={user}>
                    <Profile user={user} onUpdateProfile={handleUpdateProfile} onViewChange={navigateToView} onLogout={handleLogout} />
                  </ProtectedRoute>
                )}
              />
              <Route path="/mbti" element={<AssessmentTest onBackToHome={() => navigate('/')} />} />
              <Route path="/assessment-test" element={<AssessmentTest onBackToHome={() => navigate('/')} />} />
              <Route path="*" element={<Home user={user} onViewChange={navigateToView} onSelectDoc={handleSelectDoc} />} />
            </Routes>
          </div>

          {showHeaderFooter && <Footer onViewChange={navigateToView} />}
        </div>
      </div>

      {showOnboarding && (
        <OnboardingModal
          onStart={() => {
            setShowOnboarding(false);
            navigate('/mbti');
          }}
          onDismiss={() => {
            setShowOnboarding(false);
            localStorage.setItem('omni_onboarding_dismissed', 'true');
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
