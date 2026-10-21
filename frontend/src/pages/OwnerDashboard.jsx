import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StarRating } from '../components/StarRating';

export const OwnerDashboard = () => {
  const [data, setData] = useState({
    hasStore: true,
    store: null,
    ratings: []
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getOwnerDashboard({ sortBy, sortOrder });
      setData(res);
    } catch (err) {
      console.error('Failed to load store owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

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

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your store performance...</p>
        </div>
      </div>
    );
  }

  if (!data.hasStore || !data.store) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-info">
          <h3>No Store Assigned</h3>
          <p>{data.message || 'There is no store assigned to your account. Please reach out to a System Administrator.'}</p>
        </div>
      </div>
    );
  }

  const { store, ratings } = data;

  return (
    <div className="dashboard-container">
      {/* Store Information & KPI Banner */}
      <div className="store-overview-card">
        <div className="store-meta-left">
          <span className="badge badge-owner">Your Store</span>
          <h1 className="store-title">{store.name}</h1>
          <p className="store-info-line">📍 {store.address}</p>
          <p className="store-info-line">✉ {store.email}</p>
        </div>

        <div className="store-stats-right">
          <div className="kpi-box">
            <span className="kpi-label">Average Store Rating</span>
            <div className="kpi-rating-display">
              <span className="kpi-large-number">{store.averageRating ? store.averageRating.toFixed(1) : '0.0'}</span>
              <span className="kpi-max-number">/ 5.0</span>
            </div>
            <StarRating value={store.averageRating} size="md" />
            <span className="kpi-subtext">Based on {store.totalRatings} user {store.totalRatings === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>
      </div>

      {/* Ratings History Section */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Customer Reviews & Ratings</h2>
          <p className="section-subtitle">
            Detailed list of all registered users who have submitted feedback for your store.
          </p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable-th" onClick={() => handleSort('name')}>
                  Customer Name {getSortIndicator('name')}
                </th>
                <th className="sortable-th" onClick={() => handleSort('email')}>
                  Email Address {getSortIndicator('email')}
                </th>
                <th>Address</th>
                <th className="sortable-th" onClick={() => handleSort('rating')}>
                  Rating Submitted {getSortIndicator('rating')}
                </th>
                <th className="sortable-th" onClick={() => handleSort('date')}>
                  Reviewed On {getSortIndicator('date')}
                </th>
              </tr>
            </thead>
            <tbody>
              {ratings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 empty-state">
                    No customers have submitted ratings for your store yet.
                  </td>
                </tr>
              ) : (
                ratings.map((item) => (
                  <tr key={item.rating_id}>
                    <td className="font-semibold text-primary">{item.user_name}</td>
                    <td className="text-secondary">{item.user_email}</td>
                    <td className="text-secondary text-sm">{item.user_address}</td>
                    <td>
                      <div className="user-rating-pill">
                        <span className="star-highlight">★</span>
                        <span className="bold">{item.rating}</span> / 5
                      </div>
                    </td>
                    <td className="text-secondary">{formatDate(item.updated_at || item.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
