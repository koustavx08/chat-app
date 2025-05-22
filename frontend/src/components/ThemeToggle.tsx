import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-surface dark:bg-background border border-white/10 text-muted dark:text-white hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-400" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;