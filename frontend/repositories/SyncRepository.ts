import { DatabaseService } from '../database/DatabaseService';

export interface SyncQueueItem {
  id: string;
  operation: 'insert_report' | 'update_report' | 'delete_report' | 'insert_patient' | 'update_patient';
  payload: string; // JSON Stringified data
  status: 'pending' | 'processing' | 'failed';
  retries: number;
  timestamp: string;
  priority: number;
}

export const SyncRepository = {
  /**
   * Pushes a new offline sync task to the SQLite queue.
   */
  addToQueue(operation: SyncQueueItem['operation'], payload: any, priority = 1): void {
    const db = DatabaseService.getDb();
    const id = `Q-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payloadStr = JSON.stringify(payload);
    const timestamp = new Date().toISOString();

    db.runSync(
      `INSERT INTO sync_queue (id, operation, payload, status, retries, timestamp, priority)
       VALUES (?, ?, ?, 'pending', 0, ?, ?);`,
      [id, operation, payloadStr, timestamp, priority]
    );
  },

  /**
   * Fetches all pending/failed queue tasks sorted by priority and oldest timestamp.
   */
  getQueue(): SyncQueueItem[] {
    const db = DatabaseService.getDb();
    const rows = db.getAllSync<any>(
      `SELECT * FROM sync_queue 
       WHERE status != 'processing' 
       ORDER BY priority DESC, timestamp ASC;`
    );

    return rows.map(r => ({
      id: r.id,
      operation: r.operation,
      payload: r.payload,
      status: r.status,
      retries: r.retries,
      timestamp: r.timestamp,
      priority: r.priority
    }));
  },

  /**
   * Updates retry counts and statuses of queue items.
   */
  updateQueueItemStatus(id: string, status: SyncQueueItem['status'], retries: number): void {
    const db = DatabaseService.getDb();
    db.runSync(
      'UPDATE sync_queue SET status = ?, retries = ? WHERE id = ?;',
      [status, retries, id]
    );
  },

  /**
   * Removes enqueued items upon successful remote sync.
   */
  deleteFromQueue(id: string): void {
    const db = DatabaseService.getDb();
    db.runSync('DELETE FROM sync_queue WHERE id = ?;', [id]);
  },

  /**
   * Cleans up the queue.
   */
  clearQueue(): void {
    const db = DatabaseService.getDb();
    db.execSync('DELETE FROM sync_queue;');
  }
};

export default SyncRepository;
