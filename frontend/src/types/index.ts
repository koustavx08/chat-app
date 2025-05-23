export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'document';
  file?: string;
  encryptedContent?: string;
  read: boolean;
  delivered: boolean;
  createdAt: string;
  updatedAt: string;
  conversationIsGroup?: boolean;
}

export interface Conversation {
  _id: string;
  participants: User[];
  isGroup: boolean;
  name?: string;
  description?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  online?: boolean;
}

export interface SocketEvents {
  typing: {
    conversationId: string;
    userName?: string;
    isTyping: boolean;
  };
  message: {
    conversationId: string;
    message: Message;
  };
  'message:delivered': {
    messageId: string;
    conversationId: string;
  };
  'message:read': {
    messageId: string;
    conversationId: string;
  };
  'user:online': {
    userId: string;
  };
  'user:offline': {
    userId: string;
  };
}

export type EventHandler = (event: Event) => void;

export interface HTMLElementWithClosest extends HTMLElement {
  closest(selector: string): HTMLElement | null;
}