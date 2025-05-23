import { create } from 'zustand';
import { api } from '../lib/api';
import { Message } from '../types';
import { getSocket } from '../lib/socket';

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (messageData: { 
    conversationId: string; 
    content: string;
    type?: 'text' | 'image' | 'video' | 'document';
    file?: string;
    encryptedContent?: string;
  }) => Promise<Message>;
  sendTypingStatus: (conversationId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  updateMessageStatusForConversation: (conversationId: string, status: 'delivered' | 'read') => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  
  fetchMessages: async (conversationId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/messages/${conversationId}`);
      set({ messages: response.data, loading: false });
    } catch (error) {
      set({ 
        error: 'Failed to load messages', 
        loading: false 
      });
    }
  },
  
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/messages', messageData);
      const newMessage = response.data;
      
      // Update local state
      set(state => ({
        messages: [...state.messages, newMessage]
      }));
      
      return newMessage;
    } catch (error) {
      set({ error: 'Failed to send message' });
      throw error;
    }
  },
  
  sendTypingStatus: (conversationId: string, isTyping: boolean) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('typing', { 
        conversationId, 
        isTyping 
      });
    }
  },
  
  markAsRead: async (conversationId: string) => {
    try {
      await api.post(`/messages/${conversationId}/read`);
      
      // Update local state to mark messages as read
      set(state => ({
        messages: state.messages.map(message => 
          message.conversationId === conversationId && !message.read
            ? { ...message, read: true }
            : message
        )
      }));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  },
  
  updateMessageStatusForConversation: (conversationId: string, status: 'delivered' | 'read') => {
    const socket = getSocket();
    const currentUserId = socket?.id;
    
    set(state => ({
      messages: state.messages.map(message => 
        message.conversationId === conversationId && message.sender._id !== currentUserId
          ? { 
              ...message, 
              ...(status === 'delivered' ? { delivered: true } : {}),
              ...(status === 'read' ? { read: true, delivered: true } : {})
            }
          : message
      )
    }));
  }
}));