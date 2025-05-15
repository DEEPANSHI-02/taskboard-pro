const Automation = require('../models/automationModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

/**
 * Process automations when a task status changes
 */
exports.processStatusChange = async (task, oldStatus, user) => {
  try {
    // Find automations that might be triggered
    const automations = await Automation.find({
      project: task.project,
      isActive: true,
      'trigger.type': 'taskStatusChanged'
    });
    
    for (const automation of automations) {
      // Check if this automation should be triggered
      if (
        (!automation.trigger.conditions.fromStatus || 
         automation.trigger.conditions.fromStatus === oldStatus) &&
        (!automation.trigger.conditions.toStatus || 
         automation.trigger.conditions.toStatus === task.status)
      ) {
        // Execute the automation actions
        await executeActions(automation.actions, task, user);
      }
    }
  } catch (error) {
    console.error('Process Status Change Automation Error:', error);
  }
};

/**
 * Process automations when a task assignee changes
 */
exports.processAssigneeChange = async (task, oldAssigneeId, user) => {
  try {
    // Find automations that might be triggered
    const automations = await Automation.find({
      project: task.project,
      isActive: true,
      'trigger.type': 'taskAssigned'
    });
    
    for (const automation of automations) {
      // Check if this automation should be triggered
      if (!automation.trigger.conditions.assigneeId || 
          automation.trigger.conditions.assigneeId.toString() === task.assignee.toString()) {
        // Execute the automation actions
        await executeActions(automation.actions, task, user);
      }
    }
  } catch (error) {
    console.error('Process Assignee Change Automation Error:', error);
  }
};

/**
 * Process automations when a task is created
 */
exports.processTaskCreated = async (task, user) => {
  try {
    // Find automations that might be triggered
    const automations = await Automation.find({
      project: task.project,
      isActive: true,
      'trigger.type': 'taskCreated'
    });
    
    for (const automation of automations) {
      // Execute the automation actions for all task created triggers
      await executeActions(automation.actions, task, user);
    }
  } catch (error) {
    console.error('Process Task Created Automation Error:', error);
  }
};

/**
 * Process automations for tasks with due dates that have passed
 * This would typically be run by a scheduled job
 */
exports.processDueDatePassed = async () => {
  try {
    const now = new Date();
    
    // Find tasks where due date has passed but no automation has been processed
    const tasks = await Task.find({
      dueDate: { $lt: now },
      dueDateProcessed: { $ne: true }
    }).populate('project');
    
    for (const task of tasks) {
      // Find automations that might be triggered
      const automations = await Automation.find({
        project: task.project,
        isActive: true,
        'trigger.type': 'taskDueDatePassed'
      });
      
      for (const automation of automations) {
        // Execute the automation actions
        await executeActions(automation.actions, task);
      }
      
      // Mark task as processed
      task.dueDateProcessed = true;
      await task.save();
    }
  } catch (error) {
    console.error('Process Due Date Passed Automation Error:', error);
  }
};

/**
 * Execute automation actions
 */
async function executeActions(actions, task, user) {
  for (const action of actions) {
    switch (action.type) {
      case 'changeStatus':
        await changeTaskStatus(task, action.params.status, user);
        break;
      case 'assignTask':
        await assignTask(task, action.params.assigneeId, user);
        break;
      case 'addBadge':
        if (task.assignee) {
          await addUserBadge(task.assignee, action.params.badge);
        }
        break;
      case 'sendNotification':
        await sendNotification(task, action.params.notificationMessage, user);
        break;
    }
  }
}

/**
 * Action: Change task status
 */
async function changeTaskStatus(task, newStatus, user) {
  try {
    // Skip if already at this status
    if (task.status === newStatus) {
      return;
    }
    
    const oldStatus = task.status;
    task.status = newStatus;
    
    // Add to history
    task.history.push({
      field: 'status',
      oldValue: oldStatus,
      newValue: newStatus,
      user: user ? user._id : task.createdBy, // Default to task creator if no user provided
      timestamp: Date.now()
    });
    
    await task.save();
  } catch (error) {
    console.error('Change Task Status Error:', error);
  }
}

/**
 * Action: Assign task to user
 */
async function assignTask(task, assigneeId, user) {
  try {
    // Skip if already assigned to this user
    if (task.assignee && task.assignee.toString() === assigneeId.toString()) {
      return;
    }
    
    const oldAssignee = task.assignee;
    task.assignee = assigneeId;
    
    // Add to history
    task.history.push({
      field: 'assignee',
      oldValue: oldAssignee,
      newValue: assigneeId,
      user: user ? user._id : task.createdBy, // Default to task creator if no user provided
      timestamp: Date.now()
    });
    
    await task.save();
    
    // Create notification for the new assignee
    await Notification.create({
      user: assigneeId,
      type: 'task_assigned',
      message: `You have been assigned to task "${task.title}"`,
      relatedProject: task.project,
      relatedTask: task._id
    });
  } catch (error) {
    console.error('Assign Task Error:', error);
  }
}

/**
 * Action: Add badge to user
 */
async function addUserBadge(userId, badge) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return;
    }
    
    // Skip if user already has this badge
    if (user.badges.includes(badge)) {
      return;
    }
    
    // Add badge
    user.badges.push(badge);
    await user.save();
    
    // Create notification for the badge
    await Notification.create({
      user: userId,
      type: 'badge_earned',
      message: `You've earned the "${badge}" badge!`
    });
  } catch (error) {
    console.error('Add User Badge Error:', error);
  }
}

/**
 * Action: Send notification
 */
async function sendNotification(task, message, user) {
  try {
    // Customize message if needed
    const customizedMessage = message
      .replace('{taskTitle}', task.title)
      .replace('{taskStatus}', task.status);
    
    // For task assignee notification
    if (task.assignee) {
      await Notification.create({
        user: task.assignee,
        type: 'automation_triggered',
        message: customizedMessage,
        relatedProject: task.project,
        relatedTask: task._id
      });
    }
  } catch (error) {
    console.error('Send Notification Error:', error);
  }
}