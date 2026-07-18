import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  label: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function MedicalInput({
  value,
  onChangeText,
  placeholder,
  error,
  label,
  keyboardType = 'default',
  autoCapitalize = 'none'
}: InputProps) {
  const { colors, isDark } = useTheme();

  return (
    <View className="mb-4">
      <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </Text>
      <View className={`flex-row items-center bg-surface dark:bg-surface-dark border ${
        error ? 'border-danger' : 'border-border/60 dark:border-border-dark/60'
      } rounded-xl px-3.5 py-2.5 shadow-sm`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#8E918F' : '#80868B'}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          className="flex-1 text-xs text-text dark:text-text-dark font-medium p-0"
          style={{ includeFontPadding: false }}
        />
      </View>
      {error && (
        <Text className="text-[9px] font-bold text-danger mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}

export function PasswordInput({
  value,
  onChangeText,
  placeholder,
  error,
  label
}: Omit<InputProps, 'keyboardType' | 'autoCapitalize'>) {
  const { colors, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </Text>
      <View className={`flex-row items-center bg-surface dark:bg-surface-dark border ${
        error ? 'border-danger' : 'border-border/60 dark:border-border-dark/60'
      } rounded-xl px-3.5 py-2.5 shadow-sm`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#8E918F' : '#80868B'}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          className="flex-1 text-xs text-text dark:text-text-dark font-medium p-0"
          style={{ includeFontPadding: false }}
        />
        
        <Pressable 
          onPress={() => setShowPassword(!showPassword)}
          className="p-1"
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Ionicons 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={16} 
            color={isDark ? '#C4C7C5' : '#5F6368'} 
          />
        </Pressable>
      </View>
      {error && (
        <Text className="text-[9px] font-bold text-danger mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}

export function AuthenticationCard({ children, extraClassName = '' }: { children: React.ReactNode; extraClassName?: string }) {
  return (
    <View className={`bg-surface dark:bg-surface-dark border border-border/45 dark:border-border-dark/45 rounded-2xl p-5 shadow-md ${extraClassName}`}>
      {children}
    </View>
  );
}
