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
  let bgStyle = 'bg-primary';
  let textStyle = 'text-text-light';

  switch (variant) {
    case 'secondary':
      bgStyle = 'bg-surface border border-border';
      textStyle = 'text-text';
      break;
    case 'success':
      bgStyle = 'bg-success';
      textStyle = 'text-text-light';
      break;
    case 'danger':
      bgStyle = 'bg-danger';
      textStyle = 'text-text-light';
      break;
    default:
      bgStyle = 'bg-primary';
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
