import { api } from '../lib/api';
import { Message } from '../types';

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

export const sendMessage = async (message: Partial<Message>): Promise<Message> => {
  const response = await api.post('/messages', message);
  return response.data;
};

export const markAsRead = async (conversationId: string): Promise<void> => {
  await api.post(`/messages/${conversationId}/read`);
}; 