import api from './api';
import * as SecureStore from 'expo-secure-store';

const login = async (credentials: { username: string; password: string }) => {
  const response = await api.post('/Users/login', credentials);
  const { token, role, username } = response.data;

  await SecureStore.setItemAsync('token', token);
  await SecureStore.setItemAsync('role', role);
  await SecureStore.setItemAsync('username', username);
  
  return response.data;
};

const logout = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('role');
  await SecureStore.deleteItemAsync('username');
};

const getToken = () => {
  return SecureStore.getItemAsync('token');
};

const getRole = () => {
  return SecureStore.getItemAsync('role');
};

const getUsername = () => {
  return SecureStore.getItemAsync('username');
};

const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

const isSuperAdmin = async () => {
    const role = await getRole();
    return role === 'SuperAdmin';
};


export const AuthService = {
  login,
  logout,
  getToken,
  getRole,
  getUsername,
  isAuthenticated,
  isSuperAdmin,
};