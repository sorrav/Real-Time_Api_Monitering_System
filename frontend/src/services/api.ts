import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () =>
    api.get('/auth/me'),
  
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/auth/profile', data),
};

// Monitor API
export const monitorAPI = {
  getAll: (params?: { status?: string; favorite?: boolean; sort?: string }) =>
    api.get('/monitors', { params }),
  
  getOne: (id: string) =>
    api.get(`/monitors/${id}`),
  
  create: (data: {
    name: string;
    url: string;
    method?: string;
    interval?: number;
    timeout?: number;
    isFavorite?: boolean;
  }) =>
    api.post('/monitors', data),
  
  update: (id: string, data: Partial<{
    name: string;
    url: string;
    method: string;
    interval: number;
    timeout: number;
    isActive: boolean;
    isFavorite: boolean;
  }>) =>
    api.put(`/monitors/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/monitors/${id}`),
  
  toggleFavorite: (id: string) =>
    api.patch(`/monitors/${id}/favorite`),
  
  toggleActive: (id: string) =>
    api.patch(`/monitors/${id}/toggle`),
};

// Health API
export const healthAPI = {
  getRecords: (monitorId: string, params?: { timeRange?: string; limit?: number }) =>
    api.get(`/health/${monitorId}`, { params }),
};

export default api;