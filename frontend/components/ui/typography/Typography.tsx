import React from 'react';
import { Text, TextProps } from 'react-native';

export function HeadingXL({ className = '', children, ...props }: TextProps) {
  return (
    <Text className={`text-4xl font-bold text-text dark:text-text-dark ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function HeadingLarge({ className = '', children, ...props }: TextProps) {
  return (
    <Text className={`text-2xl font-bold text-text dark:text-text-dark ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function HeadingMedium({ className = '', children, ...props }: TextProps) {
  return (
    <Text className={`text-xl font-semibold text-text dark:text-text-dark ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function Title({ className = '', children, ...props }: TextProps) {
  return (
    <Text className={`text-lg font-semibold text-text dark:text-text-dark ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function Subtitle({ className = '', children, ...props }: TextProps) {
  return (
    <Text className={`text-base font-medium text-subText dark:text-subText-dark ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function Body({ className = '', children, ...props }: TextProps) {
  return (
    <Text className={`text-sm font-normal leading-5 text-text dark:text-text-dark ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function Caption({ className = '', children, ...props }: TextProps) {
  return (
    <Text className={`text-xs font-normal text-subText dark:text-subText-dark ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function SmallText({ className = '', children, ...props }: TextProps) {
  return (
    <Text className={`text-[10px] font-normal tracking-wide text-subText dark:text-subText-dark ${className}`} {...props}>
      {children}
    </Text>
  );
}
