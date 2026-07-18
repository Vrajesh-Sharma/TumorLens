import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config';

export const API_BASE_URL = config.api.baseUrl;

export class ApiRequestError extends Error {
  statusCode?: number;
  details?: string;

  constructor(message: string, statusCode?: number, details?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (reqConfig) => {
    try {
      const token = await SecureStore.getItemAsync('JWT_TOKEN');
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API Client] Token fetch failure:', err);
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (__DEV__) {
      console.warn('[API Client Error]', {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
      });
    }

    const status = error.response?.status;
    const data = error.response?.data as Record<string, string> | undefined;

    if (status === 401) {
      SecureStore.deleteItemAsync('JWT_TOKEN');
    }

    return Promise.reject(
      new ApiRequestError(
        data?.message || error.message || 'Network request failed',
        status,
        data?.details
      )
    );
  }
);

export function createApiService(basePath: string) {
  return {
    get: <T>(url = '', params?: Record<string, unknown>) =>
      apiClient.get<T>(`${basePath}${url}`, { params }),
    post: <T>(url = '', data?: unknown) =>
      apiClient.post<T>(`${basePath}${url}`, data),
    put: <T>(url = '', data?: unknown) =>
      apiClient.put<T>(`${basePath}${url}`, data),
    patch: <T>(url = '', data?: unknown) =>
      apiClient.patch<T>(`${basePath}${url}`, data),
    delete: <T>(url = '') =>
      apiClient.delete<T>(`${basePath}${url}`),
  };
}

export default apiClient;
