import * as SecureStore from "expo-secure-store";
import { api, setAuthToken } from "./api";
import { LoginResponse } from "./types";

const TOKEN_KEY = "userToken";

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const logout = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  setAuthToken(null);
};

export const login = async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/Users/login", credentials);
  if (data?.token) {
    await saveToken(data.token);
    setAuthToken(data.token);
  }
  return data;
};

export const initAuthFromStorage = async () => {
  const token = await getToken();
  setAuthToken(token);
};


