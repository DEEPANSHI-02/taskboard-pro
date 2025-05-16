// File: src/pages/dashboard/ProjectsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Alert, Badge, Button, Input, Loader, Dropdown } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { projectService } from '../../services/projectService';

const ProjectsPage = () => {
  const { user } = useAuth();
  const { toast } = useUI();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, owned, member

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getUserProjects();
        setProjects(response);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  // Filter and search projects
  const filteredProjects = projects.filter(project => {
    // Filter by ownership
    if (filter === 'owned' && project.owner !== user.uid) return false;
    if (filter === 'member' && project.owner === user.uid) return false;
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and organize your projects</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/projects/new">
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">Filter:</span>
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                {filter === 'all' ? 'All Projects' : filter === 'owned' ? 'Owned Projects' : 'Member Projects'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            }
            items={[
              { label: 'All Projects', value: 'all' },
              { label: 'Owned Projects', value: 'owned' },
              { label: 'Member Projects', value: 'member' }
            ]}
            onItemClick={(item) => setFilter(item.value)}
            renderItem={(item) => (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                {item.label}
              </button>
            )}
          />
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`}>
              <Card hover className="h-full">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    {project.owner === user.uid && (
                      <Badge variant="secondary" size="sm">Owner</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">{project.description}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-1">
                      {project.members?.slice(0, 3).map((member, index) => (
                        <div 
                          key={index}
                          className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs text-gray-600"
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
                      ))}
                      {project.members?.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs text-gray-600">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Updated {formatDate(project.updatedAt)}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <Badge variant="primary" size="sm">
                      {project.tasks?.length || 0} Tasks
                    </Badge>
                    
                    <div className="text-xs text-gray-500">
                      {project.status === 'active' ? (
                        <Badge variant="success" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">Archived</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Alert 
          title={searchTerm ? "No matching projects found" : "No projects found"} 
          variant="info"
        >
          {searchTerm ? (
            <p>Try adjusting your search or filter criteria.</p>
          ) : (
            <p>You don't have any projects yet. Let's create your first project.</p>
          )}
          {!searchTerm && (
            <Link to="/projects/new" className="mt-2 inline-block">
              <Button size="sm">Create Project</Button>
            </Link>
          )}
        </Alert>
      )}
    </div>
  );
};

export default ProjectsPage;