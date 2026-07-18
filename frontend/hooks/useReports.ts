import { useState, useEffect, useCallback } from 'react';
import { Report, ReportStatistics } from '../types/report';
import { reportService } from '../services/reportService';

export type ReportFilterType = 'all' | 'anomaly' | 'healthy' | 'high_tumor' | 'recent' | 'favorites';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ReportFilterType>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReportStatistics>({
    totalCount: 0,
    tumorDetectedCount: 0,
    healthyCount: 0,
    favoriteCount: 0,
    averageTumorArea: 0,
  });

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getAll();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const total = reports.length;
    const detected = reports.filter(r => r.tumorDetected).length;
    const healthy = total - detected;
    const favs = reports.filter(r => r.favorite).length;
    const detectedScans = reports.filter(r => r.tumorDetected && r.tumorStats?.tumor_area);
    const avgArea = detectedScans.length > 0
      ? detectedScans.reduce((acc, cur) => acc + (cur.tumorStats?.tumor_area || 0), 0) / detectedScans.length
      : 0;

    setStats({
      totalCount: total,
      tumorDetectedCount: detected,
      healthyCount: healthy,
      favoriteCount: favs,
      averageTumorArea: parseFloat(avgArea.toFixed(2)),
    });
  }, [reports]);

  useEffect(() => {
    let result = [...reports];

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

  const addReport = async (report: Report) => {
    try {
      await reportService.create(report);
      await loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to save report.');
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await reportService.delete(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete report.');
      throw err;
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const report = reports.find(r => r.id === id);
      if (report) {
        const nextVal = !report.favorite;
        setReports(prev => prev.map(r => r.id === id ? { ...r, favorite: nextVal } : r));
        await reportService.toggleFavorite(id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update favorite.');
      await loadReports();
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      const report = reports.find(r => r.id === id);
      if (report) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, notes } : r));
        await reportService.updateNotes(id, notes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update notes.');
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
    updateNotes,
  };
}

export default useReports;
