import { Report, ReportStatistics } from '../types/report';
import { storageService } from './storageService';

const COLLECTION = 'patients/reports';

class ReportServiceImpl {
  async getAll(): Promise<Report[]> {
    return storageService.getCollection<Report>(COLLECTION);
  }

  async getById(id: string): Promise<Report | null> {
    return storageService.getById<Report>(COLLECTION, id);
  }

  async create(report: Report): Promise<void> {
    await storageService.addItem(COLLECTION, report);
  }

  async update(id: string, updates: Partial<Report>): Promise<void> {
    await storageService.updateItem(COLLECTION, id, updates);
  }

  async delete(id: string): Promise<void> {
    await storageService.removeItem(COLLECTION, id);
  }

  async toggleFavorite(id: string): Promise<void> {
    const report = await this.getById(id);
    if (report) {
      await this.update(id, { favorite: !report.favorite, syncStatus: 'pending' });
    }
  }

  async updateNotes(id: string, notes: string): Promise<void> {
    await this.update(id, { notes, syncStatus: 'pending' });
  }

  async getStats(): Promise<ReportStatistics> {
    const reports = await this.getAll();
    const total = reports.length;
    const detected = reports.filter(r => r.tumorDetected).length;
    const healthy = total - detected;
    const favs = reports.filter(r => r.favorite).length;
    const detectedScans = reports.filter(r => r.tumorDetected && r.tumorStats?.tumor_area);
    const avgArea = detectedScans.length > 0
      ? detectedScans.reduce((acc, cur) => acc + (cur.tumorStats?.tumor_area || 0), 0) / detectedScans.length
      : 0;

    return {
      totalCount: total,
      tumorDetectedCount: detected,
      healthyCount: healthy,
      favoriteCount: favs,
      averageTumorArea: parseFloat(avgArea.toFixed(2)),
    };
  }

  async search(query: string): Promise<Report[]> {
    const all = await this.getAll();
    if (!query.trim()) return all;
    const q = query.toLowerCase().trim();
    return all.filter(r =>
      r.patientName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  }

  async clearAll(): Promise<void> {
    await storageService.clearCollection(COLLECTION);
  }

  async getCount(): Promise<number> {
    return storageService.getCollectionSize(COLLECTION);
  }
}

export const reportService = new ReportServiceImpl();
export default reportService;
