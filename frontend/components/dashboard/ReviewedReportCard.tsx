import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../theme';

export interface ReviewedReport {
  id: string;
  patientName: string;
  reportId: string;
  reviewedDate: string;
  finding: 'positive' | 'negative' | 'uncertain';
  findingSummary: string;
}

interface ReviewedReportCardProps {
  report: ReviewedReport;
  onPressView?: (id: string) => void;
  delayIndex?: number;
}

export function ReviewedReportCard({
  report,
  onPressView,
  delayIndex = 0,
}: ReviewedReportCardProps) {
  const { isDark } = useTheme();

  const getFindingConfig = () => {
    switch (report.finding) {
      case 'positive':
        return {
          icon: 'warning-outline' as const,
          label: 'Anomaly Detected',
          bgColor: isDark ? 'bg-danger/15' : 'bg-danger/10',
          textColor: isDark ? 'text-danger-dark' : 'text-danger',
        };
      case 'negative':
        return {
          icon: 'checkmark-circle-outline' as const,
          label: 'Normal',
          bgColor: isDark ? 'bg-success/15' : 'bg-success/10',
          textColor: isDark ? 'text-success-dark' : 'text-success',
        };
      case 'uncertain':
        return {
          icon: 'help-circle-outline' as const,
          label: 'Needs Follow-up',
          bgColor: isDark ? 'bg-warning/15' : 'bg-warning/10',
          textColor: isDark ? 'text-warning-dark' : 'text-warning',
        };
    }
  };

  const findingConfig = getFindingConfig();

  return (
    <Animated.View
      entering={FadeInRight.delay(400 + delayIndex * 80).duration(400)}
      className="w-[260px] bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 mr-4 shadow-sm"
    >
      <View className="flex-row items-center gap-3 mb-3">
        <View className={`w-9 h-9 rounded-lg ${findingConfig.bgColor} items-center justify-center`}>
          <Ionicons name={findingConfig.icon} size={18} color={isDark ? '#F87171' : '#DC2626'} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-text dark:text-text-dark" numberOfLines={1}>
            {report.patientName}
          </Text>
          <Text className="text-[10px] text-subText dark:text-subText-dark mt-0.5 font-semibold">
            {report.reportId}
          </Text>
        </View>
      </View>

      <View className={`px-2.5 py-1 rounded-full self-start mb-2.5 ${findingConfig.bgColor}`}>
        <Text className={`text-[9px] font-bold ${findingConfig.textColor}`}>
          {findingConfig.label}
        </Text>
      </View>

      <Text className="text-[11px] text-subText dark:text-subText-dark leading-4 mb-3" numberOfLines={2}>
        {report.findingSummary}
      </Text>

      <View className="flex-row items-center justify-between pt-2 border-t border-border/20 dark:border-border-dark/20 mb-3">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="checkmark-done-outline" size={12} color={isDark ? '#7A8A9A' : '#6B7280'} />
          <Text className="text-[10px] text-subText dark:text-subText-dark">
            Reviewed {report.reviewedDate}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => onPressView && onPressView(report.id)}
        className="w-full bg-primaryContainer dark:bg-primaryContainer-dark border border-primary/10 dark:border-primary-dark/10 py-2 rounded-xl flex-row items-center justify-center gap-1.5"
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <Text className="text-xs font-bold text-primary dark:text-primary-dark">
          View Report
        </Text>
        <Ionicons name="chevron-forward-outline" size={12} color={isDark ? '#A8C7FA' : '#0B57D0'} />
      </Pressable>
    </Animated.View>
  );
}

export default ReviewedReportCard;
