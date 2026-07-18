import { useState, useEffect, useCallback } from 'react';
import { Report, ReportStatistics } from '../types/report';
import { ReportRepository } from '../repositories/ReportRepository';
import { SyncRepository } from '../repositories/SyncRepository';

export type ReportFilterType = 'all' | 'anomaly' | 'healthy' | 'high_tumor' | 'recent' | 'favorites';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ReportFilterType>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Statistical counts
  const [stats, setStats] = useState<ReportStatistics>({
    totalCount: 0,
    tumorDetectedCount: 0,
    healthyCount: 0,
    favoriteCount: 0,
    averageTumorArea: 0
  });

  /**
   * Loads all reports from the repository.
   */
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ReportRepository.getReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve clinical scan reports.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Compute aggregated stats
  useEffect(() => {
    const total = reports.length;
    const detected = reports.filter(r => r.tumorDetected).length;
    const healthy = total - detected;
    const favs = reports.filter(r => r.favorite).length;

    const detectedScans = reports.filter(r => r.tumorDetected && r.tumorStats?.tumor_area !== undefined);
    const avgArea = detectedScans.length > 0
      ? detectedScans.reduce((acc, cur) => acc + (cur.tumorStats.tumor_area || 0), 0) / detectedScans.length
      : 0;

    setStats({
      totalCount: total,
      tumorDetectedCount: detected,
      healthyCount: healthy,
      favoriteCount: favs,
      averageTumorArea: parseFloat(avgArea.toFixed(2))
    });
  }, [reports]);

  // Apply filters and searches locally
  useEffect(() => {
    let result = [...reports];

    // Filter rules
    if (filter === 'anomaly') {
      result = result.filter(r => r.tumorDetected);
    } else if (filter === 'healthy') {
      result = result.filter(r => !r.tumorDetected);
    } else if (filter === 'high_tumor') {
      result = result.filter(r => r.tumorDetected && (r.tumorStats?.tumor_area || 0) >= 5.0);
    } else if (filter === 'favorites') {
      result = result.filter(r => r.favorite);
    } else if (filter === 'recent') {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      result = result.filter(r => new Date(r.timestamp).getTime() >= oneDayAgo);
    }

    // Search query parsing
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.patientName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q)) ||
        (r.tumorDetected ? 'anomaly' : 'healthy').includes(q)
      );
    }

    setFilteredReports(result);
  }, [reports, filter, searchQuery]);

  /**
   * Appends or edits a report.
   */
  const addReport = async (report: Report) => {
    try {
      await ReportRepository.saveReport(report);
      
      // Enqueue sync task
      SyncRepository.addToQueue('insert_report', report);
      
      await loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to save clinical report.');
    }
  };

  /**
   * Deletes a report file.
   */
  const deleteReport = async (id: string) => {
    try {
      await ReportRepository.deleteReport(id);
      
      // Enqueue sync task
      SyncRepository.addToQueue('delete_report', { id });
      
      await loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report log.');
      throw err;
    }
  };

  /**
   * Toggles the favorite flag.
   */
  const toggleFavorite = async (id: string) => {
    try {
      const report = reports.find(r => r.id === id);
      if (report) {
        const nextVal = !report.favorite;
        await ReportRepository.favoriteReport(id, nextVal);
        
        // Enqueue sync task
        SyncRepository.addToQueue('update_report', { ...report, favorite: nextVal });
        
        // Optimistic state update
        setReports(prev => prev.map(r => r.id === id ? { ...r, favorite: nextVal } : r));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update favorite status.');
    }
  };

  /**
   * Modifies doctor notes.
   */
  const updateNotes = async (id: string, notes: string) => {
    try {
      const report = reports.find(r => r.id === id);
      if (report) {
        await ReportRepository.updateReportNotes(id, notes);
        
        const updatedReport = { ...report, notes };
        // Enqueue sync task
        SyncRepository.addToQueue('update_report', updatedReport);
        
        setReports(prev => prev.map(r => r.id === id ? updatedReport : r));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update diagnostic notes.');
    }
  };

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return {
    reports,
    filteredReports,
    isLoading,
    error,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refreshReports: loadReports,
    addReport,
    deleteReport,
    toggleFavorite,
    updateNotes
  };
}

export default useReports;
