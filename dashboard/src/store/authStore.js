import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('token', token);
      window.postMessage({ type: 'TABMIND_AUTH_SYNC', token }, '*');
    }
    set({ user, token, isAuthenticated: !!token });
  },

  fetchProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true });
      return response.data;
    } catch (err) {
      get().logout();
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  initAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      window.postMessage({ type: 'TABMIND_AUTH_SYNC', token }, '*');
      set({ token, isAuthenticated: true });
      // Proactively fetch profile if token exists
      get().fetchProfile();
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const response = await api.patch('/user/preferences', preferences);
      set((state) => ({
        user: { ...state.user, preferences: response.data }
      }));
      return response.data;
    } catch (err) {
      console.error('Failed to update preferences:', err);
      throw err;
    }
  },
}));

export default useAuthStore;
