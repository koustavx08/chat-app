export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
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