import { useState, useEffect, useCallback } from 'react';
import { syncApi } from '../backend/syncApi';
import { PatientRepository } from '../repositories/PatientRepository';
import { ReportRepository } from '../repositories/ReportRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncStatusType = 'synced' | 'pending' | 'uploading' | 'failed' | 'offline';

const LAST_SYNC_KEY = 'TUMORLENS_LAST_SYNC';

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('pending');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Load last sync timestamp
  useEffect(() => {
    async function loadLastSync() {
      const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (time) {
        setLastSynced(time);
        setSyncStatus('synced');
      } else {
        setSyncStatus('pending');
      }
    }
    loadLastSync();
  }, []);

  /**
   * Triggers background or manual synchronization of all local records.
   */
  const triggerSync = useCallback(async () => {
    setSyncStatus('uploading');
    
    // Check connection first
    const isOnline = await syncApi.checkCloudConnectivity();
    if (!isOnline) {
      setSyncStatus('offline');
      return false;
    }

    try {
      // Fetch local records to synchronize
      const patients = await PatientRepository.getPatients();
      const reports = await ReportRepository.getReports();

      // Perform sync APIs
      await syncApi.syncPatientsToServer(patients);
      await syncApi.syncReportsToServer(reports);

      // Save sync details
      const nowStr = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, nowStr);
      setLastSynced(nowStr);
      setSyncStatus('synced');
      setPendingCount(0);
      return true;
    } catch (err) {
      console.error('[useSync] Failure syncing data:', err);
      setSyncStatus('failed');
      return false;
    }
  }, []);

  return {
    syncStatus,
    lastSynced,
    pendingCount,
    syncNow: triggerSync
  };
}

export default useSync;
