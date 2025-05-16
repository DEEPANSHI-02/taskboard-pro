import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Alert, Badge, Button, Loader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useUI();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch projects
        const projectsResponse = await projectService.getUserProjects();
        
        // Fetch tasks assigned to user
        const tasksResponse = await taskService.getAssignedTasks();
        
        // Calculate stats
        const completedTasks = tasksResponse.filter(task => task.status === 'Done').length;
        const pendingTasks = tasksResponse.filter(task => task.status !== 'Done').length;
        const overdueTasks = tasksResponse.filter(task => {
          return task.status !== 'Done' && new Date(task.dueDate) < new Date();
        }).length;
        
        // Update state
        setStats({
          totalProjects: projectsResponse.length,
          completedTasks,
          pendingTasks,
          overdueTasks
        });
        
        // Get recent projects (most recently updated)
        const sortedProjects = [...projectsResponse].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        ).slice(0, 3);
        setRecentProjects(sortedProjects);
        
        // Get assigned tasks
        setAssignedTasks(tasksResponse.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.displayName}</h1>
        <p className="mt-1 text-sm text-gray-500">Here's an overview of your projects and tasks</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Total Projects</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalProjects}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Completed Tasks</h2>
            <p className="text-3xl font-bold mt-2">{stats.completedTasks}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Pending Tasks</h2>
            <p className="text-3xl font-bold mt-2">{stats.pendingTasks}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-red-600 text-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Overdue Tasks</h2>
            <p className="text-3xl font-bold mt-2">{stats.overdueTasks}</p>
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
          <Link to="/projects">
            <Button variant="outline" size="sm">
              View All Projects
            </Button>
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <Link key={project._id} to={`/projects/${project._id}`}>
                <Card hover className="h-full">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Updated {formatDate(project.updatedAt)}
                      </span>
                      <Badge variant="primary" size="sm">
                        {project.tasks?.length || 0} Tasks
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Alert 
            title="No projects found" 
            variant="info"
          >
            <p>You don't have any projects yet. Let's create your first project.</p>
            <Link to="/projects/new" className="mt-2 inline-block">
              <Button size="sm">Create Project</Button>
            </Link>
          </Alert>
        )}
      </div>

      {/* Assigned Tasks */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Tasks Assigned to You</h2>
        </div>

        {assignedTasks.length > 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/projects/${task.projectId}/tasks/${task._id}`} className="text-primary-600 hover:text-primary-900">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/projects/${task.projectId}`} className="text-gray-600 hover:text-gray-900">
                          {task.projectTitle}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.dueDate ? (
                          <span className={`${
                            new Date(task.dueDate) < new Date() && task.status !== 'Done'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}>
                            {formatDate(task.dueDate)}
                          </span>
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {task.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Alert 
            title="No tasks assigned" 
            variant="info"
          >
            <p>You don't have any tasks assigned to you at the moment.</p>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;