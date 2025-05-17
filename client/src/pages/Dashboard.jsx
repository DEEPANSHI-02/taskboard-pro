import { useState, useEffect } from "react";
import useAuth  from "../hooks/useAuth";
import { getAuth, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Example project data for placeholder
const sampleProjects = [
  { id: 1, title: "Marketing Campaign", tasksCount: 12, dueDate: "June 1, 2025", status: "In Progress" },
  { id: 2, title: "Website Redesign", tasksCount: 8, dueDate: "July 15, 2025", status: "To Do" },
  { id: 3, title: "Product Launch", tasksCount: 15, dueDate: "August 10, 2025", status: "In Progress" },
];

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real application, you would fetch projects from your API
    // For now, we'll use the sample data
    setProjects(sampleProjects);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // The AuthProvider will handle redirecting to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Dashboard header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name || user?.email || "User"}!
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-500">
          <h3 className="text-gray-500 text-sm">Total Projects</h3>
          <p className="text-2xl font-semibold">{projects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm">Completed Tasks</h3>
          <p className="text-2xl font-semibold">8</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm">Due Soon</h3>
          <p className="text-2xl font-semibold">3</p>
        </div>
      </div>

      {/* Projects section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Projects</h2>
        <button className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm">
          + New Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading projects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              to={`/project/${project.id}`}
              key={project.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{project.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    project.status === "In Progress" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <div className="flex justify-between">
                    <span>{project.tasksCount} tasks</span>
                    <span>Due: {project.dueDate}</span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Empty project card for adding new */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-40 bg-gray-50 hover:bg-gray-100 cursor-pointer">
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 mx-auto flex items-center justify-center mb-2">
                <span className="text-gray-500 text-xl">+</span>
              </div>
              <p className="text-gray-500">Add New Project</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent activity section - simplified version */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow p-4 overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                <span className="text-xs">JS</span>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">John Smith</span> completed task 
                  <span className="font-medium"> Update homepage design</span>
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                <span className="text-xs">AS</span>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">Alex Smith</span> created project 
                  <span className="font-medium"> Product Launch</span>
                </p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
                <span className="text-xs">MJ</span>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">Mary Johnson</span> assigned you a task 
                  <span className="font-medium"> Finalize presentation</span>
                </p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;