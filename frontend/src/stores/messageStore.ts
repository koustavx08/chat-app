import { create } from 'zustand';
import { Message } from '../types';
import { getMessages, sendMessage as sendMessageApi, markAsRead as markAsReadApi } from '../api/messages';
import { getSocket } from '../lib/socket';

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (message: Partial<Message>) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  sendTypingStatus: (conversationId: string, isTyping: boolean) => void; // Added sendTypingStatus
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  loading: false,
  error: null,
  fetchMessages: async (conversationId) => {
    set({ loading: true, error: null });
    try {
      const messages = await getMessages(conversationId);
      set({ messages, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  sendMessage: async (message) => {
    set({ loading: true, error: null });
    try {
      const newMessage = await sendMessageApi(message);
      set((state) => ({
        messages: [...state.messages, newMessage],
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  markAsRead: async (conversationId) => {
    set({ loading: true, error: null });
    try {
      await markAsReadApi(conversationId);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  sendTypingStatus: (conversationId, isTyping) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('typing', {
        conversationId,
        isTyping
      });
    } else {
      console.warn('Socket not connected, cannot send typing status');
    }
  }
}));