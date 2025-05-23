import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useConversationStore } from '../stores/conversationStore';
import { Users, MessageCircle, UserPlus, X, Plus, Search } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import ConversationItem from './ConversationItem';
import { motion, AnimatePresence } from 'framer-motion';

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
      ? conversation.name ?? 'Unnamed Group'
      : conversation.participants.find(p => p._id !== user?._id)?.name ?? 'Unknown User';
    
    return conversationName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  const sidebarClass = isOpen 
    ? 'fixed inset-y-0 left-0 z-50 w-80 transform translate-x-0 transition-transform duration-300 ease-in-out md:relative md:translate-x-0'
    : 'fixed inset-y-0 left-0 z-50 w-80 transform -translate-x-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0';

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isOpen && isMobileScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <aside className={`${sidebarClass} flex flex-col h-full`}>
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
            Messages
          </h2>
          {isMobileScreen && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="input w-full pl-10"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1">
          <Link
            to="/"
            className={`sidebar-item ${location.pathname === '/' ? 'sidebar-item-active' : ''}`}
          >
            <MessageCircle className="h-5 w-5" />
            All Conversations
          </Link>
          <Link
            to="/create-group"
            className={`sidebar-item ${location.pathname === '/create-group' ? 'sidebar-item-active' : ''}`}
          >
            <Users className="h-5 w-5" />
            Create Group
          </Link>
        </nav>

        {/* Direct Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Direct Messages
            </h3>
            <button 
              onClick={() => navigate('/new-conversation')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200 text-gray-500 dark:text-gray-400"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          ) : (
            <motion.ul 
              className="space-y-0.5"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {filteredConversations
                .filter(conversation => !conversation.isGroup)
                .map(conversation => (
                  <motion.li
                    key={conversation._id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                  >
                    <ConversationItem conversation={conversation} />
                  </motion.li>
                ))}
            </motion.ul>
          )}
          
          {/* Group Chats */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Group Chats
              </h3>
              <button 
                onClick={() => navigate('/create-group')}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200 text-gray-500 dark:text-gray-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            ) : (
              <motion.ul 
                className="space-y-0.5"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                {filteredConversations
                  .filter(conversation => conversation.isGroup)
                  .map(conversation => (
                    <motion.li
                      key={conversation._id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                    >
                      <ConversationItem conversation={conversation} />
                    </motion.li>
                  ))}
              </motion.ul>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;