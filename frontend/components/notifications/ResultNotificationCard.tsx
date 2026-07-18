import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface NotificationAction {
  label: string;
  onPress: () => void;
}

export interface NotificationConfig {
  type: 'critical' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  actions?: NotificationAction[];
  duration?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  onDismiss?: () => void;
}

interface Props {
  config: NotificationConfig;
  onDismiss: () => void;
}

const ICON_MAP: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  critical: { name: 'warning', color: '#C5221F', bg: '#FCE8E6' },
  success: { name: 'checkmark-circle', color: '#137333', bg: '#E6F4EA' },
  warning: { name: 'alert-circle', color: '#B06000', bg: '#FFEFC9' },
  info: { name: 'information-circle', color: '#0B57D0', bg: '#D3E3FD' },
};

const HAPTIC_MAP: Record<string, Haptics.ImpactFeedbackStyle> = {
  critical: Haptics.ImpactFeedbackStyle.Heavy,
  success: Haptics.ImpactFeedbackStyle.Light,
  warning: Haptics.ImpactFeedbackStyle.Medium,
  info: Haptics.ImpactFeedbackStyle.Light,
};

export default function ResultNotificationCard({ config, onDismiss }: Props) {
  const icon = ICON_MAP[config.type] || ICON_MAP.info;

  useEffect(() => {
    Haptics.impactAsync(HAPTIC_MAP[config.type] || Haptics.ImpactFeedbackStyle.Light);
  }, [config.type]);

  useEffect(() => {
    if (config.duration === 0) return;
    const timer = setTimeout(onDismiss, config.duration || 4000);
    return () => clearTimeout(timer);
  }, [config.duration, onDismiss]);

  return (
    <Animated.View
      entering={FadeInDown.duration(300).springify()}
      exiting={FadeOutUp.duration(200)}
      className="absolute top-0 left-0 right-0 z-50 px-4 pt-12"
    >
      <View className="bg-gray-900/95 rounded-2xl border border-white/10 shadow-lg">
        <View className="flex-row items-start gap-3 p-4">
          <View className={`w-10 h-10 rounded-full items-center justify-center`} style={{ backgroundColor: icon.bg }}>
            <Ionicons name={icon.name} size={22} color={icon.color} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-white">
              {config.title}
            </Text>
            <Text className="text-xs text-white/70 mt-0.5 leading-4">
              {config.message}
            </Text>
            {config.actions && config.actions.length > 0 && (
              <View className="flex-row gap-2 mt-3">
                {config.actions.map((action, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      action.onPress();
                      onDismiss();
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      idx === 0 ? 'bg-white/20' : 'bg-white/10'
                    }`}
                  >
                    <Text className="text-xs font-bold text-white">
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          <Pressable onPress={onDismiss} className="p-1">
            <Ionicons name="close" size={18} color="white" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
