import React, { useState } from 'react';
import { api } from '../services/api';
import { validatePassword } from '../utils/validation';
import { PasswordInput } from './PasswordInput';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.currentPassword) {
      setError('Current password is required.');
      return;
    }

    const passErr = validatePassword(formData.newPassword);
    if (passErr) {
      setError(passErr);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password cannot be the same as your current password.');
      return;
    }

    setLoading(true);
    try {
      await api.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Change Password</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="current-password">Current Password</label>
              <PasswordInput
                id="current-password"
                name="currentPassword"
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                New Password
                <span className="char-count">(8-16 chars, 1 uppercase, 1 special char)</span>
              </label>
              <PasswordInput
                id="new-password"
                name="newPassword"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
              <PasswordInput
                id="confirm-password"
                name="confirmPassword"
                placeholder="Re-enter your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
