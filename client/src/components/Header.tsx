import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '@/app/store';
import { logout } from '@/features/authSlice';
import { Button } from '@/components/ui/button';
import { User, LogOut, Zap } from 'lucide-react';

export function Header({ onLoginClick, onRegisterClick }: { onLoginClick: () => void; onRegisterClick: () => void; }) {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="container mx-auto p-4 flex justify-between items-center border-b mb-8">
      <div className="text-2xl font-bold tracking-tight">
        <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>AI Interviewer</a>
      </div>
      <nav>
        {userInfo ? (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2"><User className="h-4 w-4" /> {userInfo.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              <Zap className="h-4 w-4" />
              <span>Trial Mode</span>
            </div>
            <Button variant="ghost" onClick={onLoginClick}>Log In</Button>
            <Button onClick={onRegisterClick}>Sign Up</Button>
          </div>
        )}
      </nav>
    </header>
  );
}