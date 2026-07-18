import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { MedicalInput, PasswordInput, AuthenticationCard } from '../../components/auth/AuthComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme';

const registerSchema = z.object({
  name: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  email: z.string().email({ message: 'Enter a valid institutional email address' }),
  hospitalName: z.string().min(4, { message: 'Hospital / Facility name is required' }),
  medicalLicenseId: z.string().min(5, { message: 'Valid Medical License ID is required' }),
  specialization: z.string().min(3, { message: 'Medical specialization is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      hospitalName: '',
      medicalLicenseId: '',
      specialization: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitting(true);
    const success = await register(data);
    setSubmitting(false);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader title="Practitioner Registration" showBack={true} />

      <ScrollView
        className={`flex-1 ${isTablet ? 'px-12' : 'px-6'}`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
      >
        <Animated.View entering={FadeInUp.duration(350)} className="mb-5 items-center">
          <Text className={`${isTablet ? 'text-2xl' : 'text-xl'} font-black text-text dark:text-text-dark tracking-tight`}>
            Create Clinician Profile
          </Text>
          <Text className="text-[10px] text-subText dark:text-subText-dark mt-1 text-center leading-4 max-w-xs">
            Input credentials to verify medical licenses and configure secure, local EHR diagnostics.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(350)} className={isTablet ? 'items-center' : ''}>
          <AuthenticationCard extraClassName={isTablet ? 'w-full max-w-md' : ''}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <MedicalInput
                  label="Full Name"
                  placeholder="Dr. Sarah Jenkins"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <MedicalInput
                  label="Institutional Email"
                  placeholder="s.jenkins@apollo.org"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                />
              )}
            />

            <Controller
              control={control}
              name="hospitalName"
              render={({ field: { onChange, value } }) => (
                <MedicalInput
                  label="Hospital / Medical Facility"
                  placeholder="Apollo Hospitals, Neurosurgery Dept"
                  value={value}
                  onChangeText={onChange}
                  error={errors.hospitalName?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="medicalLicenseId"
              render={({ field: { onChange, value } }) => (
                <MedicalInput
                  label="Medical Board License ID"
                  placeholder="MC-84920-X"
                  value={value}
                  onChangeText={onChange}
                  error={errors.medicalLicenseId?.message}
                  autoCapitalize="characters"
                />
              )}
            />

            <Controller
              control={control}
              name="specialization"
              render={({ field: { onChange, value } }) => (
                <MedicalInput
                  label="Medical Specialization"
                  placeholder="Neuroradiologist"
                  value={value}
                  onChangeText={onChange}
                  error={errors.specialization?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  label="Security Password"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              className="w-full bg-primary py-3.5 rounded-xl items-center justify-center mt-3 shadow-md shadow-primary/10"
              style={({ pressed }) => pressed && { opacity: 0.9 }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  Create Physician Profile
                </Text>
              )}
            </Pressable>
          </AuthenticationCard>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(150).duration(350)} className="mt-6 flex-row justify-center gap-1.5">
          <Text className="text-xs text-subText dark:text-subText-dark">Already registered?</Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text className="text-xs font-bold text-primary dark:text-primary-dark">
              Sign In Instead
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
