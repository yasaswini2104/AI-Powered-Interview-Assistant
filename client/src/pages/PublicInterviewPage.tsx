// client\src\pages\PublicInterviewPage.tsx
import { useEffect, useState } from 'react';
import apiClient from '@/api/axios';
import { IntervieweeView } from '@/components/IntervieweeView';
import { Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';

const useSessionId = () => {
    const path = window.location.pathname;
    const parts = path.split('/');
    if (parts.length > 2 && parts[parts.length - 2] === 'interview') {
        return parts[parts.length - 1];
    }
    return null;
}

export function PublicInterviewPage() {
    const sessionId = useSessionId();
    const [sessionInfo, setSessionInfo] = useState<{ role: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) {
                setError('Invalid interview link. Session ID is missing.');
                setLoading(false);
                return;
            }
            try {
                const response = await apiClient.get(`/sessions/${sessionId}`);
                setSessionInfo(response.data);
            } catch (err) {
                if (isAxiosError(err) && err.response) {
                    setError(err.response.data.message);
                } else {
                    setError('Invalid or expired interview link.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [sessionId]);

    if (loading) {
        return <div className="flex flex-col items-center justify-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /> <p className="mt-2 text-slate-600">Loading interview session...</p></div>
    }

    if (error) {
        return <div className="text-center text-red-600 p-8 border border-red-200 bg-red-50 rounded-md">{error}</div>
    }

    return (
        <div>
            <h2 className="text-center text-2xl font-bold mb-2">AI Interview for {sessionInfo?.role}</h2>
            <p className="text-center text-slate-600 mb-6">Please upload your resume to begin the automated screening process.</p>
            {/* We now pass all the necessary props to the IntervieweeView */}
            <IntervieweeView 
                isPublicSession={true} 
                sessionId={sessionId!} 
                publicRole={sessionInfo!.role}
            />
        </div>
    );
}

