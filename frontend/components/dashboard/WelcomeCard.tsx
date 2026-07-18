import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeCardProps {
  doctorName?: string;
  subtitle?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function WelcomeCard({
  doctorName = 'Dr. Sarah Johnson',
  subtitle = 'AI-assisted Brain Tumor Segmentation',
}: WelcomeCardProps) {
  const { colors, isDark } = useTheme();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(400)}
      className="mx-5 my-4 overflow-hidden rounded-2xl bg-primary dark:bg-primaryContainer-dark shadow-lg shadow-primary/20 dark:shadow-black/40"
    >
      <View className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-white/10 dark:bg-primary-dark/5" />
      <View className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/5 dark:bg-primary-dark/5" />

      <View className="p-5 flex-col justify-between">
        <View className="flex-row items-center gap-1.5 mb-3 opacity-90">
          <Ionicons name="calendar-outline" size={14} color={isDark ? colors.text : '#FFFFFF'} />
          <Text className="text-xs font-semibold text-white/90 dark:text-text-dark/95">
            {formattedDate}
          </Text>
        </View>

        <View className="mb-2">
          <Text className="text-sm font-medium text-white/80 dark:text-subText-dark/80">
            {getGreeting()},
          </Text>
          <Text className="text-2xl font-bold text-white dark:text-primary-dark mt-0.5 tracking-tight">
            {doctorName}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mt-2 pt-3 border-t border-white/15 dark:border-border-dark/30">
          <View className="w-2 h-2 rounded-full bg-success-dark animate-pulse" />
          <Text className="text-xs font-medium text-white/90 dark:text-text-dark/90 flex-1">
            {subtitle}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default WelcomeCard;
