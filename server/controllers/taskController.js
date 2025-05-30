const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const automationService = require('../services/automationService');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, status, assigneeId, dueDate } = req.body;
    
    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const isMember = project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Verify status is valid
    if (status && !project.statuses.some(s => s.name === status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Default to first status if not provided
    const taskStatus = status || project.statuses[0].name;
    
    // Create task
    const task = new Task({
      title,
      description,
      project: projectId,
      status: taskStatus,
      assignee: assigneeId,
      createdBy: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });
    
    await task.save();
    
    // Trigger task created automations
    await automationService.processTaskCreated(task, req.user);
    
    return res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

// Get tasks for a project
exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    
    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const isMember = project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Build query
    const query = { project: projectId };
    if (status) {
      query.status = status;
    }
    
    // Get tasks
    const tasks = await Task.find(query)
      .populate('assignee', 'name email profilePicture')
      .populate('createdBy', 'name email profilePicture')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId)
      .populate('assignee', 'name email profilePicture')
      .populate('createdBy', 'name email profilePicture')
      .populate('project', 'title statuses');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Verify project exists and user is a member
    const project = await Project.findById(task.project);
    const isMember = project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch task'
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, assigneeId, dueDate } = req.body;
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Verify project exists and user is a member
    const project = await Project.findById(task.project);
    const isMember = project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Validate status if provided
    if (status && !project.statuses.some(s => s.name === status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Track changes for automations
    const changes = {
      title: { from: task.title, to: title },
      description: { from: task.description, to: description },
      status: { from: task.status, to: status },
      assignee: { from: task.assignee, to: assigneeId },
      dueDate: { from: task.dueDate, to: dueDate ? new Date(dueDate) : undefined }
    };
    
    // Update task with history entry
    const oldStatus = task.status;
    const oldAssignee = task.assignee;
    
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (assigneeId) task.assignee = assigneeId;
    if (dueDate) task.dueDate = new Date(dueDate);
    
    // Add history entry
    Object.keys(changes).forEach(field => {
      if (changes[field].to && changes[field].from !== changes[field].to) {
        task.history.push({
          field,
          oldValue: changes[field].from,
          newValue: changes[field].to,
          user: req.user._id
        });
      }
    });
    
    await task.save();
    
    // Process automations
    if (oldStatus !== task.status) {
      await automationService.processStatusChange(task, oldStatus, req.user);
    }
    
    if ((!oldAssignee && task.assignee) || 
        (oldAssignee && task.assignee && oldAssignee.toString() !== task.assignee.toString())) {
      await automationService.processAssigneeChange(task, oldAssignee, req.user);
    }
    
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Verify project exists and user is a member
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    
    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator or project owner can delete tasks'
      });
    }
    
    await Task.deleteOne({ _id: task._id });
    
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

// Add comment to task
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Verify project exists and user is a member
    const project = await Project.findById(task.project);
    const isMember = project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Add comment
    task.comments.push({
      text,
      user: req.user._id,
      createdAt: Date.now()
    });
    
    await task.save();
    
    // Return task with populated comment user
    const updatedTask = await Task.findById(taskId)
      .populate('assignee', 'name email profilePicture')
      .populate('createdBy', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture');
    
    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};