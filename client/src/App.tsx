import { useState, useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, type RootState, type AppDispatch } from './app/store';
import { clearInterviewState } from './features/interviewSlice';
import { Toaster } from '@/components/ui/sonner';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Header } from './components/Header';
import { IntervieweeView } from './components/IntervieweeView';
import { InterviewerDashboard } from './components/InterviewerDashboard';
import { CreateSession } from './components/CreateSession';
import { PublicInterviewPage } from './pages/PublicInterviewPage';
import { WelcomeBackModal } from './components/WelcomeBackModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function HomePage() {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const isRecruiter = userInfo?.role === 'recruiter';

  if (userInfo && isRecruiter) {
    return (
      <main>
        <Tabs defaultValue="create" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Session</TabsTrigger>
            <TabsTrigger value="dashboard">Recruiter Dashboard</TabsTrigger>
          </TabsList>
          <TabsContent value="create"><CreateSession /></TabsContent>
          <TabsContent value="dashboard"><InterviewerDashboard /></TabsContent>
        </Tabs>
      </main>
    );
  }

  return (
    <main>
      <Tabs defaultValue="interviewee" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interviewee">Interviewee (Chat)</TabsTrigger>
          <TabsTrigger value="interviewer">Interviewer (Dashboard)</TabsTrigger>
        </TabsList>
        
        {/* Trial mode - works without login, data stored in browser */}
        <TabsContent value="interviewee">
          <IntervieweeView isPublicSession={false} />
        </TabsContent>
        
        <TabsContent value="interviewer">
          <InterviewerDashboard />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function AppContent() {
    const dispatch = useDispatch<AppDispatch>();
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const interviewStatus = useSelector((state: RootState) => state.interview.status);
    const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register'>('home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const path = window.location.pathname;
    const isPublicInterviewRoute = path.startsWith('/interview/');

    useEffect(() => {
        if (userInfo) setCurrentPage('home');
    }, [userInfo]);

    useEffect(() => {
        if (interviewStatus === 'in-progress' || interviewStatus === 'pending-info') {
            setIsModalOpen(true);
        }
    }, [interviewStatus]);

    const handleResume = () => setIsModalOpen(false);
    const handleStartOver = () => {
        dispatch(clearInterviewState());
        setIsModalOpen(false);
    };

    const renderPage = () => {
        if (isPublicInterviewRoute) return <PublicInterviewPage />;
        
        if (currentPage === 'register') {
            return <RegisterPage onSwitchToLogin={() => setCurrentPage('login')} />;
        }
        if (currentPage === 'login') {
            return <LoginPage onSwitchToRegister={() => setCurrentPage('register')} />;
        }
        
        return <HomePage />;
    };
    
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {!isPublicInterviewRoute && (
                <Header 
                    onLoginClick={() => setCurrentPage('login')} 
                    onRegisterClick={() => setCurrentPage('register')} 
                />
            )}
            <div className="container mx-auto px-4 mt-8">{renderPage()}</div>
            <WelcomeBackModal isOpen={isModalOpen} onResume={handleResume} onStartOver={handleStartOver} />
            <Toaster 
        position="bottom-right" 
        richColors
        toastOptions={{
          classNames: {
            description: 'text-slate-600',
          },
        }}
      />
        </div>
    );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;