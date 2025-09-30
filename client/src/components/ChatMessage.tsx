
import { Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils'; 

interface ChatMessageProps {
  role: 'ai' | 'user' | 'feedback';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAi = role === 'ai' || role === 'feedback';

  const icon = {
    ai: <Bot className="h-6 w-6" />,
    user: <User className="h-6 w-6" />,
    feedback: <Sparkles className="h-6 w-6 text-yellow-500" />,
  }[role];

  return (
    <div className={cn('flex items-start gap-4 p-4 rounded-lg', isAi ? 'bg-slate-100' : 'bg-blue-100 self-end')}>
      <div className={cn('flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center', isAi ? 'bg-slate-200' : 'bg-blue-200')}>
        {icon}
      </div>
      <div className="flex-1 space-y-2">
        <p className="font-bold">{isAi ? 'AI Interviewer' : 'You'}</p>
        <p className="text-slate-700 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
