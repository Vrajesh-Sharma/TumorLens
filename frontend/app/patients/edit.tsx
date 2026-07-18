import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import AppHeader from '../../components/ui/navigation/AppHeader';
import { MedicalInput } from '../../components/auth/AuthComponents';
import { usePatients } from '../../hooks/usePatients';
import { useTheme } from '../../theme';

const patientSchema = z.object({
  name: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  age: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0 && num <= 120;
  }, { message: 'Enter a valid age' }),
  gender: z.enum(['male', 'female', 'other']),
  hospitalId: z.string().min(3, { message: 'Hospital Subject ID is required' }),
  doctor: z.string().min(3, { message: 'Assigned neuroradiologist name is required' }),
  notes: z.string().optional()
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function EditPatientScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients, updatePatient } = usePatients();
  const [submitting, setSubmitting] = useState(false);

  const patient = patients.find(p => p.id === id);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      name: '',
      age: '' as any,
      gender: 'male',
      hospitalId: '',
      doctor: '',
      notes: ''
    }
  });

  // Load existing subject parameters into form controllers
  useEffect(() => {
    if (patient) {
      setValue('name', patient.name);
      setValue('age', patient.age?.toString());
      setValue('gender', patient.gender);
      setValue('hospitalId', patient.hospitalId);
      setValue('doctor', patient.doctor);
      setValue('notes', patient.notes);
    }
  }, [patient, setValue]);

  if (!patient) {
    return (
      <ScreenContainer scrollable={false}>
        <AppHeader title="Edit Profile" showBack={true} />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-sm font-bold text-text dark:text-text-dark">Patient Record Missing</Text>
          <Pressable onPress={() => router.back()} className="mt-4 bg-primary px-4 py-2 rounded-xl">
            <Text className="text-xs font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await updatePatient({
        ...patient,
        name: data.name,
        age: Number(data.age),
        gender: data.gender,
        hospitalId: data.hospitalId,
        doctor: data.doctor,
        notes: data.notes || ''
      });
      setSubmitting(false);
      Alert.alert('Record Updated', 'Demographic parameters have been successfully edited.');
      router.back();
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Update Failure', err.message || 'Could not edit subject details.');
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader title="Edit Subject Details" showBack={true} />

      <ScrollView 
        className={`flex-1 ${isTablet ? 'px-12' : 'px-5'}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
      >
        <Animated.View entering={FadeInUp.duration(350)}>
          {/* Full Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <MedicalInput
                label="Full Subject Name"
                placeholder="Sarah Jenkins"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                autoCapitalize="words"
              />
            )}
          />

          {/* Age & Gender Row */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Controller
                control={control}
                name="age"
                render={({ field: { onChange, value } }) => (
                  <MedicalInput
                    label="Patient Age"
                    placeholder="45"
                    value={value?.toString() || ''}
                    onChangeText={onChange}
                    error={errors.age?.message}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>

            <View className="flex-1">
              <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider mb-1.5 ml-1">
                Gender
              </Text>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row bg-surface dark:bg-surface-dark border border-border/60 dark:border-border-dark/60 rounded-xl overflow-hidden p-1 h-[40px] items-center">
                    {['male', 'female', 'other'].map((g) => (
                      <Pressable
                        key={g}
                        onPress={() => onChange(g as any)}
                        className={`flex-1 py-1.5 rounded-lg items-center justify-center ${
                          value === g ? 'bg-primary dark:bg-primary-dark' : ''
                        }`}
                      >
                        <Text className={`text-[10px] font-bold uppercase ${
                          value === g ? 'text-white' : 'text-slate-400'
                        }`}>
                          {g}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />
            </View>
          </View>

          {/* Hospital Subject ID */}
          <Controller
            control={control}
            name="hospitalId"
            render={({ field: { onChange, value } }) => (
              <MedicalInput
                label="Hospital Record ID"
                placeholder="HOSP-94821"
                value={value}
                onChangeText={onChange}
                error={errors.hospitalId?.message}
                autoCapitalize="characters"
              />
            )}
          />

          {/* Doctor */}
          <Controller
            control={control}
            name="doctor"
            render={({ field: { onChange, value } }) => (
              <MedicalInput
                label="Assigned Neuroradiologist"
                placeholder="Dr. Krina Parmar"
                value={value}
                onChangeText={onChange}
                error={errors.doctor?.message}
                autoCapitalize="words"
              />
            )}
          />

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider mb-1.5 ml-1">
              Demographic / Intake Notes
            </Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <View className="bg-surface dark:bg-surface-dark border border-border/60 dark:border-border-dark/60 rounded-xl p-3 min-h-[90px] justify-center">
                  <MedicalInput
                    label=""
                    placeholder="Input subject clinical annotations, intake complaints, or scans target..."
                    value={value || ''}
                    onChangeText={onChange}
                    error={errors.notes?.message}
                  />
                </View>
              )}
            />
          </View>

          {/* Update Action Button */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
            className="w-full bg-primary py-4 rounded-xl items-center justify-center shadow-md shadow-primary/10"
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-bold text-white uppercase tracking-wider">
                Save Demographic Updates
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
