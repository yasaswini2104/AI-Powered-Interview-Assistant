// client\src\components\LogoutWarningModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Play, RotateCcw } from 'lucide-react';

interface LogoutWarningModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onStartOver: () => void;
}

export function LogoutWarningModal({ isOpen, onContinue, onStartOver }: LogoutWarningModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <DialogTitle className="text-2xl">You've Been Logged Out</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            You were logged out during your interview session. Your progress has been saved locally in your browser, but won't sync to your account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> To save your interview results to your account and access them across devices, please log back in after completing this session.
          </p>
        </div>

        <DialogFooter className="sm:justify-start gap-2">
          <Button onClick={onContinue} className="flex-1">
            <Play className="mr-2 h-4 w-4" />
            Continue Interview
          </Button>
          <Button variant="outline" onClick={onStartOver} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}