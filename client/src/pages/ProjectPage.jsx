import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../features/auth/AuthProvider";

// Components for the Kanban board
const StatusColumn = ({ title, tasks, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 w-full md:w-80 flex-shrink-0">
        <h3 className="font-medium text-gray-800 mb-3">{title}</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full md:w-80 flex-shrink-0">
      <h3 className="font-medium text-gray-800 mb-3">
        {title}{" "}
        <span className="text-gray-500 text-sm">({tasks.length})</span>
      </h3>
      <div className="space-y-3 min-h-[200px]">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-3 text-center text-gray-500 h-24 flex items-center justify-center">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
export default ProjectPage;

const TaskCard = ({ task }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow p-3">
      <h4 className="font-medium text-gray-800 mb-2">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div>
          {task.dueDate && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800">
              {task.assignee.name?.charAt(0) || "?"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectPage = () => {
  const { projectId } = useParams();
  const { token } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !projectId) {
      return;
    }

    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch project details
        const projectResponse = await axios.get(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch tasks for this project
        const tasksResponse = await axios.get(`/api/tasks/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProject(projectResponse.data.project);
        setTasks(tasksResponse.data.tasks || []);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError(err.response?.data?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, token]);

  // Group tasks by status
  const todoTasks = tasks.filter((task) => task.status === "To Do");
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress");
  const doneTasks = tasks.filter((task) => task.status === "Done");

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-100 text-red-700">
        <h2 className="font-bold mb-2">Error</h2>
        <p>{error}</p>
        <Link 
          to="/dashboard" 
          className="inline-block mt-4 text-sm bg-white px-3 py-1 rounded border border-red-200 hover:bg-red-50"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Project header */}
      <div className="flex justify-between items-center mb-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project?.title}</h1>
            <p className="text-gray-600">{project?.description || "No description provided"}</p>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Link 
            to={`/project/${projectId}/automations`}
            className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md text-sm"
          >
            Automations
          </Link>
          <button className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md text-sm">
            Project Settings
          </button>
        </div>
      </div>

      {/* Task actions */}
      <div className="mb-6">
        <button className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm flex items-center">
          <span className="mr-1">+</span> Add Task
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex space-x-4 pb-4 min-h-[300px]">
          <StatusColumn 
            title="To Do" 
            tasks={todoTasks} 
            isLoading={loading} 
          />
          <StatusColumn 
            title="In Progress" 
            tasks={inProgressTasks} 
            isLoading={loading} 
          />
          <StatusColumn 
            title="Done" 
            tasks={doneTasks} 
            isLoading={loading} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;