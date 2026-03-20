import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken } from './storage';

const API_BASE_URL = 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== REQUEST INTERCEPTOR =====
// Reads JWT from chrome.storage.local (never localStorage in extension context)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
// Gracefully handle 401 (invalid/expired JWT)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear the invalid token — the extension will need to re-authenticate
      await import('./storage').then(({ clearToken }) => clearToken());
      console.warn('[TabMind] JWT expired or invalid. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export default api;
