import { Platform, Alert } from 'react-native';

let SQLite: any = null;
let FileSystem: any = null;

if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
  try {
    FileSystem = require('expo-file-system/legacy');
  } catch {}
}

const DB_NAME = 'tumorlens.db';
let dbInstance: any = null;

export interface AppDb {
  runSync: (...args: any[]) => void;
  getAllSync: <T>(sql: string, params?: any[]) => T[];
  getFirstSync: <T>(sql: string, params?: any[]) => T | null;
  execSync: (sql: string) => void;
  withTransactionSync: (fn: () => void) => void;
}

export const DatabaseService = {
  getDb(): AppDb {
    if (Platform.OS === 'web') {
      if (!dbInstance) {
        dbInstance = {
          runSync: () => {},
          getAllSync: <T>() => [] as T[],
          getFirstSync: <T>() => null as T | null,
          execSync: () => {},
          withTransactionSync: (fn: () => void) => fn(),
        } as AppDb;
      }
      return dbInstance;
    }
    if (!dbInstance) {
      dbInstance = SQLite.openDatabaseSync(DB_NAME);
    }
    return dbInstance;
  },

  /**
   * Initializes schemas, runs migrations, and constructs optimized indices.
   */
  initDatabase(): void {
    const db = this.getDb();
    
    try {
      db.withTransactionSync(() => {
        // 1. Doctors Table
        db.execSync(`
          CREATE TABLE IF NOT EXISTS doctors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            hospitalName TEXT NOT NULL,
            medicalLicenseId TEXT NOT NULL,
            specialization TEXT NOT NULL,
            department TEXT,
            phone TEXT,
            photoUri TEXT,
            role TEXT NOT NULL DEFAULT 'doctor'
          );
        `);

        // 2. Patients Table
        db.execSync(`
          CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            hospitalId TEXT NOT NULL,
            doctor TEXT NOT NULL,
            notes TEXT,
            createdAt TEXT NOT NULL
          );
        `);

        // 3. Reports Table (with offline-first tracking)
        db.execSync(`
          CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            patientName TEXT NOT NULL,
            patientAge INTEGER,
            patientGender TEXT,
            originalImageUri TEXT,
            overlayImageUri TEXT,
            tumorDetected INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            favorite INTEGER DEFAULT 0,
            notes TEXT,
            modelUsed TEXT,
            syncStatus TEXT DEFAULT 'pending',
            cloudId TEXT,
            updatedAt TEXT,
            conflictVersion INTEGER DEFAULT 1
          );
        `);

        // 4. Tumor Statistics Table
        db.execSync(`
          CREATE TABLE IF NOT EXISTS tumor_statistics (
            id TEXT PRIMARY KEY,
            reportId TEXT NOT NULL,
            tumor_area REAL,
            edema REAL,
            necrotic_core REAL,
            enhancing_tumor REAL,
            inference_time REAL,
            FOREIGN KEY (reportId) REFERENCES reports(id) ON DELETE CASCADE
          );
        `);

        // 4.5. Images Table
        db.execSync(`
          CREATE TABLE IF NOT EXISTS images (
            id TEXT PRIMARY KEY,
            filePath TEXT NOT NULL,
            fileSize INTEGER,
            createdTime TEXT NOT NULL,
            type TEXT NOT NULL
          );
        `);

        // 5. Sync Queue Table
        db.execSync(`
          CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            operation TEXT NOT NULL,
            payload TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            retries INTEGER DEFAULT 0,
            timestamp TEXT NOT NULL,
            priority INTEGER DEFAULT 1
          );
        `);

        // 6. Settings Table
        db.execSync(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );
        `);

        // Optimize search parameters via indices
        db.execSync('CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);');
        db.execSync('CREATE INDEX IF NOT EXISTS idx_reports_patient ON reports(patientName);');
        db.execSync('CREATE INDEX IF NOT EXISTS idx_reports_favorite ON reports(favorite);');
        db.execSync('CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);');
      });
    } catch (err) {
      console.error('[DatabaseService] Initialization failure:', err);
      Alert.alert('Database Initialization Error', 'Hospital records engine failed to build schemas.');
    }
  },

  /**
   * Backups the local database file.
   */
  async backupDatabase(): Promise<string> {
    if (!FileSystem) throw new Error('Not supported on web');
    try {
      const dbDir = `${FileSystem.documentDirectory}SQLite/`;
      const sourceUri = `${dbDir}${DB_NAME}`;
      
      const backupDir = `${FileSystem.documentDirectory}backups/`;
      const destUri = `${backupDir}backup_tumorlens_${Date.now()}.db`;

      const dirInfo = await FileSystem.getInfoAsync(backupDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
      }

      await FileSystem.copyAsync({ from: sourceUri, to: destUri });
      return destUri;
    } catch (err: any) {
      console.error('[DatabaseService] Backup failure:', err);
      throw new Error('Database backup failed');
    }
  },

  /**
   * Restores database from a given URI path.
   */
  async restoreDatabase(backupUri: string): Promise<void> {
    if (!FileSystem) throw new Error('Not supported on web');
    try {
      if (dbInstance) {
        dbInstance = null;
      }

      const dbDir = `${FileSystem.documentDirectory}SQLite/`;
      const targetUri = `${dbDir}${DB_NAME}`;

      await FileSystem.copyAsync({ from: backupUri, to: targetUri });
      
      dbInstance = SQLite.openDatabaseSync(DB_NAME);
    } catch (err) {
      console.error('[DatabaseService] Restore failure:', err);
      throw new Error('Database restore failed');
    }
  },

  /**
   * Returns current database file size in bytes.
   */
  async getDatabaseSize(): Promise<number> {
    if (!FileSystem) return 0;
    try {
      const dbUri = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
      const info = await FileSystem.getInfoAsync(dbUri);
      return info.exists ? info.size : 0;
    } catch {
      return 0;
    }
  }
};

export default DatabaseService;
