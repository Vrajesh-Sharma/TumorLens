import { useState, useEffect, useCallback } from 'react';
import { StorageService, CACHE_DIR, IMAGES_DIR, PDF_DIR } from '../database/StorageService';
import { ReportRepository } from '../repositories/ReportRepository';
import { Alert } from 'react-native';

export function useCache() {
  const [cacheSize, setCacheSize] = useState(0);
  const [imagesSize, setImagesSize] = useState(0);
  const [pdfSize, setPdfSize] = useState(0);

  const calculateSizes = useCallback(async () => {
    const cSize = await StorageService.getDirectorySize(CACHE_DIR);
    const iSize = await StorageService.getDirectorySize(IMAGES_DIR);
    const pSize = await StorageService.getDirectorySize(PDF_DIR);
    
    setCacheSize(cSize);
    setImagesSize(iSize);
    setPdfSize(pSize);
  }, []);

  useEffect(() => {
    calculateSizes();
  }, [calculateSizes]);

  /**
   * Purges temporary image caches.
   */
  const handleClearCache = async () => {
    await StorageService.clearCache();
    await calculateSizes();
  };

  /**
   * Deletes all local reports and cleans up associated file assets.
   */
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
            // Clear SQLite tables
            await ReportRepository.clearReports();
            
            // Clear folders
            const contents = await StorageService.getDirectorySize(IMAGES_DIR);
            if (contents > 0) {
              await StorageService.clearCache();
            }
            
            await calculateSizes();
            Alert.alert('Database Purged', 'Local report records and files have been successfully deleted.');
          }
        }
      ]
    );
  };

  return {
    cacheSize,
    imagesSize,
    pdfSize,
    refreshSizes: calculateSizes,
    clearCache: handleClearCache,
    deleteLocalReports: handleDeleteLocalReports
  };
}

export default useCache;
