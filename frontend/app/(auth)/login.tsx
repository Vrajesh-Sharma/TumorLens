import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as SecureStore from 'expo-secure-store';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { MedicalInput, PasswordInput, AuthenticationCard } from '../../components/auth/AuthComponents';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid institutional email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().default(true)
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { login, loginBiometric, isBiometricEnrolled } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true
    }
  });

  useEffect(() => {
    async function loadRememberedEmail() {
      try {
        const savedEmail = await SecureStore.getItemAsync('REMEMBERED_EMAIL');
        if (savedEmail) {
          setValue('email', savedEmail);
        }
      } catch (err) {
        console.warn('Failed to load remembered email:', err);
      }
    }
    loadRememberedEmail();
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    const success = await login(data.email, data.password, data.rememberMe);
    setSubmitting(false);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Google Single Sign-On', 'Redirecting to institutional Google workspace federated identity portal...');
  };

  const handleBiometricLogin = async () => {
    const success = await loginBiometric();
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const formWidth = isTablet ? 'w-full max-w-md' : 'w-full';

  return (
    <ScreenContainer scrollable={true} avoidKeyboard>
      <AppHeader title="Practitioner Sign In" showBack={true} />

      <View className={`flex-1 ${isTablet ? 'px-12' : 'px-6'} justify-center py-6`}>
        <Animated.View entering={FadeInUp.duration(350)} className="mb-6 items-center">
          <Text className={`${isTablet ? 'text-2xl' : 'text-xl'} font-black text-text dark:text-text-dark tracking-tight`}>
            Hospital System Portal
          </Text>
          <Text className={`text-[10px] text-subText dark:text-subText-dark mt-1 text-center leading-4 max-w-xs`}>
            Access U-Net radiology inferences, case files, and local PACS database archives.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(350)} className={isTablet ? 'items-center' : ''}>
          <AuthenticationCard extraClassName={isTablet ? 'w-full max-w-md' : ''}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <MedicalInput
                  label="Institutional Email"
                  placeholder="doctor@hospital.com"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
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

            <View className="flex-row items-center justify-between mt-1 mb-6">
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <Pressable
                    onPress={() => onChange(!value)}
                    className="flex-row items-center gap-2"
                  >
                    <Ionicons
                      name={value ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={value ? '#0B57D0' : (isDark ? '#8E918F' : '#5F6368')}
                    />
                    <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase">
                      Remember Me
                    </Text>
                  </Pressable>
                )}
              />

              <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                <Text className="text-[10px] font-black text-primary dark:text-primary-dark uppercase">
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              className="w-full bg-primary py-3.5 rounded-xl items-center justify-center shadow-md shadow-primary/10"
              style={({ pressed }) => pressed && { opacity: 0.9 }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  Authorize Practitioner
                </Text>
              )}
            </Pressable>
          </AuthenticationCard>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(160).duration(350)} className={`mt-6 gap-3 ${isTablet ? 'items-center' : ''}`}>
          {isBiometricEnrolled && (
            <Pressable
              onPress={handleBiometricLogin}
              className={`${formWidth} border border-border dark:border-border-dark py-3.5 rounded-xl flex-row items-center justify-center gap-2 bg-surface dark:bg-surface-dark`}
              style={({ pressed }) => pressed && { opacity: 0.8 }}
            >
              <Ionicons name="finger-print-outline" size={16} color={isDark ? '#E3E3E3' : '#1F2023'} />
              <Text className="text-xs font-bold text-text dark:text-text-dark uppercase tracking-wider">
                Sign In with Touch ID / Face ID
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleGoogleSignIn}
            className={`${formWidth} border border-border dark:border-border-dark py-3.5 rounded-xl flex-row items-center justify-center gap-2 bg-surface dark:bg-surface-dark`}
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          >
            <Ionicons name="logo-google" size={14} color={isDark ? '#E3E3E3' : '#1F2023'} />
            <Text className="text-xs font-bold text-text dark:text-text-dark uppercase tracking-wider">
              Continue with Google Workspace
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(350)} className="mt-8 mb-6 flex-row justify-center gap-1.5">
          <Text className="text-xs text-subText dark:text-subText-dark">New to TumorLens?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text className="text-xs font-bold text-primary dark:text-primary-dark">
              Register Credentials
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
