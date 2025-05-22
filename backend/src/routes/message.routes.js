const express = require('express');
const { 
  getMessages, 
  sendMessage, 
  uploadFiles,
  markAsRead,
  deleteMessage,
  searchMessages
} = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/search', searchMessages);
router.get('/:conversationId', getMessages);
router.post('/', sendMessage);
router.post('/upload', upload.array('files', 10), uploadFiles);
router.post('/:conversationId/read', markAsRead);
router.delete('/:id', deleteMessage);

module.exports = router;