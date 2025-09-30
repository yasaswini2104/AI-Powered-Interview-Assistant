import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { type RootState, type AppDispatch } from '@/app/store';
import { fetchQuestion, submitAnswer, completeInterview } from '../features/interviewThunks';
import { clearInterviewState } from '../features/interviewSlice'; // 1. Import the clear action
import { ChatMessage } from './ChatMessage';
import { InterviewTimer } from './InterviewTimer';
import { AnswerInput } from './AnswerInput';
import { Loader2 } from 'lucide-react';

export function ChatWindow() {
  const dispatch = useDispatch<AppDispatch>();
  const { status, history, currentQuestionIndex } = useSelector((state: RootState) => state.interview);
  const hasFetchedInitialQuestion = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (status === 'in-progress' && history.length === 0 && !hasFetchedInitialQuestion.current) {
      hasFetchedInitialQuestion.current = true;
      dispatch(fetchQuestion());
    }
  }, [status, history.length, dispatch]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleAnswerSubmit = async (answer: string) => {
    try {
      await dispatch(submitAnswer(answer)).unwrap();
      
      // We get the index directly from the Redux state after it has been updated.
      const updatedIndex = (await store.getState()).interview.currentQuestionIndex;

      if (updatedIndex < 6) {
        dispatch(fetchQuestion());
      } else {
        toast.info("Interview finished!", { description: "Calculating your final results..." });
        
        // --- THIS IS THE FIX ---
        // 2. We call the simplified thunk.
        await dispatch(completeInterview()).unwrap();

        // 3. After a short delay, we manually clear the state for the next visit.
        setTimeout(() => {
          dispatch(clearInterviewState());
        }, 3000); // 3-second delay for the user to see the success screen
      }
    } catch (error) {
      console.error("Failed to submit answer or complete interview:", error);
      toast.error("Process Failed", { description: "An error occurred. Please try again." });
    }
  };

  const handleTimeUp = () => handleAnswerSubmit("(Time ran out)");
  
  const getTimerDuration = () => {
    if (currentQuestionIndex < 2) return 20;
    if (currentQuestionIndex < 4) return 60;
    return 120;
  };

  const currentQuestion = history[history.length - 1];
  const isAwaitingAnswer = currentQuestion && typeof currentQuestion.answer === 'undefined';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {isAwaitingAnswer && (
        <InterviewTimer
          key={currentQuestion.question}
          duration={getTimerDuration()}
          onTimeUp={handleTimeUp}
        />
      )}
      <div className="space-y-4 flex flex-col p-4 border rounded-lg bg-white h-[60vh] overflow-y-auto">
        {history.map((entry, index) => (
          <div key={index} className="flex flex-col gap-4">
            <ChatMessage role="ai" content={entry.question} />
            {entry.answer && <ChatMessage role="user" content={entry.answer} />}
            {entry.feedback && <ChatMessage role="feedback" content={`Feedback: ${entry.feedback}`} />}
          </div>
        ))}
        {status === 'loading' && <div className="self-center p-4"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>}
        <div ref={chatEndRef} />
      </div>
      {isAwaitingAnswer && <AnswerInput onSubmit={handleAnswerSubmit} isLoading={status === 'loading'} />}
    </div>
  );
}

import { store } from '../app/store';