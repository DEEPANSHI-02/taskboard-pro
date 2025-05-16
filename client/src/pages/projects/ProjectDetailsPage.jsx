import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Loader, Avatar, Badge } from '../../components/ui/Index';
import TaskList from '../../components/tasks/TaskList';
import ProjectMembers from '../../components/projects/ProjectMembers';
import ProjectStatuses from '../../components/projects/ProjectStatuses';
import { getProjectById, deleteProject } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProjectById(projectId);
        setProject(response.data);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        toast.error(error.response?.data?.message || 'Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const isOwner = project?.owner?._id === currentUser?._id;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>

        <div className="flex items-center space-x-3">
          {isOwner && (
            <>
              <Button 
                variant="secondary"
                onClick={() => navigate(`/projects/${projectId}/edit`)}
              >
                Edit Project
              </Button>
              <Button 
                variant="danger"
                onClick={() => setDeleteModal(true)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-gray-600 text-sm">Members</div>
          <div className="font-bold text-xl">{project.members.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-gray-600 text-sm">Status Columns</div>
          <div className="font-bold text-xl">{project.statuses.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-gray-600 text-sm">Created</div>
          <div className="font-bold text-xl">{new Date(project.createdAt).toLocaleDateString()}</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          {isOwner && (
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statuses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('statuses')}
            >
              Status Columns
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Tasks</h2>
              <Button size="sm">Create Task</Button>
            </div>
            <TaskList projectId={projectId} />
          </div>
        )}
        
        {activeTab === 'members' && (
          <ProjectMembers 
            projectId={projectId}
            members={project.members}
            isOwner={isOwner}
          />
        )}
        
        {activeTab === 'statuses' && isOwner && (
          <ProjectStatuses 
            projectId={projectId}
            statuses={project.statuses}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteProject}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;