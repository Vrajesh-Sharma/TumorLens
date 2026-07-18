import React from 'react';
import { View, Text, Pressable, Image, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const isSmall = width < 375;
  const isTablet = width >= 768;

  return (
    <ScreenContainer scrollable={!isTablet && height < 700}>
      <View className={`flex-1 justify-between ${isTablet ? 'px-12' : 'px-6'} py-12`}>
        <Animated.View
          entering={FadeInUp.duration(400)}
          className={`items-center ${isTablet ? 'mt-20' : isSmall ? 'mt-8' : 'mt-12'}`}
        >
          <View className={`${isTablet ? 'w-20 h-20' : 'w-16 h-16'} rounded-3xl bg-primary/10 border border-primary/20 items-center justify-center mb-4`}>
            <Ionicons name="medical" size={isTablet ? 40 : 32} color="#0B57D0" />
          </View>
          <Text className={`${isTablet ? 'text-3xl' : 'text-2xl'} font-black text-text dark:text-text-dark tracking-tight`}>
            TUMORLENS
          </Text>
          <Text className="text-xs text-subText dark:text-subText-dark uppercase tracking-widest mt-1.5 font-mono">
            Radiology & AI Diagnostics
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(150).duration(450)}
          className={`${isTablet ? 'px-12' : ''} gap-5 py-4`}
        >
          {[
            { icon: 'scan-outline', title: 'U-Net Segmentations', desc: 'Automated multi-class segmentation models (ED, NCR, ET) trained on clinical BraTS datasets.' },
            { icon: 'folder-open-outline', title: 'PACS Records Storage', desc: 'Hospital-grade patient case archives integrated with native PDF export templates.' },
            { icon: 'shield-checkmark-outline', title: 'Clinician Privacy', desc: 'Secure local biometric enrollment (Face ID / Touch ID) to protect sensitive patient records.' },
          ].map((item, i) => (
            <View key={i} className="flex-row gap-4">
              <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
                <Ionicons name={item.icon as any} size={18} color="#0B57D0" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-text dark:text-text-dark">{item.title}</Text>
                <Text className="text-[10px] text-subText dark:text-subText-dark mt-0.5 leading-4">
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          className={`${isTablet ? 'px-20' : ''} gap-3.5`}
        >
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="w-full bg-primary py-4 rounded-xl items-center justify-center shadow-md shadow-primary/20"
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            <Text className="text-sm font-bold text-white uppercase tracking-wider">
              Sign In to Account
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/register')}
            className="w-full border border-border dark:border-border-dark py-4 rounded-xl items-center justify-center bg-surface dark:bg-surface-dark"
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            <Text className="text-sm font-bold text-text dark:text-text-dark uppercase tracking-wider">
              Register New Practitioner
            </Text>
          </Pressable>

          <Text className="text-[9px] text-subText dark:text-subText-dark text-center mt-2 leading-4">
            By logging in, you agree to HIPAA medical directives and verify you are a licensed radiologist.
          </Text>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
