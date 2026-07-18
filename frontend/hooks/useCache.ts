import { useState, useEffect, useCallback } from 'react';
import { Directory, Paths } from 'expo-file-system';
import { storageService } from '../services/storageService';
import { reportService } from '../services/reportService';
import { Alert } from 'react-native';

export function useCache() {
  const [cacheSize, setCacheSize] = useState(0);
  const [imagesSize, setImagesSize] = useState(0);

  const calculateSizes = useCallback(async () => {
    try {
      const imgDir = new Directory(Paths.document, 'app_data', 'images');
      const imgInfo = await imgDir.info();
      setImagesSize(imgInfo.size || 0);

      const dataDir = new Directory(storageService.dataDir);
      const dataInfo = await dataDir.info();
      setCacheSize(dataInfo.size || 0);
    } catch {
      setCacheSize(0);
      setImagesSize(0);
    }
  }, []);

  useEffect(() => {
    calculateSizes();
  }, [calculateSizes]);

  const handleClearCache = async () => {
    try {
      const imgDir = new Directory(Paths.document, 'app_data', 'images');
      await imgDir.delete();
      await imgDir.create({ intermediates: true });
      await calculateSizes();
    } catch {
      // silent
    }
  };

  const handleDeleteLocalReports = async () => {
    Alert.alert(
      'Purge Diagnostic Database',
      'This will delete ALL local patient scans, U-Net masks, and diagnostic reports permanently. Cloud synced records will remain unaffected. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Database',
          style: 'destructive',
          onPress: async () => {
            await reportService.clearAll();
            await storageService.clearCollection('patients/patients');
            await storageService.clearCollection('meta/sync_queue');
            await handleClearCache();
            await calculateSizes();
            Alert.alert('Database Purged', 'Local report records and files have been successfully deleted.');
          },
        },
      ]
    );
  };

  return {
    cacheSize,
    imagesSize,
    pdfSize: 0,
    refreshSizes: calculateSizes,
    clearCache: handleClearCache,
    deleteLocalReports: handleDeleteLocalReports,
  };
}

export default useCache;
