import React from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { PerClassCounts } from '../../types/prediction';
import { formatConfidence, formatScanDate } from '../../utils';

interface ReportGeneratorProps {
  tumorAreaPercent: number;
  perClassCounts: PerClassCounts;
  confidence: number;
  modelVersion: string;
  device?: string;
  scanDate: string;
  tumorDetected: boolean;
  patientName?: string;
  inferenceTime?: number;
  isSaving?: boolean;
  onSave?: () => void;
  onShare?: () => void;
  onExportPdf?: () => void;
}

export function ReportGenerator({
  tumorAreaPercent,
  perClassCounts,
  confidence,
  modelVersion,
  device,
  scanDate,
  tumorDetected,
  patientName,
  inferenceTime,
  isSaving,
  onSave,
  onShare,
  onExportPdf,
}: ReportGeneratorProps) {
  const { colors, isDark } = useTheme();
  const deviceName = device || (Platform.OS === 'web' ? 'Web Browser' : `${Platform.OS === 'ios' ? 'iOS' : 'Android'} Device`);

  const total = (perClassCounts.background || 0) + (perClassCounts.necrotic_core || 0) + (perClassCounts.edema || 0) + (perClassCounts.enhancing_tumor || 0) || 1;
  const getPercent = (count: number) => ((count / total) * 100).toFixed(2);

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl shadow-sm overflow-hidden"
    >
      <View className="px-5 pt-5 pb-3.5 border-b border-border/20 dark:border-border-dark/20">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary-dark/10 items-center justify-center">
              <Ionicons name="document-text-outline" size={14} color={colors.primary} />
            </View>
            <Text className="text-xs font-bold text-text dark:text-text-dark uppercase tracking-wider">
              AI Diagnostic Report
            </Text>
          </View>
          <View className={`px-2.5 py-0.5 rounded-full ${tumorDetected ? 'bg-danger/10' : 'bg-success/10'}`}>
            <Text className={`text-[10px] font-bold ${tumorDetected ? 'text-danger' : 'text-success'}`}>
              {tumorDetected ? 'Anomaly Detected' : 'Healthy Slice'}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-5 py-4 gap-3.5">
        {tumorDetected && (
          <View className="flex-row justify-between items-center pb-3 border-b border-border/10 dark:border-border-dark/10">
            <Text className="text-xs text-subText dark:text-subText-dark">Tumor Area</Text>
            <Text className="text-xs font-bold text-text dark:text-text-dark font-mono">{tumorAreaPercent.toFixed(2)}%</Text>
          </View>
        )}

        <View className="gap-2.5 pb-3 border-b border-border/10 dark:border-border-dark/10">
          <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider">Tissue Classification</Text>

          {[
            { label: 'Peritumoral Edema (ED)', color: '#D97706', key: 'edema' as const },
            { label: 'Necrotic Core (NCR)', color: '#DC2626', key: 'necrotic_core' as const },
            { label: 'Enhancing Tumor (ET)', color: '#2563EB', key: 'enhancing_tumor' as const },
            { label: 'Background (BG)', color: isDark ? '#374151' : '#E5E7EB', key: 'background' as const },
          ].map(({ label, color, key }) => (
            <View key={key} className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <Text className="text-xs text-text dark:text-text-dark">{label}</Text>
              </View>
              <Text className="text-xs font-bold text-text dark:text-text-dark font-mono">{getPercent(perClassCounts[key] || 0)}%</Text>
            </View>
          ))}
        </View>

        <View className="gap-2.5 pb-3 border-b border-border/10 dark:border-border-dark/10">
          <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider">Model Telemetry</Text>

          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-subText dark:text-subText-dark">Confidence Score</Text>
            <Text className="text-xs font-bold text-text dark:text-text-dark font-mono">{formatConfidence(confidence)}</Text>
          </View>

          {inferenceTime !== undefined && (
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-subText dark:text-subText-dark">Inference Time</Text>
              <Text className="text-xs font-bold text-text dark:text-text-dark font-mono">{inferenceTime.toFixed(3)}s</Text>
            </View>
          )}

          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-subText dark:text-subText-dark">Model Version</Text>
            <Text className="text-xs font-bold text-primary dark:text-primary-dark">{modelVersion}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-subText dark:text-subText-dark">Device</Text>
            <Text className="text-xs font-bold text-text dark:text-text-dark font-mono text-right flex-1 ml-2" numberOfLines={1}>{deviceName}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-subText dark:text-subText-dark">Scan Date</Text>
            <Text className="text-xs font-bold text-text dark:text-text-dark font-mono">{formatScanDate(scanDate)}</Text>
          </View>
        </View>

        {patientName && (
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-subText dark:text-subText-dark">Patient</Text>
            <Text className="text-xs font-bold text-text dark:text-text-dark">{patientName}</Text>
          </View>
        )}
      </View>

      {onSave || onShare || onExportPdf ? (
        <View className="px-5 pb-5 pt-2 gap-2.5">
          {onSave && (
            <Pressable
              onPress={onSave}
              disabled={isSaving}
              className="w-full bg-primary dark:bg-primary-dark py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-md shadow-primary/20"
              style={({ pressed }) => pressed && !isSaving && { opacity: 0.8 }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={isDark ? '#051E3C' : '#FFFFFF'} />
              ) : (
                <Ionicons name="save-outline" size={16} color={isDark ? '#051E3C' : '#FFFFFF'} />
              )}
              <Text className="text-sm font-bold text-white dark:text-background-dark">
                {isSaving ? 'Saving...' : 'Save Report'}
              </Text>
            </Pressable>
          )}

          <View className="flex-row gap-2.5">
            {onShare && (
              <Pressable
                onPress={onShare}
                className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark py-3 rounded-xl flex-row items-center justify-center gap-2"
                style={({ pressed }) => pressed && { opacity: 0.8 }}
              >
                <Ionicons name="share-social-outline" size={15} color={isDark ? '#E3E3E3' : '#1F2023'} />
                <Text className="text-xs font-bold text-text dark:text-text-dark">Share</Text>
              </Pressable>
            )}

            {onExportPdf && (
              <Pressable
                onPress={onExportPdf}
                className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark py-3 rounded-xl flex-row items-center justify-center gap-2"
                style={({ pressed }) => pressed && { opacity: 0.8 }}
              >
                <Ionicons name="document-outline" size={15} color={isDark ? '#E3E3E3' : '#1F2023'} />
                <Text className="text-xs font-bold text-text dark:text-text-dark">Export PDF</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}

export default ReportGenerator;
