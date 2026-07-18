import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface EmptyReportsProps {
  type: 'reports' | 'search' | 'favorites';
  query?: string;
}

export function EmptyReports({ type, query }: EmptyReportsProps) {
  const { isDark } = useTheme();

  const getContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: 'search-outline',
          title: 'No Matching Cases',
          desc: `We couldn't find any patient or report ID matching "${query}". Check spelling or try a different filter.`,
        };
      case 'favorites':
        return {
          icon: 'star-outline',
          title: 'No Starred Reports',
          desc: 'Press the star icon on any radiology card to mark it as a favorite for quick reference.',
        };
      case 'reports':
      default:
        return {
          icon: 'folder-open-outline',
          title: 'No Reports Found',
          desc: 'Import or capture T2-weighted structural MRI slices in the upload tab to generate AI diagnostic models.',
        };
    }
  };

  const content = getContent();

  return (
    <View className="flex-1 py-14 px-6 items-center justify-center">
      <View className="w-14 h-14 rounded-full bg-border/20 dark:bg-border-dark/20 items-center justify-center mb-4">
        <Ionicons name={content.icon as keyof typeof Ionicons.glyphMap} size={26} color={isDark ? '#C4C7C5' : '#5F6368'} />
      </View>
      
      <Text className="text-sm font-bold text-text dark:text-text-dark text-center">
        {content.title}
      </Text>
      
      <Text className="text-xs text-subText dark:text-subText-dark text-center mt-1.5 leading-5 max-w-[280px]">
        {content.desc}
      </Text>
    </View>
  );
}

export default EmptyReports;
