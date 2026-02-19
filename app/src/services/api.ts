import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { isDemoMode, demoUser, demoFriends, demoBookings, demoStats } from '../config/demoConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Demo mode flag
const DEMO_MODE = isDemoMode();

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API delay for demo mode
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      if (email === 'demo@snapcofriend.com' && password === 'demo123') {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        return { data: { success: true, token: 'demo-token', user: demoUser } };
      }
      throw new Error('Invalid credentials');
    }
    return api.post('/auth/login', { email, password });
  },

  register: async (data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      const newUser = { ...demoUser, ...data, _id: 'new-user-' + Date.now() };
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(newUser));
      return { data: { success: true, token: 'demo-token', user: newUser } };
    }
    return api.post('/auth/register', data);
  },

  logout: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { data: { success: true } };
    }
    return api.post('/auth/logout');
  },

  getMe: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: demoUser } };
    }
    return api.get('/auth/me');
  },

  forgotPassword: async (email: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, message: 'Password reset email sent (Demo Mode)' } };
    }
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, message: 'Password reset successful (Demo Mode)' } };
    }
    return api.post(`/auth/reset-password/${token}`, { password });
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, message: 'Password updated (Demo Mode)' } };
    }
    return api.put('/auth/update-password', { currentPassword, newPassword });
  },

  refreshToken: async (refreshToken: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, token: 'demo-token' } };
    }
    return api.post('/auth/refresh-token', { refreshToken });
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: demoUser } };
    }
    return api.get('/users/profile');
  },

  updateProfile: async (data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { ...demoUser, ...data } } };
    }
    return api.put('/users/profile', data);
  },

  uploadAvatar: async (avatarUrl: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { ...demoUser, avatar: avatarUrl } } };
    }
    return api.post('/users/avatar', { avatarUrl });
  },

  updateEmergencyContact: async (data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data } };
    }
    return api.put('/users/emergency-contact', data);
  },

  deleteAccount: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { data: { success: true } };
    }
    return api.delete('/users/account');
  }
};

// Friend API
export const friendAPI = {
  getFriends: async (params?: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      let filtered = [...demoFriends];
      if (params?.city) {
        filtered = filtered.filter(f => f.location.city.toLowerCase() === params.city.toLowerCase());
      }
      if (params?.occasion) {
        filtered = filtered.filter(f => f.occasions.includes(params.occasion));
      }
      return { data: { success: true, data: filtered, pagination: { total: filtered.length, page: 1, pages: 1 } } };
    }
    return api.get('/friends', { params });
  },

  getFriendById: async (id: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      const friend = demoFriends.find(f => f._id === id);
      if (!friend) throw new Error('Friend not found');
      return { data: { success: true, data: friend } };
    }
    return api.get(`/friends/${id}`);
  },

  getMyProfile: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: null } };
    }
    return api.get('/friends/me/profile');
  },

  createProfile: async (data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data } };
    }
    return api.post('/friends/profile', data);
  },

  updateProfile: async (data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data } };
    }
    return api.put('/friends/profile', data);
  },

  addPackage: async (data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { _id: 'pkg-' + Date.now(), ...data } } };
    }
    return api.post('/friends/packages', data);
  },

  updatePackage: async (packageId: string, data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data } };
    }
    return api.put(`/friends/packages/${packageId}`, data);
  },

  deletePackage: async (packageId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.delete(`/friends/packages/${packageId}`);
  },

  updateAvailability: async (availability: any[]) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: availability } };
    }
    return api.put('/friends/availability', { availability });
  },

  getStats: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { totalBookings: 0, totalEarnings: 0, rating: 0 } } };
    }
    return api.get('/friends/me/stats');
  }
};

// Booking API
export const bookingAPI = {
  getBookings: async (params?: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: demoBookings } };
    }
    return api.get('/bookings', { params });
  },

  getBookingById: async (id: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      const booking = demoBookings.find(b => b._id === id);
      if (!booking) throw new Error('Booking not found');
      return { data: { success: true, data: booking } };
    }
    return api.get(`/bookings/${id}`);
  },

  createBooking: async (data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      const newBooking = {
        _id: 'booking-' + Date.now(),
        ...data,
        status: 'pending',
        payment: { status: 'pending' },
        createdAt: new Date().toISOString()
      };
      return { data: { success: true, data: newBooking } };
    }
    return api.post('/bookings', data);
  },

  updateStatus: async (id: string, status: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { _id: id, status } } };
    }
    return api.put(`/bookings/${id}/status`, { status });
  },

  cancelBooking: async (id: string, reason: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { _id: id, status: 'cancelled', cancelReason: reason } } };
    }
    return api.put(`/bookings/${id}/cancel`, { reason });
  },

  addCheckIn: async (id: string, data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data } };
    }
    return api.post(`/bookings/${id}/checkin`, data);
  },

  getMessages: async (id: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: [] } };
    }
    return api.get(`/bookings/${id}/messages`);
  },

  sendMessage: async (id: string, content: string, type?: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { _id: 'msg-' + Date.now(), content, type, createdAt: new Date().toISOString() } } };
    }
    return api.post(`/bookings/${id}/messages`, { content, type });
  },

  addReview: async (id: string, data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data } };
    }
    return api.post(`/bookings/${id}/review`, data);
  },

  disputeBooking: async (id: string, data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data } };
    }
    return api.post(`/bookings/${id}/dispute`, data);
  }
};

