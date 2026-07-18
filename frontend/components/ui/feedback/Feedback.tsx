import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Title, Caption } from '../typography/Typography';
import { PrimaryButton, OutlinedButton } from '../buttons/Buttons';

interface AvatarProps {
  uri?: string;
  initials?: string;
  size?: number;
}

export function Avatar({ uri, initials = 'DR', size = 40 }: AvatarProps) {
  return (
    <View 
      className="bg-primaryContainer dark:bg-primaryContainer-dark items-center justify-center border border-border dark:border-border-dark"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {uri ? (
        <Image 
          source={{ uri }} 
          className="w-full h-full"
          style={{ borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Text 
          className="text-primary dark:text-primary-dark font-bold"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

interface BadgeProps {
  count?: number;
  visible?: boolean;
}

export function Badge({ count, visible = true }: BadgeProps) {
  if (!visible) return null;

  return (
    <View className="bg-danger px-1.5 py-0.5 rounded-full items-center justify-center min-w-[18px] min-h-[18px]">
      <Text className="text-white text-[9px] font-black text-center">
        {count !== undefined && count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

interface ChipProps {
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, iconName, selected = false, onPress }: ChipProps) {
  const activeClass = selected 
    ? 'bg-primary dark:bg-primary-dark border-primary' 
    : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark';
  const textClass = selected 
    ? 'text-white' 
    : 'text-text dark:text-text-dark';
  const iconColor = selected ? '#FFFFFF' : '#5F6368';

  return (
    <View 
      className={`flex-row items-center border px-3.5 py-1.5 rounded-full gap-1.5 ${activeClass}`}
      onTouchEnd={onPress}
    >
      {iconName && (
        <Ionicons name={iconName} size={14} color={iconColor} />
      )}
      <Text className={`text-xs font-semibold ${textClass}`}>
        {label}
      </Text>
    </View>
  );
}

export function LoadingSpinner({ size = 28, color = '#0B57D0' }: { size?: number; color?: string }) {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200 }),
      -1,
      false
    );
  }, [rotation]);

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="sync-outline" size={size} color={color} />
    </Animated.View>
  );
}

interface EmptyStateProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({ iconName, title, description, actionTitle, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8 bg-transparent">
      <View className="w-16 h-16 rounded-full bg-surface dark:bg-surface-dark items-center justify-center mb-4 border border-border dark:border-border-dark">
        <Ionicons name={iconName} size={28} color="#5F6368" />
      </View>
      <Title className="font-bold text-center text-text dark:text-text-dark">{title}</Title>
      <Caption className="text-center text-subText dark:text-subText-dark mt-2 max-w-xs px-2 leading-4">
        {description}
      </Caption>
      {actionTitle && onAction && (
        <PrimaryButton 
          title={actionTitle} 
          onPress={onAction} 
          className="mt-6 w-48"
        />
      )}
    </View>
  );
}

interface ErrorStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({ iconName = 'alert-circle-outline', title, description, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8 bg-transparent">
      <View className="w-16 h-16 rounded-full bg-danger/10 items-center justify-center mb-4 border border-danger/20">
        <Ionicons name={iconName} size={28} color="#C5221F" />
      </View>
      <Title className="font-bold text-center text-text dark:text-text-dark">{title}</Title>
      <Caption className="text-center text-subText dark:text-subText-dark mt-2 max-w-xs px-2 leading-4">
        {description}
      </Caption>
      {onRetry && (
        <OutlinedButton 
          title="Retry Connection" 
          onPress={onRetry} 
          iconName="refresh"
          className="mt-6 w-48"
        />
      )}
    </View>
  );
}

interface MedicalStatusBadgeProps {
  status: 'healthy' | 'anomaly' | 'pending';
}

export function MedicalStatusBadge({ status }: MedicalStatusBadgeProps) {
  let bgStyle = 'bg-success/10 border-success/20';
  let textStyle = 'text-success';
  let label = 'No Anomaly';

  if (status === 'anomaly') {
    bgStyle = 'bg-danger/10 border-danger/20';
    textStyle = 'text-danger';
    label = 'Anomaly Detected';
  } else if (status === 'pending') {
    bgStyle = 'bg-warning/10 border-warning/20';
    textStyle = 'text-warning';
    label = 'Analyzing Scan';
  }

  return (
    <View className={`px-3 py-1 rounded-full border ${bgStyle}`}>
      <Text className={`text-xs font-bold ${textStyle}`}>
        {label}
      </Text>
    </View>
  );
}

export function ProgressIndicator({ value }: { value: number }) {
  const clampedValue = Math.max(0, Math.min(1, value));
  
  return (
    <View className="w-full bg-border dark:bg-border-dark h-2 rounded-full overflow-hidden">
      <View 
        className="bg-primary dark:bg-primary-dark h-full rounded-full"
        style={{ width: `${clampedValue * 100}%` }}
      />
    </View>
  );
}

export function FullScreenLoader() {
  return (
    <View className="flex-1 bg-background dark:bg-background-dark items-center justify-center">
      <LoadingSpinner size={36} />
      <Caption className="mt-4 font-semibold tracking-widest text-primary dark:text-primary-dark uppercase">
        Initializing Clinician Workspace
      </Caption>
    </View>
  );
}

export function ButtonLoader({ color = '#FFFFFF' }: { color?: string }) {
  return <ActivityIndicator size="small" color={color} />;
}

export function SkeletonCard() {
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: pulse.value,
    };
  });

  return (
    <Animated.View 
      style={animatedStyle} 
      className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-5 rounded-2xl mb-4 gap-3"
    >
      <View className="h-4 bg-border dark:bg-border-dark rounded w-1/3" />
      <View className="h-6 bg-border dark:bg-border-dark rounded w-3/4 mt-1" />
      <View className="h-4 bg-border dark:bg-border-dark rounded w-1/2" />
    </Animated.View>
  );
}

export function ImagePlaceholder() {
  return (
    <View className="bg-surface dark:bg-surface-dark border border-dashed border-border dark:border-border-dark rounded-2xl h-48 w-full items-center justify-center gap-2">
      <Ionicons name="image-outline" size={32} color="#5F6368" />
      <Caption className="text-subText dark:text-subText-dark">MRI Scan Preview Area</Caption>
    </View>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState 
      iconName="cloud-offline-outline"
      title="Network Request Failed"
      description="The application could not reach the clinical analysis endpoint. Please verify your workstation's network settings."
      onRetry={onRetry}
    />
  );
}

export function EmptyReports({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState 
      iconName="document-text-outline"
      title="No Clinical Reports Found"
      description="There are currently no generated diagnostic reports saved in this case file."
      actionTitle="Upload MRI Scan"
      onAction={onAction}
    />
  );
}

export function NoInternet({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState 
      iconName="wifi-outline"
      title="No Connection"
      description="No active internet network interface was detected. Please connect to your hospital LAN or clinical Wi-Fi network."
      onRetry={onRetry}
    />
  );
}

export function SomethingWentWrong({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState 
      iconName="close-circle-outline"
      title="Application Error"
      description="An unexpected error occurred during segment compilation. If this persists, please contact medical IT support."
      onRetry={onRetry}
    />
  );
}
