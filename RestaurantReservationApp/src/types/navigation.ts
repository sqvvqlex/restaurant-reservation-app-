import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Reservation } from './index';

export type Restaurant = {
  id: number;
  name: string;
  location: string;
  description: string;
  cuisine_type: string;
  opening_hours: string;
  closing_hours: string;
  max_capacity: number;
  created_at?: string;
  updated_at?: string;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: {
    timestamp?: number;
  };
  RestaurantDetails: {
    restaurant: Restaurant;
  };
  ReservationForm: {
    restaurant: Restaurant;
    reservation?: Reservation;
  };
  ReservationList: undefined;
  Profile: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type MainTabParamList = {
  Home: undefined;
  Reservations: undefined;
  Profile: undefined;
}; 