// Match API
export const matchAPI = {
  findMatches: async (data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      // Return friends that match the occasion
      const matches = demoFriends
        .filter(f => f.occasions.includes(data.occasion))
        .map(f => ({
          friend: f,
          matchScore: Math.floor(Math.random() * 30) + 70,
          recommendedPackage: f.packages[0],
          estimatedTotal: f.packages[0].hourlyRate * (data.duration?.hours || 3)
        }));
      return { data: { success: true, data: matches } };
    }
    return api.post('/matches/find', data);
  },

  getMatchDetails: async (friendId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      const friend = demoFriends.find(f => f._id === friendId);
      if (!friend) throw new Error('Friend not found');
      return { data: { success: true, data: friend } };
    }
    return api.get(`/matches/${friendId}`);
  },

  getRecommendations: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: demoFriends.slice(0, 3) } };
    }
    return api.get('/matches/recommendations');
  }
};

// Message API
export const messageAPI = {
  getConversations: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: [] } };
    }
    return api.get('/messages/conversations');
  },

  getUnreadCount: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { count: 0 } } };
    }
    return api.get('/messages/unread');
  },

  markAsRead: async (bookingId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.put(`/messages/read/${bookingId}`);
  }
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: async (bookingId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return {
        data: {
          success: true,
          orderId: 'order_' + Date.now(),
          amount: 400000, // in paise
          currency: 'INR',
          keyId: 'rzp_test_demo_key'
        }
      };
    }
    return api.post('/payments/create-intent', { bookingId });
  },

  confirmPayment: async (bookingId: string, paymentIntentId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { _id: bookingId, status: 'confirmed' } } };
    }
    return api.post('/payments/confirm', { bookingId, paymentIntentId });
  },

  getPaymentMethods: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: [] } };
    }
    return api.get('/payments/methods');
  },

  addPaymentMethod: async (paymentMethodId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.post('/payments/methods', { paymentMethodId });
  },

  removePaymentMethod: async (methodId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.delete(`/payments/methods/${methodId}`);
  },

  getEarnings: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return {
        data: {
          success: true,
          data: {
            totalEarnings: 0,
            pendingEarnings: 0,
            totalBookings: 0,
            recentEarnings: []
          }
        }
      };
    }
    return api.get('/payments/earnings');
  },

  requestPayout: async (amount: number) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, message: 'Payout request submitted (Demo Mode)' } };
    }
    return api.post('/payments/payout', { amount });
  }
};

// Safety API
export const safetyAPI = {
  triggerSOS: async (bookingId: string, location?: any, notes?: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, message: 'SOS triggered (Demo Mode)' } };
    }
    return api.post('/safety/sos', { bookingId, location, notes });
  },

  getSafetyStatus: async (bookingId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { status: 'safe' } } };
    }
    return api.get(`/safety/status/${bookingId}`);
  },

  shareLocation: async (bookingId: string, lat: number, lng: number) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.post('/safety/location', { bookingId, lat, lng });
  },

  getCheckInStatus: async (bookingId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: { checkedIn: false } } };
    }
    return api.get(`/safety/checkin/${bookingId}`);
  },

  verifySafetyCode: async (bookingId: string, code: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, valid: code === '1234' } };
    }
    return api.post('/safety/verify-code', { bookingId, code });
  }
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return {
        data: {
          success: true,
          data: {
            totalUsers: 150,
            totalFriends: 45,
            totalBookings: 230,
            totalRevenue: 1250000,
            pendingVerifications: 12
          }
        }
      };
    }
    return api.get('/admin/dashboard');
  },

  getUsers: async (params?: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: [demoUser], pagination: { total: 1, page: 1, pages: 1 } } };
    }
    return api.get('/admin/users', { params });
  },

  getBookings: async (params?: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: demoBookings, pagination: { total: demoBookings.length, page: 1, pages: 1 } } };
    }
    return api.get('/admin/bookings', { params });
  },

  verifyUser: async (userId: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.put(`/admin/users/${userId}/verify`);
  },

  getDisputes: async (status?: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: [] } };
    }
    return api.get('/admin/disputes', { params: { status } });
  },

  resolveDispute: async (disputeId: string, data: any) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.put(`/admin/disputes/${disputeId}/resolve`, data);
  },

  getPendingVerifications: async () => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: [] } };
    }
    return api.get('/admin/verifications');
  },

  approveVerification: async (id: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.put(`/admin/verifications/${id}/approve`);
  },

  rejectVerification: async (id: string, reason: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true } };
    }
    return api.put(`/admin/verifications/${id}/reject`, { reason });
  },

  getReports: async (type: string, startDate: string, endDate: string) => {
    if (DEMO_MODE) {
      await mockDelay();
      return { data: { success: true, data: [] } };
    }
    return api.get('/admin/reports', { params: { type, startDate, endDate } });
  }
};

export default api;
