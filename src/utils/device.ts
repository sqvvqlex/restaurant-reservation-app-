import * as Device from 'expo-device';

export const getDeviceModel = async () => {
  return Device.modelName;
};

export const isIOS = () => {
  return Device.osName === 'iOS';
};

export const isAndroid = () => {
  return Device.osName === 'Android';
}; 