import axios from 'axios';
import Config from 'react-native-config';
import { useAppStore } from '../store/useAppStore';

const api = axios.create({
  baseURL: Config.API_BASE_URL || 'https://nexor-backend.onrender.com/api',
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

// Handle token expiry — but NOT for Swiggy routes (401 there = Swiggy not connected, not Nexor logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url: string = error.config?.url ?? '';
    const isSwiggyRoute = url.includes('/swiggy/');
    if (error.response?.status === 401 && !isSwiggyRoute) {
      useAppStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default api;
