import { Platform } from 'react-native';

const KEYS = {
  JWT_TOKEN: 'JWT_TOKEN',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  USER_PROFILE: 'USER_PROFILE',
  THEME_MODE: 'THEME_MODE',
} as const;

async function get(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const { getItemAsync } = require('expo-secure-store');
    return await getItemAsync(key);
  } catch {
    return null;
  }
}

async function set(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const { setItemAsync } = require('expo-secure-store');
    await setItemAsync(key, value);
  } catch (err) {
    console.error('[SecureStore] Set failed:', key, err);
  }
}

async function remove(key: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const { deleteItemAsync } = require('expo-secure-store');
    await deleteItemAsync(key);
  } catch (err) {
    console.error('[SecureStore] Delete failed:', key, err);
  }
}

export const secureStoreService = {
  KEYS,
  get,
  set,
  remove,
  async getToken(): Promise<string | null> {
    return get(KEYS.JWT_TOKEN);
  },
  async setToken(token: string): Promise<void> {
    await set(KEYS.JWT_TOKEN, token);
  },
  async removeToken(): Promise<void> {
    await remove(KEYS.JWT_TOKEN);
  },
  async clearAll(): Promise<void> {
    await Promise.all(Object.values(KEYS).map((key) => remove(key)));
  },
};

export default secureStoreService;
