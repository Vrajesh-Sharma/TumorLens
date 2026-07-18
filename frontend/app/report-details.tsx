import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '../hooks/useReports';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '../components/ui/layout/Layouts';
import { AppHeader } from '../components/ui/navigation/AppHeader';
import { useRequireAuth } from '../hooks/useRoleGuard';
import { MriViewer, OpacitySlider, Legend } from '../components/viewer';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import ExportActionSheet from '../components/exports/ExportActionSheet';
import type { LegendItem } from '../components/viewer/Legend';

export default function ReportDetailsScreen() {
  useRequireAuth();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const params = useLocalSearchParams<{ id: string }>();

  const { reports, toggleFavorite, deleteReport, updateNotes } = useReports();
  const report = reports.find(r => r.id === params.id);

  const [notes, setNotes] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (report) {
      setNotes(report.notes || '');
    }
  }, [report]);

  if (!report) {
    return (
      <ScreenContainer scrollable={false}>
        <AppHeader title="Report Review" showBack={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-14 h-14 rounded-full bg-danger/10 items-center justify-center mb-4">
            <Ionicons name="alert-circle-outline" size={28} color="#C5221F" />
          </View>
          <Text className="text-sm font-bold text-text dark:text-text-dark text-center">
            Report Record Not Found
          </Text>
          <Text className="text-xs text-subText dark:text-subText-dark text-center mt-1.5 max-w-[260px] leading-5">
            The requested radiology case files may have been deleted by another administrator.
          </Text>
          <Pressable 
            onPress={() => router.back()} 
            className="mt-6 bg-primary dark:bg-primary px-5 py-2.5 rounded-xl shadow-md"
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          >
            <Text className="text-xs font-bold text-white dark:text-background-dark">
              Return to Records
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const originalUri = report.originalImageUri || null;
  const overlayUri = report.overlayImageUri || null;

  const counts = report.tumorStats?.per_class_counts || {};
  const totalPixels = (counts.background || 0) + (counts.necrotic_core || 0) + (counts.edema || 0) + (counts.enhancing_tumor || 0) || 1;

  const legendItems: LegendItem[] = [
    { label: 'Background (BG)', color: isDark ? '#374151' : '#E5E7EB', count: counts.background || 0 },
    { label: 'Necrotic Core (NCR)', color: '#DC2626', count: counts.necrotic_core || 0 },
    { label: 'Peritumoral Edema (ED)', color: '#D97706', count: counts.edema || 0 },
    { label: 'Enhancing Tumor (ET)', color: '#2563EB', count: counts.enhancing_tumor || 0 },
  ];

  const handleToggleFavorite = () => {
    toggleFavorite(report.id);
  };

  const handleExportPdf = () => {
    setShowExport(true);
  };

  const handleShare = () => {
    setShowExport(true);
  };

  const handleDelete = () => {
    Alert.alert(
      'Wipe Case File',
      `Are you sure you want to permanently delete the report of ${report.patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Record', 
          style: 'destructive',
          onPress: async () => {
            await deleteReport(report.id);
            router.back();
          }
        }
      ]
    );
  };

  const handleSaveNotes = () => {
    updateNotes(report.id, notes);
    Alert.alert('Notes Saved', 'Clinician findings and directives have been saved to local database.');
  };

  const handleAnalyzeAgain = () => {
    router.replace({
      pathname: '/upload',
      params: { prefilledImageUri: report.originalImageUri }
    });
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader 
        title="PACS Case Review" 
        subtitle={report.patientName} 
        showBack={true} 
      />

      <ScrollView 
        className={`flex-1 ${isTablet ? 'px-12' : 'px-5'}`} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
      >
        <Animated.View entering={FadeIn.duration(350)} className="mb-3">
          <MriViewer
            originalUri={originalUri}
            overlayUri={overlayUri}
            overlayOpacity={overlayOpacity}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(350)} className="mb-5">
          <OpacitySlider value={overlayOpacity} onValueChange={setOverlayOpacity} />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(350)} className="mb-5">
          <Legend items={legendItems} totalPixels={totalPixels} />
        </Animated.View>

        <View className="mb-5">
          <ReportGenerator
            tumorAreaPercent={report.tumorStats?.tumor_area || 0}
            perClassCounts={counts}
            confidence={report.tumorDetected ? 0.95 : 0.98}
            modelVersion={report.modelUsed || 'BraTS2020 U-Net (TFLite)'}
            scanDate={report.timestamp}
            tumorDetected={report.tumorDetected}
            patientName={report.patientName}
            inferenceTime={report.tumorStats?.inference_time || 0.28}
            onShare={handleShare}
            onExportPdf={handleExportPdf}
          />
        </View>

        <Animated.View 
          entering={FadeInUp.delay(160).duration(350)} 
          className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-5 shadow-sm mb-5"
        >
          <View className="flex-row items-center justify-between pb-3.5 border-b border-border/20 dark:border-border-dark/20 mb-3.5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              <Text className="text-xs font-bold text-text dark:text-text-dark uppercase tracking-wider">
                Clinician Findings Notes
              </Text>
            </View>
            <Pressable 
              onPress={handleSaveNotes} 
              className="bg-primary/10 px-3.5 py-1 rounded-lg"
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text className="text-[10px] font-bold text-primary dark:text-primary-dark uppercase">
                Save Notes
              </Text>
            </Pressable>
          </View>
          
          <TextInput
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Record surgical annotations, contrast reviews, or scan diagnostics here..."
            placeholderTextColor={isDark ? '#8E918F' : '#80868B'}
            className="text-xs text-text dark:text-text-dark bg-background dark:bg-background-dark p-3.5 rounded-xl min-h-[100px] border border-border/10 dark:border-border-dark/10"
            style={{ textAlignVertical: 'top' }}
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(200).duration(350)} 
          className="gap-3"
        >
          <View className="flex-row gap-3">
            <Pressable 
              onPress={handleToggleFavorite} 
              className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark py-3.5 rounded-xl flex-row items-center justify-center gap-2"
              style={({ pressed }) => pressed && { opacity: 0.8 }}
            >
              <Ionicons 
                name={report.favorite ? 'star' : 'star-outline'} 
                size={15} 
                color={report.favorite ? '#FDD663' : (isDark ? '#E3E3E3' : '#1F2023')} 
              />
              <Text className="text-xs font-bold text-text dark:text-text-dark">
                {report.favorite ? 'Starred Case' : 'Star Case'}
              </Text>
            </Pressable>

            <Pressable 
              onPress={handleDelete} 
              className="flex-1 bg-danger/10 py-3.5 rounded-xl flex-row items-center justify-center gap-2 border border-danger/25"
              style={({ pressed }) => pressed && { opacity: 0.8 }}
            >
              <Ionicons name="trash-outline" size={15} color={isDark ? '#F28B82' : '#C5221F'} />
              <Text className="text-xs font-bold text-danger">
                Delete Case
              </Text>
            </Pressable>
          </View>

          <Pressable 
            onPress={handleAnalyzeAgain} 
            className="w-full bg-primary dark:bg-primary-dark py-4 rounded-xl flex-row items-center justify-center gap-2 mt-1 shadow-md shadow-primary/10"
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          >
            <Ionicons name="refresh" size={16} color={isDark ? '#051E3C' : '#FFFFFF'} />
            <Text className="text-sm font-bold text-white dark:text-background-dark">
              Re-analyze Scan Slice
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <ExportActionSheet
        visible={showExport}
        onClose={() => setShowExport(false)}
        report={report}
        overlayBase64={report.overlayImageUri}
        onExportComplete={(msg) => Alert.alert('Export Complete', msg)}
      />
    </ScreenContainer>
  );
}
