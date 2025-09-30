import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from 'lucide-react';
import apiClient from '../api/axios';
import { startInterviewSuccess } from '../features/interviewSlice';
import { type AppDispatch, type RootState } from '@/app/store';
import { isAxiosError } from 'axios';

const availableRoles = ["Full Stack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Other"];

export function ResumeUploadForm({ isPublicSession, sessionId, publicRole }: { isPublicSession: boolean; sessionId?: string; publicRole?: string; }) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const finalRole = isPublicSession ? publicRole : (selectedRole === 'Other' ? customRole : selectedRole);

    if (!file || !finalRole) {
      toast.error('Missing Information', { description: 'Please provide all required information.' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', finalRole);

    const isTrialMode = !userInfo && !isPublicSession;

    if (isTrialMode) {
      try {
        const mockCandidate = {
          _id: `trial-${Date.now()}`,
          name: null, 
          email: null,
          phone: null,
          role: finalRole,
        };
        
        dispatch(startInterviewSuccess(mockCandidate));
        toast.success('Trial Mode', { description: "Your data will be stored locally. Sign up to save across devices!" });
      } catch {
        toast.error('Upload Failed', { description: 'An error occurred processing your file.' });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    let url = '/candidates/start';
    if (isPublicSession) {
        url = '/candidates/start/public';
        formData.append('sessionId', sessionId!);
    }
    
    try {
      const response = await apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(startInterviewSuccess(response.data.candidate));
      toast.success('Upload Successful', { description: "Your resume has been parsed. Let's begin!" });
    } catch (error) {
      let errorMessage = 'An unexpected error occurred.';
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      toast.error('Upload Failed', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || !file || (!isPublicSession && (selectedRole === 'Other' ? !customRole : !selectedRole));
  const isTrialMode = !userInfo && !isPublicSession;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Start Your Interview</CardTitle>
        <CardDescription>
          {isPublicSession 
            ? `You are applying for the ${publicRole} role. Please upload your resume to begin.` 
            : isTrialMode 
              ? 'Trial Mode: Your data will be stored locally in your browser. Sign up to save across devices.'
              : 'Upload your resume and select a role to begin the screening.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {!isPublicSession && (
            <>
              <div className="space-y-2">
                <label htmlFor="role-select" className="font-medium">Role Applying For</label>
                <Select onValueChange={setSelectedRole} value={selectedRole}>
                  <SelectTrigger id="role-select"><SelectValue placeholder="Select a role..." /></SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {selectedRole === 'Other' && (
                <div className="space-y-2 animate-in fade-in-0 duration-500">
                  <label htmlFor="custom-role-input" className="font-medium">Please specify the role</label>
                  <Input id="custom-role-input" placeholder="e.g., QA Engineer" value={customRole} onChange={(e) => setCustomRole(e.target.value)} required />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="resume-upload" className="font-medium">Resume File</label>
            <Input id="resume-upload" type="file" accept=".pdf" onChange={handleFileChange} required />
            {isTrialMode && (
              <p className="text-xs text-slate-500">Note: In trial mode, resume parsing is simulated. You'll be asked for your details manually.</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {isTrialMode ? 'Start Trial Interview' : 'Upload and Start'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}