import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useOffline } from '../../hooks/useOffline';
import { useCache } from '../../hooks/useCache';
import { useTheme } from '../../theme';

import { SyncQueueItem } from '../../repositories/SyncRepository';

/**
 * 1. OfflineBanner
 * Displays a slide-down banner at the top of the interface when network connection is lost.
 */
export function OfflineBanner() {
  const { isConnected, isWeakConnection, networkDetails } = useOffline();

  if (isConnected && !isWeakConnection) return null;

  const bgStyle = isWeakConnection ? 'bg-warning/90 dark:bg-warning/90' : 'bg-danger/95 dark:bg-danger/95';
  const icon = isWeakConnection ? 'wifi-outline' : 'cloud-offline-outline';
  const title = isWeakConnection ? 'Weak Workstation Connection' : 'Radiology System Offline';

  return (
    <Animated.View 
      entering={FadeInUp.duration(300)} 
      exiting={FadeOutUp.duration(200)}
      className={`w-full px-5 py-2.5 flex-row items-center gap-3 ${bgStyle} z-50 shadow-sm`}
    >
      <Ionicons name={icon as any} size={16} color="white" />
      <View className="flex-1">
        <Text className="text-[10px] font-black text-white uppercase tracking-wider">
          {title}
        </Text>
        <Text className="text-[8px] text-white/90 leading-3 mt-0.5" numberOfLines={1}>
          {networkDetails}
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * 2. SyncIndicator & SyncProgress
 * Displays small sync spinner and queue status.
 */
export function SyncIndicator() {
  const { isSyncing, queueLength, syncNow } = useOffline();

  if (queueLength === 0 && !isSyncing) return null;

  return (
    <Pressable 
      onPress={() => syncNow()}
      className="flex-row items-center gap-1.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg"
      style={({ pressed }) => pressed && { opacity: 0.8 }}
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color="#0B57D0" className="scale-75" />
      ) : (
        <Ionicons name="sync" size={12} className="text-primary animate-spin" />
      )}
      <Text className="text-[8px] font-black text-primary uppercase">
        {isSyncing ? 'Syncing...' : `${queueLength} Queue`}
      </Text>
    </Pressable>
  );
}

/**
 * 3. QueueStatus
 * Displays detailed cards of pending updates.
 */
export function QueueStatus() {
  const { queue, isSyncing, syncNow } = useOffline();

  return (
    <View className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="file-tray-full-outline" size={16} className="text-subText dark:text-subText-dark" />
          <Text className="text-xs font-bold text-text dark:text-text-dark">
            Offline Synchronization Queue
          </Text>
        </View>
        <Text className="text-[10px] font-mono text-subText dark:text-subText-dark">
          {queue.length} Tasks
        </Text>
      </View>

      {queue.length === 0 ? (
        <Text className="text-[10px] text-subText dark:text-subText-dark leading-4">
          All local clinical reports and demographics are fully synchronized with the cloud PACS server.
        </Text>
      ) : (
        <View className="gap-2.5">
          {queue.slice(0, 3).map((item: SyncQueueItem) => (
            <View key={item.id} className="bg-background dark:bg-slate-900/60 p-2.5 rounded-xl border border-border/10 dark:border-border-dark/10 flex-row justify-between items-center">
              <View className="flex-1 mr-2">
                <Text className="text-[9px] font-bold text-text dark:text-text-dark uppercase">
                  {item.operation.replace('_', ' ')}
                </Text>
                <Text className="text-[8px] text-subText dark:text-subText-dark font-mono mt-0.5">
                  ID: {item.id} • {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-[8px] font-mono text-warning bg-warning/5 dark:bg-warning/15 px-1.5 py-0.5 rounded uppercase">
                  Retry: {item.retries}/5
                </Text>
              </View>
            </View>
          ))}
          
          {queue.length > 3 && (
            <Text className="text-[8px] text-subText dark:text-subText-dark text-center uppercase tracking-wider my-1">
              + {queue.length - 3} more queued actions
            </Text>
          )}

          <Pressable
            onPress={() => syncNow()}
            disabled={isSyncing}
            className="w-full bg-primary py-2.5 rounded-xl items-center justify-center mt-1"
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                Sync Queue Now
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

/**
 * 4. StorageUsage & Cache Indicators
 */
export function StorageUsageCard() {
  const { cacheSize, imagesSize, pdfSize, clearCache } = useCache();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0.00 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4 shadow-sm">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="pie-chart-outline" size={16} className="text-subText dark:text-subText-dark" />
        <Text className="text-xs font-bold text-text dark:text-text-dark">
          Workstation Cache Storage
        </Text>
      </View>

      <View className="gap-2 mb-4">
        {/* Images size */}
        <View className="flex-row justify-between py-1 border-b border-border/5 dark:border-border-dark/5">
          <Text className="text-[10px] text-subText dark:text-subText-dark">MRI Image Scans</Text>
          <Text className="text-[10px] font-bold text-text dark:text-text-dark font-mono">{formatSize(imagesSize)}</Text>
        </View>
        
        {/* PDF reports */}
        <View className="flex-row justify-between py-1 border-b border-border/5 dark:border-border-dark/5">
          <Text className="text-[10px] text-subText dark:text-subText-dark">Exported PDFs</Text>
          <Text className="text-[10px] font-bold text-text dark:text-text-dark font-mono">{formatSize(pdfSize)}</Text>
        </View>

        {/* Temporary cache */}
        <View className="flex-row justify-between py-1">
          <Text className="text-[10px] text-subText dark:text-subText-dark">Temporary Cache</Text>
          <Text className="text-[10px] font-bold text-text dark:text-text-dark font-mono">{formatSize(cacheSize)}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => clearCache()}
        className="w-full border border-danger/20 bg-danger/5 py-2.5 rounded-xl items-center justify-center"
        style={({ pressed }) => pressed && { opacity: 0.9 }}
      >
        <Text className="text-[10px] font-bold text-danger uppercase tracking-wider">
          Clear Temporary Cache
        </Text>
      </Pressable>
    </View>
  );
}
