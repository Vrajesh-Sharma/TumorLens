import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import type { UserRole } from '../types';
import { addAuthFailureListener } from '../services/authEvents';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  userRole: UserRole | null;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<boolean>;
  loginBiometric: () => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  isBiometricSupported: boolean;
  isBiometricEnrolled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateLocalId(): string {
  return 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function createLocalUser(email: string, name?: string) {
  const isRadiologist = email.toLowerCase().includes('radiologist');
  return {
    token: 'local_' + Date.now().toString(36),
    refreshToken: 'local_refresh_' + Date.now().toString(36),
    user: {
      id: generateLocalId(),
      name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      email,
      role: (isRadiologist ? 'radiologist' : 'doctor') as UserRole,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);

  useEffect(() => {
    async function initializeAuth() {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(hasHardware);
        setIsBiometricEnrolled(isEnrolled);

        const savedToken = await SecureStore.getItemAsync('JWT_TOKEN');
        const savedUserStr = await SecureStore.getItemAsync('USER_PROFILE');

        if (savedToken && savedUserStr) {
          setUser(JSON.parse(savedUserStr));
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('[AuthProvider] Initialization failure:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    const unsub = addAuthFailureListener(() => {
      setUser(null);
      setIsAuthenticated(false);
    });
    return unsub;
  }, []);

  const persistSession = async (data: ReturnType<typeof createLocalUser>) => {
    const userWithRole = data.user as UserProfile;
    setUser(userWithRole);
    setIsAuthenticated(true);

    await SecureStore.setItemAsync('JWT_TOKEN', data.token);
    await SecureStore.setItemAsync('REFRESH_TOKEN', data.refreshToken);
    await SecureStore.setItemAsync('USER_PROFILE', JSON.stringify(userWithRole));
  };

  const login = async (email: string, pass: string, rememberMe = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = createLocalUser(email);
      await persistSession(data);

      if (rememberMe) {
        await SecureStore.setItemAsync('REMEMBERED_EMAIL', email);
      } else {
        await SecureStore.deleteItemAsync('REMEMBERED_EMAIL');
      }

      return true;
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Invalid medical credentials or password.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = createLocalUser(formData.email, formData.name);
      await persistSession(data);
      return true;
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Server error creating clinician account.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginBiometric = async (): Promise<boolean> => {
    if (!isBiometricSupported || !isBiometricEnrolled) {
      Alert.alert('Unavailable', 'Biometric profile features are not configured on this hardware.');
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authorize Clinician Session',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const savedToken = await SecureStore.getItemAsync('JWT_TOKEN');
        const savedUserStr = await SecureStore.getItemAsync('USER_PROFILE');

        if (savedToken && savedUserStr) {
          setUser(JSON.parse(savedUserStr));
          setIsAuthenticated(true);
          return true;
        } else {
          Alert.alert('Session Expired', 'Please enter your password to authorize biometrics.');
          return false;
        }
      }
      return false;
    } catch (err: any) {
      console.error('[Biometrics] Error:', err);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('JWT_TOKEN');
      await SecureStore.deleteItemAsync('REFRESH_TOKEN');
      await SecureStore.deleteItemAsync('USER_PROFILE');

      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.warn('[AuthProvider] Logout failure:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (profileUpdate: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...profileUpdate };
      setUser(updated);
      SecureStore.setItemAsync('USER_PROFILE', JSON.stringify(updated));
    }
  };

  const userRole = user?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        userRole,
        login,
        loginBiometric,
        register,
        logout,
        updateProfile,
        isBiometricSupported,
        isBiometricEnrolled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
