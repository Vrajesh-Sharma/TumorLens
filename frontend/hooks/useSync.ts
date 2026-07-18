import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';
import { reportService } from '../services/reportService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncStatusType = 'synced' | 'pending' | 'uploading' | 'failed' | 'offline';

const LAST_SYNC_KEY = 'TUMORLENS_LAST_SYNC';

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('synced');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function loadLastSync() {
      const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (time) {
        setLastSynced(time);
        setSyncStatus('synced');
      }
    }
    loadLastSync();
  }, []);

  const triggerSync = useCallback(async () => {
    setSyncStatus('uploading');

    try {
      await patientService.getAll();
      await reportService.getAll();

      const nowStr = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, nowStr);
      setLastSynced(nowStr);
      setSyncStatus('synced');
      setPendingCount(0);
      return true;
    } catch (err) {
      console.error('[useSync] Failure:', err);
      setSyncStatus('failed');
      return false;
    }
  }, []);

  return {
    syncStatus,
    lastSynced,
    pendingCount,
    syncNow: triggerSync,
  };
}

export default useSync;
