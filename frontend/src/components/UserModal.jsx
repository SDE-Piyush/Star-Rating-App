import React, { useState } from 'react';
import { api } from '../services/api';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/validation';
import { PasswordInput } from './PasswordInput';

export const UserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    const addrErr = validateAddress(formData.address);
    if (addrErr) newErrors.address = addrErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) return;

    setLoading(true);
    try {
      await api.createAdminUser(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New User</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && <div className="alert alert-danger">{serverError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="user-name">
                Full Name <span className="text-danger">*</span>
                <span className="char-count">({formData.name.length}/60 max)</span>
              </label>
              <input
                id="user-name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Piyush Kumar"
                value={formData.name}
                onChange={handleChange}
                maxLength={60}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="user-email">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g. user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="user-role">
                  Account Role <span className="text-danger">*</span>
                </label>
                <select
                  id="user-role"
                  name="role"
                  className="form-input"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="USER">Normal User</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-password">
                Password <span className="text-danger">*</span>
                <span className="char-count">(8-16 chars, 1 uppercase, 1 special char)</span>
              </label>
              <PasswordInput
                id="user-password"
                name="password"
                className={errors.password ? 'is-invalid' : ''}
                placeholder="e.g. SecurePass@123"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-address">
                Physical Address <span className="text-danger">*</span>
                <span className="char-count">({formData.address.length}/400 max)</span>
              </label>
              <textarea
                id="user-address"
                name="address"
                rows="3"
                className={`form-input ${errors.address ? 'is-invalid' : ''}`}
                placeholder="Enter street address, city, state, and zip..."
                value={formData.address}
                onChange={handleChange}
                maxLength={400}
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
