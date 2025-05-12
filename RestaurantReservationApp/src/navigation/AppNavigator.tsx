import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Main Screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { RestaurantDetailsScreen } from '../screens/main/RestaurantDetailsScreen';
import { ReservationFormScreen } from '../screens/main/ReservationFormScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { ReservationsScreen } from '../screens/main/ReservationsScreen';

// Types
import type { RootStackParamList, MainTabParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'restaurant' : 'restaurant-outline';
            break;
          case 'Reservations':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'help-circle';
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Restaurants' }}
    />
    <Tab.Screen 
      name="Reservations" 
      component={ReservationsScreen}
      options={{ title: 'My Reservations' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="RestaurantDetails" 
        component={RestaurantDetailsScreen}
        options={{ 
          headerShown: true,
          title: 'Restaurant Details'
        }}
      />
      <Stack.Screen 
        name="ReservationForm" 
        component={ReservationFormScreen}
        options={{ 
          headerShown: true,
          title: 'Make Reservation'
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
); 