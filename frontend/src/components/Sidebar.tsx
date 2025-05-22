import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useConversationStore } from '../stores/conversationStore';
import { Users, MessageCircle, UserPlus, X, Plus, Search } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import ConversationItem from './ConversationItem';

const Sidebar = () => {
  const { user } = useAuthStore();
  const { conversations, fetchConversations, loading, isOpen, toggleSidebar } = useConversationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    const conversationName = conversation.isGroup 
      ? conversation.name 
      : conversation.participants.find(p => p._id !== user?._id)?.name || '';
    
    return conversationName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  const sidebarClass = isOpen 
    ? 'fixed inset-y-0 left-0 z-50 w-72 transform translate-x-0 transition-transform duration-300 ease-in-out md:relative md:translate-x-0'
    : 'fixed inset-y-0 left-0 z-50 w-72 transform -translate-x-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0';

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && isMobileScreen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`${sidebarClass} flex flex-col h-full bg-white border-r border-gray-200`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          {isMobileScreen && (
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search conversations"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-2 space-y-1">
          <Link
            to="/"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              location.pathname === '/' 
                ? 'bg-primary-50 text-primary-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageCircle className="mr-3 h-5 w-5 flex-shrink-0" />
            All Conversations
          </Link>
          <Link
            to="/create-group"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              location.pathname === '/create-group' 
                ? 'bg-primary-50 text-primary-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="mr-3 h-5 w-5 flex-shrink-0" />
            Create Group
          </Link>
        </nav>

        {/* Direct Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Direct Messages
            </h3>
            <button 
              onClick={() => navigate('/new-conversation')}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <UserPlus className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredConversations
                .filter(conversation => !conversation.isGroup)
                .map(conversation => (
                  <ConversationItem 
                    key={conversation._id} 
                    conversation={conversation} 
                  />
                ))}
            </ul>
          )}
          
          {/* Group Chats */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Group Chats
              </h3>
              <button 
                onClick={() => navigate('/create-group')}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredConversations
                  .filter(conversation => conversation.isGroup)
                  .map(conversation => (
                    <ConversationItem 
                      key={conversation._id} 
                      conversation={conversation} 
                    />
                  ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;