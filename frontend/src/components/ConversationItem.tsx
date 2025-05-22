import { useNavigate } from 'react-router-dom';
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
    ? conversation.name 
    : otherParticipant?.name || 'Unknown User';
  
  const avatarUrl = isGroup 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name)}&background=8B5CF6&color=fff` 
    : otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant?.name || 'U')}&background=3B82F6&color=fff`;
  
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount || 0;
  
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
      return <CheckCheck className="h-4 w-4 text-primary-500 flex-shrink-0" />;
    } else if (lastMessage.delivered) {
      return <Check className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
    return null;
  };

  return (
    <li onClick={handleClick} className="cursor-pointer">
      <div className={`flex items-center px-2 py-2 rounded-md hover:bg-gray-100 ${unreadCount > 0 ? 'bg-gray-50' : ''}`}>
        <div className="relative flex-shrink-0">
          <img 
            src={avatarUrl} 
            alt={displayName} 
            className="h-10 w-10 rounded-full" 
          />
          {conversation.online && !isGroup && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success-500 ring-2 ring-white"></span>
          )}
        </div>
        
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium truncate ${unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
              {displayName}
            </p>
            {lastMessage && (
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {lastMessage ? (
                lastMessage.type === 'text' 
                  ? lastMessage.content 
                  : `Sent a ${lastMessage.type}`
              ) : 'No messages yet'}
            </p>
            
            <div className="flex items-center space-x-1">
              {messageStatusIcon()}
              
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ConversationItem;