import { useState, useEffect, useCallback } from 'react';
import { syncQueueService } from '../services/syncQueueService';

export type SyncStatusType = 'synced' | 'pending' | 'uploading' | 'failed' | 'offline';

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('synced');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    syncQueueService.getPendingCount().then(count => {
      setPendingCount(count);
      if (count > 0) setSyncStatus('pending');
    });
  }, []);

  const triggerSync = useCallback(async () => {
    setSyncStatus('uploading');

    try {
      const nowStr = new Date().toISOString();
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
