import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMessageStore } from '../stores/messageStore';
import { useConversationStore } from '../stores/conversationStore';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import { ArrowLeft, Video, UserPlus, Info, Users } from 'lucide-react';
import { getSocket } from '../lib/socket';
import { AnimatePresence, motion } from 'framer-motion';
import { SocketEvents } from '../types';

const GroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { messages, loading, fetchMessages } = useMessageStore();
  const { currentConversation, getConversation } = useConversationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (groupId) {
      fetchMessages(groupId);
      getConversation(groupId);
    }
  }, [groupId, fetchMessages, getConversation]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const handleTyping = (data: SocketEvents['typing']) => {
      if (data.conversationId === groupId) {
        const userName = data.userName ?? 'Someone';
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.add(userName);
          return newSet;
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userName);
            return newSet;
          });
        }, 3000);
      }
    };
    
    socket.on('typing', handleTyping);
    
    return () => {
      socket.off('typing', handleTyping);
      // Clear all timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950 font-inter">
      {/* Chat header */}
      <div className="px-4 py-3 glass-panel rounded-none md:rounded-t-xl flex items-center shadow-md">
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
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="glass-panel p-8 text-center">
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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
                    message={{ ...message, conversationIsGroup: true }}
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
      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-primary-600 animate-pulse">{typingMessage()}</p>
        </div>
      )}
      {/* Message input */}
      <div className="glass-panel rounded-none md:rounded-b-xl p-4 shadow-md">
        <MessageInput conversationId={groupId} />
      </div>
    </div>
  );
};

export default GroupChat;