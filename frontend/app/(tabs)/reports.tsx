import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, Alert, FlatList, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { useTheme } from '../../theme';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';

// Custom components
import SearchBar from '../../components/reports/SearchBar';
import FilterChip from '../../components/reports/FilterChip';
import StatisticsRow from '../../components/reports/StatisticsRow';
import ReportCard from '../../components/reports/ReportCard';
import EmptyReports from '../../components/reports/EmptyReports';
import DeleteDialog from '../../components/reports/DeleteDialog';

// Hook & Services
import { useReports, ReportFilterType } from '../../hooks/useReports';
import { pdfExportService } from '../../services/pdfExport';
import { Report } from '../../types/report';

// Filter configurations
const FILTER_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'anomaly', label: 'Tumors' },
  { key: 'healthy', label: 'Healthy' },
  { key: 'high_tumor', label: 'High Area (≥5%)' },
  { key: 'recent', label: 'Recent (24h)' },
  { key: 'favorites', label: 'Starred' }
] as const;

// Skeleton Card loader
function SkeletonCard() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 750 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={animatedStyle}
      className="bg-surface dark:bg-surface-dark border border-border/30 dark:border-border-dark/30 rounded-2xl p-4 mb-4 flex-row gap-3"
    >
      <View className="w-16 h-16 rounded-xl bg-border/40 dark:bg-border-dark/40" />
      <View className="flex-1 justify-between py-1">
        <View className="h-3.5 bg-border/40 dark:bg-border-dark/40 rounded w-2/3" />
        <View className="h-2.5 bg-border/40 dark:bg-border-dark/40 rounded w-1/2" />
        <View className="h-3 bg-border/40 dark:bg-border-dark/40 rounded w-1/3 mt-2" />
      </View>
    </Animated.View>
  );
}

const ReportsScreen = React.memo(function ReportsScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  const {
    filteredReports,
    isLoading,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    deleteReport,
    toggleFavorite
  } = useReports();

  // Delete modal dialog state
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);

  // Handle report detail navigation
  const handleOpenReport = useCallback((reportId: string) => {
    router.push({
      pathname: '/report-details',
      params: { id: reportId }
    });
  }, []);

  // Handle report PDF sharing
  const handleShareReport = useCallback(async (report: Report) => {
    try {
      await pdfExportService.shareReportPdf(report);
    } catch (err: any) {
      Alert.alert('Sharing Failure', 'Unable to execute native document sharing. ' + err.message);
    }
  }, []);

  // Handle report deletion confirmation
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await deleteReport(deleteTarget.id);
      setDeleteTarget(null);
      Alert.alert('Record Deleted', 'The radiology case file has been successfully wiped from storage.');
    } catch (err: any) {
      Alert.alert('Deletion Failure', 'Could not delete record. ' + err.message);
    }
  }, [deleteTarget, deleteReport]);

  return (
    <ScreenContainer scrollable={false}>
      {/* PACS App Header */}
      <AppHeader 
        title="Diagnostic Records" 
        subtitle="PACS Volumetric case history files" 
      />

      <View className={`flex-1 ${isTablet ? 'px-12' : 'px-5'} pt-3`}>
        {/* Search Input */}
        <View className="mb-4">
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {/* Filter Chips Horizontal Scrolling */}
        <View className="mb-2">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row py-1"
          >
            {FILTER_CHIPS.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                selected={filter === chip.key}
                onPress={() => setFilter(chip.key as any)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Scrollable Main Content */}
        <FlatList
          data={isLoading ? [] : filteredReports}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 6 }}
          removeClippedSubviews={true}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={7}
          getItemLayout={(_data, index) => ({
            length: 140,
            offset: 140 * index,
            index,
          })}
          ListHeaderComponent={
            // Show statistics row at the top
            <StatisticsRow stats={stats} />
          }
          ListEmptyComponent={
            isLoading ? (
              <View>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : (
              <EmptyReports 
                type={searchQuery ? 'search' : filter === 'favorites' ? 'favorites' : 'reports'} 
                query={searchQuery}
              />
            )
          }
          renderItem={({ item, index }) => (
            <ReportCard
              report={item}
              index={index}
              onOpen={() => handleOpenReport(item.id)}
              onFavorite={() => toggleFavorite(item.id)}
              onShare={() => handleShareReport(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
        />
      </View>

      {/* Delete Dialog Confirmation */}
      <DeleteDialog
        visible={deleteTarget !== null}
        patientName={deleteTarget?.patientName || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </ScreenContainer>
  );
});

export default ReportsScreen;
