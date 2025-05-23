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

// Add type for socket events
export interface SocketEvents {
  'typing': (data: { conversationId: string; isTyping: boolean }) => void;
  'message': (message: Message) => void;
  'message:delivered': (data: { messageId: string; conversationId: string }) => void;
  'message:read': (data: { messageId: string; conversationId: string }) => void;
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
}

// Add type for event handlers
export type EventHandler = (event: Event) => void;
export type HTMLElementWithClosest = HTMLElement & {
  closest(selector: string): HTMLElement | null;
};