// client\src\api\axios.ts
import axios from 'axios';
import { store } from '../app/store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL , 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.userInfo?.token;

  // Only add Authorization header if token exists
  // Trial mode requests will work without this header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;