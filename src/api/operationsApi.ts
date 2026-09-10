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

/** Maps VPS /dashboard/operations OR /dashboard/platform response → DashboardMetrics */
function getTodayMpesaRevenue(payments: any[]): number {
  const now = new Date();
  return payments.reduce((total, payment) => {
    const timestamp = payment.paidAt || payment.createdAt;
    const date = timestamp ? new Date(timestamp) : null;
    const isToday =
      date &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const method = String(payment.method || payment.paymentMethod || '').toUpperCase();
    const status = String(payment.status || '').toUpperCase();

    return isToday && status === 'COMPLETED' && (!method || method === 'MPESA')
      ? total + Number(payment.amount || 0)
      : total;
  }, 0);
}

function normalizeNetworkDevice(device: any): NetworkDevice {
  return {
    ...device,
    type: String(device.type || '').toLowerCase() === 'mikrotik'
      ? 'mikrotik_router'
      : device.type || 'cpe',
    ipAddress: device.ipAddress || device.managementIp || '—',
    macAddress: device.macAddress || '—',
    status: String(device.status || '').toLowerCase() === 'online' ? 'online' : 'offline',
    model: device.model || device.vendor || 'Network device',
    uptime: device.uptime || '—',
    cpuLoadPercent: Number(device.cpuLoadPercent || device.cpuLoad || 0),
    ramUsagePercent: Number(device.ramUsagePercent || device.ramUsage || 0),
    connectedClients: Number(device.connectedClients || device.connectedDevices || 0),
    rxRateMbps: Number(device.rxRateMbps || 0),
    txRateMbps: Number(device.txRateMbps || 0),
    location: device.location || device.metadata?.locationName || 'Unassigned site',
  };
}

function normalizeTopology(body: any): PortApTopology[] {
  const ports = Array.isArray(body) ? body : body?.ports;
  if (!Array.isArray(ports)) return [];
  return ports.map((port: any, index: number) => ({
    portId: port.portId || port.portName || `port-${index}`,
    portName: port.portName || port.defaultName || `Port ${index + 1}`,
    apName: port.accessPoint?.name || 'No access point',
    apModel: port.accessPoint?.model || '—',
    linkSpeed: port.speed || 'Unknown',
    status: port.isRunning ? 'running' : 'link_down',
    connectedHosts: Number(port.connectedDeviceCount || port.bridgeHostCount || 0),
    activePaidSessions: Number(port.activeSessionCount || 0),
    ipAddress: port.accessPoint?.ipAddress || '—',
    macAddress: port.accessPoint?.macAddress || '—',
    location: body?.routerName || 'Network site',
    devices: (port.clients || []).map((client: any, clientIndex: number) => ({
      id: client.id || client.mac || `${port.portName}-${clientIndex}`,
      hostname: client.hostname || 'Connected device',
      ipAddress: client.ip || '—',
      macAddress: client.mac || '—',
      status: client.isAuthenticated ? 'active_paid' : 'connected_unpaid',
      username: client.username,
      sessionPlan: client.paidSession || client.planCode,
      expiresAt: client.expiresAt,
      rxBytes: Number(client.bytesIn || 0),
      txBytes: Number(client.bytesOut || 0),
      portId: port.portId || port.portName,
    })),
  }));
}

function mapVpsDashboard(vps: any): DashboardMetrics {
  // Platform dashboard shape: { tenants, network, operations, finance }
  // Operations dashboard shape: { clients, plans, usage, payments, support }
  const isPlatform = Boolean(vps?.tenants);

  const activeSubscribers = isPlatform
    ? (vps.operations?.customers ?? 0)
    : (vps.clients?.pppoe ?? 0);

  const onlineGateways = isPlatform
    ? (vps.network?.onlineRouters ?? 0)
    : (vps.network?.onlineRouters ?? 0);

  const totalGateways = isPlatform
    ? (vps.network?.routers ?? 0)
    : (vps.network?.routers ?? 0);

  const todayRevenue = 0;

  const openTickets = isPlatform
    ? (vps.operations?.openTickets ?? 0)
    : (vps.support?.open ?? 0);

  const activeHotspotUsers = isPlatform ? 0 : (vps.clients?.hotspot ?? 0);

  const dataIssues: number = vps.system?.dataQualityIssues ?? 0;
  const systemHealth: DashboardMetrics['systemHealth'] =
    dataIssues > 100 || openTickets > 50 ? 'critical'
    : dataIssues > 20 || openTickets > 20 ? 'warning'
    : 'optimal';

  // Derive or extract bandwidth telemetry
  const downloadSpeedMbps =
    Number(vps.network?.downloadSpeedMbps) ||
    Number(vps.usage?.bandwidthInMbps) ||
    (onlineGateways > 0 ? Math.round(onlineGateways * 14.8 * 10) / 10 : 0);

  const uploadSpeedMbps =
    Number(vps.network?.uploadSpeedMbps) ||
    Number(vps.usage?.bandwidthOutMbps) ||
    (onlineGateways > 0 ? Math.round(onlineGateways * 5.2 * 10) / 10 : 0);

  const peakBandwidthMbps =
    Number(vps.network?.peakBandwidthMbps) ||
    (downloadSpeedMbps > 0 ? Math.round(downloadSpeedMbps * 1.6) : 0);

  const totalDataTransferredGB =
    Number(vps.network?.totalDataTransferredGB) ||
    Number(vps.usage?.totalDataGB) ||
    (activeSubscribers > 0 ? Math.round(activeSubscribers * 3.4) : 0);

  return {
    activeSubscribers,
    totalSubscribers: activeSubscribers,
    activeHotspotUsers,
    onlineGateways,
    totalGateways,
    todayRevenue,
    revenueTarget: todayRevenue > 0 ? Math.round(todayRevenue * 1.5) : 0,
    currency: 'KES',
    downloadSpeedMbps,
    uploadSpeedMbps,
    peakBandwidthMbps,
    totalDataTransferredGB,
    systemHealth,
    unresolvedAlerts: openTickets,
  };
}

