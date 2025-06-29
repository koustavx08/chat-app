import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Smile, X, Image, FileText, Film, AlertCircle, CheckCircle } from 'lucide-react';
import { useMessageStore } from '../stores/messageStore';
import { useAuthStore } from '../stores/authStore';
import { encryptMessage } from '../lib/encryption';
import { motion, AnimatePresence } from 'framer-motion';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import toast from 'react-hot-toast';

interface MessageInputProps {
  conversationId: string;
}

const MessageInput = ({ conversationId }: MessageInputProps) => {
  const { user } = useAuthStore();
  const { sendMessage, sendTypingStatus } = useMessageStore();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const maxMessageLength = 2000;
  
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
      // Clean up any pending operations
      setIsUploading(false);
      setSelectedFiles([]);
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
      const fileArray = Array.from(files) as File[];
      processFiles(fileArray);
    }
    
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed', { duration: 1500 });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    // Validate file sizes (max 10MB per file)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) are too large. Maximum size is 10MB per file.`, {
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 4000,
      });
      return;
    }
    
    // Validate file count (max 10 files at once)
    if (selectedFiles.length + files.length > 10) {
      toast.error('Cannot upload more than 10 files at once.', {
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 4000,
      });
      return;
    }
    
    // Validate file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
    
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Some files have unsupported formats. Please select images, videos, or documents.', {
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 4000,
      });
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) added successfully!`, {
      icon: <CheckCircle className="h-5 w-5" />,
      duration: 2000,
    });
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleSendMessage = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || !user || isUploading) return;
    
    try {
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);
        
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 15;
          });
        }, 200);
        
        const response = await fetch(`/api/messages/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        clearInterval(progressInterval);
        setUploadProgress(100);
        
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
      setUploadProgress(0);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        sendTypingStatus(conversationId, false);
      }
      
      // Success notification for file uploads
      if (selectedFiles.length > 0) {
        toast.success(`Message with ${selectedFiles.length} file(s) sent!`, {
          icon: <CheckCircle className="h-5 w-5" />,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // More specific error handling with toast notifications
      if (error instanceof Error) {
        if (error.message.includes('Failed to upload files')) {
          toast.error('File upload failed. Please check your connection and try again.', {
            icon: <AlertCircle className="h-5 w-5" />,
            duration: 5000,
          });
        } else if (error.message.includes('Network')) {
          toast.error('Network error. Please check your connection.', {
            icon: <AlertCircle className="h-5 w-5" />,
            duration: 5000,
          });
        } else {
          toast.error('Failed to send message. Please try again.', {
            icon: <AlertCircle className="h-5 w-5" />,
            duration: 4000,
          });
        }
      } else {
        toast.error('An unexpected error occurred while sending the message.', {
          icon: <AlertCircle className="h-5 w-5" />,
          duration: 4000,
        });
      }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className={`relative ${isDragOver ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-primary-100/80 dark:bg-primary-900/80 rounded-lg border-2 border-dashed border-primary-400 dark:border-primary-500"
          >
            <div className="text-center">
              <Paperclip className="h-8 w-8 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
              <p className="text-primary-700 dark:text-primary-300 font-medium">Drop files here to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  {getFileIcon(fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors duration-200"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            className={`p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200 ${
              showAttachmentOptions ? 'bg-gray-100 dark:bg-white/5' : ''
            }`}
            aria-label={showAttachmentOptions ? "Close attachment options" : "Open attachment options"}
            disabled={isUploading}
          >
            {showAttachmentOptions ? <X className="h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
          </button>

          <AnimatePresence>
            {showAttachmentOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-2 glass-panel divide-y divide-gray-200 dark:divide-gray-700 min-w-[140px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleFileSelect();
                    setShowAttachmentOptions(false);
                  }}
                  className="dropdown-item"
                  disabled={isUploading}
                >
                  <Image className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFileSelect();
                    setShowAttachmentOptions(false);
                  }}
                  className="dropdown-item"
                  disabled={isUploading}
                >
                  <Film className="h-4 w-4 text-accent-500 dark:text-accent-400" />
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFileSelect();
                    setShowAttachmentOptions(false);
                  }}
                  className="dropdown-item"
                  disabled={isUploading}
                >
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Document
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= maxMessageLength) {
                setMessage(e.target.value);
                handleTyping();
                
                // Auto-resize textarea
                if (inputRef.current) {
                  inputRef.current.style.height = 'auto';
                  inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSendMessage();
              } else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="input flex-1 min-w-0 resize-none overflow-hidden min-h-[44px] max-h-[120px] pr-12"
            rows={1}
            aria-label="Message input"
            disabled={isUploading}
          />
          
          {/* Character counter */}
          {message.length > maxMessageLength * 0.8 && (
            <div className={`absolute bottom-1 right-2 text-xs px-1.5 py-0.5 rounded ${
              message.length >= maxMessageLength 
                ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' 
                : message.length > maxMessageLength * 0.9
                  ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
                  : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
            }`}>
              {message.length}/{maxMessageLength}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200 ${
              showEmojiPicker ? 'bg-gray-100 dark:bg-white/5' : ''
            }`}
            aria-label={showEmojiPicker ? "Close emoji picker" : "Open emoji picker"}
            disabled={isUploading}
          >
            <Smile className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <div className="glass-panel p-2 shadow-xl">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                    previewPosition="none"
                    skinTonePosition="none"
                    maxFrequentRows={2}
                    perLine={8}
                    emojiButtonSize={28}
                    emojiSize={18}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={isUploading || (!message.trim() && selectedFiles.length === 0) || message.length > maxMessageLength}
          className={`btn ${isUploading ? 'btn-secondary' : 'btn-primary'} !p-2 relative overflow-hidden`}
          whileHover={{ scale: isUploading ? 1 : 1.05 }}
          whileTap={{ scale: isUploading ? 1 : 0.95 }}
          aria-label={isUploading ? "Uploading..." : "Send message"}
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span className="text-xs">{uploadProgress}%</span>
            </div>
          ) : (
            <Send className="h-5 w-5" />
          )}
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
    </div>
  );
};

export default MessageInput;