// client\src\features\candidatesThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axios';
import { isAxiosError } from 'axios';
import { type RootState } from '@/app/store';

export const fetchAllCandidates = createAsyncThunk(
  'candidates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/candidates');
      return response.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('An unknown error occurred while fetching candidates.');
    }
  }
);

// NEW: Sync trial interview to authenticated account
export const syncTrialToAccount = createAsyncThunk(
  'candidates/syncTrialToAccount',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { candidateId, name, email, phone, role, history, currentQuestionIndex } = state.interview;

    // Only sync if this is a trial interview
    if (!candidateId?.startsWith('trial-')) {
      return rejectWithValue('Not a trial interview');
    }

    // Only sync if interview has started (has at least one question)
    if (history.length === 0) {
      return rejectWithValue('No interview data to sync');
    }

    try {
      // Create a new candidate record with the trial data
      const response = await apiClient.post('/candidates/sync-trial', {
        name,
        email,
        phone,
        role,
        interviewHistory: history,
        currentQuestionIndex,
        status: state.interview.status,
      });

      return response.data.candidate;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('Failed to sync trial interview to account.');
    }
  }
);