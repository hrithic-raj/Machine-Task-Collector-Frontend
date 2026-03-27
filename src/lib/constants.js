// Tech stack options
export const TECH_STACKS = ['MERN', 'Python', 'Dotnet', 'Frontend', 'GoLang', 'JAVA'];

// File upload limits
export const UPLOAD_LIMITS = {
  maxFiles: 10,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  companies: '/companies',
  tags: '/tags',
  tasks: '/tasks',
};
