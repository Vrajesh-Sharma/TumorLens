import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { useAuth } from '../../contexts/AuthContext';

export default function SessionExpiredScreen() {
  const { logout } = useAuth();
  const { width } = useWindowDimensions();
  const isSmall = width < 375;

  const handleReauth = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer scrollable={false}>
      <View className="flex-1 px-6 justify-center items-center">
        <Animated.View entering={FadeInUp.duration(400)} className="items-center">
          <View className={`${isSmall ? 'w-14 h-14' : 'w-16 h-16'} rounded-full bg-danger/10 items-center justify-center mb-6`}>
            <Ionicons name="time-outline" size={isSmall ? 28 : 32} color="#C5221F" />
          </View>

          <Text className={`${isSmall ? 'text-lg' : 'text-xl'} font-black text-text dark:text-text-dark tracking-tight text-center`}>
            Security Session Expired
          </Text>

          <Text className="text-xs text-subText dark:text-subText-dark mt-2.5 text-center leading-5 max-w-xs">
            To safeguard sensitive patient records in compliance with medical policies, sessions are capped. Please authorize your credentials again.
          </Text>

          <Pressable
            onPress={handleReauth}
            className={`mt-8 bg-primary dark:bg-primary px-6 py-3.5 rounded-xl ${isSmall ? 'w-52' : 'w-60'} shadow-md items-center`}
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            <Text className="text-xs font-bold text-white dark:text-background-dark uppercase tracking-wider">
              Verify Account Again
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
