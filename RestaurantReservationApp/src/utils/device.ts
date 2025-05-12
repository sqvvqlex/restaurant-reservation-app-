import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const getDeviceModel = () => {
  return Device.modelName || 'Unknown Device';
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const getAPIBaseURL = () => 'http://192.168.1.12:5001/api';

export const getAPIBaseURLDev = () => {
  if (__DEV__) {
    return isAndroid 
      ? 'http://10.0.2.2:3008/api'
      : 'http://localhost:3008/api';
  }
  return 'http://your-production-api-url/api'; // Replace with your production API URL
}; 