const express = require('express');
const { 
  getConversations, 
  getConversationById, 
  createConversation,
  createGroupConversation,
  markAsRead,
  deleteConversation
} = require('../controllers/conversation.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/', getConversations);
router.get('/:id', getConversationById);
router.post('/', createConversation);
router.post('/group', createGroupConversation);
router.post('/:id/read', markAsRead);
router.delete('/:id', deleteConversation);

module.exports = router;