import { api, setAuthToken } from './api';
import { saveAccessToken, clearAccessToken, getAccessToken, saveUserRole, clearUserRole } from './storage';

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: string;
  role?: string;
  user?: any;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await api.post('Users/login', payload);

  if (data?.token) {
    await saveAccessToken(data.token);
    setAuthToken(data.token);
  }
  if (data?.role) {
    await saveUserRole(data.role);
  }
  return data;
}

export async function logout() {
  await clearAccessToken();
  await clearUserRole();
  setAuthToken(undefined);
}

export async function initAuthFromStorage() {
  const token = await getAccessToken();
  setAuthToken(token ?? undefined);
  return token;
}


