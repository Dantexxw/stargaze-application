export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'BILLING_ADMIN' | 'SUPPORT_AGENT' | 'TECHNICIAN';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  region: string;
  activeRouters: number;
  activeSubscribers: number;
  isPrimary?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone: string;
  tenantId: string;
  assignedTenantIds?: string[];
  biometricEnabled?: boolean;
}

export interface DashboardMetrics {
  activeSubscribers: number;
  totalSubscribers: number;
  activeHotspotUsers: number;
  onlineGateways: number;
  totalGateways: number;
  todayRevenue: number;
  revenueTarget: number;
  currency: string;
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  peakBandwidthMbps: number;
  totalDataTransferredGB: number;
  systemHealth: 'optimal' | 'warning' | 'critical';
  unresolvedAlerts: number;
}

export interface FinancialAnalytics {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueGrowthPercent: number;
  activeSubscribers: number;
  hotspotSalesCount: number;
  conversionRatePercent: number;
  pppoeRevenue: number;
  hotspotRevenue: number;
  averageTransactionValue: number;
  currency: string;
}

export interface DeviceRegistrationPayload {
  deviceToken: string;
  platform: 'ios' | 'android' | 'web';
  tenantId: string;
  userId: string;
  appVersion: string;
  registeredAt?: string;
}

export type NotificationType = 'CRITICAL' | 'PAYMENT' | 'TICKET';

export interface PushNotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  targetScreen: 'Dashboard' | 'Operations' | 'Customers' | 'Settings';
  data?: Record<string, any>;
  timestamp: string;
}

export interface NetworkDevice {
  id: string;
  name: string;
  model: string;
  type: 'mikrotik_router' | 'ubiquiti_ap' | 'switch' | 'olt' | 'cpe';
  ipAddress: string;
  macAddress: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: string;
  cpuLoadPercent: number;
  ramUsagePercent: number;
  connectedClients: number;
  rxRateMbps: number;
  txRateMbps: number;
  signalStrengthDbm?: number;
  location: string;
  parentDeviceId?: string;
  latitude?: number;
  longitude?: number;
}

export interface ConnectedHostDevice {
  id: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  status: 'active_paid' | 'connected_unpaid';
  username?: string;
  sessionPlan?: string;
  totalDurationSeconds?: number;
  remainingSeconds?: number;
  expiresAt?: string;
  rxBytes: number;
  txBytes: number;
  signalDbm?: number;
  portId: string;
  vendor?: string;
}

export interface ApClient {
  mac: string;
  ip: string;
  hostname: string;
  isAuthenticated: boolean;
  username?: string;            // e.g. "pay-ui5g55hklq"
  uptime?: string;              // e.g. "33m40s"
  paidSession?: string;         // e.g. "Day Pass (1d)", "6 Hour Pass"
  planCode?: string;            // e.g. "HS-24H", "HS-6H"
  timeLeft?: string;            // e.g. "14h 30m 49s left"
  remainingSeconds?: number;    // e.g. 52249
  totalSeconds?: number;        // e.g. 86400 (for progress bar %)
  expiresAt?: string;           // ISO timestamp: "2026-09-06T03:15:38.085Z"
  bytesIn: number;
  bytesOut: number;
}

export interface PortTopology {
  portName: string;             // e.g. "ether4"
  defaultName: string;
  isRunning: boolean;
  speed: string;                // e.g. "1Gbps"
  isApConnected: boolean;
  accessPoint: {
    name: string;               // e.g. "EAP225-Outdoor"
    model: string;
    vendor: string;
    macAddress?: string;
  } | null;
  bridgeHostCount: number;
  connectedDeviceCount: number;
  activeSessionCount: number;
  clients: ApClient[];
}

export interface PortApTopology {
  portId: string;
  portName: string;
  apName: string;
  apModel: string;
  linkSpeed: string;
  status: 'running' | 'link_down' | 'disabled';
  connectedHosts: number;
  activePaidSessions: number;
  ipAddress: string;
  macAddress: string;
  location: string;
  latitude?: number;
  longitude?: number;
  devices: ConnectedHostDevice[];
}

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  portName: string;
  apName: string;
  apModel: string;
  macAddress: string;
  ipAddress: string;
  location: string;
  latitude: number;
  longitude: number;
  disconnectTime: string;
  severity: 'critical' | 'warning';
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  dispatchedTechName?: string;
  dispatchedPhone?: string;
  dispatchStatus?: 'idle' | 'dispatched' | 'resolved';
}

