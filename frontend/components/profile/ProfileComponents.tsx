import React from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { UserProfile } from '../../contexts/AuthContext';

interface AvatarProps {
  name: string;
  size?: number;
}

export function ProfileAvatar({ name, size = 64 }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'DR';

  return (
    <View 
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-primary dark:bg-primary-dark items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm"
    >
      <Text style={{ fontSize: size * 0.4 }} className="font-bold text-white dark:text-background-dark">
        {initials}
      </Text>
    </View>
  );
}

interface DoctorCardProps {
  user: UserProfile;
}

export function DoctorCard({ user }: DoctorCardProps) {
  const { colors } = useTheme();
  const roleLabel = user.role === 'radiologist' ? 'Radiologist' : 'Doctor';

  return (
    <View className="bg-surface dark:bg-surface-dark border border-border/45 dark:border-border-dark/45 rounded-2xl p-4 flex-row gap-4 items-center shadow-sm">
      <ProfileAvatar name={user.name} size={56} />
      
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs font-bold text-text dark:text-text-dark">
            {user.name}
          </Text>
          <View className={`px-1.5 py-0.5 rounded-full ${user.role === 'radiologist' ? 'bg-primary/10' : 'bg-success/10'}`}>
            <Text className={`text-[8px] font-bold uppercase ${user.role === 'radiologist' ? 'text-primary' : 'text-success'}`}>
              {roleLabel}
            </Text>
          </View>
        </View>
        <Text className="text-[9px] text-subText dark:text-subText-dark mt-1 font-mono">
          {user.email}
        </Text>
      </View>
    </View>
  );
}

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
}

export function SettingsItem({
  icon,
  title,
  subtitle,
  value,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
  destructive = false
}: SettingsItemProps) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={hasSwitch ? undefined : onPress}
      className="flex-row items-center justify-between py-3 border-b border-border/10 dark:border-border-dark/10"
      style={({ pressed }) => pressed && !hasSwitch && { opacity: 0.7 }}
    >
      <View className="flex-row items-center gap-3.5 flex-1 mr-2">
        <View className={`w-8 h-8 rounded-xl items-center justify-center ${
          destructive ? 'bg-danger/10' : 'bg-primary/10'
        }`}>
          <Ionicons 
            name={icon} 
            size={16} 
            color={destructive ? '#C5221F' : '#0B57D0'} 
          />
        </View>
        <View className="flex-1">
          <Text className={`text-xs font-bold ${destructive ? 'text-danger' : 'text-text dark:text-text-dark'}`}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-[8px] text-subText dark:text-subText-dark mt-0.5 leading-3">
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {hasSwitch ? (
        <Switch 
          value={switchValue} 
          onValueChange={onSwitchChange} 
          trackColor={{ false: '#BDC1C6', true: '#0B57D0' }}
          thumbColor={isDark ? '#E3E3E3' : '#FFFFFF'}
        />
      ) : (
        <View className="flex-row items-center gap-1.5">
          {value && (
            <Text className="text-[10px] text-subText dark:text-subText-dark font-medium uppercase font-mono">
              {value}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={14} color={isDark ? '#8E918F' : '#80868B'} />
        </View>
      )}
    </Pressable>
  );
}

export function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider mb-2.5 ml-1">
        {title}
      </Text>
      <View className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl px-4 py-1.5 shadow-sm">
        {children}
      </View>
    </View>
  );
}
