import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, useWindowDimensions, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../components/ui/layout/Layouts';
import { AppHeader } from '../components/ui/navigation/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Paths, File, Directory } from 'expo-file-system';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../theme';
import { formatConfidence } from '../utils';
import { reportFormatter } from '../services/predictionService';
import { useRequireAuth } from '../hooks/useRoleGuard';
import { usePrediction } from '../hooks/usePrediction';
import { useScanStore } from '../store';
import { MriViewer, OpacitySlider, Legend } from '../components/viewer';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { reportService } from '../services/reportService';
import { syncQueueService } from '../services/syncQueueService';
import { notificationService } from '../services/notifications';
import { useNotificationPopUp } from '../hooks/useNotificationPopUp';
import ResultNotificationCard from '../components/notifications/ResultNotificationCard';
import ExportActionSheet from '../components/exports/ExportActionSheet';
import type { LegendItem } from '../components/viewer/Legend';

export default function ResultScreen() {
  useRequireAuth();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const params = useLocalSearchParams<{ imageUri?: string; fileName?: string; patientAge?: string; patientGender?: string }>();
  const { currentScan } = useScanStore();
  const { status, progress, error, data: prediction, startPrediction, cancelPrediction, resetPrediction } = usePrediction();

  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const [isSaving, setIsSaving] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [permanentImageUri, setPermanentImageUri] = useState<string | null>(null);
  const { currentNotification: notif, show: showNotif, dismiss: dismissNotif } = useNotificationPopUp();

  const localImageUri = params.imageUri || currentScan?.originalImageUri || null;

  async function copyToPermanentStorage(uri: string): Promise<string> {
    try {
      const imgDir = new Directory(Paths.document, 'images');
      if (!(await imgDir.exists)) {
        await imgDir.create({ intermediates: true });
      }
      const srcFile = new File(uri);
      const ext = uri.split('.').pop()?.toLowerCase() || 'png';
      const destFile = new File(imgDir, `orig_${Date.now()}.${ext}`);
      await srcFile.copy(destFile);
      return destFile.uri;
    } catch {
      return uri;
    }
  }

  useEffect(() => {
    if (localImageUri && !permanentImageUri) {
      copyToPermanentStorage(localImageUri).then(setPermanentImageUri);
    }
  }, [localImageUri, permanentImageUri]);

  useEffect(() => {
    if (localImageUri && !prediction && status === 'idle') {
      startPrediction(localImageUri);
    }
  }, [localImageUri, prediction, status, startPrediction]);

  useEffect(() => {
    if (status === 'success' && prediction) {
      showNotif({
        type: prediction.detection_flag ? 'critical' : 'success',
        title: prediction.detection_flag ? 'Tumor Detected' : 'Scan Complete — Healthy',
        message: prediction.detection_flag
          ? `Tumor area: ${prediction.tumor_area.toFixed(1)}% — Review recommended`
          : `No anomalies found. Confidence: ${formatConfidence(prediction.confidence || 0)}`,
        actions: [
          { label: 'View Report', onPress: () => {} },
          { label: 'Dismiss', onPress: () => {} },
        ],
        icon: prediction.detection_flag ? 'warning-outline' : 'checkmark-circle-outline',
        duration: prediction.detection_flag ? 0 : 4000,
      });
    }
  }, [status, prediction, dismissNotif, showNotif]);

  const handleRetry = () => {
    resetPrediction();
    if (localImageUri) {
      startPrediction(localImageUri);
    }
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <ScreenContainer scrollable={false}>
        <AppHeader title="Diagnostic Report" subtitle="Running AI inference..." showBack={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text className="text-sm font-bold text-text dark:text-text-dark text-center">
            Running BraTS2020 U-Net Inference
          </Text>
          <Text className="text-xs text-subText dark:text-subText-dark text-center mt-2">
            {progress > 0 ? `${Math.round(progress)}%` : 'Preprocessing image...'}
          </Text>
          <Text className="text-xs text-subText dark:text-subText-dark text-center mt-1 max-w-[260px] leading-5">
            This may take a moment as the model analyzes the MRI scan entirely on-device.
          </Text>
          <Pressable
            onPress={cancelPrediction}
            className="mt-6 bg-danger/10 px-5 py-2.5 rounded-xl border border-danger/25"
          >
            <Text className="text-xs font-bold text-danger">Cancel Analysis</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (status === 'error') {
    return (
      <ScreenContainer scrollable={false}>
        <AppHeader title="Diagnostic Report" showBack={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-14 h-14 rounded-full bg-danger/10 items-center justify-center mb-4">
            <Ionicons name="alert-circle-outline" size={28} color="#C5221F" />
          </View>
          <Text className="text-sm font-bold text-text dark:text-text-dark text-center">
            Analysis Failed
          </Text>
          <Text className="text-xs text-subText dark:text-subText-dark text-center mt-2 max-w-[260px] leading-5">
            {error || 'An error occurred during AI inference.'}
          </Text>
          <Pressable
            onPress={handleRetry}
            className="mt-6 bg-primary dark:bg-primary-dark px-5 py-2.5 rounded-xl shadow-md"
          >
            <Text className="text-xs font-bold text-white dark:text-background-dark">Retry Analysis</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (!prediction) {
    return (
      <ScreenContainer scrollable={false}>
        <AppHeader title="Diagnostic Report" showBack={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-14 h-14 rounded-full bg-warning/10 items-center justify-center mb-4">
            <Ionicons name="document-outline" size={28} color="#B06000" />
          </View>
          <Text className="text-sm font-bold text-text dark:text-text-dark text-center">
            No Analysis Results
          </Text>
          <Text className="text-xs text-subText dark:text-subText-dark text-center mt-2 max-w-[260px] leading-5">
            No scan data found. Please upload an MRI image first.
          </Text>
          <Pressable
            onPress={() => router.replace('/upload')}
            className="mt-6 bg-primary dark:bg-primary-dark px-5 py-2.5 rounded-xl shadow-md"
          >
            <Text className="text-xs font-bold text-white dark:text-background-dark">Upload MRI Scan</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const isTumorDetected = prediction.detection_flag;
  const stats = prediction.stats || {};
  const inferenceTime = stats.inference_time || undefined;
  const perClass = prediction.per_class_counts || {};

  const clinicalReport = reportFormatter.generateReport(prediction);

  const bgCount = perClass.background || 0;
  const necroticCount = perClass.necrotic_core || 0;
  const edemaCount = perClass.edema || 0;
  const enhancingCount = perClass.enhancing_tumor || 0;
  const totalPixels = bgCount + necroticCount + edemaCount || 1;

  const overlaySourceUri = prediction.overlay_image?.startsWith('data:')
    ? prediction.overlay_image
    : prediction.overlay_image
      ? `data:image/png;base64,${prediction.overlay_image}`
      : null;

  const maskSourceUri = prediction.raw_mask?.startsWith('data:')
    ? prediction.raw_mask
    : prediction.raw_mask
      ? `data:image/png;base64,${prediction.raw_mask}`
      : null;

  const legendItems: LegendItem[] = [
    { label: 'Background (BG)', color: isDark ? '#374151' : '#E5E7EB', count: bgCount },
    { label: 'Necrotic Core (NCR)', color: '#DC2626', count: necroticCount },
    { label: 'Peritumoral Edema (ED)', color: '#D97706', count: edemaCount },
    { label: 'Enhancing Tumor (ET)', color: '#2563EB', count: enhancingCount },
  ];

  const handleSaveReport = async () => {
    setIsSaving(true);
    try {
      const patientName = params.fileName?.trim() || (currentScan?.id ? `Scan ${currentScan.id.slice(-4)}` : 'Unknown Patient');
      const patientAge = params.patientAge ? parseInt(params.patientAge, 10) : undefined;
      const patientGender = (params.patientGender as 'male' | 'female' | 'other') || undefined;
      const reportData: import('../types/report').Report = {
        id: `REP-${Date.now()}`,
        patientName,
        patientId: `PID-${Date.now().toString(36).toUpperCase()}`,
        patientAge,
        patientGender,
        originalImageUri: permanentImageUri || localImageUri || '',
        overlayImageUri: overlaySourceUri || '',
        maskImageUri: maskSourceUri || undefined,
        tumorStats: {
          tumor_area: prediction.tumor_area,
          per_class_counts: perClass,
          inference_time: inferenceTime,
          timestamp: stats.timestamp,
        },
        tumorDetected: isTumorDetected,
        timestamp: stats.timestamp || new Date().toISOString(),
        favorite: false,
        syncStatus: 'pending',
        modelUsed: clinicalReport.modelUsed,
      };
      await reportService.create(reportData);
      await syncQueueService.add('insert_report', reportData);
      notificationService.scheduleReportSavedNotification(reportData.patientName);
      Alert.alert(
        'Report Saved',
        'The diagnostic report has been saved to the local database. It will sync when connectivity is restored.',
        [{ text: 'Dismiss' }]
      );
    } catch (err: any) {
      Alert.alert('Save Failed', 'Unable to save report: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const buildTempReport = () => ({
    id: `temp_${Date.now()}`,
    patientName: params.fileName?.trim() || (currentScan?.id ? `Scan ${currentScan.id.slice(-4)}` : 'Unknown Patient'),
    patientId: `PID-${Date.now().toString(36).toUpperCase()}`,
    patientAge: params.patientAge ? parseInt(params.patientAge, 10) : undefined,
    patientGender: (params.patientGender as 'male' | 'female' | 'other') || undefined,
    originalImageUri: permanentImageUri || localImageUri || '',
    overlayImageUri: overlaySourceUri || '',
    maskImageUri: maskSourceUri || undefined,
    tumorStats: {
      tumor_area: prediction.tumor_area,
      per_class_counts: perClass,
      inference_time: inferenceTime,
      timestamp: stats.timestamp,
    },
    tumorDetected: isTumorDetected,
    timestamp: stats.timestamp || new Date().toISOString(),
    favorite: false,
    modelUsed: clinicalReport.modelUsed,
  });

  const handleShareReport = async () => {
    setShowExport(true);
  };

  const handleExportPdf = async () => {
    setShowExport(true);
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Diagnostic Report"
        subtitle="Radiology AI Analysis Console"
        showBack={true}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
      >
        <Animated.View
          entering={FadeInUp.duration(400)}
          className={`${isTablet ? 'mx-12' : 'mx-5'} mb-4 p-4 rounded-2xl border flex-row items-center gap-3.5 ${
            isTumorDetected
              ? 'bg-danger/5 border-danger/20 dark:bg-danger/10'
              : 'bg-success/5 border-success/20 dark:bg-success/10'
          }`}
        >
          <View className={`w-10 h-10 rounded-full items-center justify-center ${
            isTumorDetected ? 'bg-danger/10' : 'bg-success/10'
          }`}>
            <Ionicons
              name={isTumorDetected ? 'alert-circle' : 'checkmark-circle'}
              size={24}
              color={isTumorDetected ? '#C5221F' : '#137333'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-widest font-mono">
              AI CLASSIFICATION STATUS
            </Text>
            <Text className={`text-base font-bold ${isTumorDetected ? 'text-danger' : 'text-success'}`}>
              {isTumorDetected ? 'Tumor Anomaly Detected' : 'Healthy Slice - Clear'}
            </Text>
            <Text className="text-[10px] text-subText dark:text-subText-dark leading-3.5 mt-0.5">
              {isTumorDetected
                ? 'Model identified localized voxel clustering matching tumor morphology.'
                : 'No significant tumor tissues matched the volumetric threshold limits.'}
            </Text>

            <View className="flex-row items-center gap-4 mt-2 pt-2 border-t border-border/10 dark:border-border-dark/10">
              <View className="flex-row items-center gap-1">
                <Ionicons name="shield-checkmark-outline" size={12} color={isDark ? '#A8C7FA' : '#0B57D0'} />
                <Text className="text-[10px] font-bold text-text dark:text-text-dark font-mono">
                  {formatConfidence(clinicalReport.confidence)}
                </Text>
              </View>
              {inferenceTime !== undefined && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="timer-outline" size={12} color={isDark ? '#A8C7FA' : '#0B57D0'} />
                  <Text className="text-[10px] font-bold text-text dark:text-text-dark font-mono">
                    {inferenceTime.toFixed(2)}s
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        <View className={`${isTablet ? 'mx-12' : 'mx-5'} mb-3`}>
          <MriViewer
            originalUri={localImageUri}
            overlayUri={overlaySourceUri}
            maskUri={maskSourceUri}
            overlayOpacity={overlayOpacity}
          />
        </View>

        {overlaySourceUri && (
          <View className={`${isTablet ? 'mx-12' : 'mx-5'} mb-4`}>
            <OpacitySlider value={overlayOpacity} onValueChange={setOverlayOpacity} />
          </View>
        )}

        <View className={`${isTablet ? 'mx-12' : 'mx-5'} mb-4`}>
          <Legend items={legendItems} totalPixels={totalPixels} />
        </View>

        <View className={`${isTablet ? 'mx-12' : 'mx-5'} mb-5`}>
          <ReportGenerator
            tumorAreaPercent={prediction.tumor_area}
            perClassCounts={perClass}
            confidence={clinicalReport.confidence}
            modelVersion={clinicalReport.modelUsed}
            scanDate={stats.timestamp || new Date().toISOString()}
            tumorDetected={isTumorDetected}
            inferenceTime={inferenceTime}
            isSaving={isSaving}
            onSave={handleSaveReport}
            onShare={handleShareReport}
            onExportPdf={handleExportPdf}
          />
        </View>

        <Animated.View
          entering={FadeInUp.delay(250).duration(400)}
          className={`${isTablet ? 'mx-12' : 'mx-5'} gap-3`}
        >
          <Pressable
            onPress={() => router.push('/(tabs)/reports')}
            className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          >
            <Ionicons name="folder-open-outline" size={16} color={isDark ? '#E3E3E3' : '#1F2023'} />
            <Text className="text-xs font-semibold text-text dark:text-text-dark">
              View History
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/upload')}
            className="w-full bg-primary dark:bg-primary-dark py-4 rounded-xl flex-row items-center justify-center gap-2 shadow-md shadow-primary/20 dark:shadow-black/40"
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          >
            <Ionicons name="refresh" size={16} color={isDark ? '#051E3C' : '#FFFFFF'} />
            <Text className="text-sm font-bold text-white dark:text-background-dark">
              Run Again
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {notif && <ResultNotificationCard config={notif} onDismiss={dismissNotif} />}

      <ExportActionSheet
        visible={showExport}
        onClose={() => setShowExport(false)}
        report={buildTempReport()}
        overlayBase64={overlaySourceUri}
        onExportComplete={(msg) => Alert.alert('Export Complete', msg)}
      />
    </ScreenContainer>
  );
}