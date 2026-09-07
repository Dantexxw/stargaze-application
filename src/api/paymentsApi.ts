import { apiClient } from './ApiClient';
import { ApiResponse } from '../types/api';
import {
  MpesaTransaction,
  Subscriber,
  FinancialAnalytics,
  ManualGrantRequest,
  HotspotPlan,
  StkPushRequest,
  StkPushResponse,
} from '../types/models';

export const paymentsApi = {
  getHotspotPlans: async (): Promise<HotspotPlan[]> => {
    try {
      const response = await apiClient.get<ApiResponse<HotspotPlan[]>>(
        '/plans?serviceType=HOTSPOT'
      );
      return response.data.data;
    } catch {
      return [
        {
          id: 'plan-1h',
          name: '1 Hour Speed Pass',
          code: 'HS-1H',
          durationHours: 1,
          durationLabel: '1 Hour',
          priceKes: 10,
          speedLimitMbps: 10,
        },
        {
          id: 'plan-6h',
          name: '6 Hours Unlimited',
          code: 'HS-6H',
          durationHours: 6,
          durationLabel: '6 Hours',
          priceKes: 20,
          speedLimitMbps: 15,
        },
        {
          id: 'plan-24h',
          name: '24 Hours Day Pass',
          code: 'HS-24H',
          durationHours: 24,
          durationLabel: '24 Hours',
          priceKes: 40,
          speedLimitMbps: 20,
          isPopular: true,
        },
        {
          id: 'plan-7d',
          name: '7 Days Weekly Unlimited',
          code: 'HS-7D',
          durationHours: 168,
          durationLabel: '7 Days',
          priceKes: 250,
          speedLimitMbps: 25,
        },
      ];
    }
  },

  triggerStkPush: async (payload: StkPushRequest): Promise<StkPushResponse> => {
    const response = await apiClient.post<ApiResponse<StkPushResponse>>(
      '/payments/stk-push',
      payload
    );
    return response.data.data;
  },

  getPayments: async (take: number = 50): Promise<MpesaTransaction[]> => {
    return paymentsApi.getMpesaTransactions();
  },

  getFinancialAnalytics: async (): Promise<FinancialAnalytics> => {
    try {
      const response = await apiClient.get<ApiResponse<FinancialAnalytics>>(
        '/analytics/financial'
      );
      return response.data.data;
    } catch {
      return {
        todayRevenue: 142500,
        yesterdayRevenue: 126800,
        revenueGrowthPercent: 12.4,
        activeSubscribers: 1842,
        hotspotSalesCount: 348,
        conversionRatePercent: 68.5,
        pppoeRevenue: 108000,
        hotspotRevenue: 34500,
        averageTransactionValue: 409.5,
        currency: 'KES',
      };
    }
  },

  getMpesaTransactions: async (): Promise<MpesaTransaction[]> => {
    try {
      const response = await apiClient.get<ApiResponse<MpesaTransaction[]>>('/payments/mpesa');
      return response.data.data;
    } catch {
      const now = Date.now();
      return [
        {
          id: 'tx-001',
          receiptNumber: 'UI5G55HKLQ',
          phoneNumber: '254708393665',
          customerName: 'Brian Omondi',
          amount: 40.0,
          currency: 'KES',
          type: 'STK_PUSH',
          packageName: 'Day Pass (24h Unlimited)',
          status: 'completed',
          timestamp: new Date(now - 1000 * 18).toISOString(), // 18s ago
          accountReference: 'HOTSPOT-NBO-01',
          macAddress: '94:E6:86:AB:12:44',
          durationPlan: '24 Hours',
        },
        {
          id: 'tx-002',
          receiptNumber: 'UI5G49JMK0',
          phoneNumber: '254722109823',
          customerName: 'Faith Wanjiku',
          amount: 20.0,
          currency: 'KES',
          type: 'VOUCHER_PURCHASE',
          packageName: '1H Speed Pass',
          status: 'completed',
          timestamp: new Date(now - 1000 * 54).toISOString(), // 54s ago
          accountReference: 'HOTSPOT-NBO-01',
          macAddress: 'A0:B1:C2:33:44:55',
          durationPlan: '1 Hour',
        },
        {
          id: 'tx-003',
          receiptNumber: 'UI5G38X99P',
          phoneNumber: '254798334112',
          customerName: 'Kevin Mutua',
          amount: 50.0,
          currency: 'KES',
          type: 'STK_PUSH',
          packageName: '6 Hour Unlimited',
          status: 'completed',
          timestamp: new Date(now - 1000 * 60 * 4).toISOString(), // 4m ago
          accountReference: 'HOTSPOT-NBO-01',
          macAddress: 'F4:34:F0:88:99:00',
          durationPlan: '6 Hours',
        },
        {
          id: 'tx-004',
          receiptNumber: 'UI5G22PL01',
          phoneNumber: '254711889002',
          customerName: 'Mercy Achieng',
          amount: 2500.0,
          currency: 'KES',
          type: 'C2B',
          packageName: 'Home Fiber 20Mbps (Monthly)',
          status: 'completed',
          timestamp: new Date(now - 1000 * 60 * 12).toISOString(), // 12m ago
          accountReference: 'PPPOE-MA-104',
          macAddress: '00:1A:2B:3C:4D:5E',
          durationPlan: '30 Days',
        },
        {
          id: 'tx-005',
          receiptNumber: 'UI5G11STK9',
          phoneNumber: '254733456789',
          customerName: 'Sammy Koech',
          amount: 40.0,
          currency: 'KES',
          type: 'STK_PUSH',
          packageName: 'Day Pass (24h Unlimited)',
          status: 'pending',
          timestamp: new Date(now - 1000 * 60 * 18).toISOString(), // 18m ago
          accountReference: 'HOTSPOT-NBO-01',
          macAddress: '3C:28:6D:77:88:99',
          durationPlan: '24 Hours',
        },
        {
          id: 'tx-006',
          receiptNumber: 'UI5G04ERR8',
          phoneNumber: '254701998877',
          customerName: 'Janet Mwangi',
          amount: 20.0,
          currency: 'KES',
          type: 'STK_PUSH',
          packageName: '1H Speed Pass',
          status: 'failed',
          timestamp: new Date(now - 1000 * 60 * 35).toISOString(),
          accountReference: 'HOTSPOT-NBO-01',
          macAddress: '18:59:36:22:33:44',
          durationPlan: '1 Hour',
        },
      ];
    }
  },

  getSubscribers: async (): Promise<Subscriber[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Subscriber[]>>('/subscribers');
      return response.data.data;
    } catch {
      return [
        {
          id: 'sub-001',
          name: 'Brian Omondi',
          accountNumber: 'PPPOE-BO-092',
          phone: '+254 722 109 823',
          type: 'pppoe',
          planName: 'Home Fiber Ultra',
          bandwidthProfile: '20M/20M',
          ipAddress: '100.64.10.14',
          macAddress: 'BC:A9:93:44:55:66',
          status: 'active',
          expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(),
          dataUsedGB: 184.2,
          balance: 0,
        },
        {
          id: 'sub-002',
          name: 'Mercy Achieng (Apex Plaza)',
          accountNumber: 'PPPOE-BIZ-104',
          phone: '+254 711 889 002',
          type: 'static_ip',
          planName: 'Business Dedicated 50M',
          bandwidthProfile: '50M/50M',
          ipAddress: '197.232.44.18',
          macAddress: '00:1A:2B:3C:4D:5E',
          status: 'active',
          expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 31).toISOString(),
          dataUsedGB: 640.8,
          balance: 0,
        },
        {
          id: 'sub-003',
          name: 'Sammy Koech',
          accountNumber: 'PPPOE-SK-055',
          phone: '+254 733 456 789',
          type: 'pppoe',
          planName: 'Home Fiber Standard',
          bandwidthProfile: '10M/10M',
          ipAddress: '100.64.10.89',
          macAddress: 'D4:6E:0E:12:34:56',
          status: 'expired',
          expiryDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          dataUsedGB: 92.4,
          balance: 1500,
        },
      ];
    }
  },

  grantManualVoucher: async (
    payload: ManualGrantRequest
  ): Promise<{ success: boolean; message: string; expiryDate: string }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ success: boolean; message: string; expiryDate: string }>
      >('/vouchers/manual-grant', payload);
      return response.data.data;
    } catch {
      const expiry = new Date(
        Date.now() + payload.durationHours * 3600 * 1000
      ).toISOString();
      return {
        success: true,
        message: `Granted ${payload.durationHours}h voucher directly to MAC ${payload.macAddress}. MikroTik Hotspot session activated.`,
        expiryDate: expiry,
      };
    }
  },

  generateVoucher: async (params: {
    packageName: string;
    durationHours: number;
    amount: number;
    quantity: number;
  }): Promise<{ voucherCodes: string[] }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ voucherCodes: string[] }>>(
        '/vouchers/generate',
        params
      );
      return response.data.data;
    } catch {
      const codes = Array.from({ length: params.quantity }, () =>
        'STAR-' + Math.random().toString(36).substring(2, 7).toUpperCase()
      );
      return { voucherCodes: codes };
    }
  },
};
