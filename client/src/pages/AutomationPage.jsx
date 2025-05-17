// src/pages/AutomationPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import useAuth from "../hooks/useAuth";

const AutomationPage = () => {
  const { projectId } = useParams();
  const { token } = useAuth();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const response = await api.get(`/api/automations/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAutomations(response.data.automations || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load automations");
      } finally {
        setLoading(false);
      }
    };

    if (token && projectId) {
      fetchAutomations();
    }
  }, [projectId, token]);

  // Sample automation templates
  const automationTemplates = [
    {
      name: "Move to In Progress when assigned",
      trigger: "TASK_ASSIGNED",
      action: "CHANGE_STATUS",
      actionParams: { status: "In Progress" }
    },
    {
      name: "Send notification when task is completed",
      trigger: "STATUS_CHANGED",
      conditions: [{ field: "status", operator: "equals", value: "Done" }],
      action: "SEND_NOTIFICATION",
      actionParams: { message: "Task completed!" }
    },
    {
      name: "Award badge on task completion",
      trigger: "STATUS_CHANGED",
      conditions: [{ field: "status", operator: "equals", value: "Done" }],
      action: "AWARD_BADGE",
      actionParams: { badgeType: "taskCompleter" }
    }
  ];

  if (loading) {
    return <div>Loading automations...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Workflow Automations</h1>
          <p className="text-gray-600">Create rules to automate task workflows</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm"
        >
          + New Automation
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 mb-6 rounded-md text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {automations.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {automations.map((automation) => (
                <tr key={automation._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{automation.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{automation.trigger}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{automation.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${automation.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {automation.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">No automations yet</h3>
          <p className="text-gray-600 mb-6">Create your first automation rule to streamline your workflow</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {automationTemplates.map((template, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-sm cursor-pointer">
                <h4 className="font-medium text-gray-800 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600">
                  When: {template.trigger.replace(/_/g, ' ')}
                  <br />
                  Action: {template.action.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Automation Form would go here */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-medium mb-4">Create New Automation</h2>
            {/* Form implementation */}
            <button onClick={() => setShowCreateForm(false)} className="mt-4 bg-gray-200 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationPage;