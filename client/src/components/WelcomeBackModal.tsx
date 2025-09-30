// client\src\components\WelcomeBackModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

interface WelcomeBackModalProps {
  isOpen: boolean;
  onResume: () => void;
  onStartOver: () => void;
}

export function WelcomeBackModal({ isOpen, onResume, onStartOver }: WelcomeBackModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome Back!</DialogTitle>
          <DialogDescription>
            It looks like you were in the middle of an interview. Would you like to resume where you left off?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 sm:justify-start gap-2">
          <Button onClick={onResume}>
            <Play className="mr-2 h-4 w-4" />
            Resume Interview
          </Button>
          <Button variant="outline" onClick={onStartOver}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
