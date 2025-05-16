import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Alert, 
  Badge, 
  Button, 
  Dropdown, 
  Loader, 
  Modal, 
  TextArea 
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';

const ProjectViewPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useUI();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: '',
    dueDate: '',
    assignedTo: ''
  });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        // Fetch project details
        const projectData = await projectService.getProject(projectId);
        setProject(projectData);
        
        // Set default statuses if not defined in project
        const projectStatuses = projectData.statuses?.length 
          ? projectData.statuses 
          : ['To Do', 'In Progress', 'Done'];
        setStatuses(projectStatuses);
        
        // Set initial task status
        setTaskForm(prev => ({ ...prev, status: projectStatuses[0] }));
        
        // Fetch tasks
        const tasksData = await taskService.getProjectTasks(projectId);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching project details:', error);
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, toast]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        ...taskForm,
        projectId
      };
      
      const createdTask = await taskService.createTask(newTask);
      setTasks(prev => [...prev, createdTask]);
      setShowNewTaskModal(false);
      resetTaskForm();
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleMemberInvite = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    
    try {
      await projectService.inviteMember(projectId, newMemberEmail);
      
      // Refresh project data to get updated members list
      const updatedProject = await projectService.getProject(projectId);
      setProject(updatedProject);
      
      setNewMemberEmail('');
      toast.success(`Invitation sent to ${newMemberEmail}`);
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      
      // Update local tasks state
      setTasks(prev => 
        prev.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleProjectDelete = async () => {
    // Confirm before deletion
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      await projectService.deleteProject(projectId);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleArchiveProject = async () => {
    try {
      const newStatus = project.status === 'active' ? 'archived' : 'active';
      await projectService.updateProject(projectId, { status: newStatus });
      
      // Update local project state
      setProject(prev => ({ ...prev, status: newStatus }));
      
      toast.success(`Project ${newStatus === 'active' ? 'activated' : 'archived'} successfully`);
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: statuses[0],
      dueDate: '',
      assignedTo: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const isProjectOwner = project && user && project.owner === user.uid;

  if (loading) {
    return <Loader />;
  }

  if (!project) {
    return (
      <Alert 
        title="Project not found" 
        variant="error"
      >
        <p>The project you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/projects" className="mt-2 inline-block">
          <Button variant="outline" size="sm">Back to Projects</Button>
        </Link>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
              {project.status === 'active' ? 'Active' : 'Archived'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created on {formatDate(project.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="primary" 
            size="md"
            onClick={() => setShowNewTaskModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </Button>
          
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowMembersModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Members
          </Button>
          
          {isProjectOwner && (
            <Dropdown
              trigger={
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </Button>
              }
              items={[
                { label: 'Edit Project', value: 'edit' },
                { label: project.status === 'active' ? 'Archive Project' : 'Activate Project', value: 'toggle-status' },
                { label: 'Delete Project', value: 'delete' }
              ]}
              onItemClick={(item) => {
                switch (item.value) {
                  case 'edit':
                    navigate(`/projects/${projectId}/edit`);
                    break;
                  case 'toggle-status':
                    handleArchiveProject();
                    break;
                  case 'delete':
                    handleProjectDelete();
                    break;
                  default:
                    break;
                }
              }}
            />
          )}
        </div>
      </div>
      
      {/* Project Description */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {project.description || 'No description provided.'}
          </p>
        </div>
      </Card>
      
      {/* Task Board (Kanban Style) */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Task Board</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statuses.map((status) => {
            // Filter tasks by status
            const statusTasks = tasks.filter(task => task.status === status);
            
            return (
              <div key={status} className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center justify-between">
                  <span>{status}</span>
                  <Badge variant="secondary">{statusTasks.length}</Badge>
                </h3>
                
                <div className="space-y-2 min-h-[200px]">
                  {statusTasks.length > 0 ? (
                    statusTasks.map((task) => (
                      <Link 
                        key={task._id} 
                        to={`/projects/${projectId}/tasks/${task._id}`}
                      >
                        <Card hover className="p-3">
                          <h4 className="font-medium text-gray-800">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            {task.dueDate && (
                              <span className={`text-xs ${
                                new Date(task.dueDate) < new Date() && task.status !== 'Done'
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                              }`}>
                                Due: {formatDate(task.dueDate)}
                              </span>
                            )}
                            
                            {task.assignedTo && project.members.some(m => m.uid === task.assignedTo) && (
                              <div className="flex items-center">
                                {(() => {
                                  const member = project.members.find(m => m.uid === task.assignedTo);
                                  if (!member) return null;
                                  
                                  return (
                                    <div 
                                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600"
                                      title={member.displayName || member.email}
                                    >
                                      {member.photoURL ? (
                                        <img 
                                          src={member.photoURL} 
                                          alt={member.displayName || member.email} 
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        (member.displayName || member.email || '').charAt(0).toUpperCase()
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-24 border border-dashed border-gray-300 rounded-md">
                      <p className="text-sm text-gray-500">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* New Task Modal */}
      <Modal
        isOpen={showNewTaskModal}
        onClose={() => {
          setShowNewTaskModal(false);
          resetTaskForm();
        }}
        title="Create New Task"
      >
        <form onSubmit={handleTaskSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <TextArea
                id="description"
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                id="assignedTo"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              >
                <option value="">Unassigned</option>
                {project.members.map((member) => (
                  <option key={member.uid} value={member.uid}>
                    {member.displayName || member.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowNewTaskModal(false);
                resetTaskForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title="Project Members"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Project Owner</h3>
            <div className="mt-2 flex items-center space-x-3">
              {(() => {
                const owner = project.members.find(m => m.uid === project.owner);
                if (!owner) return null;
                
                return (
                  <>
                    <div className="flex-shrink-0">
                      {owner.photoURL ? (
                        <img 
                          src={owner.photoURL} 
                          alt={owner.displayName || owner.email} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium">
                            {(owner.displayName || owner.email || '').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{owner.displayName || 'No name'}</p>
                      <p className="text-gray-500">{owner.email}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">Members</h3>
            <ul className="mt-2 space-y-2">
              {project.members.filter(m => m.uid !== project.owner).length > 0 ? (
                project.members
                  .filter(m => m.uid !== project.owner)
                  .map((member) => (
                    <li key={member.uid} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {member.photoURL ? (
                            <img 
                              src={member.photoURL} 
                              alt={member.displayName || member.email} 
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {(member.displayName || member.email || '').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{member.displayName || 'No name'}</p>
                          <p className="text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      
                      {isProjectOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await projectService.removeMember(projectId, member.uid);
                              
                              // Update members list
                              setProject(prev => ({
                                ...prev,
                                members: prev.members.filter(m => m.uid !== member.uid)
                              }));
                              
                              toast.success('Member removed successfully');
                            } catch (error) {
                              console.error('Error removing member:', error);
                              toast.error('Failed to remove member');
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      )}
                    </li>
                  ))
              ) : (
                <p className="text-sm text-gray-500">No additional members</p>
              )}
            </ul>
          </div>
          
          {isProjectOwner && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900">Invite New Member</h3>
              <form onSubmit={handleMemberInvite} className="mt-2 flex">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="flex-1 block rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
                <Button
                  type="submit"
                  className="rounded-l-none"
                >
                  Invite
                </Button>
              </form>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectViewPage;