const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

// Google OAuth login route
router.post(
  "/google-login",
  authMiddleware.verifyFirebaseToken,
  authController.googleLogin
);

// Get current user profile
router.get("/me", authMiddleware.protect, authController.getCurrentUser);

// Verify token validity
router.get("/verify-token", authMiddleware.protect, authController.verifyToken);

module.exports = router;
