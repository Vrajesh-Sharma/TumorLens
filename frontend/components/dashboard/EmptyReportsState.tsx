import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { PrimaryButton } from '../ui/buttons/Buttons';

interface EmptyReportsStateProps {
  onUploadPress?: () => void;
}

export function EmptyReportsState({ onUploadPress }: EmptyReportsStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="mx-5 p-6 rounded-2xl border border-dashed border-border/65 dark:border-border-dark/60 items-center justify-center bg-surface/30 dark:bg-surface-dark/10"
    >
      {/* Icon Frame */}
      <View className="w-16 h-16 rounded-full bg-background dark:bg-background-dark items-center justify-center mb-4 border border-border/20 dark:border-border-dark/20 relative">
        <View className="absolute inset-2 rounded-full border border-dashed border-primary/20 dark:border-primary-dark/20 animate-spin" />
        <Ionicons name="document-text-outline" size={28} color={isDark ? '#A8C7FA' : '#0B57D0'} />
      </View>

      {/* Texts */}
      <Text className="text-sm font-bold text-text dark:text-text-dark text-center">
        No reports available
      </Text>
      
      <Text className="text-xs text-subText dark:text-subText-dark text-center mt-1.5 mb-5 px-6 leading-4">
        Upload your first MRI scan file to begin AI-powered brain tumor segmentations.
      </Text>

      {/* Button */}
      {onUploadPress && (
        <PrimaryButton
          title="Upload First MRI Scan"
          iconName="cloud-upload-outline"
          onPress={onUploadPress}
          className="w-full max-w-[220px] py-2.5 rounded-xl"
        />
      )}
    </Animated.View>
  );
}

export default EmptyReportsState;
