import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Loader } from '../../components/ui/Index';
import ProjectCard from '../../components/projects/ProjectCard';
import { getUserProjects } from '../../services/projectService';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getUserProjects();
        setProjects(response.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError(err.response?.data?.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">{error}</p>
        <Button 
          className="mt-4" 
          variant="secondary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Projects</h1>
        <Button to="/projects/new">Create New Project</Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to get started</p>
          <Button to="/projects/new">Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;