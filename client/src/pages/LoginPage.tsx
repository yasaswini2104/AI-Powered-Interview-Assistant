// client\src\pages\LoginPage.tsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { type AppDispatch, type RootState } from '@/app/store';
import { login } from '@/features/authThunks';

export function LoginPage({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { status, error, userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
  }, [userInfo]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back!</CardTitle>
        <CardDescription>Log in to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Log In'}
          </Button>
          <p className="text-center text-sm">
            Don't have an account?{' '}
            <Button variant="link" onClick={onSwitchToRegister} className="p-0">Sign Up</Button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
