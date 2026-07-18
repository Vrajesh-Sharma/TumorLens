import { useState, useEffect, useCallback, useRef } from 'react';
import { syncQueueService, SyncQueueItem } from '../services/syncQueueService';
import { reportService } from '../services/reportService';
import { useNetwork } from './useNetwork';
import { notificationService } from '../services/notifications';

export function useSyncQueue() {
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const network = useNetwork();
  const syncNotified = useRef(false);
  const syncingLock = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const refreshQueue = useCallback(async () => {
    try {
      const items = await syncQueueService.getAll();
      if (mounted.current) setQueue(items);
    } catch {}
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  const retryFailedItems = useCallback(async () => {
    const items = await syncQueueService.getAll();
    const failed = items.filter(i => i.status === 'failed');
    if (failed.length === 0) return;
    for (const item of failed) {
      await syncQueueService.updateStatus(item.id, 'pending', 0);
    }
    refreshQueue();
  }, [refreshQueue]);

  const processQueue = useCallback(async () => {
    if (syncingLock.current) return;
    syncingLock.current = true;
    setIsSyncing(true);

    try {
      if (!network.isConnected || network.isWeakConnection) return;

      const items = await syncQueueService.getAll();
      if (items.length === 0) return;

      let syncedCount = 0;
      let failedCount = 0;

      for (const item of items) {
        if (!mounted.current) return;
        await syncQueueService.updateStatus(item.id, 'processing', item.retries);

        try {
          const payload = item.payload;

          switch (item.operation) {
            case 'insert_patient':
            case 'update_patient':
            case 'insert_report':
            case 'update_report': {
              if (payload.id) {
                await reportService.update(payload.id, { syncStatus: 'synced' } as any);
              }
              break;
            }
            case 'delete_report':
              break;
          }

          await syncQueueService.remove(item.id);
          syncedCount++;
        } catch (err) {
          console.error('[useSyncQueue] Processing error on task:', item.id, err);
          const nextRetries = item.retries + 1;
          const status = nextRetries >= 5 ? 'failed' : 'pending';
          await syncQueueService.updateStatus(item.id, status as any, nextRetries);
          if (status === 'failed') failedCount++;
        }
      }

      if (mounted.current) {
        refreshQueue();

        if (syncedCount > 0 && failedCount === 0) {
          notificationService.scheduleSyncCompleteNotification(syncedCount);
        } else if (failedCount > 0) {
          notificationService.scheduleSyncFailedNotification(failedCount);
        }
      }
    } finally {
      syncingLock.current = false;
      if (mounted.current) setIsSyncing(false);
    }
  }, [network.isConnected, network.isWeakConnection, refreshQueue]);

  useEffect(() => {
    if (network.isConnected && !network.isWeakConnection && queue.length > 0 && !syncingLock.current) {
      syncNotified.current = false;
      processQueue();
    }
  }, [network.isConnected, network.isWeakConnection, queue.length, processQueue]);

  return {
    queue,
    isSyncing,
    refreshQueue,
    processQueue,
    retryFailedItems,
    enqueueTask: async (op: SyncQueueItem['operation'], payload: any, priority = 1) => {
      await syncQueueService.add(op, payload, priority);
      refreshQueue();
    },
  };
}

export default useSyncQueue;
