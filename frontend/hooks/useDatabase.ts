import { useState, useEffect, useCallback } from 'react';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { storageService } from '../services/storageService';
import { reportService } from '../services/reportService';
import { Alert } from 'react-native';

export function useDatabase() {
  const [dbSize, setDbSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSize = useCallback(async () => {
    try {
      const dir = new Directory(storageService.dataDir);
      const info = await dir.info();
      setDbSize(info.size || 0);
    } catch {
      setDbSize(0);
    }
  }, []);

  useEffect(() => {
    fetchSize();
  }, [fetchSize]);

  const handleBackup = async () => {
    setIsProcessing(true);
    try {
      await storageService.flushAll();
      const backupDir = new Directory(Paths.document, 'backups');
      await backupDir.create({ intermediates: true });
      const sourceDir = new Directory(storageService.dataDir);
      const items = await sourceDir.list();
      for (const item of items) {
        const src = new File(sourceDir, item.name);
        const dest = new File(backupDir, item.name);
        await src.copy(dest);
      }
      await fetchSize();
      Alert.alert('Backup Created', 'Data backup successfully compiled.');
    } catch {
      Alert.alert('Backup Error', 'Could not create data backup.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (backupUri: string) => {
    setIsProcessing(true);
    try {
      storageService.invalidateCache();
      const dataDir = new Directory(storageService.dataDir);
      const existing = await dataDir.exists;
      if (existing) {
        const oldItems = await dataDir.list();
        for (const item of oldItems) {
          const f = new File(dataDir, item.name);
          await f.delete();
        }
      }
      const backupDir = new Directory(backupUri);
      const items = await backupDir.list();
      for (const item of items) {
        const src = new File(backupDir, item.name);
        const dest = new File(dataDir, item.name);
        await src.copy(dest);
      }
      await fetchSize();
      Alert.alert('Data Restored', 'The diagnostic database has been successfully updated.');
      return true;
    } catch {
      Alert.alert('Restore Error', 'Could not restore target database.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const exportDatabaseFile = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing Unavailable', 'Native sharing dialog is disabled on this device.');
      return;
    }
    try {
      await storageService.flushAll();
      await Sharing.shareAsync(storageService.dataDir, { dialogTitle: 'Export TumorLens Data' });
    } catch {
      Alert.alert('Export Failure', 'Could not share the data directory.');
    }
  };

  const exportReportsCSV = async () => {
    try {
      const reports = await reportService.getAll();
      let csvContent = 'ID,Patient Name,Age,Gender,Tumor Detected,Tumor Area (%),Notes,Created At\n';
      for (const r of reports) {
        const notesEscaped = r.notes ? `"${r.notes.replace(/"/g, '""')}"` : '""';
        csvContent += `${r.id},"${r.patientName}",${r.patientAge || ''},${r.patientGender || ''},${r.tumorDetected ? 'YES' : 'NO'},${r.tumorStats?.tumor_area || 0}%,${notesEscaped},${r.timestamp}\n`;
      }
      const tempFile = new File(Paths.cache, `tumor_reports_${Date.now()}.csv`);
      await tempFile.write(csvContent);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempFile.uri, { dialogTitle: 'Export Patient Reports (CSV)' });
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('CSV Export Error', 'Could not compile patient report sheets.');
    }
  };

  const exportReportsJSON = async () => {
    try {
      const reports = await reportService.getAll();
      const content = JSON.stringify(reports, null, 2);
      const tempFile = new File(Paths.cache, `tumor_reports_${Date.now()}.json`);
      await tempFile.write(content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempFile.uri, { dialogTitle: 'Export Patient Reports (JSON)' });
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
    exportReportsJSON,
  };
}

export default useDatabase;
