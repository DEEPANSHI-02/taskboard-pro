const Notification = require('../models/notificationModel');

// Get notifications for current user
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 10, page = 1, unreadOnly = false } = req.query;
    
    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('relatedProject', 'title')
      .populate('relatedTask', 'title');
    
    const totalCount = await Notification.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark notifications as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs are required'
      });
    }
    
    // Ensure user can only update their own notifications
    await Notification.updateMany({
      _id: { $in: notificationIds },
      user: req.user._id
    }, {
      $set: { isRead: true }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Mark Notifications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notifications'
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });
    
    return res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get Unread Count Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Ensure user can only delete their own notifications
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await Notification.deleteOne({ _id: notificationId });
    
    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete Notification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};