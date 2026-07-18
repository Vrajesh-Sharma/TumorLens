import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { MedicalInput } from '../../components/auth/AuthComponents';
import { usePatients } from '../../hooks/usePatients';
import { useAuth } from '../../contexts/AuthContext';

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

export default function AddPatientScreen() {

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user } = useAuth();
  const { addPatient } = usePatients();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      name: '',
      age: '' as any,
      gender: 'male',
      hospitalId: `HOSP-${Math.floor(10000 + Math.random() * 90000)}`,
      doctor: user?.name || 'Dr. Krina Parmar',
      notes: ''
    }
  });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const patientId = `PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await addPatient({
        id: patientId,
        name: data.name,
        age: Number(data.age),
        gender: data.gender,
        hospitalId: data.hospitalId,
        doctor: data.doctor,
        notes: data.notes || ''
      });
      setSubmitting(false);
      Alert.alert('Subject Enrolled', 'The patient record has been successfully added to local storage database.');
      router.back();
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Enrollment Error', err.message || 'Could not save subject files.');
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader title="Subject Enrollment" showBack={true} />

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
                    {['male', 'female'].map((g) => (
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
              {errors.gender?.message && (
                <Text className="text-[9px] font-bold text-danger mt-1 ml-1">{errors.gender?.message}</Text>
              )}
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

          {/* Add Action Button */}
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
                Enroll New Subject
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
