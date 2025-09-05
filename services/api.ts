import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "./auth";
import { ApiError } from "./types";

const API_BASE_URL = "https://api2.sersim.com.tr/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fastApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const setAuthToken = (token: string | null) => {
  [api, fastApi, uploadApi].forEach((instance) => {
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete instance.defaults.headers.common["Authorization"];
    }
  });
};

const isNetworkError = (error: any) => !error.response && !!error.message;
const isTimeoutError = (error: any) =>
  error.code === "ECONNABORTED" || error.message.includes("timeout");
const isServerError = (error: any) =>
  error.response && error.response.status >= 500;
const isClientError = (error: any) =>
  error.response && error.response.status >= 400 && error.response.status < 500;

const getUserFriendlyErrorMessage = (error: any): string => {
  if (isNetworkError(error)) return "Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.";
  if (isTimeoutError(error)) return "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.";
  if (isServerError(error)) return "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.";
  if (isClientError(error)) return "Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.";
  return "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.";
};

// ✅ Ortak interceptor handler
const handleError = (error: any): Promise<ApiError> => {
  const apiError: ApiError = {
    ...error,
    userMessage: getUserFriendlyErrorMessage(error),
  };
  return Promise.reject(apiError);
};

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((res) => res, handleError);
fastApi.interceptors.response.use((res) => res, handleError);
uploadApi.interceptors.response.use((res) => res, handleError);


