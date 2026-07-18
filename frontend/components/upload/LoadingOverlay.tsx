import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Modal, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface LoadingOverlayProps {
  visible: boolean;
  progress: number;
  onCancel: () => void;
}

const MESSAGES = [
  'Preprocessing image slices...',
  'Normalizing pixel intensities...',
  'Running BraTS2020 U-Net model...',
  'Segmenting active tumor sub-regions...',
  'Calculating volumetric statistics...',
  'Generating diagnostic summary...',
  'Finalizing report parameters...',
];

export function LoadingOverlay({ visible, progress, onCancel }: LoadingOverlayProps) {
  const { isDark } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1000); // Rotate messages every 1 second

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const currentMessage = progress < 100
    ? `${MESSAGES[Math.min(Math.floor(progress / 15), MESSAGES.length - 1)]} (${progress}%)`
    : MESSAGES[messageIndex];

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        className="flex-1 bg-background/90 dark:bg-background-dark/95 items-center justify-center px-6"
      >
        <View className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 p-8 rounded-2xl shadow-xl items-center max-w-[320px] w-full">
          {/* Spinner Loader */}
          <View className="mb-6 relative justify-center items-center">
            <ActivityIndicator size="large" color={isDark ? '#A8C7FA' : '#0B57D0'} />
          </View>

          {/* Title */}
          <Text className="text-base font-bold text-text dark:text-text-dark text-center">
            AI Segmentation Engine
          </Text>

          {/* Changing Subtitle messages */}
          <View className="h-10 justify-center mt-2.5">
            <Text className="text-xs text-subText dark:text-subText-dark text-center font-medium font-mono leading-4">
              {currentMessage}
            </Text>
          </View>

          {/* Progress bar */}
          <View className="w-full h-1.5 bg-border/30 dark:bg-border-dark/30 rounded-full mt-5 overflow-hidden">
            <View 
              className="h-full bg-primary dark:bg-primary-dark rounded-full" 
              style={{
                width: `${progress}%`
              }}
            />
          </View>

          {/* Cancel button */}
          <Pressable
            onPress={onCancel}
            className="mt-6 flex-row items-center gap-1.5 border border-border dark:border-border-dark px-4 py-2 rounded-xl"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Ionicons name="close" size={14} color={isDark ? '#C4C7C5' : '#5F6368'} />
            <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase">
              Cancel Analysis
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

export default LoadingOverlay;
