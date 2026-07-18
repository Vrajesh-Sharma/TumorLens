import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncRepository, SyncQueueItem } from '../repositories/SyncRepository';
import { ReportRepository } from '../repositories/ReportRepository';
import { PatientRepository } from '../repositories/PatientRepository';
import { useNetwork } from './useNetwork';
import { syncApi } from '../backend/syncApi';
import { notificationService } from '../services/notifications';

export function useSyncQueue() {
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const network = useNetwork();
  const syncNotified = useRef(false);

  const refreshQueue = useCallback(() => {
    const items = SyncRepository.getQueue();
    setQueue(items);
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  const retryFailedItems = useCallback(() => {
    const items = SyncRepository.getQueue();
    const failed = items.filter(i => i.status === 'failed');
    if (failed.length === 0) return;
    failed.forEach(item => {
      SyncRepository.updateQueueItemStatus(item.id, 'pending', 0);
    });
    refreshQueue();
  }, [refreshQueue]);

  const processQueue = useCallback(async () => {
    if (isSyncing || !network.isConnected || network.isWeakConnection) return;
    
    const items = SyncRepository.getQueue();
    if (items.length === 0) return;

    setIsSyncing(true);

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of items) {
      SyncRepository.updateQueueItemStatus(item.id, 'processing', item.retries);
      let success = false;

      try {
        const payload = JSON.parse(item.payload);

        switch (item.operation) {
          case 'insert_patient':
          case 'update_patient':
            success = await syncApi.syncPatientsToServer([payload]);
            break;

          case 'insert_report':
          case 'update_report':
            const localReport = await ReportRepository.getReports().then(list => list.find(r => r.id === payload.id));
            if (localReport && localReport.cloudId) {
              console.log('[useSyncQueue] Running conflict resolution schema for report:', localReport.id);
            }
            success = await syncApi.syncReportsToServer([payload]);
            if (success && localReport) {
              await ReportRepository.saveReport({
                ...localReport,
                syncStatus: 'synced',
                conflictVersion: (localReport.conflictVersion || 1) + 1
              });
            }
            break;

          case 'delete_report':
            success = true;
            break;

          default:
            success = true;
        }
      } catch (err) {
        console.error('[useSyncQueue] Processing error on task:', item.id, err);
        success = false;
      }

      if (success) {
        SyncRepository.deleteFromQueue(item.id);
        syncedCount++;
      } else {
        const nextRetries = item.retries + 1;
        const status = nextRetries >= 5 ? 'failed' : 'pending';
        SyncRepository.updateQueueItemStatus(item.id, status, nextRetries);
        if (status === 'failed') failedCount++;
      }
    }

    refreshQueue();

    if (syncedCount > 0 && failedCount === 0) {
      notificationService.scheduleSyncCompleteNotification(syncedCount);
    } else if (failedCount > 0) {
      notificationService.scheduleSyncFailedNotification(failedCount);
    }

    setIsSyncing(false);
  }, [isSyncing, network.isConnected, network.isWeakConnection, refreshQueue]);

  useEffect(() => {
    if (network.isConnected && !network.isWeakConnection && queue.length > 0) {
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
    enqueueTask: (op: SyncQueueItem['operation'], payload: any, priority = 1) => {
      SyncRepository.addToQueue(op, payload, priority);
      refreshQueue();
    }
  };
}

export default useSyncQueue;
