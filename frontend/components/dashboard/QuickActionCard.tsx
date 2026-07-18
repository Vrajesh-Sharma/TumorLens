import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface QuickActionCardProps {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
  backgroundColor: string;
  delayIndex?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function QuickActionCard({
  title,
  description,
  iconName,
  onPress,
  color,
  backgroundColor,
  delayIndex = 0,
}: QuickActionCardProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  // Press micro-animations
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 250 });
  };

  return (
    <AnimatedPressable
      entering={FadeInUp.delay(200 + delayIndex * 50).duration(400)}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 flex-col justify-between shadow-sm"
    >
      {/* Icon Wrapper */}
      <View 
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: isDark ? `${backgroundColor}15` : backgroundColor }}
      >
        <Ionicons 
          name={iconName} 
          size={20} 
          color={isDark ? '#A8C7FA' : color} 
        />
      </View>

      {/* Title & Description */}
      <View>
        <Text className="text-sm font-bold text-text dark:text-text-dark tracking-tight">
          {title}
        </Text>
        <Text className="text-xs text-subText dark:text-subText-dark mt-1 leading-4" numberOfLines={2}>
          {description}
        </Text>
      </View>

      {/* Go Indicator */}
      <View className="flex-row justify-end mt-2">
        <Ionicons name="arrow-forward-outline" size={14} color={isDark ? '#C4C7C5' : '#5F6368'} />
      </View>
    </AnimatedPressable>
  );
}

export default QuickActionCard;
