import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { Conversation } from '../types';
import { useConversationStore } from '../stores/conversationStore';

interface ConversationItemProps {
  conversation: Conversation;
}

const ConversationItem = ({ conversation }: ConversationItemProps) => {
  const { user } = useAuthStore();
  const { setCurrentConversation, toggleSidebar } = useConversationStore();
  const navigate = useNavigate();
  
  const isGroup = conversation.isGroup;
  const otherParticipant = !isGroup 
    ? conversation.participants.find(p => p._id !== user?._id) 
    : null;
  
  const displayName = isGroup 
    ? conversation.name ?? 'Unnamed Group'
    : otherParticipant?.name ?? 'Unknown User';
  
  const avatarUrl = isGroup 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name ?? 'G')}&background=6366f1&color=fff` 
    : otherParticipant?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant?.name ?? 'U')}&background=6366f1&color=fff`;
  
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount ?? 0;
  
  const handleClick = () => {
    setCurrentConversation(conversation);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
    
    if (isGroup) {
      navigate(`/group/${conversation._id}`);
    } else {
      navigate(`/chat/${conversation._id}`);
    }
  };
  
  const messageStatusIcon = () => {
    if (!lastMessage || lastMessage.sender._id === user?._id) return null;
    if (lastMessage.read) {
      return <CheckCheck className="h-4 w-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />;
    } else if (lastMessage.delivered) {
      return <Check className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />;
    }
    return null;
  };

  return (
    <div 
      onClick={handleClick} 
      className={`
        p-2 rounded-lg cursor-pointer transition-all duration-200
        hover:bg-gray-100 dark:hover:bg-white/5
        ${unreadCount > 0 ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img 
            src={avatarUrl} 
            alt={displayName} 
            className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800" 
          />
          {conversation.online && !isGroup && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-teal-500 ring-2 ring-white dark:ring-gray-800"></span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`font-medium truncate ${
              unreadCount > 0 
                ? 'text-gray-900 dark:text-white font-semibold' 
                : 'text-gray-700 dark:text-gray-200'
            }`}>
              {displayName}
            </p>
            {lastMessage && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-0.5">
            <p className={`text-sm truncate ${
              unreadCount > 0 
                ? 'text-gray-900 dark:text-white font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {lastMessage ? (
                lastMessage.type === 'text' 
                  ? lastMessage.content 
                  : `Sent a ${lastMessage.type}`
              ) : 'No messages yet'}
            </p>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {messageStatusIcon()}
              
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-xs text-white font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;