import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BaseButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

interface TextButtonProps extends BaseButtonProps {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
}

interface IconButtonProps extends BaseButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

function AnimatedButtonContainer({ 
  onPress, 
  disabled, 
  loading, 
  className = '', 
  children 
}: { 
  onPress?: () => void; 
  disabled?: boolean; 
  loading?: boolean; 
  className?: string; 
  children: React.ReactNode; 
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`flex-row items-center justify-center rounded-xl px-5 py-3.5 ${disabled || loading ? 'opacity-50' : ''} ${className}`}
    >
      {children}
    </AnimatedPressable>
  );
}

export function PrimaryButton({ title, iconName, iconPosition = 'left', loading, className = '', ...props }: TextButtonProps) {
  return (
    <AnimatedButtonContainer className={`bg-primary dark:bg-primary-dark ${className}`} loading={loading} {...props}>
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View className="flex-row items-center gap-2">
          {iconName && iconPosition === 'left' && (
            <Ionicons name={iconName} size={18} color="#FFFFFF" />
          )}
          <Text className="text-sm font-semibold text-white text-center">
            {title}
          </Text>
          {iconName && iconPosition === 'right' && (
            <Ionicons name={iconName} size={18} color="#FFFFFF" />
          )}
        </View>
      )}
    </AnimatedButtonContainer>
  );
}

export function SecondaryButton({ title, iconName, iconPosition = 'left', loading, className = '', ...props }: TextButtonProps) {
  return (
    <AnimatedButtonContainer className={`bg-primaryContainer dark:bg-primaryContainer-dark ${className}`} loading={loading} {...props}>
      {loading ? (
        <ActivityIndicator size="small" color="#0B57D0" />
      ) : (
        <View className="flex-row items-center gap-2">
          {iconName && iconPosition === 'left' && (
            <Ionicons name={iconName} size={18} color="#0B57D0" />
          )}
          <Text className="text-sm font-semibold text-primary dark:text-primary-dark text-center">
            {title}
          </Text>
          {iconName && iconPosition === 'right' && (
            <Ionicons name={iconName} size={18} color="#0B57D0" />
          )}
        </View>
      )}
    </AnimatedButtonContainer>
  );
}

export function OutlinedButton({ title, iconName, iconPosition = 'left', loading, className = '', ...props }: TextButtonProps) {
  return (
    <AnimatedButtonContainer className={`border border-border dark:border-border-dark bg-transparent ${className}`} loading={loading} {...props}>
      {loading ? (
        <ActivityIndicator size="small" color="#0B57D0" />
      ) : (
        <View className="flex-row items-center gap-2">
          {iconName && iconPosition === 'left' && (
            <Ionicons name={iconName} size={18} color="#0B57D0" />
          )}
          <Text className="text-sm font-semibold text-primary dark:text-primary-dark text-center">
            {title}
          </Text>
          {iconName && iconPosition === 'right' && (
            <Ionicons name={iconName} size={18} color="#0B57D0" />
          )}
        </View>
      )}
    </AnimatedButtonContainer>
  );
}

export function IconButton({ iconName, size = 20, color, loading, className = '', ...props }: IconButtonProps) {
  return (
    <AnimatedButtonContainer className={`p-2.5 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark ${className}`} loading={loading} {...props}>
      {loading ? (
        <ActivityIndicator size="small" color={color || '#0B57D0'} />
      ) : (
        <Ionicons name={iconName} size={size} color={color || '#0B57D0'} />
      )}
    </AnimatedButtonContainer>
  );
}
