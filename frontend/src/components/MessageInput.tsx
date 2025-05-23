import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Smile, X, Image, FileText, Film } from 'lucide-react';
import { useMessageStore } from '../stores/messageStore';
import { useAuthStore } from '../stores/authStore';
import { encryptMessage } from '../lib/encryption';
import { motion, AnimatePresence } from 'framer-motion';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MessageInputProps {
  conversationId: string;
}

const MessageInput = ({ conversationId }: MessageInputProps) => {
  const { user } = useAuthStore();
  const { sendMessage, sendTypingStatus } = useMessageStore();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    sendTypingStatus(conversationId, true);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(conversationId, false);
    }, 3000);
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  const handleFileSelect = () => { // Removed unused 'type' parameter
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleSendMessage = async () => {
    if ((!message && selectedFiles.length === 0) || !user) return;
    
    try {
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        
        const response = await fetch(`/api/messages/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload files');
        }
        
        const { fileUrls } = await response.json();
        
        for (const fileUrl of fileUrls) {
          const fileType = getFileType(fileUrl.originalname);
          const encryptedContent = encryptMessage(fileUrl.path);
          
          await sendMessage({
            conversationId,
            content: fileUrl.originalname,
            type: fileType,
            file: fileUrl.path,
            encryptedContent
          });
        }
        
        if (message.trim()) {
          const encryptedContent = encryptMessage(message);
          await sendMessage({
            conversationId,
            content: message,
            type: 'text',
            encryptedContent
          });
        }
        
        setSelectedFiles([]);
      } else {
        const encryptedContent = encryptMessage(message);
        await sendMessage({
          conversationId,
          content: message,
          type: 'text',
          encryptedContent
        });
      }
      
      setMessage('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        sendTypingStatus(conversationId, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'document';
    
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'];
    
    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (documentExts.includes(ext)) return 'document';
    
    return 'document';
  };
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 text-primary-500 dark:text-primary-400" />;
      case 'video':
        return <Film className="h-4 w-4 text-accent-500 dark:text-accent-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage();
      }}
    >
      {/* Selected files preview */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 p-2 space-y-2"
          >
            {selectedFiles.map((file, index) => {
              const fileType = getFileType(file.name);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  {getFileIcon(fileType)}
                  <span className="text-sm truncate flex-1">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
          >
            {showAttachmentOptions ? <X className="h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
          </button>

          <AnimatePresence>
            {showAttachmentOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 glass-panel divide-y divide-gray-200 dark:divide-gray-700"
              >
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="dropdown-item"
                >
                  <Image className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="dropdown-item"
                >
                  <Film className="h-4 w-4 text-accent-500 dark:text-accent-400" />
                  Video
                </button>
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="dropdown-item"
                >
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Document
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="input flex-1 min-w-0"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
          >
            <Smile className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute bottom-full right-0 mb-2"
              >
                <div className="glass-panel p-2">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={isUploading || (!message && selectedFiles.length === 0)}
          className="btn btn-primary !p-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="h-5 w-5" />
        </motion.button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />
    </form>
  );
};

export default MessageInput;