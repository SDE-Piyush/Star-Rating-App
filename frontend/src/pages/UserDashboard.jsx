import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StarRating } from '../components/StarRating';
import { RatingModal } from '../components/RatingModal';

export const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [selectedStoreForRating, setSelectedStoreForRating] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.getStores({ search, sortBy, sortOrder });
      setStores(res.stores || []);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const getSortIndicator = (field) => {
    if (sortBy !== field) return <span className="sort-icon sort-inactive">↕</span>;
    return <span className="sort-icon sort-active">{sortOrder === 'ASC' ? '▲' : '▼'}</span>;
  };

  const openRatingModal = (store) => {
    setSelectedStoreForRating(store);
    setIsRatingModalOpen(true);
  };

  const handleRatingSuccess = () => {
    fetchStores();
    setToastMessage('Rating recorded successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <h1 className="page-title">Explore & Rate Stores</h1>
          <p className="page-subtitle">Browse registered stores, view overall community feedback, and submit your review.</p>
        </div>
      </div>

      {toastMessage && (
        <div className="alert alert-success toast-alert">{toastMessage}</div>
      )}

      {/* Search Bar */}
      <div className="filter-card">
        <div className="search-input-wrapper">

          <input
            type="text"
            className="form-input search-input"
            placeholder="Search stores by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Stores Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable-th" onClick={() => handleSort('name')}>
                  Store Name {getSortIndicator('name')}
                </th>
                <th className="sortable-th" onClick={() => handleSort('address')}>
                  Address {getSortIndicator('address')}
                </th>
                <th className="sortable-th" onClick={() => handleSort('overallRating')}>
                  Overall Rating {getSortIndicator('overallRating')}
                </th>
                <th className="sortable-th" onClick={() => handleSort('userSubmittedRating')}>
                  My Submitted Rating {getSortIndicator('userSubmittedRating')}
                </th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading stores...</p>
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 empty-state">
                    No stores found matching your search.
                  </td>
                </tr>
              ) : (
                stores.map((store) => {
                  const hasUserRating = store.userSubmittedRating !== null && store.userSubmittedRating !== undefined;
                  return (
                    <tr key={store.id}>
                      <td className="font-semibold text-primary">{store.name}</td>
                      <td className="text-secondary">{store.address}</td>
                      <td>
                        <StarRating value={store.overallRating} />
                        <span className="rating-count-sub">
                          ({store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'})
                        </span>
                      </td>
                      <td>
                        {hasUserRating ? (
                          <div className="user-rating-pill">
                            <span className="star-highlight">★</span>
                            <span className="bold">{store.userSubmittedRating}</span> / 5
                          </div>
                        ) : (
                          <span className="badge-not-rated">Not rated yet</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className={`btn btn-sm ${hasUserRating ? 'btn-outline-primary' : 'btn-primary'}`}
                          onClick={() => openRatingModal(store)}
                        >
                          {hasUserRating ? 'Modify Rating' : 'Rate Store'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for rating submission/modification */}
      {selectedStoreForRating && (
        <RatingModal
          store={selectedStoreForRating}
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedStoreForRating(null);
          }}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};
