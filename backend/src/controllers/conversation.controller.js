const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const mongoose = require('mongoose');

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    // Find all conversations that include the current user
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name email avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    // Calculate unread counts and set context for virtual fields
    const processedConversations = conversations.map(conv => {
      // Find the unread count for current user
      const unreadCount = conv.unreadCounts.find(
        uc => uc.user.toString() === req.user.id.toString()
      )?.count || 0;
      
      // Set user context for virtual fields
      conv.setUserId(req.user.id);
      
      // Return processed conversation
      return {
        ...conv.toObject(),
        unreadCount
      };
    });
    
    res.status(200).json(processedConversations);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get conversation by ID
 * @route   GET /api/conversations/:id
 * @access  Private
 */
const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name email avatar isOnline lastSeen')
      .populate('lastMessage');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is part of the conversation
    if (!conversation.participants.some(p => p._id.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    // Set user context for virtual fields
    conversation.setUserId(req.user.id);
    
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new one-on-one conversation
 * @route   POST /api/conversations
 * @access  Private
 */
const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a user ID'
      });
    }
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] },
      isGroup: false
    })
      .populate('participants', 'name email avatar isOnline lastSeen')
      .populate('lastMessage');
    
    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }
    
    // Create new conversation
    const newConversation = await Conversation.create({
      participants: [req.user.id, userId],
      isGroup: false,
      unreadCounts: [
        { user: req.user.id, count: 0 },
        { user: userId, count: 0 }
      ]
    });
    
    // Populate the conversation details
    await newConversation.populate('participants', 'name email avatar isOnline lastSeen');
    
    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new group conversation
 * @route   POST /api/conversations/group
 * @access  Private
 */
const createGroupConversation = async (req, res) => {
  try {
    const { name, description, participants } = req.body;
    
    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a name and participants array'
      });
    }
    
    // Ensure at least 2 participants
    if (participants.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Group must have at least 2 participants'
      });
    }
    
    // Add current user to participants if not already included
    if (!participants.includes(req.user.id.toString())) {
      participants.push(req.user.id.toString());
    }
    
    // Initialize unreadCounts array
    const unreadCounts = participants.map(userId => ({
      user: userId,
      count: 0
    }));
    
    // Create new group conversation
    const newGroup = await Conversation.create({
      name,
      description,
      participants,
      isGroup: true,
      admin: req.user.id,
      unreadCounts
    });
    
    // Populate the conversation details
    await newGroup.populate('participants', 'name email avatar isOnline lastSeen');
    
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Mark conversation as read
 * @route   POST /api/conversations/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Verify conversation exists and user is part of it
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
    
    // Update unread count for current user
    await Conversation.updateOne(
      { _id: conversationId, 'unreadCounts.user': req.user.id },
      { $set: { 'unreadCounts.$.count': 0 } }
    );
    
    // Mark all messages from other users as read
    await Message.updateMany(
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
    
    res.status(200).json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete conversation
 * @route   DELETE /api/conversations/:id
 * @access  Private
 */
const deleteConversation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const conversationId = req.params.id;
    
    // Verify conversation exists and user is part of it
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
    
    // For group chats, only admin can delete or user can leave
    if (conversation.isGroup && conversation.admin.toString() !== req.user.id.toString()) {
      // User is not admin, so just remove them from the group
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $pull: { participants: req.user.id } }
      );
      
      await session.commitTransaction();
      session.endSession();
      
      return res.status(200).json({
        success: true,
        message: 'You have left the group'
      });
    }
    
    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId }, { session });
    
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId, { session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getConversations,
  getConversationById,
  createConversation,
  createGroupConversation,
  markAsRead,
  deleteConversation
};