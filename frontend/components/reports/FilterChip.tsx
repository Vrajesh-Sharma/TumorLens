import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FilterChip = React.memo(function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`px-4 py-2 rounded-full border mr-2 mb-2 flex-row items-center justify-center ${
        selected 
          ? 'bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark shadow-sm' 
          : 'bg-surface dark:bg-surface-dark border-border/70 dark:border-border-dark/70'
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text className={`text-xs font-bold ${
        selected ? 'text-white dark:text-background-dark' : 'text-subText dark:text-subText-dark'
      }`}>
        {label}
      </Text>
    </AnimatedPressable>
  );
});

export default FilterChip;
