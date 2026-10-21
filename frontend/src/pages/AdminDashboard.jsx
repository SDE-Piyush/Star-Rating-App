import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StarRating } from '../components/StarRating';
import { UserModal } from '../components/UserModal';
import { StoreModal } from '../components/StoreModal';

export const AdminDashboard = () => {
  // KPI Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users'

  // Stores State
  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('ASC');
  const [loadingStores, setLoadingStores] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('ASC');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch KPI stats
  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const res = await api.getAdminStores({
        ...storeFilters,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder
      });
      setStores(res.stores || []);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.getAdminUsers({
        ...userFilters,
        sortBy: userSortBy,
        sortOrder: userSortOrder
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores();
    } else {
      fetchUsers();
    }
  }, [activeTab, storeFilters, storeSortBy, storeSortOrder, userFilters, userSortBy, userSortOrder]);

  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('ASC');
    }
  };

  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUserSortBy(field);
      setUserSortOrder('ASC');
    }
  };

  const getSortIndicator = (currentSortBy, currentOrder, field) => {
    if (currentSortBy !== field) return <span className="sort-icon sort-inactive">↕</span>;
    return <span className="sort-icon sort-active">{currentOrder === 'ASC' ? '▲' : '▼'}</span>;
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="dashboard-container">
      {/* Page Title & Actions */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="page-title">Administrator Dashboard</h1>
          <p className="page-subtitle">Manage stores, users, system settings, and inspect community feedback.</p>
        </div>
        <div className="header-action-buttons">
          <button 
            type="button" 
            className="btn btn-outline-primary"
            onClick={() => setIsStoreModalOpen(true)}
          >
            + Add New Store
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setIsUserModalOpen(true)}
          >
            + Add New User
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="alert alert-success toast-alert">{toastMessage}</div>
      )}

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-users">👥</div>
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <span className="stat-number">{stats.totalUsers}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-stores">🏪</div>
          <div className="stat-content">
            <span className="stat-label">Total Stores</span>
            <span className="stat-number">{stats.totalStores}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-ratings">⭐</div>
          <div className="stat-content">
            <span className="stat-label">Submitted Ratings</span>
            <span className="stat-number">{stats.totalRatings}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          🏪 Registered Stores ({stores.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Accounts ({users.length})
        </button>
      </div>

      {/* TAB 1: STORES */}
      {activeTab === 'stores' && (
        <div>
          {/* Filters for Stores */}
          <div className="filter-card">
            <div className="filters-grid">
              <div className="filter-field">
                <label className="filter-label">Filter by Store Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type name..."
                  value={storeFilters.name}
                  onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                />
              </div>

              <div className="filter-field">
                <label className="filter-label">Filter by Email</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type email..."
                  value={storeFilters.email}
                  onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                />
              </div>

              <div className="filter-field">
                <label className="filter-label">Filter by Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type address..."
                  value={storeFilters.address}
                  onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                />
              </div>

              <div className="filter-field-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setStoreFilters({ name: '', email: '', address: '' })}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Stores Table */}
          <div className="table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable-th" onClick={() => handleStoreSort('name')}>
                      Store Name {getSortIndicator(storeSortBy, storeSortOrder, 'name')}
                    </th>
                    <th className="sortable-th" onClick={() => handleStoreSort('email')}>
                      Email {getSortIndicator(storeSortBy, storeSortOrder, 'email')}
                    </th>
                    <th className="sortable-th" onClick={() => handleStoreSort('address')}>
                      Address {getSortIndicator(storeSortBy, storeSortOrder, 'address')}
                    </th>
                    <th className="sortable-th" onClick={() => handleStoreSort('rating')}>
                      Average Rating {getSortIndicator(storeSortBy, storeSortOrder, 'rating')}
                    </th>
                    <th>Assigned Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStores ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div className="spinner"></div>
                        <p className="loading-text">Loading stores...</p>
                      </td>
                    </tr>
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 empty-state">
                        No stores found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id}>
                        <td className="font-semibold text-primary">{s.name}</td>
                        <td className="text-secondary">{s.email}</td>
                        <td className="text-secondary text-sm">{s.address}</td>
                        <td>
                          <StarRating value={s.rating} />
                          <span className="rating-count-sub">({s.rating_count} reviews)</span>
                        </td>
                        <td>
                          {s.owner_name ? (
                            <div>
                              <span className="font-semibold text-sm">{s.owner_name}</span>
                              <div className="text-muted text-xs">{s.owner_email}</div>
                            </div>
                          ) : (
                            <span className="badge-unassigned">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div>
          {/* Filters for Users */}
          <div className="filter-card">
            <div className="filters-grid">
              <div className="filter-field">
                <label className="filter-label">Filter by Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type name..."
                  value={userFilters.name}
                  onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                />
              </div>

              <div className="filter-field">
                <label className="filter-label">Filter by Email</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type email..."
                  value={userFilters.email}
                  onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                />
              </div>

              <div className="filter-field">
                <label className="filter-label">Filter by Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type address..."
                  value={userFilters.address}
                  onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                />
              </div>

              <div className="filter-field">
                <label className="filter-label">Filter by Role</label>
                <select
                  className="form-input"
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>

              <div className="filter-field-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setUserFilters({ name: '', email: '', address: '', role: '' })}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable-th" onClick={() => handleUserSort('name')}>
                      Full Name {getSortIndicator(userSortBy, userSortOrder, 'name')}
                    </th>
                    <th className="sortable-th" onClick={() => handleUserSort('email')}>
                      Email Address {getSortIndicator(userSortBy, userSortOrder, 'email')}
                    </th>
                    <th className="sortable-th" onClick={() => handleUserSort('address')}>
                      Address {getSortIndicator(userSortBy, userSortOrder, 'address')}
                    </th>
                    <th className="sortable-th" onClick={() => handleUserSort('role')}>
                      Role {getSortIndicator(userSortBy, userSortOrder, 'role')}
                    </th>
                    <th className="sortable-th" onClick={() => handleUserSort('rating')}>
                      Store Rating (If Owner) {getSortIndicator(userSortBy, userSortOrder, 'rating')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div className="spinner"></div>
                        <p className="loading-text">Loading users...</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 empty-state">
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td className="font-semibold text-primary">{u.name}</td>
                        <td className="text-secondary">{u.email}</td>
                        <td className="text-secondary text-sm">{u.address}</td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td>
                          {u.role === 'STORE_OWNER' ? (
                            u.store_name ? (
                              <div>
                                <span className="font-semibold text-xs text-primary">{u.store_name}</span>
                                <div>
                                  <StarRating value={u.rating} />
                                  <span className="rating-count-sub">({u.rating_count} reviews)</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted text-xs">No store linked</span>
                            )
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={() => {
          fetchStats();
          fetchUsers();
          showToast('New user account created successfully!');
        }}
      />

      {/* Add Store Modal */}
      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onSuccess={() => {
          fetchStats();
          fetchStores();
          showToast('New store registered successfully!');
        }}
      />
    </div>
  );
};
