import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface InterviewTimerProps {
  duration: number;
  onTimeUp: () => void;
}

export function InterviewTimer({ duration, onTimeUp }: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId); 
  }, [timeLeft, onTimeUp]);

  const progress = (timeLeft / duration) * 100;

  return (
    <div className="w-full bg-slate-100 p-4 rounded-lg border border-slate-200 sticky top-4 z-10">
      <div className="flex items-center justify-between gap-4">
        <Clock className="h-6 w-6 text-slate-600" />
        <div className="flex-1">
          <p className="text-center font-medium text-slate-700">{timeLeft} seconds remaining</p>
          <Progress value={progress} className="mt-2 h-2" />
        </div>
      </div>
    </div>
  );
}
