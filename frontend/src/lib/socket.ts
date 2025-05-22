import { io, Socket } from 'socket.io-client';

export let socket: Socket | null = null;

export const initializeSocketConnection = (token: string) => {
  if (socket) {
    // If socket already exists and is connected, return
    if (socket.connected) return;
    
    // If socket exists but is disconnected, reconnect it
    socket.connect();
    return;
  }
  
  // Create new socket connection
  socket = io({
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
  
  // Return the socket instance
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};