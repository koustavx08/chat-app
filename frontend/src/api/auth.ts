import { api } from '../lib/api';
import { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.put('/api/users/profile', data);
  return response.data;
};