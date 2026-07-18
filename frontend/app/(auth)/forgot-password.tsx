import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { MedicalInput, AuthenticationCard } from '../../components/auth/AuthComponents';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Enter a valid institutional email address' })
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    Alert.alert(
      'Recovery Email Dispatched',
      `A 6-digit OTP verification code has been dispatched to ${data.email}. (Demo Code: 123456)`,
      [
        {
          text: 'Verify OTP',
          onPress: () => router.push({
            pathname: '/(auth)/otp',
            params: { email: data.email }
          })
        }
      ]
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader title="Recover Credentials" showBack={true} />

      <View className={`flex-1 ${isTablet ? 'px-12' : 'px-6'} justify-center`}>
        <Animated.View entering={FadeInUp.duration(350)} className="mb-6 items-center">
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3.5">
            <Text className="text-xl font-bold text-primary">?</Text>
          </View>
          <Text className={`${isTablet ? 'text-2xl' : 'text-xl'} font-black text-text dark:text-text-dark tracking-tight`}>
            Forgot Password
          </Text>
          <Text className="text-[10px] text-subText dark:text-subText-dark mt-1.5 text-center leading-4 max-w-xs">
            Input your registered email. We will search the medical registry and dispatch an OTP validation passcode.
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

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              className="w-full bg-primary py-3.5 rounded-xl items-center justify-center mt-3 shadow-md shadow-primary/10"
              style={({ pressed }) => pressed && { opacity: 0.9 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  Request OTP Verification
                </Text>
              )}
            </Pressable>
          </AuthenticationCard>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
