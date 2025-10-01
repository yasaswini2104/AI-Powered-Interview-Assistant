// client\src\components\AnswerInput.tsx
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea'; 
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
  onAnswerChange?: (answer: string) => void; // Add this prop
}

export function AnswerInput({ onSubmit, isLoading, onAnswerChange }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer(''); 
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAnswer(value);
    onAnswerChange?.(value); // Call the callback when answer changes
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
      <div className="relative">
        <Textarea
          placeholder="Type your answer here..."
          value={answer}
          onChange={handleChange}
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