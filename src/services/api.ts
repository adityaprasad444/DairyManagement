import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User services
export const userService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};

// Subscription services
export const subscriptionService = {
  getAll: async () => {
    const response = await api.get('/subscriptions');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },
  create: async (subscriptionData: any) => {
    const response = await api.post('/subscriptions', subscriptionData);
    return response.data;
  },
  update: async (id: string, subscriptionData: any) => {
    const response = await api.put(`/subscriptions/${id}`, subscriptionData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },
};

// Delivery services
export const deliveryService = {
  getAll: async () => {
    const response = await api.get('/deliveries');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },
  create: async (deliveryData: any) => {
    const response = await api.post('/deliveries', deliveryData);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/deliveries/${id}/status`, { status });
    return response.data;
  },
};

// Billing services
export const billingService = {
  getAll: async () => {
    const response = await api.get('/bills');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },
  create: async (billingData: any) => {
    const response = await api.post('/bills', billingData);
    return response.data;
  },
  updateStatus: async (id: string, status: string, paymentData?: any) => {
    const response = await api.patch(`/bills/${id}/status`, { status, ...paymentData });
    return response.data;
  },
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 