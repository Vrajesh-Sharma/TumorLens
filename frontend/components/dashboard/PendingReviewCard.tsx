import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../theme';

export interface PendingReview {
  id: string;
  patientName: string;
  reportId: string;
  submittedDate: string;
  priority: 'high' | 'medium' | 'low';
  studyType: string;
}

interface PendingReviewCardProps {
  review: PendingReview;
  onPressReview?: (id: string) => void;
  delayIndex?: number;
}

export function PendingReviewCard({
  review,
  onPressReview,
  delayIndex = 0,
}: PendingReviewCardProps) {
  const { isDark } = useTheme();

  const getPriorityConfig = () => {
    switch (review.priority) {
      case 'high':
        return {
          label: 'Urgent',
          bgColor: isDark ? 'bg-danger/15' : 'bg-danger/10',
          textColor: isDark ? 'text-danger-dark' : 'text-danger',
        };
      case 'medium':
        return {
          label: 'Standard',
          bgColor: isDark ? 'bg-warning/15' : 'bg-warning/10',
          textColor: isDark ? 'text-warning-dark' : 'text-warning',
        };
      case 'low':
        return {
          label: 'Routine',
          bgColor: isDark ? 'bg-success/15' : 'bg-success/10',
          textColor: isDark ? 'text-success-dark' : 'text-success',
        };
    }
  };

  const priorityConfig = getPriorityConfig();

  return (
    <Animated.View
      entering={FadeInRight.delay(400 + delayIndex * 80).duration(400)}
      className="w-[280px] bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 mr-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-bold text-text dark:text-text-dark" numberOfLines={1}>
            {review.patientName}
          </Text>
          <Text className="text-[10px] text-subText dark:text-subText-dark mt-0.5 font-semibold">
            {review.reportId} • {review.studyType}
          </Text>
        </View>
        <View className={`px-2 py-0.5 rounded-full ${priorityConfig.bgColor}`}>
          <Text className={`text-[9px] font-bold ${priorityConfig.textColor}`}>
            {priorityConfig.label}
          </Text>
        </View>
      </View>

      <View className="w-full h-24 rounded-xl bg-background dark:bg-background-dark border border-border/20 dark:border-border-dark/20 items-center justify-center mb-3">
        <Ionicons name="document-text-outline" size={36} color={isDark ? '#4A5A74' : '#B0B8C5'} />
        <Text className="text-xs text-subText dark:text-subText-dark mt-1 font-medium">
          MRI Brain Study
        </Text>
      </View>

      <View className="flex-row items-center justify-between pt-2 border-t border-border/20 dark:border-border-dark/20 mb-3">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={12} color={isDark ? '#7A8A9A' : '#6B7280'} />
          <Text className="text-[10px] text-subText dark:text-subText-dark">
            {review.submittedDate}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          <Text className="text-[10px] text-subText dark:text-subText-dark">Awaiting Review</Text>
        </View>
      </View>

      <Pressable
        onPress={() => onPressReview && onPressReview(review.id)}
        className="w-full bg-primary dark:bg-primary-dark py-2.5 rounded-xl flex-row items-center justify-center gap-1.5"
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <Ionicons name="eye-outline" size={14} color="#FFFFFF" />
        <Text className="text-xs font-bold text-white">
          Start Review
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default PendingReviewCard;
