import React from 'react';
import { View, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  DashboardHeader,
  WelcomeCard,
  QuickActionCard,
  StatCard,
  RecentReportCard,
  SectionTitle,
  EmptyReportsState,
  RadiologistDashboard,
} from '../../components/dashboard';
import { useReports } from '../../hooks/useReports';

export default function HomeScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { filteredReports, stats } = useReports();

  const userName = user?.name || 'Doctor';
  const userRole = user?.role || 'doctor';
  const recentReports = filteredReports.slice(0, 5);

  const quickActions = [
    {
      id: 'action-upload',
      title: 'Upload MRI',
      description: 'Import DICOM/image files',
      iconName: 'cloud-upload-outline' as const,
      route: '/upload',
      color: '#0B57D0',
      backgroundColor: '#D3E3FD',
    },
    {
      id: 'action-camera',
      title: 'Scan Camera',
      description: 'Capture physical scan',
      iconName: 'camera-outline' as const,
      route: '/upload?method=camera',
      color: '#B06000',
      backgroundColor: '#FFEFC9',
    },
    {
      id: 'action-reports',
      title: 'View Reports',
      description: 'Access patient records',
      iconName: 'document-text-outline' as const,
      route: '/reports',
      color: '#137333',
      backgroundColor: '#E6F4EA',
    },
    {
      id: 'action-history',
      title: 'Scan History',
      description: 'Log of past operations',
      iconName: 'time-outline' as const,
      route: '/(tabs)/reports',
      color: '#C5221F',
      backgroundColor: '#FCE8E6',
    },
  ];

  const statItems = [
    {
      id: 'stat-total',
      value: String(stats.totalCount),
      label: 'Total Reports',
      iconName: 'folder-open-outline' as const,
      trend: stats.tumorDetectedCount > 0 ? `${stats.tumorDetectedCount} anomalies` : 'No anomalies',
      trendType: (stats.tumorDetectedCount > 0 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
      color: '#0B57D0',
    },
    {
      id: 'stat-detected',
      value: String(stats.tumorDetectedCount),
      label: 'Tumor Detected',
      iconName: 'alert-circle-outline' as const,
      trend: `${((stats.tumorDetectedCount / (stats.totalCount || 1)) * 100).toFixed(0)}% of cases`,
      trendType: (stats.tumorDetectedCount > 0 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
      color: '#C5221F',
    },
    {
      id: 'stat-area',
      value: stats.averageTumorArea > 0 ? `${stats.averageTumorArea.toFixed(1)}%` : '0%',
      label: 'Avg Tumor Area',
      iconName: 'analytics-outline' as const,
      trend: stats.averageTumorArea > 0 ? `${stats.averageTumorArea.toFixed(1)}% avg` : 'No data',
      trendType: (stats.averageTumorArea > 0 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
      color: '#B06000',
    },
    {
      id: 'stat-healthy',
      value: String(stats.healthyCount),
      label: 'Healthy Scans',
      iconName: 'shield-checkmark-outline' as const,
      trend: `${((stats.healthyCount / (stats.totalCount || 1)) * 100).toFixed(0)}% clear`,
      trendType: 'neutral' as 'up' | 'down' | 'neutral',
      color: '#137333',
    },
  ];

  if (userRole === 'radiologist') {
    return (
      <ScreenContainer scrollable={false}>
        <DashboardHeader
          doctorName={userName}
          subtitle="Radiologist Dashboard"
          onNotificationPress={() => {
            Alert.alert(
              'Notifications',
              '2 pending review assignments. Check pending reviews section.',
              [{ text: 'Dismiss' }]
            );
          }}
          onProfilePress={() => router.push('/(tabs)/settings')}
          hasNotifications={true}
        />
        <RadiologistDashboard name={userName} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <DashboardHeader
        doctorName={userName}
        onNotificationPress={() => {
          Alert.alert(
            'Notifications',
            'No pending notifications. All systems operational.',
            [{ text: 'Dismiss' }]
          );
        }}
        onProfilePress={() => router.push('/(tabs)/settings')}
        hasNotifications={true}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <WelcomeCard doctorName={userName} />

        <View className="mb-2">
          <SectionTitle
            title="Quick Actions"
            subtitle="Common clinical workflows"
            delay={200}
          />

          <View className={`flex-row ${isTablet ? 'px-12' : 'px-5'} mb-3 gap-3`}>
            <View className="flex-1">
              <QuickActionCard
                title={quickActions[0].title}
                description={quickActions[0].description}
                iconName={quickActions[0].iconName}
                onPress={() => router.push('/(tabs)/upload')}
                color={quickActions[0].color}
                backgroundColor={quickActions[0].backgroundColor}
                delayIndex={0}
              />
            </View>
            <View className="flex-1">
              <QuickActionCard
                title={quickActions[1].title}
                description={quickActions[1].description}
                iconName={quickActions[1].iconName}
                onPress={() => router.push('/(tabs)/upload')}
                color={quickActions[1].color}
                backgroundColor={quickActions[1].backgroundColor}
                delayIndex={1}
              />
            </View>
          </View>

          <View className={`flex-row ${isTablet ? 'px-12' : 'px-5'} mb-2 gap-3`}>
            <View className="flex-1">
              <QuickActionCard
                title={quickActions[2].title}
                description={quickActions[2].description}
                iconName={quickActions[2].iconName}
                onPress={() => router.push('/(tabs)/reports')}
                color={quickActions[2].color}
                backgroundColor={quickActions[2].backgroundColor}
                delayIndex={2}
              />
            </View>
            <View className="flex-1">
              <QuickActionCard
                title={quickActions[3].title}
                description={quickActions[3].description}
                iconName={quickActions[3].iconName}
                onPress={() => router.push('/(tabs)/reports')}
                color={quickActions[3].color}
                backgroundColor={quickActions[3].backgroundColor}
                delayIndex={3}
              />
            </View>
          </View>
        </View>

        <View className="mb-4">
          <SectionTitle
            title="Recent Reports"
            subtitle="Latest AI analysis results"
            rightText={recentReports.length > 0 ? 'View All' : undefined}
            onRightPress={recentReports.length > 0 ? () => router.push('/(tabs)/reports') : undefined}
            delay={250}
          />

          {recentReports.length === 0 ? (
            <EmptyReportsState onUploadPress={() => router.push('/(tabs)/upload')} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: isTablet ? 48 : 20, paddingRight: 4 }}
              className="py-1"
            >
              {recentReports.map((report, index) => (
                <RecentReportCard
                  key={report.id}
                  report={{
                    id: report.id,
                    patientName: report.patientName,
                    age: report.patientAge || 0,
                    gender: (report.patientGender || 'other') as 'male' | 'female' | 'other',
                    analysisDate: report.timestamp,
                    tumorAreaMm2: report.tumorStats?.tumor_area || 0,
                    tumorAreaPercentage: report.tumorStats?.tumor_area || 0,
                    tumorDetected: report.tumorDetected,
                    predictionScore: report.tumorStats?.tumor_area || 0,
                    status: report.tumorDetected ? 'Completed' as const : 'Completed' as const,
                    imageUri: report.originalImageUri ? { uri: report.originalImageUri } : null,
                  }}
                  onPressOpen={() => {
                    router.push(`/report-details?id=${report.id}`);
                  }}
                  delayIndex={index}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View className="mb-4">
          <SectionTitle
            title="Overview"
            subtitle="Practice statistics"
            delay={350}
          />

          <View className={`flex-row ${isTablet ? 'px-12' : 'px-5'} mb-3 gap-3`}>
            <View className="flex-1">
              <StatCard
                value={statItems[0].value}
                label={statItems[0].label}
                iconName={statItems[0].iconName}
                trend={statItems[0].trend}
                trendType={statItems[0].trendType}
                color={statItems[0].color}
                delayIndex={0}
              />
            </View>
            <View className="flex-1">
              <StatCard
                value={statItems[1].value}
                label={statItems[1].label}
                iconName={statItems[1].iconName}
                trend={statItems[1].trend}
                trendType={statItems[1].trendType}
                color={statItems[1].color}
                delayIndex={1}
              />
            </View>
          </View>

          <View className={`flex-row ${isTablet ? 'px-12' : 'px-5'} mb-2 gap-3`}>
            <View className="flex-1">
              <StatCard
                value={statItems[2].value}
                label={statItems[2].label}
                iconName={statItems[2].iconName}
                trend={statItems[2].trend}
                trendType={statItems[2].trendType}
                color={statItems[2].color}
                delayIndex={2}
              />
            </View>
            <View className="flex-1">
              <StatCard
                value={statItems[3].value}
                label={statItems[3].label}
                iconName={statItems[3].iconName}
                trend={statItems[3].trend}
                trendType={statItems[3].trendType}
                color={statItems[3].color}
                delayIndex={3}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}