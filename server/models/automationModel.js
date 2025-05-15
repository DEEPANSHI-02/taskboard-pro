const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trigger: {
    type: {
      type: String,
      required: true,
      enum: ['taskStatusChanged', 'taskAssigned', 'taskDueDatePassed', 'taskCreated']
    },
    conditions: {
      // Dynamic conditions based on trigger type
      fromStatus: String,
      toStatus: String,
      assigneeId: mongoose.Schema.Types.ObjectId,
      dueDate: Date
    }
  },
  actions: [{
    type: {
      type: String,
      required: true,
      enum: ['changeStatus', 'assignTask', 'addBadge', 'sendNotification']
    },
    // Dynamic parameters based on action type
    params: {
      status: String,
      assigneeId: mongoose.Schema.Types.ObjectId,
      badge: String,
      notificationMessage: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster automation lookups
automationSchema.index({ project: 1, 'trigger.type': 1 });

module.exports = mongoose.model('Automation', automationSchema);