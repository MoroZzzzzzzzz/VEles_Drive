import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { access_token, user } = response.data;
    
    // Store token and user data
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Vehicles API
export const vehiclesAPI = {
  getVehicles: async (params = {}) => {
    const response = await api.get('/vehicles/', { params });
    return response.data;
  },

  getVehicle: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles/', vehicleData);
    return response.data;
  },

  updateVehicle: async (id, updateData) => {
    const response = await api.put(`/vehicles/${id}`, updateData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/vehicles/categories');
    return response.data;
  },

  searchSuggestions: async (query) => {
    const response = await api.get('/vehicles/search/suggestions', {
      params: { q: query }
    });
    return response.data;
  }
};

// Dealers API  
export const dealersAPI = {
  getDealers: async (params = {}) => {
    const response = await api.get('/dealers/', { params });
    return response.data;
  },

  getDealer: async (id) => {
    const response = await api.get(`/dealers/${id}`);
    return response.data;
  },

  createDealerProfile: async (dealerData) => {
    const response = await api.post('/dealers/', dealerData);
    return response.data;
  },

  updateDealerProfile: async (id, updateData) => {
    const response = await api.put(`/dealers/${id}`, updateData);
    return response.data;
  },

  getDealerVehicles: async (id, params = {}) => {
    const response = await api.get(`/dealers/${id}/vehicles`, { params });
    return response.data;
  },

  getDealerReviews: async (id) => {
    const response = await api.get(`/dealers/${id}/reviews`);
    return response.data;
  },

  createDealerReview: async (id, reviewData) => {
    const response = await api.post(`/dealers/${id}/reviews`, reviewData);
    return response.data;
  }
};

// Favorites API
export const favoritesAPI = {
  getFavorites: async () => {
    const response = await api.get('/favorites/');
    return response.data;
  },

  addToFavorites: async (vehicleId) => {
    const response = await api.post(`/favorites/${vehicleId}`);
    return response.data;
  },

  removeFromFavorites: async (vehicleId) => {
    const response = await api.delete(`/favorites/${vehicleId}`);
    return response.data;
  },

  checkFavoriteStatus: async (vehicleId) => {
    const response = await api.get(`/favorites/check/${vehicleId}`);
    return response.data;
  }
};

// Messages API
export const messagesAPI = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messages/', messageData);
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/messages/unread/count');
    return response.data;
  }
};

export default api;