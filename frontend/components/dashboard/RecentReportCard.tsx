import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import type { ImageSourcePropType } from 'react-native';

interface RecentReportCardReport {
  id: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  analysisDate: string;
  tumorAreaMm2: number;
  tumorAreaPercentage: number;
  tumorDetected: boolean;
  predictionScore: number;
  status: 'Completed' | 'Pending' | 'Failed';
  imageUri: ImageSourcePropType | null;
}

interface RecentReportCardProps {
  report: RecentReportCardReport;
  onPressOpen?: (reportId: string) => void;
  delayIndex?: number;
}

export function RecentReportCard({
  report,
  onPressOpen,
  delayIndex = 0,
}: RecentReportCardProps) {
  const { colors, isDark } = useTheme();

  // Status tag styling
  const getStatusConfig = () => {
    if (report.status === 'Failed') {
      return {
        label: 'Scan Failed',
        bgColor: isDark ? 'bg-danger/15' : 'bg-danger/10',
        textColor: isDark ? 'text-danger-dark' : 'text-danger',
        borderColor: isDark ? 'border-danger-dark/20' : 'border-danger/20',
      };
    }
    if (report.status === 'Pending') {
      return {
        label: 'Processing',
        bgColor: isDark ? 'bg-warning/15' : 'bg-warning/10',
        textColor: isDark ? 'text-warning-dark' : 'text-warning',
        borderColor: isDark ? 'border-warning-dark/20' : 'border-warning/20',
      };
    }
    
    // Completed status depends on whether tumor is detected
    if (report.tumorDetected) {
      return {
        label: 'Anomaly Detected',
        bgColor: isDark ? 'bg-danger/15' : 'bg-danger/10',
        textColor: isDark ? 'text-danger-dark' : 'text-danger',
        borderColor: isDark ? 'border-danger-dark/20' : 'border-danger/20',
      };
    } else {
      return {
        label: 'No Anomaly',
        bgColor: isDark ? 'bg-success/15' : 'bg-success/10',
        textColor: isDark ? 'text-success-dark' : 'text-success',
        borderColor: isDark ? 'border-success-dark/20' : 'border-success/20',
      };
    }
  };

  const statusConfig = getStatusConfig();
  const genderAge = `${report.gender.charAt(0).toUpperCase()} / ${report.age}y`;

  return (
    <Animated.View
      entering={FadeInRight.delay(400 + delayIndex * 80).duration(400)}
      className="w-[280px] bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 mr-4 shadow-sm"
    >
      {/* Patient Demographics */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-bold text-text dark:text-text-dark" numberOfLines={1}>
            {report.patientName}
          </Text>
          <Text className="text-[10px] text-subText dark:text-subText-dark mt-0.5 font-semibold">
            {report.id} • {genderAge}
          </Text>
        </View>
        
        {/* Status Pill */}
        <View className={`px-2 py-0.5 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
          <Text className={`text-[9px] font-bold ${statusConfig.textColor}`}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Image Preview Area */}
      <View className="w-full h-28 rounded-xl bg-slate-900/5 dark:bg-slate-900/40 border border-border/20 dark:border-border-dark/20 overflow-hidden mb-3.5 items-center justify-center relative">
        {report.imageUri ? (
          <Image
            source={report.imageUri}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center justify-center">
            <Ionicons name="pulse" size={32} color={colors.border} />
            <Text className="text-xs text-subText mt-1">No MRI Preview</Text>
          </View>
        )}
        
        {/* Confidence Overlay */}
        {report.status === 'Completed' && (
          <View className="absolute bottom-1.5 right-1.5 bg-black/60 px-2 py-0.5 rounded-md">
            <Text className="text-[9px] font-bold text-white">
              AI: {(report.predictionScore).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      {/* Metrics & Date */}
      <View className="flex-row items-center justify-between pt-2 border-t border-border/20 dark:border-border-dark/20 mb-3">
        <View>
          <Text className="text-[9px] text-subText dark:text-subText-dark uppercase tracking-wider">
            Tumor Area
          </Text>
          <Text className="text-xs font-bold text-text dark:text-text-dark mt-0.5">
            {report.tumorDetected ? `${report.tumorAreaPercentage}% (${report.tumorAreaMm2.toFixed(1)} mm²)` : '0.0%'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[9px] text-subText dark:text-subText-dark uppercase tracking-wider">
            Analysis Date
          </Text>
          <Text className="text-xs font-medium text-subText dark:text-subText-dark mt-0.5">
            {new Date(report.analysisDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <Pressable
        onPress={() => onPressOpen && onPressOpen(report.id)}
        className="w-full bg-primaryContainer dark:bg-primaryContainer-dark border border-primary/10 dark:border-primary-dark/10 py-2 rounded-xl flex-row items-center justify-center gap-1.5"
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <Text className="text-xs font-bold text-primary dark:text-primary-dark">
          Open Case Report
        </Text>
        <Ionicons name="document-text-outline" size={12} color={isDark ? '#A8C7FA' : '#0B57D0'} />
      </Pressable>
    </Animated.View>
  );
}

export default RecentReportCard;
