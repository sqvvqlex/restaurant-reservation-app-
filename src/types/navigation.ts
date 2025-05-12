export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  RestaurantDetails: { restaurant: any };
};

export type Restaurant = {
  id: number;
  name: string;
  description: string;
  location: string;
  cuisine_type: string;
  opening_hours: string;
  closing_hours: string;
  max_capacity: number;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: number;
  user_id: number;
  restaurant_id: number;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}; 