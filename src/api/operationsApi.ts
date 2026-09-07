import { apiClient } from './ApiClient';
import { ApiResponse } from '../types/api';
import {
  DashboardMetrics,
  NetworkDevice,
  AlertItem,
  PortApTopology,
  EmergencyAlert,
  FieldTechnician,
  PingResult,
} from '../types/models';

export const operationsApi = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/operations');
      return response.data.data || (response.data as any);
    } catch {
      const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/platform');
      return response.data.data || (response.data as any);
    }
  },

  getEmergencyAlerts: async (): Promise<EmergencyAlert[]> => {
    try {
      const response = await apiClient.get<ApiResponse<EmergencyAlert[]>>('/network/access-points-alerts');
      return response.data.data;
    } catch { return []; }
  },

  acknowledgeAlert: async (alertId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/network/access-points-alerts/${alertId}/ack`);
    return response.data;
  },

  getAvailableTechnicians: async (): Promise<FieldTechnician[]> => {
    try {
      const response = await apiClient.get<ApiResponse<FieldTechnician[]>>('/network/technicians');
      return response.data.data;
    } catch { return []; }
  },

  dispatchTechnicianSms: async (params: {
    alertId: string;
    technicianPhone: string;
    technicianName: string;
    message: string;
  }): Promise<{ success: boolean; message: string; messageId: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string; messageId: string }>('/network/technicians/dispatch-sms', params);
    return response.data;
  },

  pingDevicePort: async (ipOrHost: string): Promise<PingResult> => {
    const response = await apiClient.post<ApiResponse<PingResult>>('/network/diagnostics/ping', { host: ipOrHost });
    return response.data.data;
  },

  getAccessPointsTopology: async (): Promise<PortApTopology[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PortApTopology[]>>('/network/access-points-topology');
      return response.data.data;
    } catch { return []; }
  },

  getDevices: async (): Promise<NetworkDevice[]> => {
    try {
      const response = await apiClient.get<ApiResponse<NetworkDevice[]>>('/network/devices');
      return response.data.data;
    } catch { return []; }
  },

  getAlerts: async (): Promise<AlertItem[]> => {
    try {
      const response = await apiClient.get<ApiResponse<AlertItem[]>>('/network/alerts');
      return response.data.data;
    } catch { return []; }
  },

  rebootDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/network/devices/${deviceId}/reboot`);
    return response.data;
  },

  disconnectHostDevice: async (macAddress: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/network/hosts/${macAddress}/disconnect`);
    return response.data;
  },
};
