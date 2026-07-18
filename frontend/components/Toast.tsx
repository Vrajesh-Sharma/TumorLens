import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import type { ToastType } from '../types';

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
};

const COLORS: Record<ToastType, string> = {
  success: '#137333',
  error: '#C5221F',
  warning: '#B06000',
  info: '#0B57D0',
};

const BG_COLORS: Record<ToastType, string> = {
  success: 'bg-success/10 border-success/20',
  error: 'bg-danger/10 border-danger/20',
  warning: 'bg-warning/10 border-warning/20',
  info: 'bg-primary/10 border-primary/20',
};

function ToastItem({ id, message, type, duration }: {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const removeToast = useAppStore((state) => state.removeToast);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => removeToast(id));
    }, duration || 3000);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className={`mx-4 mb-2 flex-row items-center border px-4 py-3 rounded-xl ${BG_COLORS[type]}`}
    >
      <Ionicons name={ICONS[type]} size={20} color={COLORS[type]} />
      <Text className="flex-1 text-sm text-text dark:text-text-dark ml-2.5">
        {message}
      </Text>
      <TouchableOpacity onPress={() => removeToast(id)} className="ml-2">
        <Ionicons name="close" size={16} color="#5F6368" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastContainer() {
  const toasts = useAppStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <View className="absolute top-14 left-0 right-0 z-50">
      {toasts.map((toast: { id: string; message: string; type: ToastType; duration?: number }) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </View>
  );
}

export default ToastContainer;
