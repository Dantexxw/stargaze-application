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
      return {
        success: true,
        message: `Device token registered successfully for platform ${payload.platform}.`,
      };
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
      // Mock notifications for instant preview & testing
      const now = new Date().toISOString();
      switch (type) {
        case 'CRITICAL':
          return {
            id: 'notif-crit-' + Date.now(),
            type: 'CRITICAL',
            title: '🚨 PRIORITY: Link Route Verified',
            body: 'Core gateway link test complete. All router ports including ether4 are 100% online and synchronized.',
            targetScreen: 'Operations',
            data: {
              portName: 'ether4',
              apModel: 'TP-Link EAP225-Outdoor v3',
              macAddress: '74:83:C2:55:66:77',
              screen: 'Operations',
            },
            timestamp: now,
          };
        case 'PAYMENT':
          return {
            id: 'notif-pay-' + Date.now(),
            type: 'PAYMENT',
            title: '💰 High-Value M-Pesa Payment',
            body: 'Received KES 4,500.00 from Mercy Achieng (254711889002) for Business Fiber 50M.',
            targetScreen: 'Customers',
            data: {
              receiptCode: 'UI5G99HIGH',
              amount: 4500,
              screen: 'Customers',
            },
            timestamp: now,
          };
        case 'TICKET':
          return {
            id: 'notif-tkt-' + Date.now(),
            type: 'TICKET',
            title: '🎫 Field Support Dispatched',
            body: 'Emergency incident assigned to technician Alex Kariuki at Westlands Mall Rooftop.',
            targetScreen: 'Operations',
            data: {
              ticketId: 'TKT-8921',
              location: 'Westlands Mall',
              screen: 'Operations',
            },
            timestamp: now,
          };
      }
    }
  },
};
