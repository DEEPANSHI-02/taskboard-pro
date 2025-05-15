const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'editor'
    },
    _id: false
  }],
  statuses: {
    type: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      order: {
        type: Number,
        required: true
      }
    }],
    default: [
      { name: 'To Do', order: 0 },
      { name: 'In Progress', order: 1 },
      { name: 'Done', order: 2 }
    ]
  },
  invites: [{
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for faster project lookups by members
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);