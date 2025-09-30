import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea'; 
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export function AnswerInput({ onSubmit, isLoading }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer(''); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
      <div className="relative">
        <Textarea
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="pr-20"
          rows={3}
          disabled={isLoading}
        />
        <Button type="submit" size="icon" className="absolute top-1/2 right-3 -translate-y-1/2" disabled={isLoading || !answer.trim()}>
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

