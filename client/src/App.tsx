// client\src\App.tsx
import { useState, useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, type RootState, type AppDispatch } from './app/store';
import { clearInterviewState, convertToTrialMode } from './features/interviewSlice';
import { syncTrialToAccount } from './features/candidatesThunks';
import { toast } from 'sonner';
import { Toaster} from '@/components/ui/sonner';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Header } from './components/Header';
import { IntervieweeView } from './components/IntervieweeView';
import { InterviewerDashboard } from './components/InterviewerDashboard';
import { CreateSession } from './components/CreateSession';
import { PublicInterviewPage } from './pages/PublicInterviewPage';
import { WelcomeBackModal } from './components/WelcomeBackModal';
import { LogoutWarningModal } from './components/LogoutWarningModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Main home page with trial mode (no login required)
function HomePage() {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const isRecruiter = userInfo?.role === 'recruiter';

  // If user is logged in AND is a recruiter, show the recruiter-specific layout
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

  // For non-logged-in users OR logged-in individuals, show the trial mode tabs
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

// Router component that handles all navigation
function AppContent() {
    const dispatch = useDispatch<AppDispatch>();
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const interviewStatus = useSelector((state: RootState) => state.interview.status);
    const candidateId = useSelector((state: RootState) => state.interview.candidateId);
    const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register'>('home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLogoutWarning, setShowLogoutWarning] = useState(false);
    
    // Check if this is a public interview route
    const path = window.location.pathname;
    const isPublicInterviewRoute = path.startsWith('/interview/');

    // Always start on home page, not login
    useEffect(() => {
        if (userInfo) {
            setCurrentPage('home');
            
            // NEW: If user just logged in and has an active trial interview, sync it
            const isTrialInterview = candidateId?.startsWith('trial-') && 
                                     (interviewStatus === 'in-progress' || interviewStatus === 'pending-info');
            
            if (isTrialInterview) {
                dispatch(syncTrialToAccount())
                    .unwrap()
                    .then(() => {
                        toast.success('Interview Synced!', { 
                            description: 'Your trial interview has been saved to your account.' 
                        });
                    })
                    .catch((error) => {
                        console.error('Failed to sync trial interview:', error);
                        // Don't show error to user - they can continue in trial mode
                    });
            }
        }
    }, [userInfo, dispatch, candidateId, interviewStatus]);

    // Show welcome back modal for in-progress interviews
    useEffect(() => {
        if (interviewStatus === 'in-progress' || interviewStatus === 'pending-info') {
            setIsModalOpen(true);
        }
    }, [interviewStatus]);

    // NEW: Detect logout during interview
    useEffect(() => {
        // If there's an active interview but user logged out, show warning
        const isInterviewActive = (interviewStatus === 'in-progress' || interviewStatus === 'pending-info') 
                                  && candidateId 
                                  && !candidateId.startsWith('trial-');
        
        if (isInterviewActive && !userInfo) {
            setShowLogoutWarning(true);
        } else {
            setShowLogoutWarning(false);
        }
    }, [userInfo, interviewStatus, candidateId]);

    const handleResume = () => setIsModalOpen(false);
    const handleStartOver = () => {
        dispatch(clearInterviewState());
        setIsModalOpen(false);
        setShowLogoutWarning(false);
    };

    const handleContinueAsGuest = () => {
        // Convert the interview to trial mode so it doesn't try to save to server
        dispatch(convertToTrialMode());
        setShowLogoutWarning(false);
        setIsModalOpen(false);
    };

    const renderPage = () => {
        // Public interview links work without login
        if (isPublicInterviewRoute) return <PublicInterviewPage />;
        
        // Show login/register only if user explicitly clicks those buttons
        if (currentPage === 'register') {
            return <RegisterPage onSwitchToLogin={() => setCurrentPage('login')} />;
        }
        if (currentPage === 'login') {
            return <LoginPage onSwitchToRegister={() => setCurrentPage('register')} />;
        }
        
        // Default: show the home page (trial mode available for everyone)
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
            
            {/* Welcome Back Modal for returning to in-progress interviews */}
            <WelcomeBackModal isOpen={isModalOpen && !showLogoutWarning} onResume={handleResume} onStartOver={handleStartOver} />
            
            {/* NEW: Logout Warning Modal */}
            <LogoutWarningModal 
                isOpen={showLogoutWarning} 
                onContinue={handleContinueAsGuest}
                onStartOver={handleStartOver}
            />
            
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