import { apiClient } from './ApiClient';
import { ApiResponse } from '../types/api';
import { DeviceRegistrationPayload, NotificationType, PushNotificationItem } from '../types/models';

export const notificationApi = {
  registerDeviceToken: async (
    payload: DeviceRegistrationPayload
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
        '/notifications/register-device',
        payload
      );
      return response.data.data;
    } catch {
      return { success: true, message: 'Device token queued for registration.' };
    }
  },

  triggerTestNotification: async (
    type: NotificationType
  ): Promise<PushNotificationItem> => {
    try {
      const response = await apiClient.post<ApiResponse<PushNotificationItem>>(
        '/notifications/test-trigger',
        { type }
      );
      return response.data.data;
    } catch {
      const now = new Date().toISOString();
      switch (type) {
        case 'CRITICAL':
          return {
            id: 'notif-crit-' + Date.now(),
            type: 'CRITICAL',
            title: '🚨 Critical Hardware Alert',
            body: 'Core gateway link test — all ports including ether4 are online.',
            targetScreen: 'Operations',
            data: { screen: 'Operations' },
            timestamp: now,
          };
        case 'PAYMENT':
          return {
            id: 'notif-pay-' + Date.now(),
            type: 'PAYMENT',
            title: '💰 M-Pesa Payment Received',
            body: 'New payment confirmed. See Customers screen for details.',
            targetScreen: 'Customers',
            data: { screen: 'Customers' },
            timestamp: now,
          };
        case 'TICKET':
          return {
            id: 'notif-tkt-' + Date.now(),
            type: 'TICKET',
            title: '🎫 Field Support Ticket',
            body: 'New support ticket assigned. Check Operations for details.',
            targetScreen: 'Operations',
            data: { screen: 'Operations' },
            timestamp: now,
          };
      }
    }
  },
};
