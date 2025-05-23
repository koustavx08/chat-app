import { api } from '../lib/api';
import { Conversation } from '../types';

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/conversations');
  return response.data;
};

export const getConversation = async (id: string): Promise<Conversation> => {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
};

export const createGroup = async (name: string, participants: string[]): Promise<Conversation> => {
  const response = await api.post('/conversations/group', { name, participants });
  return response.data;
};

export const addParticipant = async (conversationId: string, userId: string): Promise<Conversation> => {
  const response = await api.post(`/conversations/${conversationId}/participants`, { userId });
  return response.data;
};

export const removeParticipant = async (conversationId: string, userId: string): Promise<Conversation> => {
  const response = await api.delete(`/conversations/${conversationId}/participants/${userId}`);
  return response.data;
}; 