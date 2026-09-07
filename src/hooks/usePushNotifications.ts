import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import { notificationApi } from '../api/notificationApi';
import { operationsApi } from '../api/operationsApi';
import { navigateToTab } from '../navigation/navigationRef';
import { NotificationType, PushNotificationItem } from '../types/models';
import { useQueryClient } from '@tanstack/react-query';

export const usePushNotifications = () => {
  const queryClient = useQueryClient();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // 1. Register device push token with backend on launch
    notificationService.registerForPushNotifications().then((token) => {
      setExpoPushToken(token);
    });

    // 2. Foreground Notification Received Listener
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notif) => {
        setNotification(notif);
      }
    );

    // 3. Notification Tap Response Listener (Deep Linking)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        const targetScreen = data?.targetScreen || data?.screen;
        const port = data?.port || 'ether4';

        if (targetScreen === 'Operations' || data?.type === 'CRITICAL' || data?.type === 'HARDWARE_DISCONNECT') {
          // Deep link directly to Operations screen with target port focus
          navigateToTab('Operations');
        } else if (
          targetScreen === 'Customers' ||
          targetScreen === 'Finance' ||
          data?.type === 'PAYMENT' ||
          data?.type === 'MPESA_PAYMENT'
        ) {
          // Deep link directly to M-Pesa Financial Stream
          navigateToTab('Customers');
        } else if (targetScreen === 'Dashboard') {
          navigateToTab('Dashboard');
        } else if (targetScreen === 'Settings') {
          navigateToTab('Settings');
        } else {
          navigateToTab('Operations');
        }
      }
    );

    // 4. Background Fetch & Warm Cache Polling (every 60s in background)
    const backgroundInterval = setInterval(async () => {
      try {
        // Pre-warm topology and alert cache silently
        await operationsApi.getAccessPointsTopology();
        queryClient.invalidateQueries({ queryKey: ['accessPointsTopology'] });
      } catch (err) {
        // Silent background fallback
      }
    }, 60000);

    // AppState Listener to trigger immediate sync when transitioning from background to active
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        queryClient.invalidateQueries();
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(backgroundInterval);
      subscription.remove();
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [queryClient]);

  const triggerTestSimulation = async (type: NotificationType) => {
    setIsSimulating(true);
    try {
      const item: PushNotificationItem = await notificationApi.triggerTestNotification(type);
      await notificationService.presentLocalNotification(item);
    } catch (err) {
      console.warn('[usePushNotifications] Test notification failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    expoPushToken,
    notification,
    isSimulating,
    triggerTestSimulation,
  };
};

export default usePushNotifications;
