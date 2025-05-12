import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { MainTabs } from './src/navigation/MainTabs';
import { RestaurantDetailsScreen } from './src/screens/main/RestaurantDetailsScreen';
import { ReservationFormScreen } from './src/screens/main/ReservationFormScreen';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
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
            title: 'Restaurant Details',
          }}
        />
        <Stack.Screen 
          name="ReservationForm" 
          component={ReservationFormScreen}
          options={{
            headerShown: true,
            title: 'Make Reservation',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
