import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Report } from '../../types/report';

interface ReportCardProps {
  report: Report;
  index: number;
  onOpen: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export function ReportCard({ report, index, onOpen, onFavorite, onShare, onDelete }: ReportCardProps) {
  const { colors, isDark } = useTheme();

  const isAnomaly = report.tumorDetected;
  const dateStr = new Date(report.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getOriginalSource = (): { uri: string } | null => {
    if (report.originalImageUri) {
      return { uri: report.originalImageUri };
    }
    return null;
  };

  const getOverlaySource = (): { uri: string } | null => {
    if (report.overlayImageUri) {
      return { uri: report.overlayImageUri };
    }
    return null;
  };

  const imageSource = isAnomaly ? getOverlaySource() : getOriginalSource();

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(350)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 mb-4 shadow-sm"
    >
      <View className="flex-row gap-3">
        {/* MRI Image Thumbnail Frame */}
        <View className="w-16 h-16 rounded-xl bg-slate-950 border border-border/10 dark:border-border-dark/10 overflow-hidden relative">
          {imageSource ? (
            <Image 
              source={imageSource} 
              className="w-full h-full" 
              resizeMode="cover" 
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-slate-900">
              <Ionicons name="image-outline" size={20} color="#4A4F5A" />
            </View>
          )}
          <View className="absolute bottom-0.5 right-0.5 bg-black/60 px-1 rounded">
            <Text className="text-[6px] font-mono font-bold text-white uppercase">
              {isAnomaly ? 'Overlay' : 'Original'}
            </Text>
          </View>
        </View>

        {/* Info Column */}
        <View className="flex-1 justify-between">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-1">
              <Text className="text-xs font-bold text-text dark:text-text-dark truncate" numberOfLines={1}>
                {report.patientName}
              </Text>
              <Text className="text-[9px] text-subText dark:text-subText-dark mt-0.5">
                ID: {report.id} • {report.patientAge || 'N/A'}y / {report.patientGender || 'N/A'}
              </Text>
            </View>

            {/* Favorite & Delete Actions */}
            <View className="flex-row items-center gap-1.5">
              <Pressable
                onPress={onFavorite}
                className="p-1"
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Ionicons 
                  name={report.favorite ? 'star' : 'star-outline'} 
                  size={16} 
                  color={report.favorite ? '#FDD663' : (isDark ? '#8E918F' : '#80868B')} 
                />
              </Pressable>
              <Pressable
                onPress={onDelete}
                className="p-1"
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Ionicons name="trash-outline" size={15} color={isDark ? '#F28B82' : '#C5221F'} />
              </Pressable>
            </View>
          </View>

          {/* Bottom telemetry indicators */}
          <View className="flex-row justify-between items-end mt-2">
            <View>
              <View className="flex-row items-center gap-1">
                <View className={`w-2 h-2 rounded-full ${isAnomaly ? 'bg-danger' : 'bg-success'}`} />
                <Text className={`text-[10px] font-bold ${isAnomaly ? 'text-danger' : 'text-success'}`}>
                  {isAnomaly ? `${report.tumorStats?.tumor_area || 0}% Area` : 'Healthy Slice'}
                </Text>
              </View>
              <Text className="text-[8px] text-subText dark:text-subText-dark font-mono mt-0.5">
                {dateStr}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Pressable
                onPress={onShare}
                className="w-7 h-7 rounded-lg border border-border dark:border-border-dark items-center justify-center bg-surface dark:bg-surface-dark"
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Ionicons name="share-social-outline" size={12} color={isDark ? '#E3E3E3' : '#1F2023'} />
              </Pressable>
              
              <Pressable
                onPress={onOpen}
                className="bg-primary dark:bg-primary px-3 py-1.5 rounded-lg flex-row items-center gap-1"
                style={({ pressed }) => pressed && { opacity: 0.8 }}
              >
                <Text className="text-[9px] font-bold text-white dark:text-background-dark uppercase">
                  Open
                </Text>
                <Ionicons name="chevron-forward" size={10} color={isDark ? '#051E3C' : '#FFFFFF'} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default ReportCard;
