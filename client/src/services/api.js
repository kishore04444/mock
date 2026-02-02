/**
 * Axios instance with auth header and error handling
 */
import axios from 'axios';
import { API_BASE } from '../utils/constants.js';
import { getToken, clearAuth } from '../utils/storage.js';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRequest = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthRequest) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
