import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Check, CheckCheck, Download, Image, FileText, Film, MoreVertical, Trash2, Reply } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message as MessageType } from '../types';
import { useAuthStore } from '../stores/authStore';
import { decryptMessage } from '../lib/encryption';

interface MessageBubbleProps {
  message: MessageType;
  previousMessage?: MessageType;
  nextMessage?: MessageType;
  showAvatar?: boolean;
}

const MessageBubble = ({ 
  message, 
  previousMessage, 
  nextMessage,
  showAvatar = true
}: MessageBubbleProps) => {
  const { user } = useAuthStore();
  const [showOptions, setShowOptions] = useState(false);
  const [showTime, setShowTime] = useState(false);
  
  const isSender = message.sender._id === user?._id;
  const isConsecutive = previousMessage?.sender._id === message.sender._id;
  const isFollowedBySame = nextMessage?.sender._id === message.sender._id;
  
  // Decrypt message content
  const decryptedContent = message.encryptedContent 
    ? decryptMessage(message.encryptedContent) 
    : message.content;
  
  // Calculate rounded corners for consecutive messages
  const getBubbleClass = () => {
    let baseClass = isSender 
      ? 'message-bubble message-bubble-sent' 
      : 'message-bubble message-bubble-received';
    
    // Adjust corners for consecutive messages
    if (isConsecutive && isFollowedBySame) {
      return `${baseClass} rounded-lg`;
    } else if (isConsecutive) {
      return isSender
        ? `${baseClass} rounded-tr-lg`
        : `${baseClass} rounded-tl-lg`;
    } else if (isFollowedBySame) {
      return isSender
        ? `${baseClass} rounded-br-lg`
        : `${baseClass} rounded-bl-lg`;
    }
    
    return baseClass;
  };
  
  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="relative group">
            <img 
              src={message.file} 
              alt="Image" 
              className="rounded-lg max-w-full max-h-60 object-contain" 
            />
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors duration-200 opacity-0 group-hover:opacity-100"
              onClick={() => window.open(message.file, '_blank')}
            >
              <Download className="h-4 w-4" />
            </motion.button>
          </div>
        );
        
      case 'video':
        return (
          <div className="relative group">
            <video 
              src={message.file} 
              controls 
              className="rounded-lg max-w-full max-h-60"
            />
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors duration-200 opacity-0 group-hover:opacity-100"
              onClick={() => window.open(message.file, '_blank')}
            >
              <Download className="h-4 w-4" />
            </motion.button>
          </div>
        );
        
      case 'document':
        return (
          <div className="flex items-center gap-2 p-1 group">
            <FileText className="h-6 w-6" />
            <div className="flex-1 truncate">
              <p className="text-sm">
                {message.content}
              </p>
            </div>
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              onClick={() => window.open(message.file, '_blank')}
            >
              <Download className="h-4 w-4" />
            </motion.button>
          </div>
        );
        
      default:
        return (
          <p className="text-sm whitespace-pre-wrap">
            {decryptedContent}
          </p>
        );
    }
  };
  
  const renderFileIcon = () => {
    switch (message.type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Film className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const renderMessageStatus = () => {
    if (!isSender) return null;
    
    if (message.read) {
      return <CheckCheck className="h-3.5 w-3.5 text-primary-400 dark:text-primary-300 ml-1" />;
    } else if (message.delivered) {
      return <Check className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 ml-1" />;
    } else {
      return <Check className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 ml-1" />;
    }
  };

  return (
    <motion.div 
      className={`flex items-end ${isSender ? 'justify-end' : 'justify-start'} mb-1 group`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar for recipient */}
      {!isSender && showAvatar && !isConsecutive && (
        <motion.img 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.name}&background=6366f1&color=fff`} 
          alt={message.sender.name} 
          className="h-8 w-8 rounded-full mr-2 mb-1 ring-2 ring-white dark:ring-gray-800" 
        />
      )}
      
      {!isSender && (isConsecutive || !showAvatar) && <div className="w-8 mr-2"></div>}
      
      <div 
        className="relative max-w-xs md:max-w-md group"
        onMouseEnter={() => setShowTime(true)}
        onMouseLeave={() => setShowTime(false)}
      >
        {/* Message bubble */}
        <div className={getBubbleClass()}>
          {/* Sender name for group chats */}
          {!isSender && !isConsecutive && message.conversationIsGroup && (
            <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
              {message.sender.name}
            </p>
          )}
          
          {renderMessageContent()}
          
          {/* Message metadata */}
          <div className={`flex items-center mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
            <AnimatePresence>
              {showTime && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="text-xs text-gray-500 dark:text-gray-400 mr-1"
                >
                  {format(new Date(message.createdAt), 'HH:mm')}
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {renderMessageStatus()}
          </div>
        </div>
        
        {/* Message options button */}
        <AnimatePresence>
          {!showOptions && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute top-2 right-0 -mr-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <button
                onClick={() => setShowOptions(true)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Message options dropdown */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-0 right-0 mt-8 w-36 glass-panel divide-y divide-gray-200 dark:divide-gray-700 z-50"
            >
              <button
                className="dropdown-item"
                onClick={() => {
                  // Handle reply
                  setShowOptions(false);
                }}
              >
                <Reply className="h-4 w-4" />
                Reply
              </button>
              <button
                className="dropdown-item text-red-600 dark:text-red-400"
                onClick={() => {
                  // Handle delete
                  setShowOptions(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MessageBubble;