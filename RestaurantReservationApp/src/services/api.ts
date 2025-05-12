import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAPIBaseURL } from '../utils/device';
import type { 
  User, 
  Restaurant, 
  Reservation, 
  LoginResponse, 
  RegisterResponse,
  APIError 
} from '../types';

const api = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError: APIError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
    };

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      apiError.message = 'Authentication required';
      apiError.code = 'AUTH_REQUIRED';
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'Request timed out. Please try again.';
      apiError.code = 'TIMEOUT';
    } else if (error.code === 'ERR_NETWORK') {
      apiError.message = 'Network error. Please check your connection.';
      apiError.code = 'NETWORK_ERROR';
    } else if (error.response?.data?.message) {
      apiError.message = error.response.data.message;
    }

    return Promise.reject(apiError);
  }
);

// Auth Service
export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(data: { username: string; email: string; password: string }): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    if (response.data.data?.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },
};

// Restaurant Service
export const restaurantService = {
  async getAll(params?: { search?: string; location?: string }): Promise<Restaurant[]> {
    try {
      console.log('API call: getAll with params:', params);
      const response = await api.get<Restaurant[]>('/restaurants', { 
        params,
        timeout: 15000 // Increased timeout for search
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response data:', {
        length: response.data.length,
        sample: response.data.slice(0, 2) // Log first two items for debugging
      });

      // Ensure we're returning an array
      const restaurants = Array.isArray(response.data) ? response.data : [];
      
      // Filter out any invalid entries
      const validRestaurants = restaurants.filter(r => r && r.id && r.name);
      
      console.log('Returning filtered restaurants:', validRestaurants.length);
      return validRestaurants;
    } catch (error: any) {
      console.error('Error in restaurantService.getAll:', error);
      // Ensure we always throw an APIError
      if (error.response?.status) {
        throw error; // Already handled by interceptor
      }
      throw {
        message: 'Failed to fetch restaurants',
        status: 500,
        code: 'FETCH_ERROR'
      } as APIError;
    }
  },

  async getById(id: number): Promise<Restaurant> {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  }
};

// Reservation Service
export const reservationService = {
  async create(data: {
    restaurant_id: number;
    date: string;
    time: string;
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

  async cancel(id: number): Promise<void> {
    await api.delete(`/reservations/${id}`);
  },

  async update(id: number, data: {
    restaurant_id: number;
    date: string;
    time: string;
    party_size: number;
    special_requests?: string;
  }): Promise<Reservation> {
    const response = await api.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  }
};

export default api;