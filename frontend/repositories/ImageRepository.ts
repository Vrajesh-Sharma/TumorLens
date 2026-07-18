import { DatabaseService } from '../database/DatabaseService';
import * as FileSystem from 'expo-file-system/legacy';
import { StorageService } from '../database/StorageService';

export interface ImageMetadata {
  id: string;
  filePath: string;
  fileSize: number;
  createdTime: string;
  type: 'original' | 'mask';
}

export const ImageRepository = {
  /**
   * Registers a saved image asset in the SQLite database.
   */
  async saveImageMetadata(id: string, filePath: string, type: 'original' | 'mask'): Promise<void> {
    const db = DatabaseService.getDb();
    let fileSize = 0;

    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        fileSize = fileInfo.size;
      }
    } catch {
      fileSize = 0;
    }

    const createdTime = new Date().toISOString();

    db.runSync(
      `INSERT OR REPLACE INTO images (id, filePath, fileSize, createdTime, type)
       VALUES (?, ?, ?, ?, ?);`,
      [id, filePath, fileSize, createdTime, type]
    );
  },

  /**
   * Fetches metadata for a registered image.
   */
  getImageMetadata(id: string): ImageMetadata | null {
    const db = DatabaseService.getDb();
    const row = db.getFirstSync<any>('SELECT * FROM images WHERE id = ?;', [id]);
    if (!row) return null;

    return {
      id: row.id,
      filePath: row.filePath,
      fileSize: row.fileSize,
      createdTime: row.createdTime,
      type: row.type
    };
  },

  /**
   * Deletes local image files and removes their database records.
   */
  async deleteImage(id: string): Promise<void> {
    const db = DatabaseService.getDb();
    const meta = this.getImageMetadata(id);
    
    if (meta) {
      // Remove from filesystem
      await StorageService.deleteFile(meta.filePath);
    }

    // Remove from SQLite
    db.runSync('DELETE FROM images WHERE id = ?;', [id]);
  },

  /**
   * Lists all cached images in the database.
   */
  getAllImages(): ImageMetadata[] {
    const db = DatabaseService.getDb();
    const rows = db.getAllSync<any>('SELECT * FROM images ORDER BY createdTime DESC;');
    return rows.map(r => ({
      id: r.id,
      filePath: r.filePath,
      fileSize: r.fileSize,
      createdTime: r.createdTime,
      type: r.type
    }));
  }
};

export default ImageRepository;