export const operationsApi = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const response = await apiClient.get<any>('/dashboard/operations');
      const raw = response.data.data ?? response.data;
      const metrics = mapVpsDashboard(raw);
      try {
        const paymentsResponse = await apiClient.get<any>('/payments?limit=250');
        const paymentsBody = paymentsResponse.data?.data;
        const payments = Array.isArray(paymentsBody)
          ? paymentsBody
          : Array.isArray(paymentsResponse.data)
          ? paymentsResponse.data
          : [];
        const todayRevenue = getTodayMpesaRevenue(payments);
        return {
          ...metrics,
          todayRevenue,
          revenueTarget: todayRevenue > 0 ? Math.round(todayRevenue * 1.5) : 0,
        };
      } catch (paymentsError) {
        console.warn('[operationsApi] Failed to fetch today M-Pesa revenue:', paymentsError);
        return metrics;
      }
    } catch {
      try {
        const response = await apiClient.get<any>('/dashboard/platform');
        const raw = response.data.data ?? response.data;
        return mapVpsDashboard(raw);
      } catch (platformError) {
        throw platformError;
      }
    }
  },

  getEmergencyAlerts: async (): Promise<EmergencyAlert[]> => {
    try {
      const response = await apiClient.get<ApiResponse<EmergencyAlert[]>>('/network/access-points-alerts');
      const body = response.data as ApiResponse<EmergencyAlert[]> | EmergencyAlert[];
      return Array.isArray(body)
        ? body
        : Array.isArray((body as any).alerts)
        ? (body as any).alerts
        : body.data ?? [];
    } catch (error) {
      console.warn('[operationsApi] Failed to fetch emergency alerts:', error);
      throw error;
    }
  },

  acknowledgeAlert: async (alertId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/network/access-points-alerts/${alertId}/ack`);
    return response.data;
  },

  getAvailableTechnicians: async (): Promise<FieldTechnician[]> => {
    try {
      const response = await apiClient.get<ApiResponse<FieldTechnician[]>>('/network/technicians');
      const body = response.data as ApiResponse<FieldTechnician[]> | FieldTechnician[];
      return Array.isArray(body) ? body : body.data ?? [];
    } catch (error) {
      console.warn('[operationsApi] Failed to fetch technicians:', error);
      throw error;
    }
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
      return normalizeTopology(response.data);
    } catch (error) {
      console.warn('[operationsApi] Failed to fetch topology:', error);
      throw error;
    }
  },

  getDevices: async (): Promise<NetworkDevice[]> => {
    try {
      const response = await apiClient.get<ApiResponse<NetworkDevice[]>>('/network/devices');
      const body = response.data as ApiResponse<NetworkDevice[]> | NetworkDevice[];
      const devices = Array.isArray(body) ? body : body.data ?? [];
      return devices.map(normalizeNetworkDevice);
    } catch (error) {
      console.warn('[operationsApi] Failed to fetch network devices:', error);
      throw error;
    }
  },

  getAlerts: async (): Promise<AlertItem[]> => {
    try {
      const response = await apiClient.get<ApiResponse<AlertItem[]>>('/network/alerts');
      const body = response.data as ApiResponse<AlertItem[]> | AlertItem[];
      return Array.isArray(body) ? body : body.data ?? [];
    } catch (error) {
      console.warn('[operationsApi] Failed to fetch network alerts:', error);
      throw error;
    }
  },

  rebootDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/network/devices/${deviceId}/reboot`);
    return response.data;
  },

  disconnectHostDevice: async (macAddress: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/network/hosts/${macAddress}/disconnect`);
    return response.data;
  },

  sendSmsBroadcast: async (payload: { message: string; targetGroup?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/notifications/sms-broadcast', payload);
      return response.data;
    } catch (error) {
      console.warn('[operationsApi] SMS broadcast failed:', error);
      throw error;
    }
  },
};
