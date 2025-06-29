import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth';

let socket: Socket | null = null;

export const initializeSocketConnection = () => {
  if (!socket) {
    const token = getAuthToken();
    if (!token) return null;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.warn('VITE_API_BASE_URL is not set. Using default http://localhost:5000 for socket connection.');
    }

    socket = io(apiBaseUrl, {
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