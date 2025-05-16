import { useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import CreateProjectForm from "../components/modals/CreateProjectForm";

function Projects() {
  const { projects, loading, error, refetchProjects } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleNewProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleProjectCreated = (newProject) => {
    refetchProjects();
  };

  if (error) {
    console.error("Projects error:", error);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Projects header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          <p className="text-gray-600">Manage and organize your projects</p>
        </div>
        <button
          onClick={handleNewProject}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm flex items-center"
        >
          <span className="mr-1">+</span> New Project
        </button>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading projects...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Link
                to={`/project/${project._id}`}
                key={project._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{project.title}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {project.members?.length || 1} members
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {project.description || "No description provided"}
                  </p>
                  <div className="text-xs text-gray-500 mt-4">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-600 mb-4">You don't have any projects yet.</p>
              <button
                onClick={handleNewProject}
                className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md text-sm"
              >
                Create your first project
              </button>
            </div>
          )}

          {/* Add new project card */}
          <div 
            onClick={handleNewProject}
            className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-40 bg-gray-50 hover:bg-gray-100 cursor-pointer"
          >
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 mx-auto flex items-center justify-center mb-2">
                <span className="text-gray-500 text-xl">+</span>
              </div>
              <p className="text-gray-500">Add New Project</p>
            </div>
          </div>
        </div>
      )}

      {/* Create project modal */}
      <CreateProjectForm 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}

export default Projects;