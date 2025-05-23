const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const Conversation = require('./models/conversation.model');
const Message = require('./models/message.model');
const logger = require('./utils/logger');

let io;

const initSocketServer = (server) => {
  io = socketio(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Connection middleware (authenticate socket connection)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user to socket
      socket.userId = user._id;
      socket.userName = user.name;
      next();
    } catch (error) {
      logger.error(`Socket authentication error: ${error.message}`);
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    logger.info(`New socket connection: ${socket.id}, User: ${socket.userId}`);
    
    // Update user status to online
    handleUserOnline(socket.userId);
    
    // Join user to their conversation rooms
    joinUserRooms(socket);
    
    // Handle messages
    socket.on('message', async (data) => {
      const { conversationId, content, type = 'text', file, encryptedContent } = data;
      
      try {
        // Save message to database
        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          content,
          type,
          file,
          encryptedContent,
          delivered: false,
          read: false
        });
        
        // Populate sender details
        await message.populate('sender', 'name email avatar');
        
        // Update conversation's lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id
        });
        
        // Emit message to all users in conversation
        io.to(conversationId).emit('message', message);
        
        // Send notification for offline users
        sendOfflineNotifications(conversationId, message, socket.userId);
      } catch (error) {
        logger.error(`Error sending message: ${error.message}`);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing events
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      
      socket.to(conversationId).emit('typing', {
        userId: socket.userId,
        userName: socket.userName,
        conversationId,
        isTyping
      });
    });
    
    // Handle read receipts
    socket.on('read', async (data) => {
      const { conversationId, messageId } = data;
      
      try {
        // Mark message as read
        if (messageId) {
          await Message.findByIdAndUpdate(messageId, { read: true });
        } else {
          // Mark all unread messages in conversation as read
          await Message.updateMany(
            { 
              conversationId, 
              sender: { $ne: socket.userId },
              read: false 
            },
            { read: true }
          );
        }
        
        // Notify other users that messages have been read
        socket.to(conversationId).emit('read', {
          userId: socket.userId,
          conversationId,
          messageId
        });
      } catch (error) {
        logger.error(`Error marking message as read: ${error.message}`);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}, User: ${socket.userId}`);
      
      // Update user status to offline
      handleUserOffline(socket.userId);
    });
  });
  
  return io;
};

// Helper functions

const handleUserOnline = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { 
      isOnline: true,
      lastSeen: new Date()
    });
    
    // Get all conversations this user is part of
    const conversations = await Conversation.find({
      participants: userId
    });
    
    // Notify other users in these conversations
    for (const conversation of conversations) {
      io.to(conversation._id.toString()).emit('user-online', {
        userId,
        conversationId: conversation._id.toString()
      });
    }
  } catch (error) {
    logger.error(`Error updating user online status: ${error.message}`);
  }
};

const handleUserOffline = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { 
      isOnline: false,
      lastSeen: new Date()
    });
    
    // Get all conversations this user is part of
    const conversations = await Conversation.find({
      participants: userId
    });
    
    // Notify other users in these conversations
    for (const conversation of conversations) {
      io.to(conversation._id.toString()).emit('user-offline', {
        userId,
        conversationId: conversation._id.toString(),
        lastSeen: new Date()
      });
    }
  } catch (error) {
    logger.error(`Error updating user offline status: ${error.message}`);
  }
};

const joinUserRooms = async (socket) => {
  try {
    // Find all conversations this user is part of
    const conversations = await Conversation.find({
      participants: socket.userId
    });
    
    // Join socket to each conversation room
    for (const conversation of conversations) {
      socket.join(conversation._id.toString());
    }
    
    // Join user's personal room (for direct notifications)
    socket.join(socket.userId.toString());
  } catch (error) {
    logger.error(`Error joining user rooms: ${error.message}`);
  }
};

const sendOfflineNotifications = async (conversationId, message, senderId) => {
  try {
    // Get conversation with participants
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email isOnline');
    
    if (!conversation) return;
    
    // Find offline participants (except sender)
    const offlineRecipients = conversation.participants.filter(
      user => !user.isOnline && user._id.toString() !== senderId.toString()
    );
    
    // Update unread count for each offline participant
    for (const recipient of offlineRecipients) {
      // This is where you would send push notifications
      // For now, we'll just log it
      logger.info(`Would send notification to offline user: ${recipient.name}`);
      
      // Increment unread count for this conversation and user
      await Conversation.updateOne(
        { _id: conversationId, 'participants.user': recipient._id },
        { $inc: { 'participants.$.unreadCount': 1 } }
      );
    }
  } catch (error) {
    logger.error(`Error sending offline notifications: ${error.message}`);
  }
};

// Expose the socket instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocketServer, getIO };