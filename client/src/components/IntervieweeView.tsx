// client\src\components\IntervieweeView.tsx
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/store';
import { ResumeUploadForm } from './ResumeUploadForm';
import { MissingInfoForm } from './MissingInfoForm';
import { ChatWindow } from './ChatWindow';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface IntervieweeViewProps {
  isPublicSession: boolean;
  sessionId?: string;
  publicRole?: string;
}

export function IntervieweeView({ isPublicSession, sessionId, publicRole }: IntervieweeViewProps) {
  const interviewStatus = useSelector((state: RootState) => state.interview.status);

  const renderContent = () => {
    switch (interviewStatus) {
      case 'idle':
        return <ResumeUploadForm 
                  isPublicSession={isPublicSession} 
                  sessionId={sessionId} 
                  publicRole={publicRole}
                />;
      
      case 'pending-info':
        return <MissingInfoForm />;
        
      case 'in-progress':
      case 'loading':
        return <ChatWindow />;

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
                Your responses have been submitted. The hiring team will be in touch with the next steps.
              </p>
            </CardContent>
          </Card>
        );

      case 'error':
        return <p className="text-red-600">An error occurred. Please refresh and try again.</p>;
        
      default:
        return <ResumeUploadForm isPublicSession={isPublicSession} sessionId={sessionId} publicRole={publicRole} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {renderContent()}
    </div>
  );
}

