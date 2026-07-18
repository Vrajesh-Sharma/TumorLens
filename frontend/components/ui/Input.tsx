import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName = '',
  className = '',
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry;
  const effectiveSecureText = isPassword ? !isPasswordVisible : false;

  const focusRingClass = isFocused
    ? 'border-primary dark:border-primary-dark'
    : error
      ? 'border-danger dark:border-danger-dark'
      : 'border-border dark:border-border-dark';

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-text dark:text-text-dark mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-surface dark:bg-surface-dark border rounded-xl px-3.5 h-12 ${focusRingClass}`}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={isFocused ? '#0B57D0' : '#5F6368'}
            className="mr-2"
          />
        )}
        <TextInput
          className={`flex-1 text-base text-text dark:text-text-dark h-full ${className}`}
          placeholderTextColor="#5F6368"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={effectiveSecureText}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="p-1"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#5F6368"
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} className="p-1">
            <Ionicons name={rightIcon} size={18} color="#5F6368" />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-xs text-danger dark:text-danger-dark mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}

export default Input;
