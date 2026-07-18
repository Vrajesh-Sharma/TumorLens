import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, FlatList, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { PatientHeader } from '../../components/patients/PatientComponents';
import { usePatients } from '../../hooks/usePatients';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import ReportCard from '../../components/reports/ReportCard';
import { pdfExportService } from '../../services/pdfExport';

export default function PatientDetailsScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients, deletePatient } = usePatients();

  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return (
      <ScreenContainer scrollable={false}>
        <PatientHeader title="Patient Files" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color={isDark ? '#F28B82' : '#C5221F'} />
          <Text className="text-sm font-bold text-text dark:text-text-dark mt-2">Patient Files Not Found</Text>
          <Text className="text-xs text-subText dark:text-subText-dark text-center mt-1">The requested patient ID may have been deleted.</Text>
          <Pressable onPress={() => router.back()} className="mt-4 bg-primary px-4 py-2 rounded-xl">
            <Text className="text-xs font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Wipe Patient Case',
      `Are you sure you want to permanently delete all record files for ${patient.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deletePatient(patient.id);
            router.back();
          }
        }
      ]
    );
  };

  // Compile stats
  const totalScans = patient.reports?.length || 0;
  const anomalies = patient.reports?.filter(r => r.tumorDetected).length || 0;
  const healthy = totalScans - anomalies;

  return (
    <ScreenContainer scrollable={false}>
      {/* Patient Header with Edit & Delete Options */}
      <View className={`flex-row items-center justify-between pb-3.5 border-b border-border/20 dark:border-border-dark/20 ${isTablet ? 'px-12' : 'px-5'} pt-3`}>
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => router.back()} className="p-1 mr-1">
            <Ionicons name="chevron-back" size={20} color={isDark ? '#E3E3E3' : '#1F2023'} />
          </Pressable>
          <View>
            <Text className="text-sm font-bold text-text dark:text-text-dark">{patient.name}</Text>
            <Text className="text-[9px] text-subText dark:text-subText-dark mt-0.5 uppercase tracking-widest font-mono">
              Subject Profile: {patient.id}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push({
              pathname: '/patients/edit',
              params: { id: patient.id }
            })}
            className="w-8 h-8 rounded-lg border border-border dark:border-border-dark items-center justify-center bg-surface dark:bg-surface-dark"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Ionicons name="create-outline" size={14} color={isDark ? '#E3E3E3' : '#1F2023'} />
          </Pressable>

          <Pressable
            onPress={handleDelete}
            className="w-8 h-8 rounded-lg bg-danger/10 items-center justify-center border border-danger/25"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Ionicons name="trash-outline" size={14} color="#C5221F" />
          </Pressable>
        </View>
      </View>

      <ScrollView className={`flex-1 ${isTablet ? 'px-12' : 'px-5'}`} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}>
        {/* Core Demographics Card */}
        <Animated.View entering={FadeIn.duration(350)} className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-5 shadow-sm mb-5">
          <View className="flex-row items-center gap-2 pb-3 border-b border-border/10 dark:border-border-dark/10 mb-3">
            <Ionicons name="person-outline" size={15} color={colors.primary} />
            <Text className="text-[10px] font-bold text-text dark:text-text-dark uppercase tracking-wider">Demographic Metrics</Text>
          </View>

          <View className="gap-2.5">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-subText dark:text-subText-dark">Intake Gender / Age</Text>
              <Text className="text-xs font-bold text-text dark:text-text-dark uppercase">{patient.gender} / {patient.age} yrs</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-subText dark:text-subText-dark">Hospital Record ID</Text>
              <Text className="text-xs font-bold text-text dark:text-text-dark font-mono">{patient.hospitalId}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-subText dark:text-subText-dark">Doctor on Record</Text>
              <Text className="text-xs font-bold text-text dark:text-text-dark">{patient.doctor}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-subText dark:text-subText-dark">Enrolled Intake Date</Text>
              <Text className="text-xs font-bold text-text dark:text-text-dark font-mono">{new Date(patient.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Diagnosis Notes */}
        <Animated.View entering={FadeInUp.delay(60).duration(300)} className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-5 shadow-sm mb-5">
          <View className="flex-row items-center gap-2 pb-3 border-b border-border/10 dark:border-border-dark/10 mb-3">
            <Ionicons name="document-text-outline" size={15} color={colors.primary} />
            <Text className="text-[10px] font-bold text-text dark:text-text-dark uppercase tracking-wider">Clinician Intake remarks</Text>
          </View>
          <Text className="text-xs text-text dark:text-text-dark leading-5">
            {patient.notes || 'No notes appended. Reviewing radiologist to record structural findings.'}
          </Text>
        </Animated.View>

        {/* Aggregate MRI Scan Stats */}
        <Animated.View entering={FadeInUp.delay(120).duration(300)} className="flex-row gap-3.5 mb-5">
          <View className="flex-1 bg-surface dark:bg-surface-dark border border-border/30 dark:border-border-dark/30 p-3.5 rounded-xl items-center shadow-xs">
            <Text className="text-[9px] font-bold text-subText dark:text-subText-dark uppercase">Total Scans</Text>
            <Text className="text-base font-black text-text dark:text-text-dark mt-1 font-mono">{totalScans}</Text>
          </View>
          <View className="flex-1 bg-danger/5 dark:bg-danger/10 border border-danger/15 dark:border-danger-dark/15 p-3.5 rounded-xl items-center shadow-xs">
            <Text className="text-[9px] font-bold text-danger uppercase">Anomalies</Text>
            <Text className="text-base font-black text-danger mt-1 font-mono">{anomalies}</Text>
          </View>
          <View className="flex-1 bg-success/5 dark:bg-success/10 border border-success/15 dark:border-success-dark/15 p-3.5 rounded-xl items-center shadow-xs">
            <Text className="text-[9px] font-bold text-success uppercase">Healthy</Text>
            <Text className="text-base font-black text-success mt-1 font-mono">{healthy}</Text>
          </View>
        </Animated.View>

        {/* MRI Diagnostic History List */}
        <View className="mb-4">
          <Text className="text-[10px] font-bold text-text dark:text-text-dark uppercase tracking-wider mb-3">
            MRI Scan & Segmentation logs ({totalScans})
          </Text>

          {totalScans === 0 ? (
            <View className="py-8 bg-surface dark:bg-surface-dark border border-border/30 dark:border-border-dark/30 rounded-xl items-center justify-center p-4">
              <Ionicons name="folder-open-outline" size={20} color={isDark ? '#C4C7C5' : '#80868B'} />
              <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase mt-2">No scans linked to this subject</Text>
            </View>
          ) : (
            patient.reports.map((report, idx) => (
              <ReportCard
                key={report.id}
                report={report}
                index={idx}
                onOpen={() => router.push({
                  pathname: '/report-details',
                  params: { id: report.id }
                })}
                onFavorite={() => {
                  Alert.alert('Favorite Scan', 'Toggled star icon on parent scan files log.');
                }}
                onShare={async () => {
                  try {
                    await pdfExportService.shareReportPdf(report);
                  } catch (err: any) {
                    Alert.alert('Sharing Failure', err.message);
                  }
                }}
                onDelete={() => {
                  Alert.alert('Action Refused', 'To delete individual scan records, wipe them from the primary reports list dashboard tab.');
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
