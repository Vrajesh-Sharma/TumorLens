import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ReportStatistics } from '../../types/report';

interface StatisticsRowProps {
  stats: ReportStatistics;
}

export const StatisticsRow = React.memo(function StatisticsRow({ stats }: StatisticsRowProps) {
  const { colors, isDark } = useTheme();

  const Card = ({ label, count, icon, color, bg }: { label: string; count: number | string; icon: string; color: string; bg: string }) => (
    <View className={`flex-1 p-3.5 rounded-xl border border-border/20 dark:border-border-dark/20 ${bg} flex-row items-center gap-3 shadow-sm`}>
      <View className={`w-8 h-8 rounded-full items-center justify-center ${color}`}>
        <Ionicons name={icon as any} size={15} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <Text className="text-[9px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider truncate" numberOfLines={1}>{label}</Text>
        <Text className="text-sm font-bold text-text dark:text-text-dark mt-0.5">{count}</Text>
      </View>
    </View>
  );

  return (
    <View className="gap-2.5 mb-5">
      <View className="flex-row gap-2.5">
        <Card 
          label="Total Cases" 
          count={stats.totalCount} 
          icon="document-text-outline" 
          color="bg-primary dark:bg-primary"
          bg="bg-surface dark:bg-surface-dark"
        />
        <Card 
          label="Anomalies" 
          count={stats.tumorDetectedCount} 
          icon="alert-circle-outline" 
          color="bg-danger dark:bg-danger"
          bg="bg-danger/5 dark:bg-danger/10"
        />
      </View>
      <View className="flex-row gap-2.5">
        <Card 
          label="Healthy" 
          count={stats.healthyCount} 
          icon="checkmark-circle-outline" 
          color="bg-success dark:bg-success"
          bg="bg-success/5 dark:bg-success/10"
        />
        <Card 
          label="Avg Tumor" 
          count={`${stats.averageTumorArea}%`} 
          icon="pie-chart-outline" 
          color="bg-warning dark:bg-warning"
          bg="bg-surface dark:bg-surface-dark"
        />
      </View>
    </View>
  );
});

export default StatisticsRow;
