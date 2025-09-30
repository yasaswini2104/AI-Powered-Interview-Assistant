import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import apiClient from '../api/axios';
import { type RootState, type AppDispatch } from '@/app/store';
import { updateInfoSuccess } from '../features/interviewSlice';
import { isAxiosError } from 'axios';

export function MissingInfoForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { candidateId, name, email, phone, role } = useSelector((state: RootState) => state.interview);
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({ name: name || '', email: email || '', phone: phone || '' });
  const [isLoading, setIsLoading] = useState(false);

  const isTrialMode = !userInfo && candidateId?.startsWith('trial-');

  useEffect(() => {
    setFormData({ name: name || '', email: email || '', phone: phone || '' });
  }, [name, email, phone]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (isTrialMode) {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        dispatch(updateInfoSuccess({
          _id: candidateId!,
          ...formData,
          role
        }));
        toast.success("Information saved!", { description: "Your trial interview will now begin." });
      } else {
        const response = await apiClient.patch(`/candidates/${candidateId}`, formData);
        dispatch(updateInfoSuccess(response.data.candidate));
        toast.success("Information saved!", { description: "Your interview will now begin." });
      }
    } catch (error) {
      console.error('Update failed:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      toast.error('Update Failed', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          {isTrialMode 
            ? "Fill in your details to continue the trial interview." 
            : "Please fill in the missing details to proceed."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!name && (
            <div className="space-y-2">
              <label htmlFor="name">Full Name</label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          {!email && (
            <div className="space-y-2">
              <label htmlFor="email">Email Address</label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
          )}
          {!phone && (
            <div className="space-y-2">
              <label htmlFor="phone">Phone Number</label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit and Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}