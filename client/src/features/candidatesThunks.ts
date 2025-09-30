// client\src\features\candidatesThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axios';
import { isAxiosError } from 'axios';

export const fetchAllCandidates = createAsyncThunk(
  'candidates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/candidates');
      return response.data; // This will be the array of candidate objects
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('An unknown error occurred while fetching candidates.');
    }
  }
);
