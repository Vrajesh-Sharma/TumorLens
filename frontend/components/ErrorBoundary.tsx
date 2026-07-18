import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Appearance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-background dark:bg-background-dark items-center justify-center p-8" accessibilityRole="alert">
          <View className="w-16 h-16 rounded-full bg-danger/10 dark:bg-danger/20 items-center justify-center mb-4">
            <Ionicons name="alert-circle-outline" size={32} color={Appearance.getColorScheme() === 'dark' ? '#F28B82' : '#C5221F'} />
          </View>
          <Text className="text-xl font-bold text-text dark:text-text-dark text-center mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-subText dark:text-subText-dark text-center mb-6 max-w-xs leading-5">
            An unexpected error occurred. Please try again or restart the app.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-primary dark:bg-primary-dark px-8 py-3 rounded-xl active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Try to recover from error"
          >
            <Text className="text-white dark:text-background-dark font-semibold text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
