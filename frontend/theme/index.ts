import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/appStore';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  dx: 48,
  dxl: 64,
};

export const borderRadius = {
  small: 6,
  medium: 12,
  large: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  floatingButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
};

export const colors = {
  light: {
    primary: '#0B57D0',
    secondary: '#5F6368',
    success: '#137333',
    warning: '#B06000',
    danger: '#C5221F',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#DADCE0',
    text: '#1F2023',
    subText: '#5F6368',
    primaryContainer: '#D3E3FD',
    onPrimaryContainer: '#041E49',
  },
  dark: {
    primary: '#A8C7FA',
    secondary: '#C4C7C5',
    success: '#81C995',
    warning: '#FDD663',
    danger: '#F28B82',
    background: '#0B0F19',
    surface: '#151F32',
    border: '#24334C',
    text: '#E3E3E3',
    subText: '#C4C7C5',
    primaryContainer: '#0842A0',
    onPrimaryContainer: '#D3E3FD',
  },
};

export const fonts = {
  heading: 'Sora',
  body: 'Inter',
  mono: 'JetBrainsMono',
} as const;

export const typography = {
  sizes: {
    headingXL: 32,
    headingLarge: 24,
    headingMedium: 20,
    title: 18,
    subtitle: 16,
    body: 14,
    caption: 12,
    smallText: 10,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  fonts,
};

export const icons = {
  home: 'home-outline' as const,
  homeActive: 'home' as const,
  reports: 'document-text-outline' as const,
  reportsActive: 'document-text' as const,
  upload: 'cloud-upload-outline' as const,
  uploadActive: 'cloud-upload' as const,
  history: 'time-outline' as const,
  historyActive: 'time' as const,
  settings: 'settings-outline' as const,
  settingsActive: 'settings' as const,
  back: 'arrow-back' as const,
  notification: 'notifications-outline' as const,
  notificationActive: 'notifications' as const,
  chevronRight: 'chevron-forward' as const,
  info: 'information-circle-outline' as const,
  alert: 'alert-circle-outline' as const,
  checkmark: 'checkmark-circle-outline' as const,
  close: 'close' as const,
  refresh: 'refresh-outline' as const,
  image: 'image-outline' as const,
};

export const theme = {
  spacing,
  borderRadius,
  shadows,
  colors,
  typography,
  icons,
  fonts,
};

export function useTheme() {
  const themeMode = useAppStore((s) => s.themeMode);
  const scheme = useColorScheme();

  // const isDark = themeMode === 'dark' || (themeMode === 'system' && scheme === 'dark');
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  return {
    colors: themeColors,
    isDark,
    theme,
  };
}
