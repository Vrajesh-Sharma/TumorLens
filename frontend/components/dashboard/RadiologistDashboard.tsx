import React from 'react';
import { View, ScrollView, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../theme';
import { SectionTitle } from './SectionTitle';
import { QuickActionCard } from './QuickActionCard';
import { PendingReviewCard } from './PendingReviewCard';
import { ReviewedReportCard } from './ReviewedReportCard';
import { StatCard } from './StatCard';
import type { PendingReview } from './PendingReviewCard';
import type { ReviewedReport } from './ReviewedReportCard';

const MOCK_PENDING_REVIEWS: PendingReview[] = [];

const MOCK_REVIEWED_REPORTS: ReviewedReport[] = [];

const RADIOLOGIST_QUICK_ACTIONS = [
  {
    title: 'Pending Reviews',
    description: 'Awaiting radiology assessment',
    iconName: 'document-text-outline' as const,
    color: '#0B57D0',
    backgroundColor: '#E8F0FE',
  },
  {
    title: 'Analytics',
    description: 'Review performance metrics',
    iconName: 'stats-chart-outline' as const,
    color: '#059669',
    backgroundColor: '#ECFDF5',
  },
  {
    title: 'Scan History',
    description: 'Browse completed reviews',
    iconName: 'time-outline' as const,
    color: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  {
    title: 'Settings',
    description: 'Preferences and account',
    iconName: 'settings-outline' as const,
    color: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
];

const RADIOLOGIST_STATS = [
  {
    value: '0',
    label: 'Total Reviews',
    iconName: 'checkmark-done-outline' as const,
    trend: 'Awaiting data from backend',
    trendType: 'neutral' as const,
    color: '#0B57D0',
  },
  {
    value: '0',
    label: 'Pending Reviews',
    iconName: 'time-outline' as const,
    trend: 'No cases pending',
    trendType: 'neutral' as const,
    color: '#D97706',
  },
  {
    value: '--',
    label: 'Diagnostic Accuracy',
    iconName: 'shield-checkmark-outline' as const,
    trend: 'Requires backend sync',
    trendType: 'neutral' as const,
    color: '#059669',
  },
  {
    value: '--',
    label: 'Avg. Response Time',
    iconName: 'timer-outline' as const,
    trend: 'No data available',
    trendType: 'neutral' as const,
    color: '#7C3AED',
  },
];

export function RadiologistDashboard({ name }: { name: string }) {
  const { isDark } = useTheme();

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="mx-5 mt-6 mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-2xl bg-primaryContainer dark:bg-primaryContainer-dark items-center justify-center border border-primary/10 dark:border-primary-dark/10">
            <Ionicons name="pulse" size={24} color={isDark ? '#A8C7FA' : '#0B57D0'} />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text dark:text-text-dark tracking-tight">
              Good {getGreeting()}, {name.split(' ')[0]}
            </Text>
            <Text className="text-xs text-subText dark:text-subText-dark mt-0.5 font-medium">
              {formatDate()} • {MOCK_PENDING_REVIEWS.length} reviews pending
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-3">
        <SectionTitle
          title="Quick Actions"
          subtitle="Radiologist workflows"
          delay={200}
        />

        <View className="flex-row px-5 mb-3 gap-3">
          <View className="flex-1">
            <QuickActionCard
              title={RADIOLOGIST_QUICK_ACTIONS[0].title}
              description={RADIOLOGIST_QUICK_ACTIONS[0].description}
              iconName={RADIOLOGIST_QUICK_ACTIONS[0].iconName}
              onPress={() => Alert.alert('Pending Reviews', 'Navigate to review queue')}
              color={RADIOLOGIST_QUICK_ACTIONS[0].color}
              backgroundColor={RADIOLOGIST_QUICK_ACTIONS[0].backgroundColor}
              delayIndex={0}
            />
          </View>
          <View className="flex-1">
            <QuickActionCard
              title={RADIOLOGIST_QUICK_ACTIONS[1].title}
              description={RADIOLOGIST_QUICK_ACTIONS[1].description}
              iconName={RADIOLOGIST_QUICK_ACTIONS[1].iconName}
              onPress={() => Alert.alert('Analytics', 'Navigate to analytics view')}
              color={RADIOLOGIST_QUICK_ACTIONS[1].color}
              backgroundColor={RADIOLOGIST_QUICK_ACTIONS[1].backgroundColor}
              delayIndex={1}
            />
          </View>
        </View>

        <View className="flex-row px-5 mb-2 gap-3">
          <View className="flex-1">
            <QuickActionCard
              title={RADIOLOGIST_QUICK_ACTIONS[2].title}
              description={RADIOLOGIST_QUICK_ACTIONS[2].description}
              iconName={RADIOLOGIST_QUICK_ACTIONS[2].iconName}
              onPress={() => router.push('/(tabs)/reports')}
              color={RADIOLOGIST_QUICK_ACTIONS[2].color}
              backgroundColor={RADIOLOGIST_QUICK_ACTIONS[2].backgroundColor}
              delayIndex={2}
            />
          </View>
          <View className="flex-1">
            <QuickActionCard
              title={RADIOLOGIST_QUICK_ACTIONS[3].title}
              description={RADIOLOGIST_QUICK_ACTIONS[3].description}
              iconName={RADIOLOGIST_QUICK_ACTIONS[3].iconName}
              onPress={() => router.push('/(tabs)/settings')}
              color={RADIOLOGIST_QUICK_ACTIONS[3].color}
              backgroundColor={RADIOLOGIST_QUICK_ACTIONS[3].backgroundColor}
              delayIndex={3}
            />
          </View>
        </View>
      </View>

      <View className="mb-4">
        <SectionTitle
          title="Pending Reviews"
          subtitle="Cases awaiting radiology assessment"
          rightText={`${MOCK_PENDING_REVIEWS.length} Pending`}
          delay={250}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
          className="py-1"
        >
          {MOCK_PENDING_REVIEWS.map((review, index) => (
            <PendingReviewCard
              key={review.id}
              review={review}
              onPressReview={(id) => Alert.alert('Review Case', `Opening review for ${id}`)}
              delayIndex={index}
            />
          ))}
        </ScrollView>
      </View>

      <View className="mb-4">
        <SectionTitle
          title="Recently Reviewed"
          subtitle="Your latest assessments"
          delay={300}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
          className="py-1"
        >
          {MOCK_REVIEWED_REPORTS.map((report, index) => (
            <ReviewedReportCard
              key={report.id}
              report={report}
              onPressView={(id) => Alert.alert('View Report', `Opening report ${id}`)}
              delayIndex={index}
            />
          ))}
        </ScrollView>
      </View>

      <View className="mb-4">
        <SectionTitle
          title="Analytics Summary"
          subtitle="Performance overview"
          delay={350}
        />

        <View className="flex-row px-5 mb-3 gap-3">
          <View className="flex-1">
            <StatCard
              value={RADIOLOGIST_STATS[0].value}
              label={RADIOLOGIST_STATS[0].label}
              iconName={RADIOLOGIST_STATS[0].iconName}
              trend={RADIOLOGIST_STATS[0].trend}
              trendType={RADIOLOGIST_STATS[0].trendType}
              color={RADIOLOGIST_STATS[0].color}
              delayIndex={0}
            />
          </View>
          <View className="flex-1">
            <StatCard
              value={RADIOLOGIST_STATS[1].value}
              label={RADIOLOGIST_STATS[1].label}
              iconName={RADIOLOGIST_STATS[1].iconName}
              trend={RADIOLOGIST_STATS[1].trend}
              trendType={RADIOLOGIST_STATS[1].trendType}
              color={RADIOLOGIST_STATS[1].color}
              delayIndex={1}
            />
          </View>
        </View>

        <View className="flex-row px-5 mb-2 gap-3">
          <View className="flex-1">
            <StatCard
              value={RADIOLOGIST_STATS[2].value}
              label={RADIOLOGIST_STATS[2].label}
              iconName={RADIOLOGIST_STATS[2].iconName}
              trend={RADIOLOGIST_STATS[2].trend}
              trendType={RADIOLOGIST_STATS[2].trendType}
              color={RADIOLOGIST_STATS[2].color}
              delayIndex={2}
            />
          </View>
          <View className="flex-1">
            <StatCard
              value={RADIOLOGIST_STATS[3].value}
              label={RADIOLOGIST_STATS[3].label}
              iconName={RADIOLOGIST_STATS[3].iconName}
              trend={RADIOLOGIST_STATS[3].trend}
              trendType={RADIOLOGIST_STATS[3].trendType}
              color={RADIOLOGIST_STATS[3].color}
              delayIndex={3}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default RadiologistDashboard;
