import { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '../database/DatabaseService';
import { ReportRepository } from '../repositories/ReportRepository';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

export function useDatabase() {
  const [dbSize, setDbSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSize = useCallback(async () => {
    const size = await DatabaseService.getDatabaseSize();
    setDbSize(size);
  }, []);

  useEffect(() => {
    fetchSize();
  }, [fetchSize]);

  /**
   * Performs database file backup.
   */
  const handleBackup = async () => {
    setIsProcessing(true);
    try {
      const uri = await DatabaseService.backupDatabase();
      await fetchSize();
      Alert.alert('Backup Created', `Database backup successfully compiled.\nPath: ${uri.split('/').pop()}`);
      return uri;
    } catch {
      Alert.alert('Backup Error', 'Could not create database backup.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Restores database from a backup path.
   */
  const handleRestore = async (backupUri: string) => {
    setIsProcessing(true);
    try {
      await DatabaseService.restoreDatabase(backupUri);
      await fetchSize();
      Alert.alert('Database Restored', 'The diagnostic database has been successfully updated.');
      return true;
    } catch {
      Alert.alert('Restore Error', 'Could not restore target database.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Exports raw database via Sharing dialog.
   */
  const exportDatabaseFile = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing Unavailable', 'Native sharing dialog is disabled on this device.');
      return;
    }

    try {
      const dbUri = `${FileSystem.documentDirectory}SQLite/tumorlens.db`;
      await Sharing.shareAsync(dbUri, { dialogTitle: 'Export TumorLens Database' });
    } catch {
      Alert.alert('Export Failure', 'Could not share the database file.');
    }
  };

  /**
   * Compiles and exports diagnostic reports to a CSV sheet.
   */
  const exportReportsCSV = async () => {
    try {
      const reports = await ReportRepository.getReports();
      let csvContent = 'ID,Patient Name,Age,Gender,Tumor Detected,Tumor Area (%),Notes,Created At\n';
      
      for (const r of reports) {
        const notesEscaped = r.notes ? `"${r.notes.replace(/"/g, '""')}"` : '""';
        csvContent += `${r.id},"${r.patientName}",${r.patientAge || ''},${r.patientGender || ''},${r.tumorDetected ? 'YES' : 'NO'},${r.tumorStats?.tumor_area || 0}%,${notesEscaped},${r.timestamp}\n`;
      }

      const tempFileUri = `${FileSystem.cacheDirectory}tumor_reports_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(tempFileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempFileUri, { dialogTitle: 'Export Patient Reports (CSV)' });
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('CSV Export Error', 'Could not compile patient report sheets.');
    }
  };

  /**
   * Compiles and exports diagnostic reports to JSON.
   */
  const exportReportsJSON = async () => {
    try {
      const reports = await ReportRepository.getReports();
      const content = JSON.stringify(reports, null, 2);
      
      const tempFileUri = `${FileSystem.cacheDirectory}tumor_reports_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(tempFileUri, content, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempFileUri, { dialogTitle: 'Export Patient Reports (JSON)' });
      }
    } catch {
      Alert.alert('JSON Export Error', 'Could not compile patient JSON reports.');
    }
  };

  return {
    dbSize,
    isProcessing,
    refreshSize: fetchSize,
    backupDatabase: handleBackup,
    restoreDatabase: handleRestore,
    exportDatabaseFile,
    exportReportsCSV,
    exportReportsJSON
  };
}

export default useDatabase;
