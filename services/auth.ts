import { api, setAuthToken } from '../services/api';
import { saveAccessToken, clearAccessToken, getAccessToken, saveUserRole, clearUserRole, saveUserName, saveUserLine } from '~/services/storage';

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: string;
  role?: string;
  user?: any;
};

type UserInfo = {
  username: string;
  line: string;
  role: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/Users/login', payload);

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

// User bilgilerini API'den çek
export async function fetchUserInfo(): Promise<UserInfo> {
  try {
    const { data } = await api.get<UserInfo>('/Users/me');
    return data;
  } catch (error: any) {
    console.error('User info fetch failed:', error);
    throw new Error(error.message || 'Kullanıcı bilgileri alınamadı');
  }
}

// Login sonrası kullanıcı bilgilerini güncelle
export async function updateUserInfoAfterLogin(username: string): Promise<void> {
  try {
    // Önce username'i kaydet
    await saveUserName(username);
    
    // API'den user bilgilerini çek
    const userInfo = await fetchUserInfo();
    await saveUserLine(userInfo.line);
    
    // Role bilgisini güncelle (eğer API'den geliyorsa)
    if (userInfo.role) {
      await saveUserRole(userInfo.role);
    }
  } catch (error: any) {
    console.warn('User bilgileri güncellenemedi:', error);
    // Fallback: sadece username'i kaydet
    await saveUserName(username);
    await saveUserLine('');
  }
}


