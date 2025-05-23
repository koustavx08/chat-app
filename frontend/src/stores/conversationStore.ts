import { create } from 'zustand';
import { Conversation } from '../types';
import { getConversations, getConversation, createGroup, addParticipant, removeParticipant } from '../api/conversations';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  isOpen: boolean; // Added for sidebar state
  fetchConversations: () => Promise<void>;
  getConversation: (id: string) => Promise<void>;
  createGroup: (name: string, participants: string[]) => Promise<Conversation>; // Modified to return Conversation
  setCurrentConversation: (conversation: Conversation) => void; // Added setCurrentConversation
  addParticipant: (conversationId: string, userId: string) => Promise<void>;
  removeParticipant: (conversationId: string, userId: string) => Promise<void>;
  toggleSidebar: () => void; // Added for sidebar state
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
  isOpen: false, // Default state for sidebar
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }), // Added setCurrentConversation implementation
  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const conversations = await getConversations();
      set({ conversations, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  getConversation: async (id) => {
    set({ loading: true, error: null });
    try {
      const conversation = await getConversation(id);
      set({ currentConversation: conversation, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  createGroup: async (name, participants) => {
    set({ loading: true, error: null });
    try {
      const conversation = await createGroup(name, participants);
      set((state) => ({
        conversations: [...state.conversations, conversation],
        loading: false
      }));
      return conversation; // Return the created Conversation object
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  addParticipant: async (conversationId, userId) => {
    set({ loading: true, error: null });
    try {
      const conversation = await addParticipant(conversationId, userId);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? conversation : c
        ),
        currentConversation: state.currentConversation?._id === conversationId
          ? conversation
          : state.currentConversation,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  removeParticipant: async (conversationId, userId) => {
    set({ loading: true, error: null });
    try {
      const conversation = await removeParticipant(conversationId, userId);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? conversation : c
        ),
        currentConversation: state.currentConversation?._id === conversationId
          ? conversation
          : state.currentConversation,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })), // Implementation for toggleSidebar
}));