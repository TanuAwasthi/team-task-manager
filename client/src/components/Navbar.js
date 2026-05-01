import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">📋 Task Manager</div>
        {user && (
          <ul className="navbar-links">
            <li>{user.firstName} {user.lastName}</li>
            <li>
              <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                Dashboard
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-danger" style={{ margin: 0 }}>
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
