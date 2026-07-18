import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface PermissionCardProps {
  type: 'camera' | 'gallery';
  onRequestPermission: () => void;
}

export function PermissionCard({ type, onRequestPermission }: PermissionCardProps) {
  const { isDark } = useTheme();

  const isCamera = type === 'camera';
  const iconName = isCamera ? 'camera-outline' : 'images-outline';
  const title = isCamera ? 'Camera Access Required' : 'Photo Gallery Access Required';
  const description = isCamera
    ? 'TumorLens requires camera access to capture high-resolution physical MRI scans for volumetric segmentation.'
    : 'TumorLens requires gallery access to browse and upload structural MRI scans (PNG/JPEG) from your files.';

  return (
    <Animated.View
      entering={FadeInDown.duration(450)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-6 items-center shadow-sm"
    >
      {/* Icon frame */}
      <View className="w-16 h-16 rounded-full bg-warning/5 dark:bg-warning/10 items-center justify-center mb-4 border border-warning/25 dark:border-warning-dark/25">
        <Ionicons name={iconName} size={28} color={isDark ? '#FDD663' : '#B06000'} />
      </View>

      {/* Texts */}
      <Text className="text-sm font-bold text-text dark:text-text-dark text-center">
        {title}
      </Text>
      
      <Text className="text-xs text-subText dark:text-subText-dark text-center mt-1.5 mb-5 px-4 leading-4">
        {description}
      </Text>

      {/* CTA Button */}
      <Pressable
        onPress={onRequestPermission}
        className="w-full bg-primary dark:bg-primary-dark py-3 rounded-xl flex-row items-center justify-center gap-1.5"
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <Text className="text-xs font-bold text-white dark:text-background-dark">
          Grant Authorization
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default PermissionCard;
