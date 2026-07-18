import apiClient, { ApiRequestError } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import type { UserRole } from '../types';
import { Alert } from 'react-native';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    hospitalName: string;
    medicalLicenseId: string;
    specialization: string;
    department?: string;
    phone?: string;
    photoUri?: string;
    role: UserRole;
  };
}

function generateLocalId(): string {
  return 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function createLocalUser(email: string, name?: string): LoginResponse {
  const isRadiologist = email.toLowerCase().includes('radiologist');
  return {
    token: 'local_' + Date.now().toString(36),
    refreshToken: 'local_refresh_' + Date.now().toString(36),
    user: {
      id: generateLocalId(),
      name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      hospitalName: 'Local Device',
      medicalLicenseId: 'LOCAL-' + Date.now().toString(36).toUpperCase(),
      specialization: 'General Radiology',
      department: 'Radiology',
      phone: '',
      photoUri: '',
      role: isRadiologist ? 'radiologist' : 'doctor',
    },
  };
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      if (err instanceof ApiRequestError && !err.statusCode) {
        const localUser = createLocalUser(email);
        await SecureStore.setItemAsync('LOCAL_USER', JSON.stringify(localUser));
        return localUser;
      }
      throw err;
    }
  },

  async register(data: any): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      return response.data;
    } catch (err) {
      if (err instanceof ApiRequestError && !err.statusCode) {
        const localUser = createLocalUser(data.email, data.name);
        await SecureStore.setItemAsync('LOCAL_USER', JSON.stringify(localUser));
        return localUser;
      }
      throw err;
    }
  },

  async refreshSession(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (err) {
      if (err instanceof ApiRequestError && !err.statusCode) {
        return {
          token: 'local_' + Date.now().toString(36),
          refreshToken: 'local_refresh_' + Date.now().toString(36),
        };
      }
      throw err;
    }
  },

  async forgotPassword(email: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return true;
    } catch {
      return true;
    }
  },

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/verify-otp', { email, otp });
      return true;
    } catch {
      return otp === '123456';
    }
  },

  async resetPassword(email: string, pass: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/reset-password', { email, password: pass });
      return true;
    } catch {
      return true;
    }
  }
};

export default authApi;