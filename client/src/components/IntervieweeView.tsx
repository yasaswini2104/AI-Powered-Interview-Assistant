// client\src\components\IntervieweeView.tsx
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/store';
import { ResumeUploadForm } from './ResumeUploadForm';
import { MissingInfoForm } from './MissingInfoForm';
import { ChatWindow } from './ChatWindow'; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function IntervieweeView() {
  const interviewStatus = useSelector((state: RootState) => state.interview.status);

  const renderContent = () => {
    switch (interviewStatus) {
      case 'idle':
        return <ResumeUploadForm />;
      case 'pending-info':
        return <MissingInfoForm />;
      case 'in-progress':
      case 'loading': // Show chat window during loading as well
        return <ChatWindow />; // <-- REPLACE THE <p> TAG
      case 'completed':
        return (
          <Card className="w-full max-w-lg mx-auto text-center">
            <CardHeader>
              <div className="mx-auto bg-green-100 p-3 rounded-full w-fit">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="mt-4 text-2xl">Interview Complete!</CardTitle>
              <CardDescription>Thank you for your time.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We have received your responses. The hiring team will review your session and get back to you with the next steps if you are a good fit.
              </p>
            </CardContent>
          </Card>
        );

      case 'error':
        return <p>An error occurred. Please refresh and try again.</p>;
      default:
        return <ResumeUploadForm />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[70vh]">
      {renderContent()}
    </div>
  );
}

