const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    isGroup: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      required: function() {
        return this.isGroup === true;
      },
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    unreadCounts: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      count: {
        type: Number,
        default: 0
      }
    }],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return this.isGroup === true;
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add a compound index for participants array elements
ConversationSchema.index(
  { 'participants': 1 },
  { 
    background: true 
  }
);

// Add a unique compound index for direct conversations
// This ensures uniqueness regardless of participant order
ConversationSchema.index(
  { 
    'participants': 1,
    'isGroup': 1
  },
  { 
    unique: true,
    partialFilterExpression: { isGroup: false }
  }
);

// Add text search index for conversation name and description
ConversationSchema.index(
  { name: 'text', description: 'text' }
);

// Virtual for unread count (computed field)
ConversationSchema.virtual('unreadCount').get(function() {
  // If unreadCounts array doesn't exist or is empty, return 0
  if (!this.unreadCounts || this.unreadCounts.length === 0) return 0;
  
  // If user ID is in context, return their unread count
  if (this._userId) {
    const userUnreadCount = this.unreadCounts.find(
      uc => uc.user.toString() === this._userId.toString()
    );
    return userUnreadCount ? userUnreadCount.count : 0;
  }
  
  // Otherwise return 0
  return 0;
});

// Set user ID in context for virtual field
ConversationSchema.methods.setUserId = function(userId) {
  this._userId = userId;
  return this;
};

module.exports = mongoose.model('Conversation', ConversationSchema);