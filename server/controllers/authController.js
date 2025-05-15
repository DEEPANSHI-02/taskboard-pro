const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Controller for handling Google OAuth login
exports.googleLogin = async (req, res) => {
  try {
    // Firebase authentication already handled by middleware
    const { user, token } = req;

    // Return user info and token
    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user information",
    });
  }
};

// Verify token validity
exports.verifyToken = async (req, res) => {
  // If middleware passed, token is valid
  return res.status(200).json({
    success: true,
    data: {
      user: req.user.toJSON(),
    },
  });
};
