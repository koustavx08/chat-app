import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../types';

export let socket: Socket<SocketEvents> | null = null;

export const initializeSocketConnection = (token: string): Socket<SocketEvents> | null => {
  if (socket) {
    // If socket already exists and is connected, return
    if (socket.connected) return socket;
    
    // If socket exists but is disconnected, reconnect it
    socket.connect();
    return socket;
  }
  
  // Create new socket connection
  socket = io<SocketEvents>({
    auth: {
      token
    },
    transports: ['websocket', 'polling']
  });
  
  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    
    // If error is due to authentication, clear token and redirect to login
    if (err.message === 'Authentication error') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  });
  
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket<SocketEvents> | null => {
  return socket;
};