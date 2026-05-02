import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const projectAPI = {
  createProject: (data) => api.post('/projects', data),
  getMyProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};

export const taskAPI = {
  createTask: (projectId, data) => api.post(`/tasks/${projectId}/tasks`, data),
  getTasks: (projectId) => api.get(`/tasks/${projectId}/tasks`),
  updateTask: (id, data) => api.put(`/tasks/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/tasks/${id}`),
  getStats: (projectId) => api.get(`/tasks/${projectId}/tasks/stats`),
};

export default api;
