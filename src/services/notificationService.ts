import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notificationApi';
import { DeviceRegistrationPayload, NotificationType, PushNotificationItem } from '../types/models';
import { CONFIG } from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';
import { useTenantStore } from '../store/useTenantStore';

// Configure foreground notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isCritical =
      notification.request.content.data?.type === 'CRITICAL' ||
      notification.request.content.data?.channelId === 'critical_alarms';

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: isCritical
        ? Notifications.AndroidNotificationPriority.MAX
        : Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

export const notificationService = {
  /**
   * Configure Android Notification Priority Channels
   */
  async setupNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      // Channel 1: critical_alarms (High priority, bypasses DND for AP theft/disconnects)
      await Notifications.setNotificationChannelAsync('critical_alarms', {
        name: '🚨 Critical Alarms (AP Theft & Cuts)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500, 200, 500],
        lightColor: '#F43F5E',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        bypassDnd: true,
      });

      // Channel 2: financial_alerts (Standard/High priority for M-Pesa payments > KES 1,000)
      await Notifications.setNotificationChannelAsync('financial_alerts', {
        name: '💰 Financial & M-Pesa Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: '#10B981',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });

      // Channel 3: system_updates (Low/Default priority)
      await Notifications.setNotificationChannelAsync('system_updates', {
        name: '⚙️ System Updates & Dispatches',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#6366F1',
        sound: 'default',
        enableLights: false,
        enableVibrate: true,
      });
    }
  },

  /**
   * Obtains device push token (APNs on iOS, FCM on Android, Expo Push Token)
   * and registers it with the backend API
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      await this.setupNotificationChannels();

      if (Platform.OS === 'web') {
        const mockToken = 'ExponentPushToken[web_preview_stargaze_token]';
        await this.syncTokenWithBackend(mockToken);
        return mockToken;
      }

      const settings: any = await Notifications.getPermissionsAsync();
      let isGranted = Boolean(settings?.granted || settings?.status === 'granted');

      if (!isGranted) {
        const request: any = await Notifications.requestPermissionsAsync();
        isGranted = Boolean(request?.granted || request?.status === 'granted');
      }

      if (!isGranted) {
        console.warn('[NotificationService] Permission denied for push notifications');
        return null;
      }

      // Retrieve device push token
      let token = 'ExponentPushToken[local_device_' + Platform.OS + ']';
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
      } catch (err) {
        console.warn('[NotificationService] Using fallback device push token:', err);
      }

      await this.syncTokenWithBackend(token);
      return token;
    } catch (err) {
      console.warn('[NotificationService] Push registration error:', err);
      return null;
    }
  },

  /**
   * Dispatches token registration payload to POST /api/v1/notifications/register-device
   */
  async syncTokenWithBackend(deviceToken: string): Promise<void> {
    const user = useAuthStore.getState().user;
    const currentTenant = useTenantStore.getState().currentTenant;

    const payload: DeviceRegistrationPayload = {
      deviceToken,
      platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
      tenantId: currentTenant?.id || 'tenant-main-nairobi',
      userId: user?.id || 'usr-tech-001',
      appVersion: CONFIG.APP_VERSION,
      registeredAt: new Date().toISOString(),
    };

    await notificationApi.registerDeviceToken(payload);
  },

  /**
   * Presents local notification matching the channel priority
   */
  async presentLocalNotification(item: PushNotificationItem): Promise<void> {
    const isCritical = item.type === 'CRITICAL';
    const isFinancial = item.type === 'PAYMENT';

    const channelId = isCritical
      ? 'critical_alarms'
      : isFinancial
      ? 'financial_alerts'
      : 'system_updates';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        data: {
          ...item.data,
          type: item.type,
          targetScreen: item.targetScreen,
          channelId,
        },
        sound: true,
        priority: isCritical
          ? Notifications.AndroidNotificationPriority.MAX
          : Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Deliver immediately
    });
  },
};

export default notificationService;
