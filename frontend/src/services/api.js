const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred during the request.');
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updatePassword: (passwords) => request('/auth/update-password', { method: 'PUT', body: JSON.stringify(passwords) }),

  // Admin
  getAdminStats: () => request('/admin/dashboard'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users?${query}`);
  },
  createAdminUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  getAdminStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/stores?${query}`);
  },
  createAdminStore: (storeData) => request('/admin/stores', { method: 'POST', body: JSON.stringify(storeData) }),
  getAvailableOwners: () => request('/admin/owners'),

  // Normal User
  getStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/stores?${query}`);
  },
  rateStore: (storeId, rating) => request(`/stores/${storeId}/rate`, { method: 'POST', body: JSON.stringify({ rating }) }),

  // Store Owner
  getOwnerDashboard: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/owner/dashboard?${query}`);
  },
};
