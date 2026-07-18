import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { MedicalInput, AuthenticationCard } from '../../components/auth/AuthComponents';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be exactly 6 characters' })
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function OtpScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const params = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  const onSubmit = async (data: OtpFormValues) => {
    setLoading(true);
    setLoading(false);
    const isValid = data.otp === '123456';

    if (isValid) {
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email: params.email }
      });
    } else {
      Alert.alert('Verification Failed', 'The OTP passcode you entered is incorrect. Please try again.');
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader title="Security Verification" showBack={true} />

      <View className={`flex-1 ${isTablet ? 'px-12' : 'px-6'} justify-center`}>
        <Animated.View entering={FadeInUp.duration(350)} className="mb-6 items-center">
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3.5">
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary || '#0B57D0'} />
          </View>
          <Text className={`${isTablet ? 'text-2xl' : 'text-xl'} font-black text-text dark:text-text-dark tracking-tight`}>
            Security Passcode
          </Text>
          <Text className="text-[10px] text-subText dark:text-subText-dark mt-1.5 text-center leading-4 max-w-xs">
            Input the 6-digit confirmation code dispatched to <Text className="font-bold">{params.email || 'your email'}</Text>.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(350)} className={isTablet ? 'items-center' : ''}>
          <AuthenticationCard extraClassName={isTablet ? 'w-full max-w-md' : ''}>
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, value } }) => (
                <MedicalInput
                  label="OTP Security Code"
                  placeholder="123456"
                  value={value}
                  onChangeText={onChange}
                  error={errors.otp?.message}
                  keyboardType="numeric"
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
                  Verify Credentials
                </Text>
              )}
            </Pressable>
          </AuthenticationCard>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
