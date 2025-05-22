import { create } from 'zustand';
import { api } from '../lib/api';
import { Conversation } from '../types';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  fetchConversations: () => Promise<void>;
  getConversation: (id: string) => Promise<void>;
  createConversation: (userId: string) => Promise<Conversation>;
  createGroup: (groupData: { name: string; description: string; participants: string[] }) => Promise<Conversation>;
  updateTypingStatus: (conversationId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation) => void;
  toggleSidebar: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
  isOpen: window.innerWidth >= 768, // Default open on desktop, closed on mobile
  
  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/conversations');
      set({ conversations: response.data, loading: false });
    } catch (error) {
      set({ 
        error: 'Failed to load conversations', 
        loading: false 
      });
    }
  },
  
  getConversation: async (id: string) => {
    // First check if we already have it
    const { conversations } = get();
    const existing = conversations.find(c => c._id === id);
    
    if (existing) {
      set({ currentConversation: existing });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/conversations/${id}`);
      set({ 
        currentConversation: response.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to load conversation', 
        loading: false 
      });
    }
  },
  
  createConversation: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/conversations', { userId });
      const newConversation = response.data;
      
      set(state => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation,
        loading: false
      }));
      
      return newConversation;
    } catch (error) {
      set({ 
        error: 'Failed to create conversation', 
        loading: false 
      });
      throw error;
    }
  },
  
  createGroup: async (groupData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/conversations/group', groupData);
      const newGroup = response.data;
      
      set(state => ({
        conversations: [newGroup, ...state.conversations],
        currentConversation: newGroup,
        loading: false
      }));
      
      return newGroup;
    } catch (error) {
      set({ 
        error: 'Failed to create group', 
        loading: false 
      });
      throw error;
    }
  },
  
  updateTypingStatus: (conversationId: string, isTyping: boolean) => {
    // This could be used to update UI for typing indicators
  },
  
  markAsRead: async (conversationId: string) => {
    try {
      await api.post(`/conversations/${conversationId}/read`);
      
      // Update local state to reflect messages as read
      set(state => ({
        conversations: state.conversations.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      }));
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  },
  
  setCurrentConversation: (conversation: Conversation) => {
    set({ currentConversation: conversation });
  },
  
  toggleSidebar: () => {
    set(state => ({ isOpen: !state.isOpen }));
  }
}));