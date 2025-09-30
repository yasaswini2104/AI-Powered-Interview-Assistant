// client\src\App.tsx
import { useState, useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, type RootState, type AppDispatch } from './app/store';
import { clearInterviewState } from './features/interviewSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { IntervieweeView } from './components/IntervieweeView';
import { InterviewerDashboard } from './components/InterviewerDashboard';
import { WelcomeBackModal } from './components/WelcomeBackModal';

// A new component to contain the logic, so we can access Redux state
function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const interviewStatus = useSelector((state: RootState) => state.interview.status);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This effect runs once after the app loads and Redux state is rehydrated
  useEffect(() => {
    if (interviewStatus === 'in-progress' || interviewStatus === 'pending-info') {
      setIsModalOpen(true);
    }
  }, [interviewStatus]);

  const handleResume = () => {
    setIsModalOpen(false);
  };

  const handleStartOver = () => {
    dispatch(clearInterviewState());
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">AI-Powered Interview Assistant</h1>
          <p className="text-slate-600 mt-2">Welcome to your automated technical screening platform.</p>
        </header>
        <main>
          <Tabs defaultValue="interviewee" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="interviewee">Interviewee</TabsTrigger>
              <TabsTrigger value="interviewer">Interviewer</TabsTrigger>
            </TabsList>
            <TabsContent value="interviewee">
              <IntervieweeView />
            </TabsContent>
            <TabsContent value="interviewer">
              <InterviewerDashboard />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <WelcomeBackModal
        isOpen={isModalOpen}
        onResume={handleResume}
        onStartOver={handleStartOver}
      />
      <Toaster />
    </div>
  );
}


// The main App component just sets up the Providers
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