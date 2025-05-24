import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversationStore } from '../stores/conversationStore';
import { Search, UserPlus, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { User } from '../types';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';

const NewConversation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { createGroup } = useConversationStore(); // Changed createConversation to createGroup
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setUsers([]);
        return;
      }

      setIsSearching(true);
      
      try {
        const response = await api.get(`/users/search?q=${encodeURIComponent(searchTerm)}`);
        // Filter out the current user from results
        const filteredUsers = response.data.filter((user: User) => user._id !== currentUser?._id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, currentUser]);

  const handleStartConversation = async (userId: string) => {
    try {
      // Assuming createGroup can handle single user for direct message,
      // or a more specific function should be created in the store.
      // For now, creating a "group" with the current user and the selected user.
      // The name of the group could be generated based on user names or be a standard placeholder.
      if (!currentUser) {
        console.error("Current user not found");
        return;
      }
      const participants = [currentUser._id, userId];
      // Create a name for the direct message, could be improved
      const otherUser = users.find(u => u._id === userId);
      const groupName = `DM with ${otherUser?.name || 'user'}`; 
      const conversation = await createGroup(groupName, participants);
      navigate(`/chat/${conversation._id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="mr-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">New Conversation</h1>
      </div>

      {/* Search input */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : searchTerm && users.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No users found
          </div>
        ) : (
          <motion.div
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
            {users.map((user) => (
              <motion.div
                key={user._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleStartConversation(user._id)}
              >
                <div className="flex items-center">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                    alt={user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewConversation;