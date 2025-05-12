import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Restaurant, Reservation, AuthResponse } from '../types';
import { isAndroid } from '../utils/device';

// Use localhost for iOS, 10.0.2.2 for Android
const baseURL = isAndroid() 
  ? 'http://10.0.2.2:3008/api'
  : 'http://localhost:3008/api';

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true // Important for CORS with credentials
});

// Add token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Request to:', config.url);
      console.log('Token present:', !!token);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Is the backend server running?', {
        baseURL: baseURL,
        error: error.message,
        details: 'Make sure the backend server is running on port 3008'
      });
    } else {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
        error: error.message
      });
    }
    return Promise.reject(error);
  }
);

// Test the API connection
api.get('/health-check').catch(error => {
  console.warn('API health check failed:', error.message);
});

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('Attempting login for:', email);
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    console.log('Login successful');
    return response.data;
  },

  async register(data: { username: string; email: string; password: string }): Promise<AuthResponse> {
    console.log('Attempting registration for:', data.email);
    const response = await api.post<AuthResponse>('/auth/register', data);
    console.log('Registration successful');
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
  }
};

export const restaurantService = {
  async getAll(filters?: { location?: string; cuisine_type?: string }): Promise<Restaurant[]> {
    const response = await api.get<Restaurant[]>('/restaurants', { params: filters });
    return response.data;
  },

  async getById(id: number): Promise<Restaurant> {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  }
};

export const reservationService = {
  async create(data: {
    restaurant_id: number;
    reservation_date: string;
    reservation_time: string;
    party_size: number;
    special_requests?: string;
  }): Promise<Reservation> {
    const response = await api.post<Reservation>('/reservations', data);
    return response.data;
  },

  async getUserReservations(): Promise<Reservation[]> {
    const response = await api.get<Reservation[]>('/reservations/user');
    return response.data;
  },

  async getAll(): Promise<Reservation[]> {
    const response = await api.get<Reservation[]>('/reservations');
    return response.data;
  },

  async update(id: number, data: Partial<Reservation>): Promise<Reservation> {
    const response = await api.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  },

  async cancel(id: number): Promise<void> {
    await api.delete(`/reservations/${id}`);
  }
};

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  }
};

export default api; 