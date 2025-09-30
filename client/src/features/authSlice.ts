import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { register, login } from './authThunks'; 

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: 'individual' | 'recruiter';
  token: string;
}

interface AuthState {
  userInfo: UserInfo | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Check if user info is already in localStorage (from a previous session)
const userInfoFromStorage: UserInfo | null = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo')!)
  : null;

const initialState: AuthState = {
  userInfo: userInfoFromStorage,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
    
    setCredentials: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
  },
  // Add extraReducers to handle thunk lifecycle actions
  extraReducers: (builder) => {
    builder
      // Handle Register Thunk
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Handle Login Thunk
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string; 
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;