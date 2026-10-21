import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenPasswordModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">Administrator</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner">Store Owner</span>;
      default:
        return <span className="badge badge-user">Normal User</span>;
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">★</span>
          <span className="brand-text">StoreRating</span>
        </Link>

        <div className="navbar-menu">
          {user ? (
            <div className="user-nav-section">
              <div className="user-profile-info">
                <span className="user-display-name">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
              <button 
                type="button" 
                className="btn btn-outline-nav"
                onClick={onOpenPasswordModal}
                title="Update your account password"
              >
                Change Password
              </button>
              <button 
                type="button" 
                className="btn btn-logout" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-nav-section">
              <Link to="/login" className="btn btn-outline-nav">Login</Link>
              <Link to="/register" className="btn btn-primary-nav">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
