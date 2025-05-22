import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paperclip, Send, Smile, X, Image, FileText, Film } from 'lucide-react';
import { useMessageStore } from '../stores/messageStore';
import { socket } from '../lib/socket';
import { useAuthStore } from '../stores/authStore';
import { useConversationStore } from '../stores/conversationStore';
import { encryptMessage } from '../lib/encryption';

interface MessageInputProps {
  conversationId: string;
  isGroup?: boolean;
}

const MessageInput = ({ conversationId, isGroup = false }: MessageInputProps) => {
  const { user } = useAuthStore();
  const { currentConversation } = useConversationStore();
  const { sendMessage, sendTypingStatus } = useMessageStore();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const recipients = currentConversation?.participants.filter(p => p._id !== user?._id) || [];
  
  const handleTyping = () => {
    // Cancel previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Emit typing event
    sendTypingStatus(conversationId, true);
    
    // Set timeout to stop typing indicator after 3 seconds
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
  
  const handleFileSelect = (type: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('accept', getAcceptString(type));
      fileInputRef.current.click();
    }
    setShowAttachmentOptions(false);
  };
  
  const getAcceptString = (type: string) => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'document':
        return '.pdf,.doc,.docx,.xls,.xlsx,.txt';
      case 'video':
        return 'video/*';
      default:
        return '*/*';
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSendMessage = async () => {
    if ((!message && selectedFiles.length === 0) || !user) return;
    
    try {
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        
        // Upload files and get their URLs
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
        
        // Send message with file attachments
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
        
        // If there's also text, send it as a separate message
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
        // Send text message
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
      // Handle error (show toast notification, etc.)
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
        return <Image className="h-4 w-4 text-primary-500" />;
      case 'video':
        return <Film className="h-4 w-4 text-secondary-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => {
            const fileType = getFileType(file.name);
            return (
              <div 
                key={index} 
                className="flex items-center bg-gray-100 rounded-md p-2 pr-3"
              >
                {getFileIcon(fileType)}
                <span className="ml-2 text-sm truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Message input */}
      <div className="flex items-end gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          {/* Attachment options */}
          {showAttachmentOptions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-2 z-10">
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => handleFileSelect('image')}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Image className="mr-2 h-5 w-5 text-primary-500" />
                  Image
                </button>
                <button
                  onClick={() => handleFileSelect('document')}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <FileText className="mr-2 h-5 w-5 text-gray-500" />
                  Document
                </button>
                <button
                  onClick={() => handleFileSelect('video')}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Film className="mr-2 h-5 w-5 text-secondary-500" />
                  Video
                </button>
              </div>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
        </div>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
              
              if (message.trim()) {
                handleTyping();
              }
            }}
            className="w-full rounded-full bg-gray-100 border-0 py-3 pl-4 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600"
            placeholder={`Message ${isGroup ? currentConversation?.name : recipients[0]?.name || 'User'}`}
            disabled={isUploading}
          />
          <button
            type="button"
            className="absolute right-2 bottom-2 p-1 rounded-full text-gray-500 hover:text-gray-700"
          >
            <Smile className="h-6 w-6" />
          </button>
        </div>
        
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={(!message.trim() && selectedFiles.length === 0) || isUploading}
          className="p-3 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;