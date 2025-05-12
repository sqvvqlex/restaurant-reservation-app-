export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  location: string;
  cuisine_type: string;
  opening_hours: string;
  closing_hours: string;
  max_capacity: number;
  rating?: number;
  image_url?: string;
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
  created_at: string;
  restaurant?: Restaurant;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
} 