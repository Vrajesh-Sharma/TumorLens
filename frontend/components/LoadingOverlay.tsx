import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useAppStore } from '../store/appStore';
import { Ionicons } from '@expo/vector-icons';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  const isLoading = useAppStore((state) => state.isLoading);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isLoading ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isLoading, opacity]);

  if (!isLoading) return null;

  return (
    <Animated.View
      style={{ opacity }}
      className="absolute inset-0 z-50 bg-black/50 items-center justify-center"
    >
      <View className="bg-surface dark:bg-surface-dark rounded-2xl px-8 py-6 items-center shadow-lg mx-8">
        <Ionicons name="sync-outline" size={32} color="#0B57D0" className="mb-3" />
        <Text className="text-base font-medium text-text dark:text-text-dark text-center">
          {message || 'Loading...'}
        </Text>
      </View>
    </Animated.View>
  );
}

export default LoadingOverlay;
