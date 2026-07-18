import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { PasswordInput, AuthenticationCard } from '../../components/auth/AuthComponents';
import { useTheme } from '../../theme';

const resetSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const params = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: ResetFormValues) => {
    setLoading(true);
    setLoading(false);

    Alert.alert(
      'Credentials Restored',
      'Your security password has been updated. Please sign in with your new credentials.',
      [{ text: 'Sign In', onPress: () => router.replace('/(auth)/login') }]
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader title="Reset Password" showBack={true} />

      <View className={`flex-1 ${isTablet ? 'px-12' : 'px-6'} justify-center`}>
        <Animated.View entering={FadeInUp.duration(350)} className="mb-6 items-center">
          <Text className={`${isTablet ? 'text-2xl' : 'text-xl'} font-black text-text dark:text-text-dark tracking-tight`}>
            Establish New Password
          </Text>
          <Text className="text-[10px] text-subText dark:text-subText-dark mt-1 text-center leading-4 max-w-xs">
            Define a strong security combination. Ensure this does not match previous configurations.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(350)} className={isTablet ? 'items-center' : ''}>
          <AuthenticationCard extraClassName={isTablet ? 'w-full max-w-md' : ''}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  label="New Password"
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
                  label="Confirm New Password"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
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
                  Over-write Password
                </Text>
              )}
            </Pressable>
          </AuthenticationCard>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
