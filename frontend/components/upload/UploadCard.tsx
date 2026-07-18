import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface UploadCardProps {
  onGalleryPress: () => void;
  onCameraPress: () => void;
  onFilePickerPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function UploadCard({ onGalleryPress, onCameraPress, onFilePickerPress }: UploadCardProps) {
  const { colors, isDark } = useTheme();

  // Shared values for scale animations on buttons
  const galleryScale = useSharedValue(1);
  const cameraScale = useSharedValue(1);
  const fileScale = useSharedValue(1);

  const galleryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: galleryScale.value }],
  }));

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cameraScale.value }],
  }));

  const fileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fileScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-6 items-center shadow-sm"
    >
      {/* Upload Illustration Container */}
      <View className="w-20 h-20 rounded-full bg-primary/5 dark:bg-primary-dark/5 items-center justify-center mb-5 border border-primary/10 dark:border-primary-dark/10 relative">
        <View className="absolute inset-1 rounded-full border border-dashed border-primary/20 dark:border-primary-dark/20" />
        <Ionicons name="cloud-upload-outline" size={36} color={isDark ? '#A8C7FA' : '#0B57D0'} />
      </View>

      {/* Texts */}
      <Text className="text-base font-bold text-text dark:text-text-dark text-center">
        Select MRI Scan
      </Text>
      <Text className="text-xs text-subText dark:text-subText-dark text-center mt-1.5 mb-6 px-4 leading-4">
        Choose a T2-weighted structural brain slice scan from your gallery or capture using the device camera.
      </Text>

      {/* Button Grid / List */}
      <View className="w-full gap-3">
        {/* Gallery button */}
        <AnimatedPressable
          onPress={onGalleryPress}
          onPressIn={() => { galleryScale.value = withSpring(0.97); }}
          onPressOut={() => { galleryScale.value = withSpring(1); }}
          style={galleryStyle}
          className="w-full bg-primary dark:bg-primary-dark py-3.5 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Ionicons name="images-outline" size={18} color={isDark ? '#051E3C' : '#FFFFFF'} />
          <Text className="text-sm font-semibold text-white dark:text-background-dark">
            Browse Gallery
          </Text>
        </AnimatedPressable>

        {/* Camera button */}
        <AnimatedPressable
          onPress={onCameraPress}
          onPressIn={() => { cameraScale.value = withSpring(0.97); }}
          onPressOut={() => { cameraScale.value = withSpring(1); }}
          style={cameraStyle}
          className="w-full bg-primaryContainer dark:bg-primaryContainer-dark border border-primary/10 dark:border-primary-dark/10 py-3.5 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Ionicons name="camera-outline" size={18} color={isDark ? '#A8C7FA' : '#0B57D0'} />
          <Text className="text-sm font-semibold text-primary dark:text-primary-dark">
            Use Device Camera
          </Text>
        </AnimatedPressable>

        {/* File Picker button */}
        {onFilePickerPress && (
          <AnimatedPressable
            onPress={onFilePickerPress}
            onPressIn={() => { fileScale.value = withSpring(0.97); }}
            onPressOut={() => { fileScale.value = withSpring(1); }}
            style={fileStyle}
            className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark py-3.5 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Ionicons name="folder-open-outline" size={18} color={isDark ? '#C4C7C5' : '#5F6368'} />
            <Text className="text-sm font-semibold text-text dark:text-text-dark">
              Choose File
            </Text>
          </AnimatedPressable>
        )}
      </View>
    </Animated.View>
  );
}

export default UploadCard;
