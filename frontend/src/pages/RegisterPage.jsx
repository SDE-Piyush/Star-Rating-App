import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/validation';
import { PasswordInput } from '../components/PasswordInput';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">★</div>
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Sign up to discover and rate local stores</p>
        </div>

        {serverError && <div className="alert alert-danger">{serverError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Full Name <span className="text-danger">*</span>
              <span className="char-count">({formData.name.length}/60 max)</span>
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Raghav"
              value={formData.name}
              onChange={handleChange}
              maxLength={60}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. chris.user@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password <span className="text-danger">*</span>
              <span className="char-count">(8-16 chars, 1 uppercase, 1 special character)</span>
            </label>
            <PasswordInput
              id="reg-password"
              name="password"
              className={errors.password ? 'is-invalid' : ''}
              placeholder="e.g. MyPassword@123"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-address">
              Address <span className="text-danger">*</span>
              <span className="char-count">({formData.address.length}/400 max)</span>
            </label>
            <textarea
              id="reg-address"
              name="address"
              rows="3"
              className={`form-input ${errors.address ? 'is-invalid' : ''}`}
              placeholder="Enter your complete street address..."
              value={formData.address}
              onChange={handleChange}
              maxLength={400}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already registered?{' '}
            <Link to="/login" className="auth-link">Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
