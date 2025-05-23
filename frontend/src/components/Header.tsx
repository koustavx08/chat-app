import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Menu, Bell, UserCircle, Settings, LogOut, X, MessageCircle } from 'lucide-react';
import { useConversationStore } from '../stores/conversationStore';
import DarkModeToggle from './DarkModeToggle';
import DropdownPortal from './DropdownPortal';
import { HTMLElementWithClosest } from '../types';

const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useConversationStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElementWithClosest;
      
      if (notificationsOpen && !target.closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
      if (profileMenuOpen && !target.closest('.profile-menu')) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen, profileMenuOpen]);

  // Ensure only one panel is open at a time
  const handleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
    setProfileMenuOpen(false);
  };
  const handleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
    setNotificationsOpen(false);
  };

  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-surface dark:bg-surface border-b border-white/10 transition-all duration-200 z-[100] relative">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
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
            <div className="relative z-[101]">
              <button
                type="button"
                className="relative rounded-full bg-surface dark:bg-background p-1 text-muted dark:text-white hover:text-primary focus:outline-none transition-all duration-200"
                onClick={handleNotifications}
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent ring-2 ring-white"></span>
              </button>
              <DropdownPortal
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                className="fixed right-4 top-16 z-[200] w-80 origin-top-right rounded-lg bg-surface dark:bg-background p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-in-out opacity-100 scale-100 notifications-dropdown"
              >
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                  <span className="font-medium">Notifications</span>
                  <button 
                    onClick={() => setNotificationsOpen(false)} 
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <div className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer">
                    <p className="text-sm">New message from Sarah</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer">
                    <p className="text-sm">David added you to a group</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                  </div>
                </div>
              </DropdownPortal>
            </div>
            {/* Profile dropdown */}
            <div className="relative z-[101]">
              <button
                type="button"
                className="rounded-full border-2 border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                onClick={handleProfileMenu}
              >
                <img
                  className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                  alt={user?.name}
                />
              </button>
              <DropdownPortal
                isOpen={profileMenuOpen}
                onClose={() => setProfileMenuOpen(false)}
                className="fixed right-4 top-16 z-[200] w-48 origin-top-right rounded-lg bg-surface dark:bg-background p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-in-out opacity-100 scale-100 profile-menu"
              >
                <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{user?.email}</p>
                </div>
                <div>
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
              </DropdownPortal>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;