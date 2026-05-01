import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api/api';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectAPI.getMyProjects();
      setProjects(res.data.projects);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.createProject(formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await projectAPI.deleteProject(id);
        loadProjects();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <p>Manage your projects and tasks</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ marginBottom: '20px' }}>
        {showForm ? 'Cancel' : '+ New Project'}
      </button>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>Create New Project</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
            <button type="submit" className="btn btn-success">Create</button>
          </form>
        </div>
      )}

      <div className="grid grid-2">
        {projects.length === 0 ? (
          <p>No projects yet. Create one to get started!</p>
        ) : (
          projects.map(project => (
            <div className="card" key={project._id} style={{ cursor: 'pointer' }}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                Members: {project.members.length}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="btn btn-primary"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
