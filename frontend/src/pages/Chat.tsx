import { useEffect } from 'react';
import { useConversationStore } from '../stores/conversationStore';
import { MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Chat = () => {
  const { conversations, fetchConversations, loading } = useConversationStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 mb-6">
            Start a new conversation with friends or create a group chat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/new-conversation"
              className="btn btn-primary"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start a conversation
            </Link>
            <Link
              to="/create-group"
              className="btn btn-secondary"
            >
              <Users className="h-5 w-5 mr-2" />
              Create a group
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="text-center max-w-md mx-auto">
        <MessageCircle className="h-16 w-16 text-primary-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to ChatApp</h3>
        <p className="text-gray-500 mb-6">
          Select a conversation from the sidebar to start chatting
        </p>
        <p className="text-sm text-gray-400">
          You have {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default Chat;