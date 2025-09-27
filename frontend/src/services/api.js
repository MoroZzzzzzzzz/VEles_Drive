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

// Search API
export const searchAPI = {
  searchVehicles: async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      }
    });
    const response = await api.get(`/vehicles/search?${params.toString()}`);
    return response.data;
  },

  getSuggestions: async (query) => {
    const response = await api.get(`/vehicles/suggestions?q=${query}`);
    return response.data;
  },

  getPopularSearches: async () => {
    const response = await api.get('/vehicles/popular-searches');
    return response.data;
  }
};

// Leads API
export const leadsAPI = {
  getDealerLeads: async (dealerId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/dealers/${dealerId}/leads?${params.toString()}`);
    return response.data;
  },

  getDealerStats: async (dealerId) => {
    const response = await api.get(`/dealers/${dealerId}/leads/stats`);
    return response.data;
  },

  updateLeadStatus: async (leadId, data) => {
    const response = await api.put(`/leads/${leadId}/status`, data);
    return response.data;
  },

  createLead: async (data) => {
    const response = await api.post('/leads/', data);
    return response.data;
  }
};

// Analytics API
export const analyticsAPI = {
  getDealerAnalytics: async (dealerId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/dealers/${dealerId}/analytics?${queryParams.toString()}`);
    return response.data;
  },

  getVehicleAnalytics: async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}/analytics`);
    return response.data;
  }
};

// Loan Calculator API
export const loanAPI = {
  calculateLoan: async (data) => {
    const response = await api.post('/loans/calculate', data);
    return response.data;
  },

  getBankOffers: async (amount, term) => {
    const response = await api.get(`/loans/offers?amount=${amount}&term=${term}`);
    return response.data;
  },

  submitLoanApplication: async (data) => {
    const response = await api.post('/loans/apply', data);
    return response.data;
  }
};

// Trade-in API
export const tradeInAPI = {
  evaluateVehicle: async (data) => {
    const response = await api.post('/trade-in/evaluate', data);
    return response.data;
  },

  uploadImages: async (vehicleId, images) => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image.file);
    });
    
    const response = await api.post(`/trade-in/${vehicleId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getMarketComparison: async (make, model, year) => {
    const response = await api.get(`/trade-in/market-comparison?make=${make}&model=${model}&year=${year}`);
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

// Reviews API
export const reviewsAPI = {
  createReview: async (reviewData) => {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
  },

  getDealerReviews: async (dealerId) => {
    const response = await api.get(`/reviews/dealer/${dealerId}`);
    return response.data;
  },

  getDealerStats: async (dealerId) => {
    const response = await api.get(`/reviews/dealer/${dealerId}/stats`);
    return response.data;
  },

  getUserReviews: async () => {
    const response = await api.get('/reviews/user');
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

// Compare API
export const compareAPI = {
  createComparison: async (vehicleIds) => {
    const response = await api.post('/compare/', vehicleIds);
    return response.data;
  },

  getComparison: async () => {
    const response = await api.get('/compare/');
    return response.data;
  },

  updateComparison: async (vehicleIds) => {
    const response = await api.put('/compare/', vehicleIds);
    return response.data;
  },

  removeFromComparison: async (vehicleId) => {
    const response = await api.delete(`/compare/${vehicleId}`);
    return response.data;
  },

  clearComparison: async () => {
    const response = await api.delete('/compare/');
    return response.data;
  },

  getFeatures: async () => {
    const response = await api.get('/compare/features');
    return response.data;
  }
};

// Payments API
export const paymentsAPI = {
  createVehiclePayment: async (paymentData) => {
    const response = await api.post('/payments/vehicle/checkout', paymentData);
    return response.data;
  },

  createBookingPayment: async (bookingData) => {
    const response = await api.post('/payments/booking/checkout', bookingData);
    return response.data;
  },

  createPackagePayment: async (packageId, successUrl, cancelUrl, metadata = {}) => {
    const response = await api.post('/payments/packages/checkout', {
      package_id: packageId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });
    return response.data;
  },

  getPaymentStatus: async (sessionId) => {
    const response = await api.get(`/payments/status/${sessionId}`);
    return response.data;
  },

  getUserTransactions: async () => {
    const response = await api.get('/payments/transactions');
    return response.data;
  },

  getPaymentPackages: async () => {
    const response = await api.get('/payments/packages');
    return response.data;
  }
};

// Leads API
export const leadsAPI = {
  requestTestDrive: async (requestData) => {
    const response = await api.post('/leads/test-drive', requestData);
    return response.data;
  },

  requestPriceInquiry: async (requestData) => {
    const response = await api.post('/leads/price-inquiry', requestData);
    return response.data;
  },

  requestCallback: async (requestData) => {
    const response = await api.post('/leads/callback', requestData);
    return response.data;
  },

  getDealerLeads: async (dealerId, status = null) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/leads/dealer/${dealerId}${params}`);
    return response.data;
  },

  getUserLeads: async () => {
    const response = await api.get('/leads/user');
    return response.data;
  },

  updateLeadStatus: async (leadId, status) => {
    const response = await api.put(`/leads/${leadId}/status`, { status });
    return response.data;
  },

  getDealerLeadStats: async (dealerId) => {
    const response = await api.get(`/leads/stats/${dealerId}`);
    return response.data;
  }
};

// Advanced Search API
export const advancedSearchAPI = {
  smartSearch: async (searchQuery) => {
    const response = await api.post('/search/smart', searchQuery);
    return response.data;
  },

  getSuggestions: async (query, limit = 10) => {
    const response = await api.get(`/search/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  saveSearch: async (savedSearch) => {
    const response = await api.post('/search/save', savedSearch);
    return response.data;
  },

  getSavedSearches: async () => {
    const response = await api.get('/search/saved');
    return response.data;
  },

  getSearchHistory: async (limit = 20) => {
    const response = await api.get(`/search/history?limit=${limit}`);
    return response.data;
  },

  getTrending: async () => {
    const response = await api.get('/search/trending');
    return response.data;
  }
};

// Verification API
export const verificationAPI = {
  checkVIN: async (vin) => {
    const response = await api.post('/verification/vin-check', { vin });
    return response.data;
  },

  requestVerification: async (requestData) => {
    const response = await api.post('/verification/request', requestData);
    return response.data;
  },

  getVehicleVerification: async (vehicleId) => {
    const response = await api.get(`/verification/vehicle/${vehicleId}`);
    return response.data;
  },

  getVerificationPricing: async () => {
    const response = await api.get('/verification/pricing');
    return response.data;
  },

  getVerificationHistory: async () => {
    const response = await api.get('/verification/history');
    return response.data;
  }
};

export default api;