import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface StatCardProps {
  value: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  color?: string;
  delayIndex?: number;
}

export function StatCard({
  value,
  label,
  iconName,
  trend,
  trendType,
  color = '#0B57D0',
  delayIndex = 0,
}: StatCardProps) {
  const { isDark } = useTheme();

  // Get trend details
  const getTrendStyles = () => {
    switch (trendType) {
      case 'up':
        return {
          textColor: isDark ? 'text-success-dark' : 'text-success',
          bgColor: isDark ? 'bg-success/15' : 'bg-success/10',
          icon: 'arrow-up' as const,
        };
      case 'down':
        return {
          textColor: isDark ? 'text-warning-dark' : 'text-warning',
          bgColor: isDark ? 'bg-warning/15' : 'bg-warning/10',
          icon: 'arrow-down' as const,
        };
      case 'neutral':
      default:
        return {
          textColor: isDark ? 'text-subText-dark' : 'text-subText',
          bgColor: isDark ? 'bg-border-dark/30' : 'bg-border/50',
          icon: 'remove' as const,
        };
    }
  };

  const trendStyles = getTrendStyles();

  return (
    <Animated.View
      entering={FadeInUp.delay(350 + delayIndex * 50).duration(400)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 flex-1 shadow-sm"
    >
      {/* Icon + Trend Pill */}
      <View className="flex-row items-center justify-between mb-3">
        <View 
          className="w-8 h-8 rounded-lg items-center justify-center bg-background dark:bg-background-dark border border-border/30 dark:border-border-dark/30"
        >
          <Ionicons 
            name={iconName} 
            size={16} 
            color={isDark ? '#A8C7FA' : color} 
          />
        </View>
        
        {/* Trend Info */}
        <View className={`px-2 py-0.5 rounded-full flex-row items-center gap-0.5 ${trendStyles.bgColor}`}>
          <Ionicons name={trendStyles.icon} size={10} className={trendStyles.textColor} />
          <Text className={`text-[10px] font-bold ${trendStyles.textColor}`}>
            {trend.split(' ')[0]}
          </Text>
        </View>
      </View>

      {/* Metric Value */}
      <Text className="text-2xl font-bold text-text dark:text-text-dark tracking-tight">
        {value}
      </Text>

      {/* Label */}
      <Text className="text-xs text-subText dark:text-subText-dark mt-1 font-medium" numberOfLines={2}>
        {label}
      </Text>
      
      {/* Detailed Trend Text */}
      <Text className="text-[10px] text-subText/70 dark:text-subText-dark/50 mt-1.5 italic">
        {trend}
      </Text>
    </Animated.View>
  );
}

export default StatCard;
