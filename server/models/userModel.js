const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String
  },
  badges: [{
    type: String,
    enum: ['Task Master', 'Early Completer', 'Team Player', 'Workflow Specialist']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add method to generate user data for tokens
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.googleId;
  return user;
};

module.exports = mongoose.model('User', userSchema);