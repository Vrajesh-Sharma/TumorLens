import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0B57D0',
      });

      await Notifications.setNotificationChannelAsync('sync', {
        name: 'Sync Status',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 100, 100],
        lightColor: '#137333',
      });

      await Notifications.setNotificationChannelAsync('offline', {
        name: 'Offline Alerts',
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0, 100],
        lightColor: '#B06000',
      });
    }

    return true;
  } catch (err) {
    console.error('[Notifications] Permission error:', err);
    return false;
  }
}

async function getPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

async function scheduleLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
  } catch (err) {
    console.error('[Notifications] Schedule failed:', err);
  }
}

async function scheduleSyncCompleteNotification(syncedCount: number) {
  await scheduleLocalNotification(
    'Sync Complete',
    `${syncedCount} item${syncedCount === 1 ? '' : 's'} synced to cloud.`,
    { type: 'sync_complete' }
  );
}

async function scheduleSyncFailedNotification(failedCount: number) {
  await scheduleLocalNotification(
    'Sync Partially Failed',
    `${failedCount} item${failedCount === 1 ? '' : 's'} could not be synced. Open queue to retry.`,
    { type: 'sync_failed' }
  );
}

async function scheduleOfflineNotification() {
  await scheduleLocalNotification(
    'You Are Offline',
    'Changes will be saved locally and sync automatically when reconnected.',
    { type: 'offline' }
  );
}

async function scheduleOnlineNotification(pendingCount: number) {
  await scheduleLocalNotification(
    'Back Online',
    pendingCount > 0
      ? `${pendingCount} pending item${pendingCount === 1 ? '' : 's'} will sync now.`
      : 'Connection restored.',
    { type: 'online' }
  );
}

async function scheduleReportSavedNotification(patientName: string) {
  await scheduleLocalNotification(
    'Report Saved',
    `AI analysis for ${patientName} saved locally and queued for sync.`,
    { type: 'report_saved' }
  );
}

async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.error('[Notifications] Cancel failed:', err);
  }
}

export const notificationService = {
  requestPermissions,
  getPushToken,
  scheduleLocalNotification,
  scheduleSyncCompleteNotification,
  scheduleSyncFailedNotification,
  scheduleOfflineNotification,
  scheduleOnlineNotification,
  scheduleReportSavedNotification,
  cancelAllNotifications,
  addNotificationResponseListener: Notifications.addNotificationResponseReceivedListener,
  addNotificationReceivedListener: Notifications.addNotificationReceivedListener,
};

export default notificationService;
