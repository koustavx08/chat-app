import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMessageStore } from '../stores/messageStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAuthStore } from '../stores/authStore';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import { ArrowLeft, Phone, Video, Info } from 'lucide-react';
import { socket } from '../lib/socket';

const DirectMessage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuthStore();
  const { messages, loading, fetchMessages, markAsRead } = useMessageStore();
  const { currentConversation, getConversation, updateTypingStatus } = useConversationStore();
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
    if (!socket || !conversationId) return;
    
    // Handle typing events
    const handleTypingEvent = (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
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
  }, [conversationId, user?._id]);
  
  if (!currentConversation || !conversationId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select a conversation</p>
      </div>
    );
  }
  
  const otherParticipant = currentConversation.participants.find(p => p._id !== user?._id);
  
  if (!otherParticipant) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center">
        <button className="md:hidden text-gray-500 mr-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="relative">
          <img
            src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${otherParticipant.name}&background=3B82F6&color=fff`}
            alt={otherParticipant.name}
            className="h-10 w-10 rounded-full"
          />
          {currentConversation.online && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success-500 ring-2 ring-white"></span>
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-900">{otherParticipant.name}</h2>
          </div>
          {isTyping ? (
            <p className="text-sm text-primary-600 animate-pulse">typing...</p>
          ) : (
            <p className="text-sm text-gray-500">
              {currentConversation.online ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Say hello to {otherParticipant.name}!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                previousMessage={index > 0 ? messages[index - 1] : undefined}
                nextMessage={index < messages.length - 1 ? messages[index + 1] : undefined}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
};

export default DirectMessage;