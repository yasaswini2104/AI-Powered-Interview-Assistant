// client\src\features\interviewSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchQuestion, submitAnswer, completeInterview } from './interviewThunks';
import { syncTrialToAccount } from './candidatesThunks';

interface InterviewEntry {
  question: string;
  answer?: string;
  feedback?: string;
  score?: number;
  skillTags?: string[];
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
  // Store completion data for trial mode
  finalSummary?: {
    summary: string;
    insights: { strengths: string[]; weaknesses: string[] };
    recommendation: { verdict: string; justification: string };
    finalScore: number;
  };
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
      
      // Check if profile details are missing
      const hasValidName = action.payload.name && action.payload.name !== 'Candidate';
      const hasValidEmail = action.payload.email;
      const hasValidPhone = action.payload.phone && action.payload.phone !== '000-000-0000';
      
      // If any critical info is missing, ask for it
      if (!hasValidName || !hasValidEmail || !hasValidPhone) {
        state.status = 'pending-info';
      } else {
        state.status = 'in-progress';
      }
    },
    
    updateInfoSuccess: (state, action: PayloadAction<CandidatePayload>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      if (action.payload.role) {
        state.role = action.payload.role;
      }
      state.status = 'in-progress';
    },
    
    clearInterviewState: () => initialState,
    
    convertToTrialMode: (state) => {
      if (state.candidateId && !state.candidateId.startsWith('trial-')) {
        state.candidateId = `trial-${Date.now()}`;
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Question
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
      
      // Submit Answer
      .addCase(submitAnswer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        const lastEntry = state.history.find(h => !h.answer);
        if (lastEntry) {
          lastEntry.answer = action.meta.arg;
          lastEntry.feedback = action.payload.feedback;
          lastEntry.score = action.payload.score;
          lastEntry.skillTags = action.payload.skillTags;
        }
        state.currentQuestionIndex += 1;
        state.status = 'in-progress';
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      })
      
      // Complete Interview
      .addCase(completeInterview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(completeInterview.fulfilled, (state, action) => {
        state.status = 'completed';
        
        // Calculate final score from history
        const totalScore = state.history.reduce((acc, entry) => acc + (entry.score || 0), 0);
        const avgScore = state.history.length > 0 ? totalScore / state.history.length : 0;
        
        // For trial mode, the response might not have full data
        if (action.payload.summary) {
          // Authenticated mode - full data from server
          state.finalSummary = {
            summary: action.payload.summary,
            insights: action.payload.insights || { strengths: [], weaknesses: [] },
            recommendation: action.payload.recommendation || { verdict: 'Pending', justification: '' },
            finalScore: parseFloat(avgScore.toFixed(2))
          };
        } else {
          // Trial mode - create minimal summary
          state.finalSummary = {
            summary: 'Interview completed in trial mode. Sign up to get AI-powered insights!',
            insights: { strengths: [], weaknesses: [] },
            recommendation: { 
              verdict: 'Trial Mode', 
              justification: 'Complete sign-up to receive detailed recommendations and analysis.' 
            },
            finalScore: parseFloat(avgScore.toFixed(2))
          };
        }
      })
      .addCase(completeInterview.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      })
      
      // Sync trial to account
      .addCase(syncTrialToAccount.fulfilled, (state, action) => {
        state.candidateId = action.payload._id;
        state.status = 'in-progress';
      });
  },
});

export const { startInterviewSuccess, updateInfoSuccess, clearInterviewState, convertToTrialMode } = interviewSlice.actions;
export default interviewSlice.reducer;