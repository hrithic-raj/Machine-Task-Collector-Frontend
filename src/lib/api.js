import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if needed (optional since we use cookies)
api.interceptors.request.use(
  (config) => {
    // Token is automatically sent via cookies, no need to add header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect for auth-related endpoints to avoid redirect loops
      // These endpoints legitimately return 401 when user is not logged in
      const url = error.config?.url || '';
      const isAuthEndpoint = url.startsWith('/auth/') || url.includes('/auth/');

      if (!isAuthEndpoint) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Companies API
export const companiesAPI = {
  getAll: (search) => api.get('/companies', { params: { search } }),
  create: (companyData) => api.post('/companies', companyData),
};

// Tags API
export const tagsAPI = {
  getAll: (search) => api.get('/tags', { params: { search } }),
  create: (tagData) => api.post('/tags', tagData),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (formData) => {
    // For file uploads, use FormData
    return api.post('/tasks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, formData) => {
    return api.put(`/tasks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id) => api.delete(`/tasks/${id}`),
};

export default api;
