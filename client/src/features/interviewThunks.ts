// client\src\features\interviewThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axios';
import { type RootState } from '@/app/store';
import { isAxiosError } from 'axios'; 

// Thunk to fetch the next interview question
export const fetchQuestion = createAsyncThunk(
  'interview/fetchQuestion',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { candidateId, role } = state.interview;
    const history = state.interview.history.map(h => h.question);

    const questionIndex = state.interview.currentQuestionIndex;
    let difficulty = 'Easy';
    if (questionIndex >= 4) {
      difficulty = 'Hard';
    } else if (questionIndex >= 2) {
      difficulty = 'Medium';
    }
    
    try {
      const response = await apiClient.post('/interview/question', { 
        candidateId, 
        role, 
        difficulty, 
        history 
      });
      return response.data;
    } catch (err) { 
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('An unknown error occurred while fetching the question.');
    }
  }
);

// Thunk to submit an answer
export const submitAnswer = createAsyncThunk(
  'interview/submitAnswer',
  async (answer: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { candidateId, history } = state.interview;
    const currentQuestion = history[history.length - 1]?.question;

    if (!currentQuestion) {
      return rejectWithValue('No active question to answer.');
    }

    try {
        const response = await apiClient.post('/interview/answer', {
            candidateId,
            question: currentQuestion,
            answer,
        });
        return response.data;
    } catch (err) { // <-- FIX: Removed ': any'
        if (isAxiosError(err) && err.response) {
            return rejectWithValue(err.response.data.message);
        }
        return rejectWithValue('An unknown error occurred while submitting the answer.');
    }
  }
);

// Thunk to finalize the interview (FINAL VERSION)
export const completeInterview = createAsyncThunk(
  'interview/complete',
  async (_, { getState, rejectWithValue }) => {
    const { candidateId } = (getState() as RootState).interview;
    try {
      const response = await apiClient.post('/interview/complete', { candidateId });
      // We simply return the final candidate data. Redux handles the rest.
      return response.data.candidate;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('An unknown error occurred while completing the interview.');
    }
  }
);