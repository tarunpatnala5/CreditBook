// Credit Book — All API Functions
import api from './client';

// ─── AUTH ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  logoutAll: () => api.post('/auth/logout-all'),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (sessionId) => api.delete(`/auth/sessions/${sessionId}`),
};

// ─── USERS ────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.post('/users/me/change-password', data),
  deleteMe: () => api.delete('/users/me'),

  // Admin
  getAll: (params) => api.get('/users', { params }),
  getPending: () => api.get('/users/pending'),
  activate: (userId) => api.post(`/users/${userId}/activate`),
  reject: (userId, reason) => api.post(`/users/${userId}/reject`, { reason }),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

// ─── PERSONS ──────────────────────────────────────────────────────────────
export const personsApi = {
  getAll: (params) => api.get('/persons', { params }),
  getShared: () => api.get('/persons/shared'),
  getOne: (id) => api.get(`/persons/${id}`),
  create: (data) => api.post('/persons', data),
  update: (id, data) => api.patch(`/persons/${id}`, data),
  scheduleDeletion: (id) => api.delete(`/persons/${id}`),
  restore: (id) => api.post(`/persons/${id}/restore`),
};

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────
export const transactionsApi = {
  getAll: (personId, params) => api.get(`/persons/${personId}/transactions`, { params }),
  create: (personId, data) => api.post(`/persons/${personId}/transactions`, data),
  update: (personId, txnId, data) => api.patch(`/persons/${personId}/transactions/${txnId}`, data),
  delete: (personId, txnId) => api.delete(`/persons/${personId}/transactions/${txnId}`),
  getInterestHistory: (personId, txnId) =>
    api.get(`/persons/${personId}/transactions/${txnId}/interest-history`),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── SUPPORT ──────────────────────────────────────────────────────────────
export const supportApi = {
  getMessages: (params) => api.get('/support/messages', { params }),
  send: (message) => api.post('/support/messages', { message }),

  // Admin
  getConversations: () => api.get('/support/conversations'),
  getConversation: (userId) => api.get(`/support/conversations/${userId}`),
  reply: (userId, message) => api.post(`/support/conversations/${userId}/reply`, { message }),
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
};
