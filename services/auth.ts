import { api, setAuthToken } from '../services/api';
import { saveAccessToken, clearAccessToken, getAccessToken, saveUserRole, clearUserRole } from '~/services/storage';

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
  // Use absolute path to avoid baseURL double slash edge-cases
  const { data } = await api.post<LoginResponse>('/Users/login', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

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


