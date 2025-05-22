import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Menu, Bell, UserCircle, Settings, LogOut, X, MessageCircle } from 'lucide-react';
import { useConversationStore } from '../stores/conversationStore';
import DarkModeToggle from './DarkModeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useConversationStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <header className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors duration-200 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              ChatApp
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors duration-200 relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-gray-900"></span>
            </button>
            
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 z-10 mt-2 w-80 origin-top-right glass-panel"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium">Notifications</span>
                    <button 
                      onClick={() => setNotificationsOpen(false)} 
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors duration-200">
                      <p className="text-sm">New message from Sarah</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
                    </div>
                    <div className="p-4 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors duration-200">
                      <p className="text-sm">David added you to a group</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <img
                className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                alt={user?.name}
              />
            </button>
            
            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 z-10 mt-2 w-56 origin-top-right glass-panel"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 p-2 text-sm rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors duration-200"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <UserCircle className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 p-2 text-sm rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors duration-200"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      className="flex w-full items-center gap-3 p-2 text-sm rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors duration-200 text-red-600 dark:text-red-400"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;