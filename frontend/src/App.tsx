import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import { useAuthStore } from './stores/authStore';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import DirectMessage from './pages/DirectMessage';
import GroupChat from './pages/GroupChat';
import CreateGroup from './pages/CreateGroup';
import NewConversation from './pages/NewConversation';
import { initializeSocketConnection } from './lib/socket';

function App() {
  const { token, isAuthenticated, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && token) {
      initializeSocketConnection(token);
    }
  }, [isAuthenticated, token]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Chat />} />
        <Route path="/chat/:conversationId" element={<DirectMessage />} />
        <Route path="/group/:groupId" element={<GroupChat />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/new-conversation" element={<NewConversation />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Redirects */}
      <Route 
        path="*" 
        element={isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
}

export default App;