export interface FieldTechnician {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: 'available' | 'on_route' | 'busy';
  latitude: number;
  longitude: number;
  distanceKm: number;
  assignedBranch: string;
  avatar?: string;
}

export interface PingResult {
  host: string;
  transmitted: number;
  received: number;
  packetLossPercent: number;
  minRttMs: number;
  avgRttMs: number;
  maxRttMs: number;
  logs: string[];
  isReachable: boolean;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  deviceId?: string;
  deviceName?: string;
  acknowledged: boolean;
}

export interface MpesaTransaction {
  id: string;
  receiptNumber: string;
  phoneNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  type: 'C2B' | 'STK_PUSH' | 'VOUCHER_PURCHASE';
  packageName: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  timestamp: string;
  accountReference: string;
  macAddress?: string;
  durationPlan?: string;
}

export interface HotspotPlan {
  id: string;
  name: string;
  code: string;
  durationHours: number;
  durationLabel: string;
  priceKes: number;
  speedLimitMbps: number;
  dataLimitMb?: number;
  isPopular?: boolean;
}

export interface StkPushRequest {
  phone: string;
  planId: string;
  macAddress?: string;
  tenantId?: string;
}

export interface StkPushResponse {
  checkoutRequestId: string;
  merchantRequestId: string;
  responseCode: string;
  customerMessage: string;
  status: 'PENDING_PIN' | 'COMPLETED' | 'FAILED';
  receiptNumber?: string;
}

export interface ManualGrantRequest {
  macAddress: string;
  phone?: string;
  durationHours: number;
  packageName: string;
  reason: string;
  grantedBy?: string;
}

export interface Subscriber {
  id: string;
  name: string;
  accountNumber: string;
  phone: string;
  type: 'pppoe' | 'hotspot_voucher' | 'static_ip';
  planName: string;
  bandwidthProfile: string;
  ipAddress?: string;
  macAddress?: string;
  status: 'active' | 'expired' | 'suspended';
  expiryDate: string;
  dataUsedGB: number;
  dataLimitGB?: number;
  balance: number;
}

// 1. Speedtest & Network Diagnostics Model
export interface SpeedtestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  packetLossPercent: number;
  serverLocation: string;
  ispGateway: string;
  timestamp: string;
  rating: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
}

// 2. Wi-Fi Signal Spectrum & RSSI Metrics
export interface WifiSignalMetrics {
  ssid: string;
  bssid: string;
  rssiDbm: number;
  qualityPercent: number;
  frequencyGhz: 2.4 | 5.0 | 6.0;
  channel: number;
  channelWidthMhz: number;
  interferenceLevel: 'LOW' | 'MODERATE' | 'HIGH';
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
}

// 3. Field Work Order & Customer Support Tickets
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'ASSIGNED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'FIBER_CUT' | 'AP_OFFLINE' | 'NEW_INSTALLATION' | 'SLOW_SPEED' | 'ROUTER_CONFIG';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  customerName: string;
  customerPhone: string;
  location: string;
  latitude: number;
  longitude: number;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  customerSignature?: string;
}

// 4. Optical Fiber Power (GPON / OLT ONU) Monitor
export interface FiberPowerReading {
  onuId: string;
  customerName: string;
  accountNumber: string;
  oltName: string;
  ponPort: string;
  rxOpticalPowerDbm: number; // e.g. -19.4 dBm (Normal -15 to -24)
  txOpticalPowerDbm: number; // e.g. +2.1 dBm
  laserBiasCurrentMa: number;
  temperatureCelsius: number;
  voltageVolts: number;
  status: 'HEALTHY' | 'WEAK_SIGNAL' | 'CRITICAL_BENT_FIBER' | 'LOS_DISCONNECTED';
  distanceMeters: number;
}

// 5. Subscriber Provisioning & Onboarding
export interface SubscriberProvisionRequest {
  fullName: string;
  phone: string;
  email?: string;
  idNumberOrKra: string;
  connectionType: 'PPPOE' | 'STATIC_IP' | 'HOTSPOT_MAC';
  planName: string;
  bandwidthProfile: '10M/10M' | '20M/20M' | '50M/50M' | '100M/100M';
  pppoeUsername?: string;
  pppoePassword?: string;
  assignedIp?: string;
  targetMac?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  routerPort?: string;
}

// 6. Offline Queued Action
export interface OfflineQueuedAction {
  id: string;
  type: 'GRANT_VOUCHER' | 'ACKNOWLEDGE_ALERT' | 'UPDATE_TICKET' | 'PROVISION_SUBSCRIBER';
  payload: Record<string, any>;
  createdAt: string;
  retryCount: number;
  status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
}
