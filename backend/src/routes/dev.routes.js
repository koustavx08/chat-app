const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const { resetDatabase, clearCollections, getIndexInfo, createOrGetDirectConversation } = require('../utils/db.utils');
const logger = require('../utils/logger');

// Protect these routes from running in production
const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This route is not available in production'
    });
  }
  next();
};

// Test data
const testUsers = [
  {
    name: 'John Smith',
    email: 'john@test.com',
    password: 'password123',
    bio: 'Software Developer',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@test.com',
    password: 'password123',
    bio: 'UX Designer',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson'
  },
  {
    name: 'Mike Wilson',
    email: 'mike@test.com',
    password: 'password123',
    bio: 'Product Manager',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Wilson'
  },
  {
    name: 'Emily Brown',
    email: 'emily@test.com',
    password: 'password123',
    bio: 'Data Scientist',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Brown'
  }
];

// Get database indexes info
router.get('/indexes', devOnly, async (req, res) => {
  try {
    const indexInfo = await getIndexInfo();
    res.status(200).json({
      success: true,
      data: indexInfo
    });
  } catch (error) {
    logger.error('Error getting index info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting index information',
      error: error.message
    });
  }
});

// Reset database (drop indexes, clear data, recreate indexes)
router.post('/reset', devOnly, async (req, res) => {
  try {
    await resetDatabase();
    res.status(200).json({
      success: true,
      message: 'Database reset completed successfully'
    });
  } catch (error) {
    logger.error('Error resetting database:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting database',
      error: error.message
    });
  }
});

// Clear all data without touching indexes
router.delete('/clear-data', devOnly, async (req, res) => {
  try {
    await clearCollections();
    res.status(200).json({
      success: true,
      message: 'All test data cleared successfully'
    });
  } catch (error) {
    logger.error('Error clearing data:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing data',
      error: error.message
    });
  }
});

// Reseed database (clear and seed new data)
router.post('/reseed', devOnly, async (req, res) => {
  try {
    logger.info('Starting database reseed...');
    
    // Clear existing data
    await clearCollections();
    logger.info('✓ Cleared existing data');

    // Insert test users
    const createdUsers = await User.create(testUsers);
    logger.info('✓ Test users created');

    // Create direct message conversations
    const conversations = [];
    for (let i = 0; i < createdUsers.length - 1; i++) {
      for (let j = i + 1; j < createdUsers.length; j++) {
        try {
          const conversation = await createOrGetDirectConversation(
            createdUsers[i]._id,
            createdUsers[j]._id
          );

          // Only add messages if this is a new conversation
          if (!conversation.lastMessage) {
            // Add messages to conversation
            const messages = [
              {
                conversationId: conversation._id,
                sender: createdUsers[i]._id,
                content: `Hey ${createdUsers[j].name}! How are you?`,
                type: 'text',
                createdAt: new Date(Date.now() - 3600000 * 3) // 3 hours ago
              },
              {
                conversationId: conversation._id,
                sender: createdUsers[j]._id,
                content: 'Hi! I\'m doing great, thanks for asking!',
                type: 'text',
                createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
              },
              {
                conversationId: conversation._id,
                sender: createdUsers[i]._id,
                content: 'Would you like to collaborate on a project?',
                type: 'text',
                createdAt: new Date(Date.now() - 3600000) // 1 hour ago
              }
            ];

            const createdMessages = await Message.create(messages);
            
            // Update last message
            conversation.lastMessage = createdMessages[createdMessages.length - 1]._id;
            await conversation.save();
            logger.info(`Added messages to conversation between ${createdUsers[i].name} and ${createdUsers[j].name}`);
          }
          
          conversations.push(conversation);
        } catch (error) {
          logger.error(`Error handling conversation between ${createdUsers[i].name} and ${createdUsers[j].name}:`, error);
          throw error;
        }
      }
    }
    logger.info('✓ Direct message conversations and messages created');

    // Create a group chat
    const groupChat = await Conversation.create({
      participants: createdUsers.map(user => user._id),
      isGroup: true,
      name: 'Project Team',
      description: 'Team discussion group',
      avatar: 'https://ui-avatars.com/api/?name=Project+Team',
      admin: createdUsers[0]._id
    });

    // Add group messages
    const groupMessages = [
      {
        conversationId: groupChat._id,
        sender: createdUsers[0]._id,
        content: 'Welcome everyone to the project team!',
        type: 'text',
        createdAt: new Date(Date.now() - 7200000) // 2 hours ago
      },
      {
        conversationId: groupChat._id,
        sender: createdUsers[1]._id,
        content: 'Thanks for creating the group!',
        type: 'text',
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        conversationId: groupChat._id,
        sender: createdUsers[2]._id,
        content: 'Looking forward to working together!',
        type: 'text',
        createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
      }
    ];

    await Message.create(groupMessages);
    groupChat.lastMessage = groupMessages[groupMessages.length - 1]._id;
    await groupChat.save();
    logger.info('✓ Group chat and messages created');

    res.status(200).json({
      success: true,
      message: 'Database reseeded successfully',
      data: {
        users: createdUsers,
        conversations: [...conversations, groupChat]
      }
    });
  } catch (error) {
    logger.error('Error reseeding database:', error);
    res.status(500).json({
      success: false,
      message: 'Error reseeding database',
      error: error.message
    });
  }
});

module.exports = router;