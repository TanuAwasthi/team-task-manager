import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { projectAPI, taskAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [memberError, setMemberError] = useState('');
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    try {
      const [projectRes, tasksRes, statsRes] = await Promise.all([
        projectAPI.getProject(projectId),
        taskAPI.getTasks(projectId),
        taskAPI.getStats(projectId),
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
      setStats(statsRes.data.stats);
    } catch (err) {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [loadData]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.createTask(projectId, taskFormData);
      setTaskFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
      setShowTaskForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');

    if (!memberEmail) {
      setMemberError('Please enter an email address');
      return;
    }

    try {
      await projectAPI.addMember(projectId, { email: memberEmail, role: memberRole });
      setMemberEmail('');
      setMemberRole('member');
      setShowMemberForm(false);
      loadData();
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateTask(taskId, { status: newStatus });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.deleteTask(taskId);
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Remove this team member from the project?')) {
      try {
        await projectAPI.removeMember(projectId, memberId);
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><div className="spinner"></div></div>;
  }

  if (!project) {
    return <div className="container"><p>Project not found</p></div>;
  }

  return (
    <div className="container">
      <h1>{project.name}</h1>
      <p>{project.description}</p>

      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="value" style={{ color: '#28a745' }}>{stats.completed}</div>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <div className="value" style={{ color: '#ffc107' }}>{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <h3>To Do</h3>
            <div className="value" style={{ color: '#007bff' }}>{stats.todo}</div>
          </div>
          <div className="stat-card">
            <h3>Overdue</h3>
            <div className="value" style={{ color: '#dc3545' }}>{stats.overdue}</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn btn-primary">
          {showTaskForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showTaskForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>Create New Task</h2>
          <form onSubmit={handleTaskSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                rows="3"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={taskFormData.dueDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-success">Create Task</button>
          </form>
        </div>
      )}

      {user && project.owner && project.owner._id === user.id && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Team Collaboration</h2>
            <button onClick={() => setShowMemberForm(!showMemberForm)} className="btn btn-primary">
              {showMemberForm ? 'Cancel' : '+ Add Member'}
            </button>
          </div>
          {showMemberForm && (
            <form onSubmit={handleAddMember}>
              {memberError && <div className="alert alert-error">{memberError}</div>}
              <div className="form-group">
                <label>Member Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-success">Add Member</button>
            </form>
          )}
        </div>
      )}

      <h2 style={{ marginTop: '30px', marginBottom: '20px' }}>Tasks</h2>
      <div>
        {tasks.length === 0 ? (
          <p>No tasks yet. Create one to get started!</p>
        ) : (
          tasks.map(task => (
            <div key={task._id} className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${task.isOverdue ? 'overdue' : ''}`}>
              <div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div>
                  <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'primary'}`}>
                    {task.priority}
                  </span>
                  {task.isOverdue && <span className="badge badge-danger" style={{ marginLeft: '5px' }}>OVERDUE</span>}
                </div>
              </div>
              <div>
                <select
                  value={task.status}
                  onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                  className="status-select"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => handleDeleteTask(task._id)} className="btn btn-danger" style={{ marginTop: '10px' }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 style={{ marginTop: '30px', marginBottom: '20px' }}>Team Members</h2>
      <div className="grid grid-3">
        {project.members.map(member => {
          const isOwner = project.owner && project.owner._id.toString() === member.userId._id.toString();
          return (
            <div className="card" key={member.userId._id}>
              <h3>{member.userId.firstName} {member.userId.lastName}</h3>
              <p>{member.userId.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary">{member.role}</span>
                  {isOwner && <span className="badge badge-success">Owner</span>}
                </div>
                {project.owner && project.owner._id.toString() === user?.id && !isOwner && (
                  <span
                    onClick={() => handleRemoveMember(member.userId._id)}
                    className="badge badge-danger"
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                    role="button"
                  >
                    Remove Member
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
