import { api } from '../lib/api';
import { Conversation } from '../types';

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/api/conversations');
  return response.data;
};

export const getConversation = async (id: string): Promise<Conversation> => {
  const response = await api.get(`/api/conversations/${id}`);
  return response.data;
};

export const createGroup = async (name: string, participants: string[]): Promise<Conversation> => {
  const response = await api.post('/api/conversations/group', { name, participants });
  return response.data;
};

export const addParticipant = async (conversationId: string, userId: string): Promise<Conversation> => {
  const response = await api.post(`/api/conversations/${conversationId}/participants`, { userId });
  return response.data;
};

export const removeParticipant = async (conversationId: string, userId: string): Promise<Conversation> => {
  const response = await api.delete(`/api/conversations/${conversationId}/participants/${userId}`);
  return response.data;
};