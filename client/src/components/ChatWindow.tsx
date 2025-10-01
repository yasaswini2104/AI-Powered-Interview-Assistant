// client\src\components\ChatWindow.tsx
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { type RootState, type AppDispatch } from '@/app/store';
import { fetchQuestion, submitAnswer, completeInterview } from '../features/interviewThunks';
import { clearInterviewState } from '../features/interviewSlice';
import { ChatMessage } from './ChatMessage';
import { InterviewTimer } from './InterviewTimer';
import { AnswerInput } from './AnswerInput';
import { Loader2 } from 'lucide-react';

export function ChatWindow() {
  const dispatch = useDispatch<AppDispatch>();
  const { status, history, currentQuestionIndex } = useSelector((state: RootState) => state.interview);
  const hasFetchedInitialQuestion = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentAnswerRef = useRef<string>('');
  const isSubmittingRef = useRef(false); // Prevent double submission
  const [timerKey, setTimerKey] = useState(0); // Force timer reset
  
  useEffect(() => {
    if (status === 'in-progress' && history.length === 0 && !hasFetchedInitialQuestion.current) {
      hasFetchedInitialQuestion.current = true;
      dispatch(fetchQuestion());
    }
  }, [status, history.length, dispatch]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Reset timer when question changes
  useEffect(() => {
    const hasUnansweredQuestion = history.some(q => q.answer === undefined);
    if (hasUnansweredQuestion) {
      setTimerKey(prev => prev + 1); // Force timer to reset
    }
  }, [history]);

  const handleAnswerSubmit = async (answer: string) => {
    // Prevent double submission
    if (isSubmittingRef.current) {
      console.log('Answer submission already in progress, ignoring...');
      return;
    }

    isSubmittingRef.current = true;
    
    try {
      // Submit the answer
      await dispatch(submitAnswer(answer)).unwrap();
      currentAnswerRef.current = ''; // Clear after successful submit
      
      // Check if we need more questions
      const updatedState = (await import('@/app/store')).store.getState();
      const updatedIndex = updatedState.interview.currentQuestionIndex;

      if (updatedIndex < 6) {
        // Fetch next question
        await dispatch(fetchQuestion()).unwrap();
      } else {
        // Interview is complete
        toast.info("Interview finished!", { description: "Calculating your final results..." });
        await dispatch(completeInterview()).unwrap();

        setTimeout(() => {
          dispatch(clearInterviewState());
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to submit answer or complete interview:", error);
      toast.error("Process Failed", { description: "An error occurred. Please try again." });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleTimeUp = () => {
    // Only submit if not already submitting
    if (isSubmittingRef.current) {
      console.log('Answer already being submitted, ignoring time up...');
      return;
    }

    // Submit whatever answer is currently typed (or empty if nothing typed)
    const answer = currentAnswerRef.current || "(No answer provided - time expired)";
    handleAnswerSubmit(answer);
  };
  
  const getTimerDuration = () => {
    if (currentQuestionIndex < 2) return 20;
    if (currentQuestionIndex < 4) return 60;
    return 120;
  };

  const currentQuestion = history[history.length - 1];
  const isAwaitingAnswer = currentQuestion && typeof currentQuestion.answer === 'undefined';
  
  // Split history into answered questions and current question
  const answeredQuestions = history.filter(q => q.answer !== undefined);
  const unansweredQuestion = history.find(q => q.answer === undefined);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {isAwaitingAnswer && (
        <InterviewTimer
          key={`${currentQuestion.question}-${timerKey}`} // Unique key for each question
          duration={getTimerDuration()}
          onTimeUp={handleTimeUp}
        />
      )}
      <div className="space-y-4 flex flex-col p-4 border rounded-lg bg-white h-[60vh] overflow-y-auto">
        {/* Show all previously answered questions with their answers */}
        {answeredQuestions.map((entry, index) => (
          <div key={`answered-${index}`} className="flex flex-col gap-4 pb-4 border-b border-slate-200">
            <ChatMessage role="ai" content={entry.question} />
            <ChatMessage role="user" content={entry.answer!} />
            {entry.feedback && (
              <ChatMessage role="feedback" content={`Feedback: ${entry.feedback}`} />
            )}
          </div>
        ))}
        
        {/* Show current unanswered question */}
        {status === 'loading' ? (
          <div className="self-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            <p className="text-center text-slate-600 mt-2">Loading next question...</p>
          </div>
        ) : unansweredQuestion ? (
          <div className="flex flex-col gap-4">
            <ChatMessage role="ai" content={unansweredQuestion.question} />
          </div>
        ) : null}
        
        <div ref={chatEndRef} />
      </div>
      {isAwaitingAnswer && (
        <AnswerInput 
          onSubmit={handleAnswerSubmit} 
          isLoading={status === 'loading' || isSubmittingRef.current}
          onAnswerChange={(answer) => { currentAnswerRef.current = answer; }}
        />
      )}
    </div>
  );
}