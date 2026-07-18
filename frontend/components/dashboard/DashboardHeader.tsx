import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SyncIndicator } from '../offline/OfflineUI';

interface DashboardHeaderProps {
  doctorName?: string;
  subtitle?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  hasNotifications?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function DashboardHeader({
  doctorName = 'Dr. Sarah Johnson',
  subtitle = 'Doctor Dashboard',
  onNotificationPress,
  onProfilePress,
  hasNotifications = true,
}: DashboardHeaderProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const initials = getInitials(doctorName);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className={`flex-row items-center justify-between ${isTablet ? 'px-12' : 'px-5'} py-4 bg-surface dark:bg-surface-dark border-b border-border/40 dark:border-border-dark/40`}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-xl bg-primary dark:bg-primary-dark items-center justify-center shadow-md shadow-primary/20 dark:shadow-primary-dark/20">
          <Ionicons name="pulse" size={20} color={isDark ? '#051E3C' : '#FFFFFF'} />
        </View>
        <View>
          <Text className="text-lg font-bold text-text dark:text-text-dark tracking-tight leading-none">
            TumorLens
          </Text>
          <Text className="text-[10px] font-semibold text-primary dark:text-primary-dark uppercase tracking-widest mt-0.5">
            {subtitle}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <SyncIndicator />

        <Pressable
          onPress={onNotificationPress}
          className="relative w-9 h-9 rounded-full bg-background dark:bg-background-dark items-center justify-center border border-border/40 dark:border-border-dark/40"
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={isDark ? colors.text : '#1F2023'}
          />
          {hasNotifications && (
            <View className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-danger border border-surface dark:border-surface-dark" />
          )}
        </Pressable>

        <Pressable
          onPress={onProfilePress}
          className="w-9 h-9 rounded-full bg-primaryContainer dark:bg-primaryContainer-dark items-center justify-center border border-primary/20 dark:border-primary-dark/20 overflow-hidden"
          style={({ pressed }) => pressed && { opacity: 0.8 }}
        >
          <Text className="text-xs font-bold text-primary dark:text-onPrimaryContainer-dark">
            {initials}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default DashboardHeader;
