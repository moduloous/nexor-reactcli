import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

const api = axios.create({
  baseURL: 'https://nexor-backend.onrender.com/api',
  timeout: 60000, // Increased to 60s because Render free-tier backends take ~50s to wake up
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAppStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default api;
