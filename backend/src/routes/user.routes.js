const express = require('express');
const { 
  getUsers, 
  getUserById, 
  updateProfile, 
  uploadAvatar,
  searchUsers
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;