// Credit Book — Axios API Client
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach access token ──────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cb_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: auto refresh on 401 ────────────────────────────
let isRefreshing = false;
let refreshQueue = [];

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('cb_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem('cb_access_token', accessToken);
        localStorage.setItem('cb_refresh_token', newRefreshToken);

        refreshQueue.forEach((p) => p.resolve(accessToken));
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        refreshQueue.forEach((p) => p.reject(refreshError));
        refreshQueue = [];

        // Clear auth and redirect to login
        localStorage.removeItem('cb_access_token');
        localStorage.removeItem('cb_refresh_token');
        localStorage.removeItem('cb_user');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Format error message
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Something went wrong';

    const formattedError = new Error(message);
    formattedError.code = error.response?.data?.error?.code;
    formattedError.status = error.response?.status;
    return Promise.reject(formattedError);
  }
);

export default apiClient;
