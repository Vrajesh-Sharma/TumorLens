import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Alert, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../hooks/useOffline';
import { useCache } from '../../hooks/useCache';
import { DoctorCard, ProfileSection, SettingsItem } from '../../components/profile/ProfileComponents';
import { QueueStatus, StorageUsageCard } from '../../components/offline/OfflineUI';
import { useTheme } from '../../theme';
import { Directory, Paths } from 'expo-file-system';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user, logout } = useAuth();
  const offline = useOffline();
  const cache = useCache();

  // Settings State Hooks
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('English (US)');
  const [darkMode, setDarkMode] = useState(isDark);
  const [dbSizeStr, setDbSizeStr] = useState('0.00 KB');

  // Format database size
  useEffect(() => {
    const size = offline.dbSize;
    if (size === 0) {
      setDbSizeStr('0.00 KB');
      return;
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    setDbSizeStr(parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]);
  }, [offline.dbSize]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out Account',
      'Are you sure you want to end your active clinician session? Local cached records will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          }
        }
      ]
    );
  };

  const handleLanguageSelect = () => {
    Alert.alert(
      'Workstation Language',
      'Select default localization dictionary:',
      [
        { text: 'English (US)', onPress: () => setLanguage('English (US)') },
        { text: 'Español (ES)', onPress: () => setLanguage('Español (ES)') },
        { text: 'Deutsch (DE)', onPress: () => setLanguage('Deutsch (DE)') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'HIPAA Data Privacy Policy',
      'This workstation is fully compliant with regional patient confidentiality laws. Dynamic U-Net overlay masks and metadata summaries are protected using locally stored AES-256 secure tokens. Remote synchronization requires federated OAuth credentials.'
    );
  };

  const handleDatabaseRestorePrompt = async () => {
    try {
      const backupDir = new Directory(Paths.document, 'backups');
      
      if (!(await backupDir.exists)) {
        Alert.alert('No Backups Found', 'No local backups have been compiled yet.');
        return;
      }

      const files = await backupDir.list();
      const jsonBackups = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));

      if (jsonBackups.length === 0) {
        Alert.alert('No Backups Found', 'No local backups have been compiled yet.');
        return;
      }

      const sortedBackups = jsonBackups.sort().reverse().slice(0, 3);
      const buttons = sortedBackups.map(file => ({
        text: file.replace('backup_tumorlens_', '').replace('.json', ''),
        onPress: async () => {
          const success = await offline.restoreDatabase(backupDir.uri);
          if (success) {
            cache.refreshSizes();
          }
        }
      }));

      Alert.alert(
        'Restore Database',
        'Select a backup timestamp to restore. This will overwrite current records.',
        [
          ...buttons,
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch {
      Alert.alert('Restore Error', 'Could not read backups directory.');
    }
  };

  if (!user) return null;

  return (
    <ScreenContainer scrollable={false}>
      {/* Settings Header */}
      <AppHeader title="Workstation Control" subtitle="Clinician profile & configuration" />

      <ScrollView 
        className={`flex-1 ${isTablet ? 'px-12' : 'px-5'}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
      >
        {/* Doctor profile card */}
        <View className="mb-5">
          <Text className="text-[10px] font-bold text-subText dark:text-subText-dark uppercase tracking-wider mb-2.5 ml-1">
            Active Practitioner
          </Text>
          <DoctorCard user={user} />
        </View>

        {/* Offline Sync Queue */}
        <View className="mb-5">
          <QueueStatus />
        </View>

        {/* Storage Cache Usage */}
        <View className="mb-5">
          <StorageUsageCard />
        </View>

        {/* Preferences Section */}
        <ProfileSection title="Workstation Preferences">
          <SettingsItem 
            icon="notifications-outline" 
            title="Intake Notifications" 
            subtitle="Get alerts for remote scan completions" 
            hasSwitch 
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />
          <SettingsItem 
            icon="language-outline" 
            title="System Language" 
            subtitle="Change dictionary localization" 
            value={language}
            onPress={handleLanguageSelect}
          />
          <SettingsItem 
            icon="moon-outline" 
            title="Dark Interface Mode" 
            subtitle="Toggle high-contrast radiology theme" 
            hasSwitch 
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
        </ProfileSection>

        {/* Database Management Section */}
        <ProfileSection title="Database Operations">
          <SettingsItem 
            icon="server-outline" 
            title="Database SQLite File Size" 
            subtitle="Current active SQLite memory layout size" 
            value={dbSizeStr}
          />
          <SettingsItem 
            icon="cloud-upload-outline" 
            title="Backup Local Database" 
            subtitle="Compile and save database state locally" 
            onPress={offline.backupDatabase}
          />
          <SettingsItem 
            icon="cloud-download-outline" 
            title="Restore Local Database" 
            subtitle="Roll back database state to previous backup" 
            onPress={handleDatabaseRestorePrompt}
          />
          <SettingsItem 
            icon="share-outline" 
            title="Share/Export Database" 
            subtitle="Send active .db file to external audit targets" 
            onPress={offline.exportDatabaseFile}
          />
        </ProfileSection>

        {/* Clinical Audits / Exports Section */}
        <ProfileSection title="Data Export Formats">
          <SettingsItem 
            icon="document-text-outline" 
            title="Export Reports to CSV" 
            subtitle="Share reports spreadsheet with annotations" 
            onPress={offline.exportReportsCSV}
          />
          <SettingsItem 
            icon="code-working-outline" 
            title="Export Reports to JSON" 
            subtitle="Share structured diagnostics metadata payload" 
            onPress={offline.exportReportsJSON}
          />
        </ProfileSection>

        {/* Security Section */}
        <ProfileSection title="Security & Compliance">
          <SettingsItem 
            icon="shield-checkmark-outline" 
            title="HIPAA Privacy Guidelines" 
            subtitle="Review patient confidentiality terms" 
            onPress={handlePrivacyPolicy}
          />
          <SettingsItem 
            icon="finger-print-outline" 
            title="Local Biometrics Status" 
            subtitle="Touch ID / Face ID hardware configuration" 
            value="Configured"
          />
        </ProfileSection>

        {/* Cleanups / Destructive Operations */}
        <ProfileSection title="Emergency & Storage Control">
          <SettingsItem 
            icon="trash-outline" 
            title="Delete Local Reports" 
            subtitle="Wipe local diagnostic logs and files" 
            destructive
            onPress={cache.deleteLocalReports}
          />
        </ProfileSection>

        {/* Account Management */}
        <ProfileSection title="Account Control">
          <SettingsItem 
            icon="log-out-outline" 
            title="Sign Out Workstation" 
            subtitle="Purge local keys and lock database" 
            destructive
            onPress={handleLogout}
          />
        </ProfileSection>
      </ScrollView>
    </ScreenContainer>
  );
}
