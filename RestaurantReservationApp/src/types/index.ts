export interface Restaurant {
  id: number;
  name: string;
  description: string;
  location: string;
  cuisine_type: string;
  opening_hours: string;
  closing_hours: string;
  max_capacity: number;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Reservation {
  id: number;
  user_id: number;
  restaurant_id: number;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  special_requests?: string;
  created_at?: string;
  updated_at?: string;
  restaurant?: Restaurant;
}

export interface APIError {
  message: string;
  status?: number;
  code?: string;
} 