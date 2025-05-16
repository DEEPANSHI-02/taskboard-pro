import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Avatar, Badge } from '../../components/ui/Index';

const ProjectCard = ({ project }) => {
  // Format date to more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <Link to={`/projects/${project._id}`} className="block">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900 truncate">{project.title}</h3>
            <Badge color="primary" className="ml-2">
              {project.statuses.length} statuses
            </Badge>
          </div>
          
          {project.description && (
            <p className="mt-2 text-gray-600 text-sm line-clamp-2">
              {project.description}
            </p>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar 
                src={project.owner?.profilePicture} 
                alt={project.owner?.name}
                name={project.owner?.name}
                size="sm"
              />
              <span className="ml-2 text-sm text-gray-600">
                {project.owner?.name || "Unknown"}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Created {formatDate(project.createdAt)}
            </span>
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="flex -space-x-2 overflow-hidden">
              {project.members.slice(0, 3).map((member, index) => (
                <Avatar
                  key={index}
                  src={member.user?.profilePicture}
                  alt={member.user?.name}
                  name={member.user?.name}
                  size="xs"
                  className="border-2 border-white"
                />
              ))}
            </div>
            {project.members.length > 3 && (
              <span className="ml-1 text-xs text-gray-500">
                +{project.members.length - 3} more
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProjectCard;