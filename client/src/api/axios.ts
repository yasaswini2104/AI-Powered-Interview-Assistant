import axios from 'axios';
import { store } from '../app/store';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.userInfo?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});


export default apiClient;
