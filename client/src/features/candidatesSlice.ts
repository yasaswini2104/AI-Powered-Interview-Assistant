// client\src\features\candidatesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchAllCandidates } from './candidatesThunks';
import { completeInterview } from './interviewThunks';

export interface InterviewEntry {
  question: string;
  answer?: string;
  score?: number;
  feedback?: string;
  skillTags?: string[];
}

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone?: string; // Make phone optional for backwards compatibility
  role: string;
  finalScore: number;
  summary: string;
  status: 'pending' | 'in-progress' | 'completed';
  interviewHistory: InterviewEntry[];
  insights: {
    strengths: string[];
    weaknesses: string[];
  };
  recommendation?: {
    verdict: string;
    justification: string;
  };
  createdAt: string;
}

interface CandidatesState {
  candidates: Candidate[];
  status: 'idle' | 'succeeded' | 'loading' | 'failed';
  error: string | null;
}

const initialState: CandidatesState = {
  candidates: [],
  status: 'idle',
  error: null,
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCandidates.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllCandidates.fulfilled, (state, action: PayloadAction<Candidate[]>) => {
        state.status = 'succeeded';
        state.candidates = action.payload;
      })
      .addCase(fetchAllCandidates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(completeInterview.fulfilled, (state, action: PayloadAction<Candidate>) => {
        // Only add to candidates list if it's a real authenticated interview
        // (not a trial mode interview)
        if (!action.payload._id.startsWith('trial-')) {
          state.candidates.unshift(action.payload);
        }
      });
  },
});

export default candidatesSlice.reducer;