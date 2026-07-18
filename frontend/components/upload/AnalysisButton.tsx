import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface AnalysisButtonProps {
  onPress: () => void;
  disabled: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnalysisButton({ onPress, disabled }: AnalysisButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={animatedStyle}
      className={`w-full py-4 rounded-xl flex-row items-center justify-center gap-2.5 shadow-md ${
        disabled 
          ? 'bg-primary/40 dark:bg-primary-dark/20 opacity-60' 
          : 'bg-primary dark:bg-primary-dark shadow-primary/20 dark:shadow-black/40'
      }`}
    >
      <Ionicons 
        name="pulse" 
        size={18} 
        color={disabled ? (isDark ? '#A8C7FA' : '#FFFFFF') : (isDark ? '#051E3C' : '#FFFFFF')} 
        className={!disabled ? 'animate-pulse' : ''}
      />
      <Text 
        className={`text-sm font-semibold text-center ${
          disabled 
            ? 'text-white/60 dark:text-text-dark/40' 
            : 'text-white dark:text-background-dark font-bold'
        }`}
      >
        Analyze MRI Scan
      </Text>
    </AnimatedPressable>
  );
}

export default AnalysisButton;
