import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMessageStore } from '../stores/messageStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAuthStore } from '../stores/authStore';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import { ArrowLeft, Phone, Video, Info } from 'lucide-react';
import { getSocket } from '../lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketEvents } from '../types';

const DirectMessage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuthStore();
  const { messages, loading, fetchMessages, markAsRead } = useMessageStore();
  const { currentConversation, getConversation } = useConversationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (conversationId) {
      getConversation(conversationId);
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId, getConversation, fetchMessages, markAsRead]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;
    
    // Handle typing events
    const handleTypingEvent: SocketEvents['typing'] = (data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.isTyping);
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Auto-clear typing indicator after 3 seconds in case we miss the stop typing event
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    };
    
    socket.on('typing', handleTypingEvent);
    
    return () => {
      socket.off('typing', handleTypingEvent);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId]);
  
  if (!currentConversation || !conversationId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Select a conversation</p>
      </div>
    );
  }
  
  const otherParticipant = currentConversation.participants.find(p => p._id !== user?._id);
  
  if (!otherParticipant) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 glass-panel rounded-none md:rounded-t-xl flex items-center gap-3"
      >
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="relative">
          <img
            src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${otherParticipant.name}&background=6366f1&color=fff`}
            alt={otherParticipant.name}
            className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800"
          />
          {currentConversation.online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-teal-500 ring-2 ring-white dark:ring-gray-800"></span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">{otherParticipant.name}</h2>
          </div>
          {isTyping ? (
            <p className="text-sm text-indigo-600 dark:text-indigo-400 animate-pulse">typing...</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentConversation.online ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col items-center justify-center"
          >
            <div className="glass-panel p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-3">No messages yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Say hello to {otherParticipant.name}!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageBubble
                    message={message}
                    previousMessage={index > 0 ? messages[index - 1] : undefined}
                    nextMessage={index < messages.length - 1 ? messages[index + 1] : undefined}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-none md:rounded-b-xl p-4"
      >
        <MessageInput conversationId={conversationId} />
      </motion.div>
    </div>
  );
};

export default DirectMessage;