// client\src\features\authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axios';
import { setCredentials } from './authSlice';
import { isAxiosError } from 'axios';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'individual' | 'recruiter' | '';
  companyName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const register = createAsyncThunk(
  'auth/register',
 
  async (userData: RegisterData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      dispatch(setCredentials(response.data));
      return response.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const errorMessage = err.response.data.errors?.[0]?.msg || err.response.data.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('An unexpected error occurred during registration.');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData: LoginData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.post('/users/login', userData);
      dispatch(setCredentials(response.data));
      return response.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const errorMessage = err.response.data.errors?.[0]?.msg || err.response.data.message;
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('An unexpected error occurred during login.');
    }
  }
);

