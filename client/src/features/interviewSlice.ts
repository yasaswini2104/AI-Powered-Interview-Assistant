import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchQuestion, submitAnswer, completeInterview } from './interviewThunks';

interface InterviewEntry {
  question: string;
  answer?: string;
  feedback?: string;
  score?: number; 
}
interface CandidatePayload {
  _id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
}
interface InterviewState {
  candidateId: string | null;
  status: 'idle' | 'loading' | 'pending-info' | 'in-progress' | 'completed' | 'error';
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  history: InterviewEntry[];
  currentQuestionIndex: number;
  error: string | null;
}

const initialState: InterviewState = {
  candidateId: null, 
  status: 'idle', 
  name: null, 
  email: null, 
  phone: null,
  role: 'Full Stack Developer', 
  history: [], 
  currentQuestionIndex: 0, 
  error: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterviewSuccess: (state, action: PayloadAction<CandidatePayload>) => {
      state.candidateId = action.payload._id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.role = action.payload.role;
      if (!action.payload.name || !action.payload.email || !action.payload.phone) {
        state.status = 'pending-info';
      } else {
        state.status = 'in-progress';
      }
    },
    updateInfoSuccess: (state, action: PayloadAction<CandidatePayload>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.status = 'in-progress';
    },
    clearInterviewState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestion.pending, (state) => { 
        state.status = 'loading'; 
        state.error = null; 
      })
      .addCase(fetchQuestion.fulfilled, (state, action) => {
        state.history.push({ question: action.payload.question });
        state.status = 'in-progress';
      })
      .addCase(fetchQuestion.rejected, (state, action) => { 
        state.status = 'error'; 
        state.error = action.payload as string; 
      })
      .addCase(submitAnswer.pending, (state) => { 
        state.status = 'loading'; 
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        const lastEntry = state.history.find(h => !h.answer);
        if (lastEntry) {
          lastEntry.answer = action.meta.arg;
          lastEntry.feedback = action.payload.feedback;
          lastEntry.score = action.payload.score; 
        }
        state.currentQuestionIndex += 1;
        state.status = 'in-progress';
      })
      .addCase(submitAnswer.rejected, (state, action) => { 
        state.status = 'error'; 
        state.error = action.payload as string; 
      })
      .addCase(completeInterview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(completeInterview.fulfilled, (state) => {
        state.status = 'completed';
      })
      .addCase(completeInterview.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      });
  },
});

export const { startInterviewSuccess, updateInfoSuccess, clearInterviewState } = interviewSlice.actions;
export default interviewSlice.reducer;