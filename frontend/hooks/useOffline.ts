import { useNetwork } from './useNetwork';
import { useSyncQueue } from './useSyncQueue';
import { useDatabase } from './useDatabase';

export function useOffline() {
  const network = useNetwork();
  const syncQueue = useSyncQueue();
  const db = useDatabase();

  return {
    // Network status parameters
    isConnected: network.isConnected,
    connectionType: network.connectionType,
    isWeakConnection: network.isWeakConnection,
    networkDetails: network.details,

    // Sync queue status parameters
    queue: syncQueue.queue,
    queueLength: syncQueue.queue.length,
    isSyncing: syncQueue.isSyncing,
    syncNow: syncQueue.processQueue,
    enqueueTask: syncQueue.enqueueTask,

    // Database parameters
    dbSize: db.dbSize,
    refreshDbSize: db.refreshSize,
    backupDatabase: db.backupDatabase,
    restoreDatabase: db.restoreDatabase,
    exportDatabaseFile: db.exportDatabaseFile,
    exportReportsCSV: db.exportReportsCSV,
    exportReportsJSON: db.exportReportsJSON
  };
}

export default useOffline;
