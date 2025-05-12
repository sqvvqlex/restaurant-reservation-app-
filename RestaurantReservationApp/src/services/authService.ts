import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../types/auth';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const data = {
        username: name,
        email,
        password,
      };
      console.log('Starting registration request with:', data);
      const response = await api.post<AuthResponse>('/auth/register', data);
      console.log('Registration response:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('Registration error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.code === 'ECONNABORTED') {
        throw new Error('Registration request timed out. Please try again.');
      }
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Starting login request for:', email);
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.token && response.data.user) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      console.log('Login successful');
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Login request timed out. Please try again.');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error('Login failed. Please check your connection and try again.');
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async getStoredUser(): Promise<any | null> {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}; 