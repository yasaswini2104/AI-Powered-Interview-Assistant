// client\src\components\ResumeUploadForm.tsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from 'lucide-react';
import apiClient from '../api/axios';
import { startInterviewSuccess } from '../features/interviewSlice';
import { type AppDispatch } from '@/app/store';
import { isAxiosError } from 'axios';

// --- THIS IS THE FIX ---
// 1. Add "Other" to the list of available roles.
const availableRoles = ["Full Stack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Other"];

export function ResumeUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>(""); // 2. Add state for the custom role input.
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // 3. Determine the final role to be submitted.
    const finalRole = selectedRole === 'Other' ? customRole : selectedRole;

    if (!file || !finalRole) {
      toast.error('Missing Information', { description: 'Please select a resume file and specify your role.' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', finalRole); // 4. Send the final role to the backend.

    try {
      const response = await apiClient.post('/candidates/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      dispatch(startInterviewSuccess(response.data.candidate));
      toast.success('Upload Successful', { description: "Your resume has been parsed. Let's begin!" });
    } catch (error) {
      console.error('Upload failed:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      toast.error('Upload Failed', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Determine if the submit button should be disabled.
  const isSubmitDisabled = isLoading || !file || (selectedRole === 'Other' ? !customRole : !selectedRole);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Start Your Interview</CardTitle>
        <CardDescription>Upload your resume and select a role to begin the screening.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="role-select" className="font-medium">Role Applying For</label>
            <Select onValueChange={setSelectedRole} value={selectedRole}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* --- 6. Conditionally render the custom role input --- */}
          {selectedRole === 'Other' && (
            <div className="space-y-2 animate-in fade-in-0 duration-500">
              <label htmlFor="custom-role-input" className="font-medium">Please specify the role</label>
              <Input 
                id="custom-role-input" 
                placeholder="e.g., QA Engineer, Data Scientist" 
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="resume-upload" className="font-medium">Resume File</label>
            <Input id="resume-upload" type="file" accept=".pdf" onChange={handleFileChange} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload and Start
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

