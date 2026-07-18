import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { SelectedImage } from '../../services/imagePicker';
import { extractImageMetadata } from '../../utils/imageUtils';

interface ImageInfoCardProps {
  image: SelectedImage;
}

export function ImageInfoCard({ image }: ImageInfoCardProps) {
  const { isDark } = useTheme();
  const metadata = extractImageMetadata(image);

  // Helper row renderer
  const renderRow = (label: string, value: string, icon: keyof typeof Ionicons.glyphMap, isLast = false) => (
    <View 
      className={`flex-row items-center justify-between py-3 ${
        isLast ? '' : 'border-b border-border/25 dark:border-border-dark/25'
      }`}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={14} color={isDark ? '#C4C7C5' : '#5F6368'} />
        <Text className="text-xs text-subText dark:text-subText-dark font-medium">
          {label}
        </Text>
      </View>
      <Text className="text-xs font-bold text-text dark:text-text-dark text-right font-mono" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-5 shadow-sm"
    >
      {/* Card Header */}
      <View className="flex-row items-center gap-2 pb-3.5 border-b border-border/30 dark:border-border-dark/30 mb-1">
        <View className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary-dark/10 items-center justify-center">
          <Ionicons name="information-circle-outline" size={16} color={isDark ? '#A8C7FA' : '#0B57D0'} />
        </View>
        <Text className="text-sm font-bold text-text dark:text-text-dark">
          Scan File Specifications
        </Text>
      </View>

      {/* Metadata Attributes */}
      {renderRow('File Name', metadata.name, 'document-outline')}
      {renderRow('Format', metadata.type, 'cube-outline')}
      {renderRow('Dimensions', metadata.dimensions, 'resize-outline')}
      {renderRow('File Size', metadata.size, 'bar-chart-outline')}
      {renderRow('Acquisition Date', metadata.acquisitionTime, 'time-outline', true)}
    </Animated.View>
  );
}

export default ImageInfoCard;
