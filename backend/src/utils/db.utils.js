const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const logger = require('./logger');

/**
 * Drops all indexes for a given model
 * @param {Model} model - Mongoose model
 * @param {string} modelName - Name of the model for logging
 */
const dropModelIndexes = async (model, modelName) => {
  try {
    await model.collection.dropIndexes();
    logger.info(`✓ Dropped all indexes for ${modelName}`);
  } catch (error) {
    // If no indexes exist, MongoDB throws an error
    if (error.code === 26) {
      logger.info(`No indexes to drop for ${modelName}`);
    } else {
      throw error;
    }
  }
};

/**
 * Recreates indexes for a given model
 * @param {Model} model - Mongoose model
 * @param {string} modelName - Name of the model for logging
 */
const recreateModelIndexes = async (model, modelName) => {
  try {
    await model.createIndexes();
    logger.info(`✓ Recreated indexes for ${modelName}`);
  } catch (error) {
    throw new Error(`Failed to recreate indexes for ${modelName}: ${error.message}`);
  }
};

/**
 * Clears all collections in the database
 */
const clearCollections = async () => {
  try {
    await User.deleteMany({});
    logger.info('✓ Cleared users collection');
    
    await Conversation.deleteMany({});
    logger.info('✓ Cleared conversations collection');
    
    await Message.deleteMany({});
    logger.info('✓ Cleared messages collection');
  } catch (error) {
    throw new Error(`Failed to clear collections: ${error.message}`);
  }
};

/**
 * Resets the database by dropping indexes, clearing collections, and recreating indexes
 * Only runs in development mode
 */
const resetDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    const error = new Error('Database reset is not allowed in production environment');
    error.statusCode = 403;
    throw error;
  }

  try {
    logger.info('Starting database reset...');

    // Drop all indexes
    logger.info('Dropping indexes...');
    await dropModelIndexes(User, 'User');
    await dropModelIndexes(Conversation, 'Conversation');
    await dropModelIndexes(Message, 'Message');

    // Clear all collections
    logger.info('Clearing collections...');
    await clearCollections();

    // Recreate indexes
    logger.info('Recreating indexes...');
    await recreateModelIndexes(User, 'User');
    await recreateModelIndexes(Conversation, 'Conversation');
    await recreateModelIndexes(Message, 'Message');

    logger.info('✓ Database reset completed successfully');
  } catch (error) {
    logger.error('Database reset failed:', error);
    throw error;
  }
};

/**
 * Gets the current state of indexes for all models
 */
const getIndexInfo = async () => {
  try {
    const userIndexes = await User.collection.indexes();
    const conversationIndexes = await Conversation.collection.indexes();
    const messageIndexes = await Message.collection.indexes();

    return {
      User: userIndexes,
      Conversation: conversationIndexes,
      Message: messageIndexes
    };
  } catch (error) {
    throw new Error(`Failed to get index information: ${error.message}`);
  }
};

/**
 * Creates a direct message conversation between two users
 * @param {ObjectId} user1Id - First user's ID
 * @param {ObjectId} user2Id - Second user's ID
 * @returns {Promise<Object>} Created or existing conversation
 */
const createOrGetDirectConversation = async (user1Id, user2Id) => {
  try {
    // Sort participant IDs to ensure consistent ordering
    const participants = [user1Id, user2Id].map(id => id.toString()).sort();

    // First try to find an existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
      isGroup: false
    });

    if (!conversation) {
      // If no conversation exists, create a new one
      conversation = await Conversation.create({
        participants,
        isGroup: false
      });
      logger.info(`Created new conversation between users ${participants[0]} and ${participants[1]}`);
    } else {
      logger.info(`Found existing conversation between users ${participants[0]} and ${participants[1]}`);
    }

    return conversation;
  } catch (error) {
    logger.error('Error in createOrGetDirectConversation:', error);
    throw error;
  }
};

module.exports = {
  resetDatabase,
  clearCollections,
  getIndexInfo,
  createOrGetDirectConversation
}; 