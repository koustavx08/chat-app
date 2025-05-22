import { useEffect } from 'react';
import { useConversationStore } from '../stores/conversationStore';
import { MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Chat = () => {
  const { conversations, fetchConversations, loading } = useConversationStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="glass-panel p-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <MessageCircle className="h-16 w-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-3">No conversations yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Start a new conversation with friends or create a group chat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/new-conversation"
                className="btn btn-primary"
              >
                <MessageCircle className="h-5 w-5" />
                Start a conversation
              </Link>
              <Link
                to="/create-group"
                className="btn btn-secondary"
              >
                <Users className="h-5 w-5" />
                Create a group
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="glass-panel p-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <MessageCircle className="h-16 w-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-3">Welcome to ChatApp</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Select a conversation from the sidebar to start chatting
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Chat;