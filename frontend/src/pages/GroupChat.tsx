import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMessageStore } from '../stores/messageStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAuthStore } from '../stores/authStore';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import { ArrowLeft, Phone, Video, UserPlus, Info, Users } from 'lucide-react';
import { getSocket } from '../lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketEvents } from '../types';

const GroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuthStore();
  const { messages, loading, fetchMessages, markAsRead } = useMessageStore();
  const { currentConversation, getConversation } = useConversationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (groupId) {
      getConversation(groupId);
      fetchMessages(groupId);
      markAsRead(groupId);
    }
  }, [groupId, getConversation, fetchMessages, markAsRead]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId) return;
    
    // Handle typing events
    const handleTypingEvent: SocketEvents['typing'] = (data) => {
      if (data.conversationId === groupId) {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          if (data.isTyping) {
            updated.add(data.userName ?? 'Someone');
          } else {
            updated.delete(data.userName ?? 'Someone');
          }
          return updated;
        });
      }
    };
    
    socket.on('typing', handleTypingEvent);
    
    return () => {
      socket.off('typing', handleTypingEvent);
    };
  }, [groupId]);
  
  if (!currentConversation || !groupId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select a group</p>
      </div>
    );
  }
  
  if (!currentConversation.isGroup) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">This is not a group conversation</p>
      </div>
    );
  }
  
  const typingMessage = () => {
    const typingArray = Array.from(typingUsers);
    if (typingArray.length === 0) return null;
    if (typingArray.length === 1) return `${typingArray[0]} is typing...`;
    if (typingArray.length === 2) return `${typingArray[0]} and ${typingArray[1]} are typing...`;
    return 'Several people are typing...';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center">
        <button className="md:hidden text-gray-500 mr-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="relative flex-shrink-0">
          <div className="bg-secondary-100 flex items-center justify-center h-10 w-10 rounded-full">
            <Users className="h-5 w-5 text-secondary-600" />
          </div>
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-900">{currentConversation.name}</h2>
          </div>
          <p className="text-sm text-gray-500">
            {currentConversation.participants.length} members
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <UserPlus className="h-5 w-5" />
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
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message._id}
                  message={{
                    ...message,
                    conversationIsGroup: true
                  }}
                  previousMessage={index > 0 ? messages[index - 1] : undefined}
                  nextMessage={index < messages.length - 1 ? messages[index + 1] : undefined}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 bg-white border-t border-gray-200">
          <p className="text-sm text-primary-600 animate-pulse">{typingMessage()}</p>
        </div>
      )}
      
      {/* Message input */}
      <MessageInput conversationId={groupId} isGroup={true} />
    </div>
  );
};

export default GroupChat;