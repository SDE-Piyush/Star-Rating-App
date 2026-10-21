import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { api } from '../services/api';

export const RatingModal = ({ store, isOpen, onClose, onSuccess }) => {
  const [selectedRating, setSelectedRating] = useState(store?.userSubmittedRating || 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !store) return null;

  const hasExistingRating = store.userSubmittedRating !== null && store.userSubmittedRating !== undefined;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setLoading(true);
    try {
      await api.rateStore(store.id, selectedRating);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {hasExistingRating ? 'Modify Your Rating' : 'Submit Store Rating'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="store-rating-context">
              <h4 className="store-name-title">{store.name}</h4>
              <p className="store-address-text">{store.address}</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="rating-select-box">
              <label className="form-label">Your Rating (1 to 5 Stars):</label>
              <div className="interactive-stars-wrapper">
                <StarRating 
                  value={selectedRating} 
                  onChange={setSelectedRating} 
                  interactive={true} 
                  size="lg" 
                />
              </div>
              <p className="rating-helper-text">
                {selectedRating} out of 5 stars selected
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : hasExistingRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
