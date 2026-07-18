import { DatabaseService } from '../database/DatabaseService';
import { Report } from '../types/report';

export const ReportRepository = {
  async getReports(): Promise<Report[]> {
    const db = DatabaseService.getDb();
    
    try {
      const rows = db.getAllSync<any>(`
        SELECT r.*, s.tumor_area, s.edema, s.necrotic_core, s.enhancing_tumor, s.inference_time 
        FROM reports r
        LEFT JOIN tumor_statistics s ON r.id = s.reportId
        ORDER BY r.timestamp DESC;
      `);

      return rows.map(row => {
        const report: Report = {
          id: row.id,
          patientName: row.patientName,
          patientAge: row.patientAge || undefined,
          patientGender: row.patientGender || undefined,
          originalImageUri: row.originalImageUri || '',
          overlayImageUri: row.overlayImageUri || '',
          tumorDetected: row.tumorDetected === 1,
          timestamp: row.timestamp,
          favorite: row.favorite === 1,
          notes: row.notes || '',
          modelUsed: row.modelUsed || '',
          syncStatus: row.syncStatus,
          cloudId: row.cloudId || undefined,
          updatedAt: row.updatedAt || undefined,
          conflictVersion: row.conflictVersion,
          tumorStats: {
            tumor_area: row.tumor_area || 0,
            per_class_counts: {
              background: row.tumor_area !== null ? parseFloat((100 - (row.edema || 0) - (row.necrotic_core || 0) - (row.enhancing_tumor || 0)).toFixed(2)) : 100,
              necrotic_core: row.necrotic_core || 0,
              edema: row.edema || 0,
              enhancing_tumor: row.enhancing_tumor || 0
            },
            inference_time: row.inference_time || undefined
          }
        };

        return report;
      });
    } catch (err) {
      console.error('[ReportRepository] getReports failure:', err);
      return [];
    }
  },

  /**
   * Saves or updates a report and its nested stats.
   */
  async saveReport(report: Report): Promise<void> {
    const db = DatabaseService.getDb();
    
    try {
      db.withTransactionSync(() => {
        db.runSync(
          `INSERT OR REPLACE INTO reports (id, patientName, patientAge, patientGender, originalImageUri, overlayImageUri, tumorDetected, timestamp, favorite, notes, modelUsed, syncStatus, cloudId, updatedAt, conflictVersion)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            report.id,
            report.patientName,
            report.patientAge || null,
            report.patientGender || null,
            report.originalImageUri || null,
            report.overlayImageUri || null,
            report.tumorDetected ? 1 : 0,
            report.timestamp,
            report.favorite ? 1 : 0,
            report.notes || null,
            report.modelUsed || null,
            report.syncStatus || 'pending',
            report.cloudId || null,
            report.updatedAt || null,
            report.conflictVersion || 1
          ]
        );

        // Delete existing stats to prevent duplicates
        db.runSync('DELETE FROM tumor_statistics WHERE reportId = ?;', [report.id]);

        if (report.tumorStats) {
          db.runSync(
            `INSERT INTO tumor_statistics (id, reportId, tumor_area, edema, necrotic_core, enhancing_tumor, inference_time)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
              `STAT-${report.id}`,
              report.id,
              report.tumorStats.tumor_area || 0,
              report.tumorStats.per_class_counts?.edema || 0,
              report.tumorStats.per_class_counts?.necrotic_core || 0,
              report.tumorStats.per_class_counts?.enhancing_tumor || 0,
              report.tumorStats.inference_time || null
            ]
          );
        }
      });
    } catch (err) {
      console.error('[ReportRepository] saveReport failure:', err);
      throw new Error('Report SQLite write failure');
    }
  },

  /**
   * Wipes a report from the database (cascade delete removes stats).
   */
  async deleteReport(id: string): Promise<void> {
    const db = DatabaseService.getDb();
    try {
      db.runSync('DELETE FROM reports WHERE id = ?;', [id]);
    } catch (err) {
      console.error('[ReportRepository] deleteReport failure:', err);
      throw new Error('Report SQLite delete failure');
    }
  },

  /**
   * Toggles the favorite flag of an MRI report.
   */
  async favoriteReport(id: string, favorite: boolean): Promise<void> {
    const db = DatabaseService.getDb();
    try {
      db.runSync(
        'UPDATE reports SET favorite = ?, syncStatus = "pending" WHERE id = ?;',
        [favorite ? 1 : 0, id]
      );
    } catch (err) {
      console.error('[ReportRepository] favoriteReport failure:', err);
      throw new Error('Report SQLite favorite update failure');
    }
  },

  /**
   * Modifies a report's notes.
   */
  async updateReportNotes(id: string, notes: string): Promise<void> {
    const db = DatabaseService.getDb();
    try {
      db.runSync(
        'UPDATE reports SET notes = ?, syncStatus = "pending" WHERE id = ?;',
        [notes, id]
      );
    } catch (err) {
      console.error('[ReportRepository] updateReportNotes failure:', err);
      throw new Error('Report SQLite notes update failure');
    }
  },

  /**
   * Clears all reports in SQLite.
   */
  async clearReports(): Promise<void> {
    const db = DatabaseService.getDb();
    try {
      db.execSync('DELETE FROM reports;');
    } catch (err) {
      console.error('[ReportRepository] clearReports failure:', err);
    }
  }
};

export default ReportRepository;
