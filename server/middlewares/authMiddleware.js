const admin = require('firebase-admin');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Verify Firebase token and create user if needed
exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    console.log("🛂 Incoming request to verify token");
    console.log("🔐 Received ID token:", idToken ? "Yes" : "No");

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided',
      });
    }

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token',
      });
    }

    console.log("✅ Firebase token verified for:", decodedToken.email);

    // Look for existing user or create new one
    let user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      user = new User({
        name: decodedToken.name || 'User',
        email: decodedToken.email,
        googleId: decodedToken.uid,
        profilePicture: decodedToken.picture || '',
      });

      await user.save();
      console.log("🆕 New user created:", user.email);
    } else if (!user.googleId) {
      // Update existing user with Google ID if missing
      user.googleId = decodedToken.uid;
      user.name = user.name || decodedToken.name || 'User';
      user.profilePicture = user.profilePicture || decodedToken.picture || '';
      await user.save();
      console.log("♻️ Existing user updated:", user.email);
    } else {
      console.log("🙋‍♂️ Existing user found:", user.email);
    }

    // Generate JWT token for your app
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Attach user and token to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('❌ Firebase Auth Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
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
        message: 'Authentication failed: No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ JWT Auth Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid token',
    });
  }
};
