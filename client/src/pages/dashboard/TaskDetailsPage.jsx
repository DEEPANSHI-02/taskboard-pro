// File: src/pages/dashboard/TaskDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Badge, Input, TextArea, Select, Avatar, Loader, Alert, Toast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';

const TaskDetailsPage = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useUI();
  
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableAssignees, setAvailableAssignees] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Fetch task, project and related data
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch task details
        const taskData = await taskService.getTaskById(projectId, taskId);
        setTask(taskData);
        setEditedTask({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          assignee: taskData.assignee?._id || '',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
          priority: taskData.priority || 'Medium'
        });
        
        // Fetch project details
        const projectData = await projectService.getProjectById(projectId);
        setProject(projectData);
        
        // Set available statuses
        setAvailableStatuses(projectData.statuses || ['To Do', 'In Progress', 'Done']);
        
        // Set available assignees
        setAvailableAssignees(projectData.members || []);
        
        // Fetch comments
        if (taskData.comments) {
          setComments(taskData.comments);
        }
        
      } catch (error) {
        console.error('Error fetching task details:', error);
        toast.error('Failed to load task details');
        navigate(`/projects/${projectId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [projectId, taskId, navigate, toast]);

  // Fetch task history
  const fetchTaskHistory = async () => {
    try {
      setHistoryLoading(true);
      const history = await taskService.getTaskHistory(projectId, taskId);
      setTaskHistory(history);
    } catch (error) {
      console.error('Error fetching task history:', error);
      toast.error('Failed to load task history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Toggle history view and fetch data if needed
  const toggleHistory = () => {
    if (!showHistory && taskHistory.length === 0) {
      fetchTaskHistory();
    }
    setShowHistory(!showHistory);
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit task updates
  const handleSubmitChanges = async () => {
    try {
      setLoading(true);
      await taskService.updateTask(projectId, taskId, editedTask);
      const updatedTask = await taskService.getTaskById(projectId, taskId);
      setTask(updatedTask);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee?._id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'Medium'
    });
    setIsEditing(false);
  };

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await taskService.addComment(projectId, taskId, newComment);
      const updatedTask = await taskService.getTaskById(projectId, taskId);
      setComments(updatedTask.comments || []);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await taskService.deleteTask(projectId, taskId);
        toast.success('Task deleted successfully');
        navigate(`/projects/${projectId}`);
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'To Do':
        return 'secondary';
      case 'In Progress':
        return 'info';
      case 'Done':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!task || !project) {
    return (
      <Alert
        title="Task not found"
        variant="error"
      >
        <p>The requested task could not be found. It may have been deleted or you don't have access to it.</p>
        <Link to={`/projects/${projectId}`} className="mt-2 inline-block">
          <Button variant="outline" size="sm">Back to Project</Button>
        </Link>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/projects" className="hover:text-primary-600">Projects</Link>
        <span className="mx-2">/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-primary-600">{project.title}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{task.title}</span>
      </div>

      {/* Task Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          {isEditing ? (
            <Input
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              className="text-2xl font-bold"
              fullWidth
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {task.status}
            </Badge>
            {task.priority && (
              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                {task.priority} Priority
              </Badge>
            )}
            {task.dueDate && (
              <Badge variant={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'danger' : 'secondary'}>
                Due: {formatDate(task.dueDate)}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          {!isEditing ? (
            <>
              <Button 
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Task
              </Button>
              <Button 
                variant="danger"
                onClick={handleDeleteTask}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleSubmitChanges}
              >
                Save Changes
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-5">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              {isEditing ? (
                <TextArea
                  name="description"
                  value={editedTask.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Task description..."
                  fullWidth
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  {task.description ? (
                    <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Comments Section */}
          <Card>
            <div className="p-5">
              <h2 className="text-lg font-semibold mb-3">Comments</h2>
              <div className="space-y-4 mb-4">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start">
                        <Avatar 
                          src={comment.user?.photoURL}
                          alt={comment.user?.displayName}
                          size="sm"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.user?.displayName || 'Unknown User'}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No comments yet</p>
                )}
              </div>
              
              {/* Add Comment */}
              <div>
                <div className="flex items-start space-x-3">
                  <Avatar 
                    src={user?.photoURL}
                    alt={user?.displayName}
                    size="sm"
                  />
                  <div className="flex-1">
                    <TextArea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      fullWidth
                    />
                    <div className="mt-2 flex justify-end">
                      <Button 
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Task History */}
          <Card>
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Activity History</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleHistory}
                >
                  {showHistory ? 'Hide History' : 'Show History'}
                </Button>
              </div>
              
              {showHistory && (
                <div className="space-y-3 mt-3">
                  {historyLoading ? (
                    <Loader size="sm" />
                  ) : taskHistory.length > 0 ? (
                    <div className="border-l-2 border-gray-200 pl-4 space-y-4">
                      {taskHistory.map((entry, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-6 mt-1.5 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white"></div>
                          <div>
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {entry.user?.displayName || 'System'}
                              </p>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(entry.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {entry.action}
                              {entry.details && (
                                <span className="text-gray-500 ml-1">
                                  {entry.details}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No activity history available</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Task Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                {isEditing ? (
                  <Select
                    name="status"
                    value={editedTask.status}
                    onChange={handleInputChange}
                    fullWidth
                  >
                    {availableStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Select>
                ) : (
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status}
                  </Badge>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Assignee</h3>
                {isEditing ? (
                  <Select
                    name="assignee"
                    value={editedTask.assignee}
                    onChange={handleInputChange}
                    fullWidth
                  >
                    <option value="">Unassigned</option>
                    {availableAssignees.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.displayName || member.email}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="flex items-center">
                    {task.assignee ? (
                      <>
                        <Avatar 
                          src={task.assignee.photoURL}
                          alt={task.assignee.displayName}
                          size="sm"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {task.assignee.displayName || task.assignee.email}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 italic">Unassigned</span>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                {isEditing ? (
                  <Input
                    type="date"
                    name="dueDate"
                    value={editedTask.dueDate}
                    onChange={handleInputChange}
                    fullWidth
                  />
                ) : (
                  <div className="text-sm">
                    {task.dueDate ? (
                      <span className={`${
                        new Date(task.dueDate) < new Date() && task.status !== 'Done'
                          ? 'text-red-600 font-medium'
                          : 'text-gray-900'
                      }`}>
                        {formatDate(task.dueDate)}
                        {new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                          <span className="ml-2 text-red-600">(Overdue)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">No due date</span>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
                {isEditing ? (
                  <Select
                    name="priority"
                    value={editedTask.priority}
                    onChange={handleInputChange}
                    fullWidth
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Select>
                ) : (
                  <Badge variant={getPriorityBadgeVariant(task.priority || 'Medium')}>
                    {task.priority || 'Medium'}
                  </Badge>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                <div className="text-sm text-gray-900">
                  {formatDateTime(task.createdAt)}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                <div className="text-sm text-gray-900">
                  {formatDateTime(task.updatedAt)}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Project Information */}
          <Card>
            <div className="p-5 space-y-4">
              <h3 className="font-medium text-gray-900">Project Information</h3>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Project</h4>
                <Link to={`/projects/${projectId}`} className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                  {project.title}
                </Link>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Owner</h4>
                <div className="flex items-center">
                  <Avatar 
                    src={project.owner?.photoURL}
                    alt={project.owner?.displayName}
                    size="sm"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {project.owner?.displayName || project.owner?.email || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Members</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.members?.map((member, index) => (
                    <Avatar 
                      key={index}
                      src={member.photoURL}
                      alt={member.displayName || member.email}
                      size="sm"
                      tooltip={member.displayName || member.email}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;