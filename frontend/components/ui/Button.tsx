import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  let bgStyle = 'bg-primary dark:bg-primary-dark';
  let textStyle = 'text-text-light';

  switch (variant) {
    case 'secondary':
      bgStyle = 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark';
      textStyle = 'text-text dark:text-text-dark';
      break;
    case 'success':
      bgStyle = 'bg-success dark:bg-success-dark';
      textStyle = 'text-text-light';
      break;
    case 'danger':
      bgStyle = 'bg-danger dark:bg-danger-dark';
      textStyle = 'text-text-light';
      break;
    default:
      bgStyle = 'bg-primary dark:bg-primary-dark';
      textStyle = 'text-text-light';
      break;
  }

  if (disabled || loading) {
    bgStyle += ' opacity-50';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center py-3.5 px-6 rounded-xl ${bgStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#F8FAFC" />
      ) : (
        <Text className={`text-base font-semibold text-center ${textStyle}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default Button;
