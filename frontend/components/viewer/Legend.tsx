import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';

export interface LegendItem {
  label: string;
  color: string;
  count?: number;
}

interface LegendProps {
  items: LegendItem[];
  totalPixels?: number;
}

export function Legend({ items, totalPixels }: LegendProps) {
  const { isDark } = useTheme();

  const getPercent = (count?: number) => {
    if (count === undefined || !totalPixels || totalPixels === 0) return '';
    return `${((count / totalPixels) * 100).toFixed(1)}%`;
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4"
    >
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary-dark/10 items-center justify-center">
          <Ionicons name="color-palette-outline" size={14} color={isDark ? '#A8C7FA' : '#0B57D0'} />
        </View>
        <Text className="text-xs font-bold text-text dark:text-text-dark">
          Segmentation Legend
        </Text>
      </View>

      <View className="gap-2">
        {items.map((item, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-1.5"
          >
            <View className="flex-row items-center gap-2.5 flex-1">
              <View
                className="w-4 h-4 rounded-md border border-border/20"
                style={{ backgroundColor: item.color }}
              />
              <Text className="text-xs text-text dark:text-text-dark font-medium" numberOfLines={1}>
                {item.label}
              </Text>
            </View>
            {item.count !== undefined && (
              <Text className="text-xs font-bold text-subText dark:text-subText-dark font-mono ml-2">
                {getPercent(item.count)}
              </Text>
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default Legend;
