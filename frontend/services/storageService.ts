import { Paths, Directory, File } from 'expo-file-system';
import { AppState } from 'react-native';

export interface Storable {
  id: string;
  [key: string]: any;
}

class StorageServiceImpl {
  private cache: Map<string, Storable[]> = new Map();
  private writeTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private initialized = false;
  private baseDir!: Directory;

  get dataDir(): string {
    return this.baseDir?.uri ?? '';
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.baseDir = new Directory(Paths.document, 'app_data');
    if (!(await this.baseDir.exists)) {
      await this.baseDir.create({ intermediates: true });
    }

    const subdirs = ['auth', 'patients', 'meta', 'exports', 'images'];
    for (const name of subdirs) {
      const dir = new Directory(this.baseDir, name);
      if (!(await dir.exists)) {
        await dir.create({ intermediates: true });
      }
    }
    this.initialized = true;

    AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        this.flushAll();
      }
    });
  }

  private file(collection: string): File {
    return new File(this.baseDir, `${collection}.json`);
  }

  async readJSON<T extends Storable>(collection: string): Promise<T[]> {
    const f = this.file(collection);
    if (!(await f.exists)) return [];
    try {
      const content = await f.text();
      return JSON.parse(content);
    } catch {
      console.error(`[storageService] Corrupted JSON in ${collection}. Data preserved in file, returning empty.`);
      return [];
    }
  }

  async writeJSON<T extends Storable>(collection: string, data: T[]): Promise<void> {
    const f = this.file(collection);
    await f.write(JSON.stringify(data, null, 2));
  }

  async getCollection<T extends Storable>(collection: string): Promise<T[]> {
    if (this.cache.has(collection)) {
      return this.cache.get(collection) as T[];
    }
    const data = await this.readJSON<T>(collection);
    this.cache.set(collection, data);
    return data;
  }

  private debouncedWrite(collection: string): void {
    const existing = this.writeTimers.get(collection);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(async () => {
      const data = this.cache.get(collection);
      if (data) {
        await this.writeJSON(collection, data);
      }
      this.writeTimers.delete(collection);
    }, 300);
    this.writeTimers.set(collection, timer);
  }

  async addItem<T extends Storable>(collection: string, item: T): Promise<void> {
    const data = await this.getCollection<T>(collection);
    const idx = data.findIndex(x => x.id === item.id);
    if (idx >= 0) {
      data[idx] = item;
    } else {
      data.push(item);
    }
    this.cache.set(collection, data);
    this.debouncedWrite(collection);
  }

  async updateItem<T extends Storable>(collection: string, id: string, updates: Partial<T>): Promise<void> {
    const data = await this.getCollection<T>(collection);
    const idx = data.findIndex(x => x.id === id);
    if (idx >= 0) {
      data[idx] = { ...data[idx], ...updates };
      this.cache.set(collection, data);
      this.debouncedWrite(collection);
    }
  }

  async removeItem(collection: string, id: string): Promise<void> {
    const data = await this.getCollection(collection);
    const filtered = data.filter(x => x.id !== id);
    this.cache.set(collection, filtered);
    this.debouncedWrite(collection);
  }

  async getById<T extends Storable>(collection: string, id: string): Promise<T | null> {
    const data = await this.getCollection<T>(collection);
    return data.find(x => x.id === id) || null;
  }

  async flushAll(): Promise<void> {
    for (const [collection, data] of this.cache.entries()) {
      await this.writeJSON(collection, data);
    }
    for (const timer of this.writeTimers.values()) {
      clearTimeout(timer);
    }
    this.writeTimers.clear();
  }

  async clearCollection(collection: string): Promise<void> {
    this.cache.set(collection, []);
    await this.writeJSON(collection, []);
  }

  async getCollectionSize(collection: string): Promise<number> {
    const data = await this.getCollection(collection);
    return data.length;
  }

  invalidateCache(collection?: string): void {
    if (collection) this.cache.delete(collection);
    else this.cache.clear();
  }
}

export const storageService = new StorageServiceImpl();
export default storageService;
