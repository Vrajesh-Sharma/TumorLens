import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync, SyncStatusType } from '../../hooks/useSync';
import { useTheme } from '../../theme';

export function SyncStatusCard() {
  const { colors, isDark } = useTheme();
  const { syncStatus, lastSynced, syncNow } = useSync();

  const getStatusConfig = (status: SyncStatusType) => {
    switch (status) {
      case 'synced':
        return {
          icon: 'cloud-done-outline',
          color: 'text-success',
          bg: 'bg-success/5 dark:bg-success/10',
          border: 'border-success/20',
          title: 'Cloud Synced',
          desc: 'All patient profiles and segmentation reports are backed up.'
        };
      case 'uploading':
        return {
          icon: 'sync-outline',
          color: 'text-primary',
          bg: 'bg-primary/5 dark:bg-primary/10',
          border: 'border-primary/20',
          title: 'Syncing Files...',
          desc: 'Uploading diagnostic scans and profile logs to secure server.'
        };
      case 'offline':
        return {
          icon: 'wifi-outline',
          color: 'text-warning',
          bg: 'bg-warning/5 dark:bg-warning/10',
          border: 'border-warning/20',
          title: 'Offline Mode',
          desc: 'Save queue active. Records will auto-sync when network returns.'
        };
      case 'failed':
        return {
          icon: 'cloud-offline-outline',
          color: 'text-danger',
          bg: 'bg-danger/5 dark:bg-danger/10',
          border: 'border-danger/20',
          title: 'Sync Failed',
          desc: 'Host server rejected connection check. Try manual override.'
        };
      case 'pending':
      default:
        return {
          icon: 'cloud-upload-outline',
          color: 'text-subText',
          bg: 'bg-surface dark:bg-surface-dark',
          border: 'border-border/60 dark:border-border-dark/60',
          title: 'Sync Pending',
          desc: 'Changes detected. Backup recommended to prevent data loss.'
        };
    }
  };

  const config = getStatusConfig(syncStatus);
  const formattedTime = lastSynced ? new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never';

  return (
    <View className={`p-4 border ${config.border} rounded-2xl ${config.bg} flex-row items-center gap-3.5 shadow-xs`}>
      <View className="p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm">
        {syncStatus === 'uploading' ? (
          <ActivityIndicator size="small" color="#0B57D0" />
        ) : (
          <Ionicons name={config.icon as any} size={20} className={config.color} />
        )}
      </View>

      <View className="flex-1">
        <Text className={`text-xs font-bold text-text dark:text-text-dark`}>
          {config.title}
        </Text>
        <Text className="text-[9px] text-subText dark:text-subText-dark mt-0.5 leading-4" numberOfLines={2}>
          {config.desc}
        </Text>
        {lastSynced && (
          <Text className="text-[8px] text-subText dark:text-subText-dark font-mono mt-1 uppercase">
            Last backup: {formattedTime}
          </Text>
        )}
      </View>

      {syncStatus !== 'uploading' && (
        <Pressable
          onPress={() => syncNow()}
          className="bg-primary px-3 py-1.5 rounded-lg"
          style={({ pressed }) => pressed && { opacity: 0.8 }}
        >
          <Text className="text-[9px] font-bold text-white uppercase">
            Sync
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default SyncStatusCard;
