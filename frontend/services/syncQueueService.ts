import { storageService } from './storageService';

const COLLECTION = 'meta/sync_queue';

export interface SyncQueueItem {
  id: string;
  operation: 'insert_report' | 'update_report' | 'delete_report' | 'insert_patient' | 'update_patient';
  payload: any;
  status: 'pending' | 'processing' | 'failed';
  retries: number;
  timestamp: string;
  priority: number;
}

class SyncQueueServiceImpl {
  async add(operation: SyncQueueItem['operation'], payload: any, priority = 1): Promise<void> {
    const item: SyncQueueItem = {
      id: `Q-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      operation,
      payload,
      status: 'pending',
      retries: 0,
      timestamp: new Date().toISOString(),
      priority,
    };
    await storageService.addItem(COLLECTION, item);
  }

  async getAll(): Promise<SyncQueueItem[]> {
    const items = await storageService.getCollection<SyncQueueItem>(COLLECTION);
    return items.filter(i => i.status !== 'processing')
      .sort((a, b) => b.priority - a.priority || new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getPendingCount(): Promise<number> {
    const items = await this.getAll();
    return items.filter(i => i.status === 'pending').length;
  }

  async updateStatus(id: string, status: SyncQueueItem['status'], retries: number): Promise<void> {
    await storageService.updateItem(COLLECTION, id, { status, retries } as any);
  }

  async remove(id: string): Promise<void> {
    await storageService.removeItem(COLLECTION, id);
  }

  async clear(): Promise<void> {
    await storageService.clearCollection(COLLECTION);
  }
}

export const syncQueueService = new SyncQueueServiceImpl();
export default syncQueueService;
