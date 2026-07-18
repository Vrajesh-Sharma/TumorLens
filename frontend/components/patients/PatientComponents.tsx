import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Patient } from '../../types/patient';
import { useTheme } from '../../theme';

interface PatientCardProps {
  patient: Patient;
  index: number;
  onPress: () => void;
}

export function PatientCard({ patient, index, onPress }: PatientCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(300)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 mb-3.5 shadow-sm"
    >
      <Pressable onPress={onPress} className="flex-row justify-between items-center">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-text dark:text-text-dark">
              {patient.name}
            </Text>
            <View className="px-2 py-0.5 rounded-full bg-primary/10">
              <Text className="text-[8px] font-bold text-primary uppercase">
                {patient.gender}
              </Text>
            </View>
          </View>

          <Text className="text-[9px] text-subText dark:text-subText-dark mt-1 font-mono">
            ID: {patient.id} • Age: {patient.age}y • Hospital ID: {patient.hospitalId}
          </Text>

          <Text className="text-[10px] text-subText dark:text-subText-dark mt-2 leading-4 truncate" numberOfLines={1}>
            {patient.notes || 'No intake records appended.'}
          </Text>

          <View className="flex-row items-center gap-3.5 mt-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="document-text-outline" size={11} color={colors.primary} />
              <Text className="text-[9px] font-bold text-text dark:text-text-dark font-mono">
                {patient.reports?.length || 0} scan reports
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={11} color={isDark ? '#C4C7C5' : '#5F6368'} />
              <Text className="text-[9px] text-subText dark:text-subText-dark font-mono">
                Intake: {new Date(patient.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={isDark ? '#C4C7C5' : '#80868B'} />
      </Pressable>
    </Animated.View>
  );
}

export function PatientHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  const { colors, isDark } = useTheme();

  return (
    <View className="flex-row items-center justify-between pb-4 border-b border-border/20 dark:border-border-dark/20 px-5 pt-3">
      <View className="flex-row items-center gap-2">
        {onBack && (
          <Pressable onPress={onBack} className="p-1 mr-1">
            <Ionicons name="chevron-back" size={20} color={isDark ? '#E3E3E3' : '#1F2023'} />
          </Pressable>
        )}
        <View>
          <Text className="text-sm font-bold text-text dark:text-text-dark">{title}</Text>
          {subtitle && (
            <Text className="text-[9px] text-subText dark:text-subText-dark mt-0.5 uppercase tracking-widest">{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
export default PatientCard;
