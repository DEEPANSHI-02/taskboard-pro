import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Input, TextArea, Button, Card } from '../../components/ui/Index';
import { createProject } from '../../services/projectService';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

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
    
    setLoading(true);
    
    try {
      await createProject(formData);
      toast.success('Project created successfully!');
      navigate('/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Project</h1>
      
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
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={loading}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateProjectPage;