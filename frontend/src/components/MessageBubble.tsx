import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Download, Image, FileText, Film, MoreVertical, Trash2, Reply } from 'lucide-react';
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
          <div className="relative">
            <img 
              src={message.file} 
              alt="Image" 
              className="rounded-md max-w-full max-h-60 object-contain" 
            />
            <a 
              href={message.file} 
              download={message.content} 
              className="absolute bottom-2 right-2 p-2 rounded-full bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-90"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        );
        
      case 'video':
        return (
          <div className="relative">
            <video 
              src={message.file} 
              controls 
              className="rounded-md max-w-full max-h-60"
            />
            <a 
              href={message.file} 
              download={message.content} 
              className="absolute bottom-2 right-2 p-2 rounded-full bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-90"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        );
        
      case 'document':
        return (
          <div className="flex items-center space-x-2 p-1">
            <FileText className={`h-6 w-6 ${isSender ? 'text-white' : 'text-gray-700'}`} />
            <div className="flex-1 truncate">
              <p className={`text-sm ${isSender ? 'text-white' : 'text-gray-900'}`}>
                {message.content}
              </p>
            </div>
            <a 
              href={message.file} 
              download={message.content} 
              className={`p-1.5 rounded-full ${isSender ? 'text-white hover:bg-primary-700' : 'text-gray-700 hover:bg-gray-300'}`}
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        );
        
      default:
        return (
          <p className={`text-sm ${isSender ? 'text-white' : 'text-gray-900'}`}>
            {decryptedContent}
          </p>
        );
    }
  };
  
  const renderFileIcon = () => {
    switch (message.type) {
      case 'image':
        return <Image className="h-4 w-4 mr-1" />;
      case 'video':
        return <Film className="h-4 w-4 mr-1" />;
      case 'document':
        return <FileText className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  const renderMessageStatus = () => {
    if (!isSender) return null;
    
    if (message.read) {
      return <CheckCheck className="h-3.5 w-3.5 text-white ml-1" />;
    } else if (message.delivered) {
      return <Check className="h-3.5 w-3.5 text-white/80 ml-1" />;
    } else {
      return <Check className="h-3.5 w-3.5 text-white/60 ml-1" />;
    }
  };

  return (
    <div className={`flex items-end ${isSender ? 'justify-end' : 'justify-start'} mb-1`}>
      {/* Avatar for recipient */}
      {!isSender && showAvatar && !isConsecutive && (
        <img 
          src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.name}&background=3B82F6&color=fff`} 
          alt={message.sender.name} 
          className="h-8 w-8 rounded-full mr-2 mb-1"
        />
      )}
      
      {!isSender && (isConsecutive || !showAvatar) && <div className="w-8 mr-2"></div>}
      
      <div className="group relative max-w-xs md:max-w-md">
        {/* Message bubble */}
        <div className={getBubbleClass()}>
          {/* Sender name for group chats */}
          {!isSender && !isConsecutive && message.conversationIsGroup && (
            <p className="text-xs font-medium text-primary-700 mb-1">
              {message.sender.name}
            </p>
          )}
          
          {renderMessageContent()}
          
          {/* Message metadata */}
          <div className={`flex items-center mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${isSender ? 'text-white/70' : 'text-gray-500'}`}>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {renderMessageStatus()}
          </div>
        </div>
        
        {/* Message options button */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="absolute top-2 right-0 p-1 rounded-full bg-gray-800 bg-opacity-0 text-transparent hover:bg-opacity-50 hover:text-white group-hover:opacity-100 opacity-0 transition-opacity -mr-8"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        
        {/* Message options dropdown */}
        {showOptions && (
          <div className="absolute top-0 right-0 mt-8 -mr-8 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  // Handle reply
                  setShowOptions(false);
                }}
              >
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </button>
              {isSender && (
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-error-600 hover:bg-gray-100"
                  onClick={() => {
                    // Handle delete
                    setShowOptions(false);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;