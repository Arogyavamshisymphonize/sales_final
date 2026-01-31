import axios from 'axios';
import toast from '../utils/toast';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors and attempt token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        toast.error('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('token', access_token);

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors with toast notifications
    if (error.response) {
      switch (error.response.status) {
        case 403:
          toast.error("You don't have permission to do that.");
          break;
        case 404:
          toast.error("Resource not found.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          if (error.response.status >= 400 && error.response.status < 500) {
            // Client errors - show the error message from backend if available
            const message = error.response.data?.detail || 'An error occurred';
            toast.error(message);
          }
      }
    } else if (error.request) {
      // Network error
      toast.error("Connection failed. Please check your internet.");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (username, email, password) => {
    const response = await api.post('/signup', { username, email, password });
    // Store both tokens
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  login: async (identifier, password) => {
    const response = await api.post('/login', { identifier, password });
    // Store both tokens
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post('/refresh', { refresh_token: refreshToken });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with local cleanup anyway
    }
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/user/profile', profileData);
    // Update stored user data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  listChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  createChat: async () => {
    const response = await api.post('/chats');
    return response.data;
  },

  updateChat: async (chatId, updates) => {
    const response = await api.patch(`/chats/${chatId}`, updates);
    return response.data;
  },

  deleteChat: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },

  getMessages: async (chatId) => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId, content) => {
    const response = await api.post(`/chats/${chatId}/messages`, { content });
    return response.data;
  },

  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload-doc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  listDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },
};

export default api;
