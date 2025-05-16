import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Input, TextArea, Button, Card, Loader } from '../../components/ui/Index';
import { getProjectById, updateProject } from '../../services/projectService';

const EditProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProjectById(projectId);
        setFormData({
          title: response.data.title || '',
          description: response.data.description || ''
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      await updateProject(projectId, formData);
      toast.success('Project updated successfully!');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Project</h1>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <Input
              label="Project Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              error={errors.title}
              required
            />
          </div>
          
          <div>
            <TextArea
              label="Project Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={submitting}
            >
              Update Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProjectPage;