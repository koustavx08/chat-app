import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth';

let socket: Socket | null = null;

export const initializeSocketConnection = () => {
  if (!socket) {
    const token = getAuthToken();
    if (!token) return null;

    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocketConnection();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};