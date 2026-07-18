import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface HealthTipCardProps {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color?: string;
  delayIndex?: number;
}

export function HealthTipCard({
  title,
  description,
  iconName,
  color = '#0B57D0',
  delayIndex = 0,
}: HealthTipCardProps) {
  const { isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(500 + delayIndex * 50).duration(400)}
      className="mx-5 mb-3 bg-surface dark:bg-surface-dark border-l-4 border border-border/40 dark:border-border-dark/40 rounded-r-2xl rounded-l-md p-4 flex-row gap-3.5 shadow-sm"
      style={{ borderLeftColor: isDark ? '#A8C7FA' : color }}
    >
      {/* Icon */}
      <View 
        className="w-9 h-9 rounded-xl items-center justify-center bg-background dark:bg-background-dark border border-border/30 dark:border-border-dark/30"
      >
        <Ionicons 
          name={iconName} 
          size={18} 
          color={isDark ? '#A8C7FA' : color} 
        />
      </View>

      {/* Text Details */}
      <View className="flex-1 justify-center">
        <Text className="text-sm font-bold text-text dark:text-text-dark">
          {title}
        </Text>
        <Text className="text-xs text-subText dark:text-subText-dark mt-1 leading-4">
          {description}
        </Text>
      </View>
    </Animated.View>
  );
}

export default HealthTipCard;
