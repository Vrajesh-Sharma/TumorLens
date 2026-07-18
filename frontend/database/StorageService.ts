import { Platform } from 'react-native';

let FileSystem: any = null;
if (Platform.OS !== 'web') {
  try {
    FileSystem = require('expo-file-system/legacy');
  } catch {}
}

const BASE_DIR = FileSystem ? FileSystem.documentDirectory : '';
export const IMAGES_DIR = `${BASE_DIR}images/`;
export const REPORTS_DIR = `${BASE_DIR}reports/`;
export const PDF_DIR = `${BASE_DIR}pdf/`;
export const CACHE_DIR = `${BASE_DIR}cache/`;

const MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024;

export const StorageService = {
  async initStorage(): Promise<void> {
    if (!FileSystem) return;
    try {
      const dirs = [IMAGES_DIR, REPORTS_DIR, PDF_DIR, CACHE_DIR];
      for (const dir of dirs) {
        const info = await FileSystem.getInfoAsync(dir);
        if (!info.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
      }
    } catch (err) {
      console.error('[StorageService] Init failure:', err);
    }
  },

  async saveToPermanentStorage(sourceUri: string, destinationDir: string): Promise<string> {
    if (!FileSystem) throw new Error('Not supported on web');
    const timestamp = Date.now();
    const extension = sourceUri.split('.').pop() || 'jpg';
    const destUri = `${destinationDir}${timestamp}.${extension}`;
    await FileSystem.copyAsync({ from: sourceUri, to: destUri });
    return destUri;
  },

  async deleteFile(uri: string): Promise<void> {
    if (!FileSystem) return;
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (err) {
      console.error('[StorageService] Delete failed:', uri, err);
    }
  },

  async getDirectorySize(dir: string): Promise<number> {
    if (!FileSystem) return 0;
    try {
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) return 0;
      const contents = await FileSystem.readDirectoryAsync(dir);
      let totalSize = 0;
      for (const file of contents) {
        const fileInfo = await FileSystem.getInfoAsync(`${dir}${file}`);
        if (fileInfo.exists && fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }
      return totalSize;
    } catch {
      return 0;
    }
  },

  async clearCache(): Promise<void> {
    if (!FileSystem) return;
    try {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    } catch (err) {
      console.error('[StorageService] Clear cache failed:', err);
    }
  },

  async enforceCacheLimit(): Promise<void> {
    if (!FileSystem) return;
    try {
      const cacheSize = await this.getDirectorySize(CACHE_DIR);
      if (cacheSize > MAX_CACHE_SIZE_BYTES) {
        await this.clearCache();
      }
    } catch {
      // Silent
    }
  },
};

export default StorageService;
