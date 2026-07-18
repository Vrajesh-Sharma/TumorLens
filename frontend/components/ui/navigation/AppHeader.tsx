import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { HeadingMedium, Caption } from '../typography/Typography';
import { IconButton } from '../buttons/Buttons';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  showNotification?: boolean;
  onNotificationPress?: () => void;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  showNotification = false,
  onNotificationPress,
}: AppHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark">
      <View className="flex-row items-center gap-3">
        {showBack && (
          <IconButton
            iconName="arrow-back"
            onPress={() => router.back()}
            className="border-0 bg-transparent p-1"
          />
        )}
        <View>
          <HeadingMedium className="font-bold text-text dark:text-text-dark">{title}</HeadingMedium>
          {subtitle && (
            <Caption className="text-subText dark:text-subText-dark mt-0.5">{subtitle}</Caption>
          )}
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {rightAction}
        {showNotification && (
          <IconButton
            iconName="notifications-outline"
            onPress={onNotificationPress}
            className="border-0 bg-transparent p-1"
          />
        )}
      </View>
    </View>
  );
}
export default AppHeader;
