// client\src\components\CreateSession.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input'; 
import { Loader2, Link, Copy } from 'lucide-react';
import apiClient from '@/api/axios';
import { isAxiosError } from 'axios'; 

const availableRoles = ["Full Stack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Other"];

export function CreateSession() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleCreateSession = async () => {
    const finalRole = selectedRole === 'Other' ? customRole : selectedRole;

    if (!finalRole) {
      toast.error("Please select or specify a role for the interview session.");
      return;
    }

    setIsLoading(true);
    setGeneratedLink(null);
    try {
      const response = await apiClient.post('/sessions/create', { role: finalRole });
      const sessionId = response.data._id;
      const link = `${window.location.origin}/interview/${sessionId}`;
      setGeneratedLink(link);
      toast.success("Session created successfully!");
    } catch (error) { 
      let errorMessage = "Please try again.";
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message;
      }
      toast.error("Failed to create session", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink).then(() => {
        toast.success("Link copied to clipboard!");
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        toast.error("Failed to copy link.");
      });
    }
  };

  const isButtonDisabled = isLoading || (selectedRole === 'Other' ? !customRole : !selectedRole);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create a New Interview Session</CardTitle>
        <CardDescription>Select a role to generate a unique, shareable link for candidates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="role-select" className="font-medium">Interview Role</label>
          <Select onValueChange={setSelectedRole} value={selectedRole}>
            <SelectTrigger id="role-select">
              <SelectValue placeholder="Select a role..." />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 6. Conditionally render the custom role input */}
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

        <Button onClick={handleCreateSession} className="w-full" disabled={isButtonDisabled}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link className="mr-2 h-4 w-4" />}
          Generate Interview Link
        </Button>

        {generatedLink && (
          <div className="p-4 bg-slate-100 rounded-md space-y-3 animate-in fade-in-0 duration-500">
            <p className="text-sm font-medium">Share this link with your candidates:</p>
            <div className="flex items-center gap-2">
              <Input value={generatedLink} readOnly className="flex-1 bg-white" />
              <Button size="icon" variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

