import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (user: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false,
  loading: false,
  
  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({
      token: null,
      user: null,
      isAuthenticated: false
    });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, loading: false });
      return;
    }
    
    set({ loading: true });
    
    try {
      const response = await api.get('/auth/me');
      set({
        user: response.data,
        isAuthenticated: true,
        loading: false
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  },
  
  updateProfile: async (userData: User) => {
    set({ loading: true });
    try {
      const response = await api.put('/users/profile', userData);
      set({
        user: response.data,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  }
}));