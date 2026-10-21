import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { validateName, validateEmail, validateAddress } from '../utils/validation';

export const StoreModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchOwners = async () => {
        try {
          const res = await api.getAvailableOwners();
          setOwners(res.owners || []);
        } catch (err) {
          console.error('Failed to load store owners:', err);
        }
      };
      fetchOwners();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      const payload = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        owner_id: formData.owner_id ? Number(formData.owner_id) : null
      };
      await api.createAdminStore(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New Store</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && <div className="alert alert-danger">{serverError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="store-name">
                Store Name <span className="text-danger">*</span>
                <span className="char-count">({formData.name.length}/60 max)</span>
              </label>
              <input
                id="store-name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Pahadi Momos"
                value={formData.name}
                onChange={handleChange}
                maxLength={60}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="store-email">
                  Store Contact Email <span className="text-danger">*</span>
                </label>
                <input
                  id="store-email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g. contact@apexstore.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="store-owner">
                  Assigned Store Owner (Optional)
                </label>
                <select
                  id="store-owner"
                  name="owner_id"
                  className="form-input"
                  value={formData.owner_id}
                  onChange={handleChange}
                >
                  <option value="">-- No Owner Assigned --</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="store-address">
                Store Physical Address <span className="text-danger">*</span>
                <span className="char-count">({formData.address.length}/400 max)</span>
              </label>
              <textarea
                id="store-address"
                name="address"
                rows="3"
                className={`form-input ${errors.address ? 'is-invalid' : ''}`}
                placeholder="Enter complete store physical location..."
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
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
