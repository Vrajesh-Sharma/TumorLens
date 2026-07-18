import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface AIStatusCardProps {
  modelName?: string;
  backendStatus?: string;
  inferenceTime?: string;
  accuracy?: string;
  healthStatus?: string;
}

export function AIStatusCard({
  modelName = 'U-Net BraTS2020',
  backendStatus = 'Online',
  inferenceTime = '~2 seconds',
  accuracy = 'Dice Score 0.82',
  healthStatus = 'Healthy',
}: AIStatusCardProps) {
  const { isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(300).duration(400)}
      className="mx-5 mb-5 overflow-hidden rounded-2xl border border-primary/20 dark:border-primary-dark/20 bg-primary/5 dark:bg-primary-dark/5 p-5"
    >
      {/* Title + Status Dot */}
      <View className="flex-row items-center justify-between pb-3.5 border-b border-border/30 dark:border-border-dark/30">
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary-dark/10 items-center justify-center">
            <Ionicons name="hardware-chip-outline" size={16} color={isDark ? '#A8C7FA' : '#0B57D0'} />
          </View>
          <View>
            <Text className="text-[10px] font-bold text-primary dark:text-primary-dark uppercase tracking-widest">
              AI Core Model
            </Text>
            <Text className="text-sm font-bold text-text dark:text-text-dark">
              {modelName}
            </Text>
          </View>
        </View>

        {/* Pulse Indicator */}
        <View className="flex-row items-center gap-1.5 bg-success/10 dark:bg-success/15 px-2.5 py-1 rounded-full border border-success/20">
          <View className="w-1.5 h-1.5 rounded-full bg-success dark:bg-success-dark" />
          <Text className="text-[10px] font-bold text-success dark:text-success-dark">
            {healthStatus}
          </Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View className="flex-row items-center justify-between mt-4">
        {/* Metric 1: Backend */}
        <View className="flex-1 items-center">
          <Text className="text-[10px] font-semibold text-subText dark:text-subText-dark uppercase tracking-wider">
            Backend
          </Text>
          <Text className="text-sm font-bold text-text dark:text-text-dark mt-1">
            {backendStatus}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-[1px] h-8 bg-border/40 dark:bg-border-dark/40" />

        {/* Metric 2: Inference */}
        <View className="flex-1 items-center">
          <Text className="text-[10px] font-semibold text-subText dark:text-subText-dark uppercase tracking-wider">
            Inference
          </Text>
          <Text className="text-sm font-bold text-text dark:text-text-dark mt-1">
            {inferenceTime}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-[1px] h-8 bg-border/40 dark:bg-border-dark/40" />

        {/* Metric 3: Accuracy */}
        <View className="flex-1 items-center">
          <Text className="text-[10px] font-semibold text-subText dark:text-subText-dark uppercase tracking-wider">
            Accuracy
          </Text>
          <Text className="text-sm font-bold text-text dark:text-text-dark mt-1">
            {accuracy.replace('Dice Score ', '')}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default AIStatusCard;
