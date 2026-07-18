import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface UploadTipCardProps {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  delayIndex?: number;
}

export function UploadTipCard({ title, description, iconName, delayIndex = 0 }: UploadTipCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(300 + delayIndex * 50).duration(400)}
      className="bg-surface dark:bg-surface-dark border-l-4 border border-border/40 dark:border-border-dark/40 rounded-r-2xl rounded-l-md p-4 flex-row gap-3.5 mb-3 shadow-sm"
      style={{ borderLeftColor: isDark ? '#A8C7FA' : '#0B57D0' }}
    >
      {/* Icon Wrapper */}
      <View className="w-8 h-8 rounded-lg bg-background dark:bg-background-dark border border-border/20 dark:border-border-dark/20 items-center justify-center">
        <Ionicons name={iconName} size={16} color={isDark ? '#A8C7FA' : '#0B57D0'} />
      </View>

      {/* Texts */}
      <View className="flex-1 justify-center">
        <Text className="text-xs font-bold text-text dark:text-text-dark">
          {title}
        </Text>
        <Text className="text-[10px] text-subText dark:text-subText-dark mt-0.5 leading-3.5">
          {description}
        </Text>
      </View>
    </Animated.View>
  );
}

export default UploadTipCard;
