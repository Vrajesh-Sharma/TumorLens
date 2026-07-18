import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, Platform, Appearance, LogBox } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { useAppStore } from '../store/appStore';
import { OfflineBanner } from '../components/offline/OfflineUI';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastContainer } from '../components/Toast';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { notificationService } from '../services/notifications';
import { storageService } from '../services/storageService';
import '../global.css';

LogBox.ignoreLogs(['Method getInfoAsync imported from "expo-file-system" is deprecated']);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
    mutations: {
      retry: 1,
    },
  },
});

function NavigationGate() {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, userRole]);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="report-details" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="result" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </View>
  );
}

function ThemeApplier() {
  const themeMode = useAppStore((s) => s.themeMode);

  useEffect(() => {
    if (themeMode === 'system') {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(themeMode);
    }
  }, [themeMode]);

  return null;
}

export default function RootLayout() {
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  useEffect(() => {
    async function prepare() {
      try {
        if (Platform.OS !== 'web') {
          await storageService.init();
        }
        await notificationService.requestPermissions();

        const savedTheme = await SecureStore.getItemAsync('THEME_MODE');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeMode(savedTheme);
        }
      } catch (err) {
        console.error('[RootLayout] Init error:', err);
      } finally {
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [setThemeMode]);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeApplier />
            <NavigationGate />
            <ToastContainer />
            <LoadingOverlay />
            <StatusBar style="auto" />
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
