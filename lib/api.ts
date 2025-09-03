const BASE_URL = 'https://api2.sersim.com.tr/api';

let authToken: string | null = null;

export function setAuthToken(token?: string) {
  authToken = token || null;
}

export async function apiRequest(endpoint: string, method: string, body?: any): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Bir hata oluştu');
    }
    
    return data;
  } catch (error) {
    console.error('API isteği sırasında hata:', error);
    throw error;
  }
}

// Convenience methods
export const api = {
  get: (endpoint: string) => apiRequest(endpoint, 'GET'),
  post: (endpoint: string, body?: any) => apiRequest(endpoint, 'POST', body),
  put: (endpoint: string, body?: any) => apiRequest(endpoint, 'PUT', body),
  delete: (endpoint: string) => apiRequest(endpoint, 'DELETE'),
};


