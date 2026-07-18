import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';

export interface PatientFormData {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other' | '';
  notes: string;
}

interface PatientDetailsProps {
  data: PatientFormData;
  onChange: (data: PatientFormData) => void;
}

const GENDER_OPTIONS: { label: string; value: 'male' | 'female' | 'other' }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export function PatientDetails({ data, onChange }: PatientDetailsProps) {
  const { isDark } = useTheme();

  const updateField = (field: keyof PatientFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-5 shadow-sm"
    >
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-dark/10 items-center justify-center">
          <Ionicons name="person-outline" size={16} color={isDark ? '#A8C7FA' : '#0B57D0'} />
        </View>
        <Text className="text-sm font-bold text-text dark:text-text-dark">
          Patient Details
        </Text>
      </View>

      <View className="gap-4">
        <View>
          <Text className="text-[11px] font-semibold text-subText dark:text-subText-dark uppercase tracking-wider mb-1.5">
            Patient Name
          </Text>
          <TextInput
            value={data.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder="e.g. John Smith"
            placeholderTextColor={isDark ? '#4A5A74' : '#B0B8C5'}
            className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-xl px-4 py-3 text-sm text-text dark:text-text-dark"
          />
        </View>

        <View className="w-1/2">
          <Text className="text-[11px] font-semibold text-subText dark:text-subText-dark uppercase tracking-wider mb-1.5">
            Age
          </Text>
          <TextInput
            value={data.age}
            onChangeText={(v) => updateField('age', v.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 45"
            placeholderTextColor={isDark ? '#4A5A74' : '#B0B8C5'}
            keyboardType="number-pad"
            maxLength={3}
            className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-xl px-4 py-3 text-sm text-text dark:text-text-dark"
          />
        </View>

        <View>
          <Text className="text-[11px] font-semibold text-subText dark:text-subText-dark uppercase tracking-wider mb-1.5">
            Gender
          </Text>
          <View className="flex-row gap-2">
            {GENDER_OPTIONS.map((opt) => {
              const selected = data.gender === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => updateField('gender', selected ? '' : opt.value)}
                  className={`flex-1 py-3 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                    selected
                      ? 'bg-primary/10 dark:bg-primary-dark/10 border-primary/30 dark:border-primary-dark/30'
                      : 'bg-background dark:bg-background-dark border-border dark:border-border-dark'
                  }`}
                  style={({ pressed }) => pressed && { opacity: 0.8 }}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selected
                        ? 'text-primary dark:text-primary-dark'
                        : 'text-subText dark:text-subText-dark'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="text-[11px] font-semibold text-subText dark:text-subText-dark uppercase tracking-wider mb-1.5">
            Clinical Notes (Optional)
          </Text>
          <TextInput
            value={data.notes}
            onChangeText={(v) => updateField('notes', v)}
            placeholder="e.g. Suspected lesion in left temporal lobe"
            placeholderTextColor={isDark ? '#4A5A74' : '#B0B8C5'}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-xl px-4 py-3 text-sm text-text dark:text-text-dark min-h-[80px]"
          />
        </View>
      </View>
    </Animated.View>
  );
}

export default PatientDetails;
