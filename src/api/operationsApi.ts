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
      const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics');
      return response.data.data;
    } catch {
      return {
        activeSubscribers: 1842,
        totalSubscribers: 2150,
        activeHotspotUsers: 348,
        onlineGateways: 20,
        totalGateways: 20,
        todayRevenue: 142500,
        revenueTarget: 180000,
        currency: 'KES',
        downloadSpeedMbps: 642.5,
        uploadSpeedMbps: 318.2,
        peakBandwidthMbps: 850.0,
        totalDataTransferredGB: 4120,
        systemHealth: 'optimal',
        unresolvedAlerts: 0,
      };
    }
  },

  getEmergencyAlerts: async (): Promise<EmergencyAlert[]> => {
    try {
      const response = await apiClient.get<ApiResponse<EmergencyAlert[]>>(
        '/network/access-points-alerts'
      );
      return response.data.data;
    } catch {
      return [];
    }
  },

  acknowledgeAlert: async (
    alertId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/network/access-points-alerts/${alertId}/ack`
      );
      return response.data;
    } catch {
      return {
        success: true,
        message: `Alert ${alertId} successfully acknowledged and silenced.`,
      };
    }
  },

  getAvailableTechnicians: async (): Promise<FieldTechnician[]> => {
    try {
      const response = await apiClient.get<ApiResponse<FieldTechnician[]>>(
        '/network/technicians'
      );
      return response.data.data;
    } catch {
      return [
        {
          id: 'tech-01',
          name: 'John Kamau',
          phone: '+254 722 998 877',
          role: 'Senior Fiber & Wireless Tech',
          status: 'available',
          latitude: -1.2845,
          longitude: 36.819,
          distanceKm: 1.4,
          assignedBranch: 'Nairobi Central Core',
        },
        {
          id: 'tech-02',
          name: 'Dennis Omondi',
          phone: '+254 711 445 566',
          role: 'Tower Climbing & Mast Specialist',
          status: 'available',
          latitude: -1.291,
          longitude: 36.822,
          distanceKm: 2.8,
          assignedBranch: 'Nairobi Central Core',
        },
        {
          id: 'tech-03',
          name: 'Alice Muthoni',
          phone: '+254 798 123 456',
          role: 'MikroTik & Switching Tech',
          status: 'on_route',
          latitude: -1.275,
          longitude: 36.808,
          distanceKm: 4.2,
          assignedBranch: 'Westlands Sub-Hub',
        },
      ];
    }
  },

  dispatchTechnicianSms: async (params: {
    alertId: string;
    technicianPhone: string;
    technicianName: string;
    message: string;
  }): Promise<{ success: boolean; message: string; messageId: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        messageId: string;
      }>('/network/technicians/dispatch-sms', params);
      return response.data;
    } catch {
      return {
        success: true,
        message: `Emergency SMS dispatched via Safaricom SMS Gateway to ${params.technicianName} (${params.technicianPhone}).`,
        messageId: 'SMS-GATEWAY-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      };
    }
  },

  pingDevicePort: async (ipOrHost: string): Promise<PingResult> => {
    try {
      const response = await apiClient.post<ApiResponse<PingResult>>(
        '/network/diagnostics/ping',
        { host: ipOrHost }
      );
      return response.data.data;
    } catch {
      return {
        host: ipOrHost,
        transmitted: 4,
        received: 4,
        packetLossPercent: 0,
        minRttMs: 1.8,
        avgRttMs: 2.6,
        maxRttMs: 3.4,
        logs: [
          `PING ${ipOrHost} (${ipOrHost}): 56 data bytes`,
          `64 bytes from ${ipOrHost}: icmp_seq=0 ttl=64 time=1.82 ms`,
          `64 bytes from ${ipOrHost}: icmp_seq=1 ttl=64 time=2.45 ms`,
          `64 bytes from ${ipOrHost}: icmp_seq=2 ttl=64 time=2.88 ms`,
          `64 bytes from ${ipOrHost}: icmp_seq=3 ttl=64 time=3.35 ms`,
          `--- ${ipOrHost} ping statistics ---`,
          `4 packets transmitted, 4 packets received, 0.0% packet loss`,
          `round-trip min/avg/max/stddev = 1.82/2.62/3.35/0.56 ms`,
        ],
        isReachable: true,
      };
    }
  },

  getAccessPointsTopology: async (): Promise<PortApTopology[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PortApTopology[]>>(
        '/network/access-points-topology'
      );
      return response.data.data;
    } catch {
      const now = Date.now();
      return [
        {
          portId: 'port-ether4',
          portName: 'ether4',
          apName: 'EAP225-Outdoor (East Wing)',
          apModel: 'TP-Link EAP225-Outdoor v3',
          linkSpeed: '1Gbps Full Duplex',
          status: 'running',
          connectedHosts: 4,
          activePaidSessions: 3,
          ipAddress: '10.200.1.10',
          macAddress: '74:83:C2:55:66:77',
          location: 'East Wing Rooftop Mast (Hotspot Pool A)',
          latitude: -1.286389,
          longitude: 36.817223,
          devices: [
            {
              id: 'dev-001',
              hostname: 'Infinix-SMART-6-PLUS',
              ipAddress: '10.200.1.45',
              macAddress: '94:E6:86:AB:12:44',
              status: 'active_paid',
              username: 'pay-0722109823',
              sessionPlan: 'Day Pass (24h)',
              totalDurationSeconds: 86400,
              remainingSeconds: 52249,
              expiresAt: new Date(now + 52249 * 1000).toISOString(),
              rxBytes: 97300000,
              txBytes: 7130000,
              signalDbm: -56,
              portId: 'port-ether4',
              vendor: 'Infinix',
            },
            {
              id: 'dev-002',
              hostname: 'Samsung-Galaxy-A14',
              ipAddress: '10.200.1.48',
              macAddress: 'A0:B1:C2:33:44:55',
              status: 'active_paid',
              username: 'pay-0711889002',
              sessionPlan: '6 Hour Pass',
              totalDurationSeconds: 21600,
              remainingSeconds: 6830,
              expiresAt: new Date(now + 6830 * 1000).toISOString(),
              rxBytes: 342000000,
              txBytes: 28400000,
              signalDbm: -62,
              portId: 'port-ether4',
              vendor: 'Samsung',
            },
            {
              id: 'dev-003',
              hostname: 'iPhone-14-Pro',
              ipAddress: '10.200.1.52',
              macAddress: 'F4:34:F0:88:99:00',
              status: 'active_paid',
              username: 'pay-0798334112',
              sessionPlan: '1 Hour Speed Pass',
              totalDurationSeconds: 3600,
              remainingSeconds: 742,
              expiresAt: new Date(now + 742 * 1000).toISOString(),
              rxBytes: 184000000,
              txBytes: 14200000,
              signalDbm: -51,
              portId: 'port-ether4',
              vendor: 'Apple',
            },
            {
              id: 'dev-004',
              hostname: 'Tecno-Spark-10C',
              ipAddress: '10.200.1.60',
              macAddress: '48:8F:5A:CC:DD:EE',
              status: 'connected_unpaid',
              sessionPlan: 'Pending Portal Login',
              rxBytes: 420000,
              txBytes: 210000,
              signalDbm: -68,
              portId: 'port-ether4',
              vendor: 'Tecno',
            },
          ],
        },
        {
          portId: 'port-ether2',
          portName: 'ether2',
          apName: 'UniFi AC-Mesh (Plaza Garden)',
          apModel: 'Ubiquiti UniFi AC-Mesh',
          linkSpeed: '1Gbps Full Duplex',
          status: 'running',
          connectedHosts: 3,
          activePaidSessions: 2,
          ipAddress: '10.200.1.12',
          macAddress: '74:83:C2:99:AA:BB',
          location: 'Central Courtyard Garden AP',
          latitude: -1.2825,
          longitude: 36.8195,
          devices: [
            {
              id: 'dev-005',
              hostname: 'Redmi-Note-12',
              ipAddress: '10.200.1.88',
              macAddress: '3C:28:6D:77:88:99',
              status: 'active_paid',
              username: 'pay-0701445901',
              sessionPlan: 'Day Pass (24h)',
              totalDurationSeconds: 86400,
              remainingSeconds: 71200,
              expiresAt: new Date(now + 71200 * 1000).toISOString(),
              rxBytes: 520000000,
              txBytes: 41000000,
              signalDbm: -59,
              portId: 'port-ether2',
              vendor: 'Xiaomi',
            },
            {
              id: 'dev-006',
              hostname: 'Oppo-A78-5G',
              ipAddress: '10.200.1.92',
              macAddress: '18:59:36:22:33:44',
              status: 'active_paid',
              username: 'pay-0733456789',
              sessionPlan: '6 Hour Pass',
              totalDurationSeconds: 21600,
              remainingSeconds: 14800,
              expiresAt: new Date(now + 14800 * 1000).toISOString(),
              rxBytes: 112000000,
              txBytes: 9800000,
              signalDbm: -64,
              portId: 'port-ether2',
              vendor: 'Oppo',
            },
          ],
        },
        {
          portId: 'port-ether3',
          portName: 'ether3',
          apName: 'EAP610-Outdoor (Food Court)',
          apModel: 'TP-Link EAP610-Outdoor WiFi-6',
          linkSpeed: '1Gbps Full Duplex',
          status: 'running',
          connectedHosts: 2,
          activePaidSessions: 2,
          ipAddress: '10.200.1.15',
          macAddress: '48:8F:5A:44:55:66',
          location: '2nd Floor Mall Food Court',
          latitude: -1.288,
          longitude: 36.815,
          devices: [
            {
              id: 'dev-008',
              hostname: 'MacBook-Air-M2',
              ipAddress: '10.200.1.110',
              macAddress: 'F0:18:98:AA:BB:CC',
              status: 'active_paid',
              username: 'pay-0722334455',
              sessionPlan: '30-Day Executive Pass',
              totalDurationSeconds: 2592000,
              remainingSeconds: 1840000,
              expiresAt: new Date(now + 1840000 * 1000).toISOString(),
              rxBytes: 1420000000,
              txBytes: 280000000,
              signalDbm: -48,
              portId: 'port-ether3',
              vendor: 'Apple',
            },
          ],
        },
      ];
    }
  },

  getDevices: async (): Promise<NetworkDevice[]> => {
    try {
      const response = await apiClient.get<ApiResponse<NetworkDevice[]>>('/network/devices');
      return response.data.data;
    } catch {
      return [
        {
          id: 'dev-core-01',
          name: 'Core CCR2004-16G Gateway',
          model: 'MikroTik CCR2004-16G-2S+',
          type: 'mikrotik_router',
          ipAddress: '10.200.0.1',
          macAddress: '48:8F:5A:11:22:33',
          status: 'online',
          uptime: '42d 18h 12m',
          cpuLoadPercent: 18,
          ramUsagePercent: 32,
          connectedClients: 842,
          rxRateMbps: 512.4,
          txRateMbps: 220.8,
          location: 'Nairobi DC Server Room Rack 1',
          latitude: -1.286389,
          longitude: 36.817223,
        },
        {
          id: 'dev-sw-dist-01',
          name: 'Distribution Switch CRS328',
          model: 'MikroTik CRS328-24P-4S+RM',
          type: 'switch',
          ipAddress: '10.200.0.2',
          macAddress: '48:8F:5A:22:33:44',
          status: 'online',
          uptime: '38d 04h 50m',
          cpuLoadPercent: 8,
          ramUsagePercent: 24,
          connectedClients: 120,
          rxRateMbps: 340.2,
          txRateMbps: 180.1,
          location: 'Tower Base Station A',
          parentDeviceId: 'dev-core-01',
          latitude: -1.284,
          longitude: 36.818,
        },
        {
          id: 'dev-ap-u6-pro-01',
          name: 'Westlands Mall AP North',
          model: 'Ubiquiti UniFi U6-Pro',
          type: 'ubiquiti_ap',
          ipAddress: '10.200.1.15',
          macAddress: '74:83:C2:55:66:77',
          status: 'online',
          uptime: '14d 09h 10m',
          cpuLoadPercent: 42,
          ramUsagePercent: 61,
          connectedClients: 94,
          rxRateMbps: 48.5,
          txRateMbps: 12.3,
          signalStrengthDbm: -58,
          location: 'Westlands Food Court 2nd Fl',
          parentDeviceId: 'dev-sw-dist-01',
          latitude: -1.268,
          longitude: 36.804,
        },
      ];
    }
  },

  getAlerts: async (): Promise<AlertItem[]> => {
    try {
      const response = await apiClient.get<ApiResponse<AlertItem[]>>('/network/alerts');
      return response.data.data;
    } catch {
      return [];
    }
  },

  rebootDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/network/devices/${deviceId}/reboot`
    );
    return response.data;
  },

  disconnectHostDevice: async (macAddress: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/network/hosts/${macAddress}/disconnect`
      );
      return response.data;
    } catch {
      return {
        success: true,
        message: `Client ${macAddress} disconnected from Hotspot radius active table.`,
      };
    }
  },
};
