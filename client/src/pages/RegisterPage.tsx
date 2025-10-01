// client\src\pages\RegisterPage.tsx
import { useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { type AppDispatch, type RootState } from '@/app/store';
import { register } from '@/features/authThunks';

type UserRole = 'individual' | 'recruiter' | '';

export function RegisterPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('');
  const [companyName, setCompanyName] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await dispatch(register({ name, email, password, role, companyName })).unwrap();
      toast.success("Registration Successful!", { description: "Please log in to continue." });
      onSwitchToLogin();
    } catch (rejectedValue) {
      toast.error("Registration Failed", { description: rejectedValue as string });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Sign up to start your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          
          <Select onValueChange={(value) => setRole(value as UserRole)} value={role}>
            <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Personal (Practice Interviews)</SelectItem>
              <SelectItem value="recruiter">Corporate (Recruiter Dashboard)</SelectItem>
            </SelectContent>
          </Select>
          
          {role === 'recruiter' && (
            <div className="space-y-2 animate-in fade-in-0 duration-500">
                <Input placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Register'}
          </Button>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <Button variant="link" onClick={onSwitchToLogin} className="p-0">Log In</Button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

