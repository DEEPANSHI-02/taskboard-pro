const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply authentication middleware to all notification routes
router.use(authMiddleware.protect);

// Get notifications for current user
router.get("/", notificationController.getUserNotifications);

// Mark notifications as read
router.post("/mark-read", notificationController.markAsRead);

// Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// Delete a notification
router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
