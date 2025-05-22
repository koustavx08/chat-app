const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const { getIO } = require('../socket');
const path = require('path');

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/messages/:conversationId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get messages with pagination
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Message.countDocuments({ conversationId });
    
    // Mark messages as delivered for this user
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user.id },
        delivered: false
      },
      { delivered: true }
    );
    
    // Notify senders that their messages have been delivered
    if (getIO()) {
      getIO().to(conversationId).emit('messages-delivered', {
        userId: req.user.id,
        conversationId
      });
    }
    
    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Send a new message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { 
      conversationId, 
      content, 
      type = 'text',
      file,
      encryptedContent
    } = req.body;
    
    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      content,
      type,
      file,
      encryptedContent
    });
    
    // Populate sender details
    await message.populate('sender', 'name email avatar');
    
    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });
    
    // Increment unread count for all participants except sender
    await Conversation.updateMany(
      { 
        _id: conversationId, 
        'unreadCounts.user': { $ne: req.user.id } 
      },
      { $inc: { 'unreadCounts.$.count': 1 } }
    );
    
    // Emit socket event
    if (getIO()) {
      getIO().to(conversationId).emit('new-message', message);
    }
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Upload message files
 * @route   POST /api/messages/upload
 * @access  Private
 */
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one file'
      });
    }
    
    // Create URLs for the uploaded files
    const fileUrls = req.files.map(file => ({
      originalname: file.originalname,
      path: `/uploads/${file.filename}`
    }));
    
    res.status(200).json({
      success: true,
      fileUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   POST /api/messages/:conversationId/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Update all unread messages sent by others
    const result = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user.id },
        read: false
      },
      {
        $set: { read: true },
        $addToSet: { 
          readBy: { 
            user: req.user.id,
            readAt: new Date()
          } 
        }
      }
    );
    
    // Reset unread count for this user in this conversation
    await Conversation.updateOne(
      { _id: conversationId, 'unreadCounts.user': req.user.id },
      { $set: { 'unreadCounts.$.count': 0 } }
    );
    
    // Emit socket event for read receipts
    if (getIO()) {
      getIO().to(conversationId).emit('messages-read', {
        userId: req.user.id,
        conversationId
      });
    }
    
    res.status(200).json({
      success: true,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this message'
      });
    }
    
    // Delete file if exists
    if (message.file && !message.file.startsWith('http')) {
      const filePath = path.join(__dirname, '../..', message.file);
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    await message.remove();
    
    // If this was the last message, update conversation's lastMessage
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation.lastMessage && conversation.lastMessage.toString() === message._id.toString()) {
      // Find the new last message
      const newLastMessage = await Message.findOne(
        { conversationId: message.conversationId },
        {},
        { sort: { createdAt: -1 } }
      );
      
      // Update conversation
      await Conversation.findByIdAndUpdate(message.conversationId, {
        lastMessage: newLastMessage ? newLastMessage._id : null
      });
    }
    
    // Emit socket event
    if (getIO()) {
      getIO().to(message.conversationId).emit('message-deleted', {
        messageId: message._id,
        conversationId: message.conversationId
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Search messages
 * @route   GET /api/messages/search
 * @access  Private
 */
const searchMessages = async (req, res) => {
  try {
    const { q, conversationId } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query'
      });
    }
    
    // Check if searching in a specific conversation
    let query = {
      $text: { $search: q }
    };
    
    if (conversationId) {
      // Verify user is part of the conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user.id
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }
      
      query.conversationId = conversationId;
    } else {
      // If not searching in a specific conversation, only search in conversations user is part of
      const conversations = await Conversation.find({
        participants: req.user.id
      });
      
      const conversationIds = conversations.map(c => c._id);
      query.conversationId = { $in: conversationIds };
    }
    
    // Search using text index
    const messages = await Message.find(
      query,
      { score: { $meta: 'textScore' } } // Add score field
    )
      .populate('sender', 'name email avatar')
      .populate('conversationId', 'name isGroup participants')
      .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
      .limit(20);
    
    // If no results with text index, try more flexible search
    if (messages.length === 0) {
      const regexQuery = {
        content: { $regex: q, $options: 'i' }
      };
      
      if (conversationId) {
        regexQuery.conversationId = conversationId;
      } else {
        const conversations = await Conversation.find({
          participants: req.user.id
        });
        
        const conversationIds = conversations.map(c => c._id);
        regexQuery.conversationId = { $in: conversationIds };
      }
      
      const regexMessages = await Message.find(regexQuery)
        .populate('sender', 'name email avatar')
        .populate('conversationId', 'name isGroup participants')
        .sort({ createdAt: -1 })
        .limit(20);
      
      return res.status(200).json(regexMessages);
    }
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  uploadFiles,
  markAsRead,
  deleteMessage,
  searchMessages
};