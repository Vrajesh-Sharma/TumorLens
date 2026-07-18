import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  onRightPress?: () => void;
  delay?: number;
}

export function SectionTitle({
  title,
  subtitle,
  rightText,
  onRightPress,
  delay = 200,
}: SectionTitleProps) {

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(300)}
      className="mx-5 mt-4 mb-3 flex-row items-center justify-between"
    >
      <View className="flex-row items-center gap-2.5 flex-1">
        {/* Left vertical Accent bar */}
        <View className="w-1.5 h-6 bg-primary dark:bg-primary-dark rounded-full" />
        
        <View className="flex-1">
          <Text className="text-base font-bold text-text dark:text-text-dark tracking-tight">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-[10px] text-subText dark:text-subText-dark font-medium mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightText && onRightPress && (
        <Pressable 
          onPress={onRightPress}
          className="py-1 px-2.5 rounded-lg bg-primaryContainer dark:bg-primaryContainer-dark"
          style={({ pressed }) => pressed && { opacity: 0.8 }}
        >
          <Text className="text-xs font-bold text-primary dark:text-primary-dark">
            {rightText}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

export default SectionTitle;
