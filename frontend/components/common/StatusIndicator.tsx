import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useHealthStatus } from '../../hooks/useHealthStatus';

export function StatusIndicator() {
  const { isConnected, isLoading } = useHealthStatus();

  return (
    <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
      {isLoading ? (
        <ActivityIndicator size="small" color="#14B8A6" className="scale-75" />
      ) : (
        <View
          className={`w-2.5 h-2.5 rounded-full ${
            isConnected ? 'bg-success' : 'bg-danger'
          }`}
        />
      )}
      <Text className="text-subText text-xs font-semibold tracking-wide uppercase">
        {isLoading ? 'Connecting...' : isConnected ? 'API Connected' : 'API Offline'}
      </Text>
    </View>
  );
}

export default StatusIndicator;
