import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://api2.sersim.com.tr/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;