import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface CardProps extends ViewProps {
  className?: string;
  animate?: boolean;
}

export function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  }, [opacity, translateY]);

  return (
    <Animated.View style={animatedStyle} className={className}>
      {children}
    </Animated.View>
  );
}

export function Card({ children, className = '', animate = true, ...props }: CardProps) {
  const content = (
    <View 
      className={`bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-5 rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </View>
  );

  if (animate) {
    return <FadeIn>{content}</FadeIn>;
  }

  return content;
}

export function ElevatedCard({ children, className = '', animate = true, ...props }: CardProps) {
  const content = (
    <View 
      className={`bg-surface dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-border/10 ${className}`}
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
      {...props}
    >
      {children}
    </View>
  );

  if (animate) {
    return <FadeIn>{content}</FadeIn>;
  }

  return content;
}
