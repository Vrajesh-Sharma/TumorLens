import React from 'react';
import { View, Image, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { ZoomIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface ImagePreviewProps {
  imageUri: string;
  onReplace: () => void;
  onRemove: () => void;
  onZoom: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ImagePreview({ imageUri, onReplace, onRemove, onZoom }: ImagePreviewProps) {
  const { colors, isDark } = useTheme();

  // Animation values for action buttons
  const scaleReplace = useSharedValue(1);
  const scaleRemove = useSharedValue(1);
  const scaleZoom = useSharedValue(1);

  return (
    <Animated.View
      entering={ZoomIn.duration(400)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 shadow-md items-center"
    >
      {/* Frame Container */}
      <View className="w-full h-72 rounded-xl bg-slate-900 border border-border/25 dark:border-border-dark/30 overflow-hidden relative justify-center items-center">
        <Image
          source={{ uri: imageUri }}
          className="w-full h-full"
          resizeMode="contain"
        />

        {/* Crosshair Overlay (Radiology theme visual) */}
        <View className="absolute inset-0 border border-dashed border-white/5 pointer-events-none" />
        <View className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-white/20 pointer-events-none" />
        <View className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-white/20 pointer-events-none" />
        
        {/* Badge Indicator */}
        <View className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 rounded-md">
          <Text className="text-[9px] font-bold text-white tracking-widest uppercase">
            Structural Scan Loaded
          </Text>
        </View>
      </View>

      {/* Button Controls */}
      <View className="flex-row w-full gap-2.5 mt-4">
        {/* Zoom Button */}
        <AnimatedPressable
          onPress={onZoom}
          onPressIn={() => { scaleZoom.value = withSpring(0.96); }}
          onPressOut={() => { scaleZoom.value = withSpring(1); }}
          style={useAnimatedStyle(() => ({ transform: [{ scale: scaleZoom.value }] }))}
          className="flex-1 bg-primaryContainer dark:bg-primaryContainer-dark border border-primary/10 dark:border-primary-dark/10 py-3 rounded-xl flex-row items-center justify-center gap-1.5"
        >
          <Ionicons name="expand-outline" size={16} color={isDark ? '#A8C7FA' : '#0B57D0'} />
          <Text className="text-xs font-bold text-primary dark:text-primary-dark">
            Zoom Scan
          </Text>
        </AnimatedPressable>

        {/* Replace Button */}
        <AnimatedPressable
          onPress={onReplace}
          onPressIn={() => { scaleReplace.value = withSpring(0.96); }}
          onPressOut={() => { scaleReplace.value = withSpring(1); }}
          style={useAnimatedStyle(() => ({ transform: [{ scale: scaleReplace.value }] }))}
          className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark py-3 rounded-xl flex-row items-center justify-center gap-1.5"
        >
          <Ionicons name="refresh-outline" size={16} color={isDark ? '#C4C7C5' : '#5F6368'} />
          <Text className="text-xs font-bold text-text dark:text-text-dark">
            Replace Scan
          </Text>
        </AnimatedPressable>

        {/* Remove Button */}
        <AnimatedPressable
          onPress={onRemove}
          onPressIn={() => { scaleRemove.value = withSpring(0.96); }}
          onPressOut={() => { scaleRemove.value = withSpring(1); }}
          style={useAnimatedStyle(() => ({ transform: [{ scale: scaleRemove.value }] }))}
          className="w-12 bg-danger/10 dark:bg-danger/15 border border-danger/25 dark:border-danger-dark/25 rounded-xl items-center justify-center"
        >
          <Ionicons name="trash-outline" size={16} color={isDark ? '#F28B82' : '#C5221F'} />
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

export default ImagePreview;
