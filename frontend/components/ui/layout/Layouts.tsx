import React from 'react';
import {
  View,
  ScrollView,
  ViewProps,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Title, Subtitle } from '../typography/Typography';

interface ScreenContainerProps extends ViewProps {
  scrollable?: boolean;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  avoidKeyboard?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = false,
  className = '',
  edges = ['top', 'bottom'],
  avoidKeyboard = false,
  ...props
}: ScreenContainerProps) {
  const containerClass = `flex-1 bg-background dark:bg-background-dark ${className}`;

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      className="flex-1"
    >
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1">{children}</View>
  );

  if (avoidKeyboard) {
    return (
      <SafeAreaView className={containerClass} edges={edges} {...props}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={containerClass} edges={edges} {...props}>
      {content}
    </SafeAreaView>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, rightAction, className = '' }: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between py-2 mb-4 ${className}`}>
      <View className="flex-1 mr-4">
        <Title className="font-bold text-text dark:text-text-dark">{title}</Title>
        {subtitle && (
          <Subtitle className="text-xs text-subText dark:text-subText-dark mt-0.5">{subtitle}</Subtitle>
        )}
      </View>
      {rightAction && (
        <View>
          {rightAction}
        </View>
      )}
    </View>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return (
    <View className={`h-[1px] bg-border dark:bg-border-dark w-full my-4 ${className}`} />
  );
}
