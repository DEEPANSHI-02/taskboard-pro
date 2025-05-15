const admin = require('firebase-admin');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Verify Firebase token and create user if needed
exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided'
      });
    }
    
    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token'
      });
    }
    
    // Look for existing user or create new one
    let user = await User.findOne({ email: decodedToken.email });
    
    if (!user) {
      user = new User({
        name: decodedToken.name || 'User',
        email: decodedToken.email,
        googleId: decodedToken.uid,
        profilePicture: decodedToken.picture || ''
      });
      
      await user.save();
    } else if (!user.googleId) {
      // Update existing user with Google ID if missing
      user.googleId = decodedToken.uid;
      user.name = user.name || decodedToken.name || 'User';
      user.profilePicture = user.profilePicture || decodedToken.picture || '';
      await user.save();
    }
    
    // Generate JWT token for API access
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Attach user and token to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User not found'
      });
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('JWT Auth Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid token'
    });
  }
};