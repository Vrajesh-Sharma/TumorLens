import React, { useRef } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = React.memo(function SearchBar({ value, onChangeText, placeholder = 'Search patient name or report ID...' }: SearchBarProps) {
  const { isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);

  return (
    <View className="flex-row items-center bg-surface dark:bg-surface-dark border border-border/60 dark:border-border-dark/60 rounded-xl px-3.5 py-2.5 shadow-sm">
      <Ionicons name="search" size={16} color={isDark ? '#C4C7C5' : '#5F6368'} className="mr-2" />
      
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#8E918F' : '#80868B'}
        className="flex-1 text-xs text-text dark:text-text-dark font-medium p-0"
        style={{ includeFontPadding: false }}
        accessibilityLabel="Search case files"
      />

      {value.length > 0 && (
        <Pressable 
          onPress={() => onChangeText('')}
          className="p-1"
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Ionicons name="close-circle" size={16} color={isDark ? '#C4C7C5' : '#5F6368'} />
        </Pressable>
      )}
    </View>
  );
});

export default SearchBar;
