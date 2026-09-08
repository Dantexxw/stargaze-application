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
      const response = await apiClient.get<ApiResponse<HotspotPlan[]>>('/payments/vouchers/plans');
      return response.data.data || (response.data as any) || [];
    } catch {
      try {
        const response = await apiClient.get<ApiResponse<HotspotPlan[]>>('/payments/hotspot-offers');
        return response.data.data || (response.data as any) || [];
      } catch { return []; }
    }
  },

  triggerStkPush: async (payload: StkPushRequest): Promise<StkPushResponse> => {
    const response = await apiClient.post<ApiResponse<StkPushResponse>>('/payments/stk-push', payload);
    return response.data.data || (response.data as any);
  },

  getPayments: async (_take: number = 50): Promise<MpesaTransaction[]> => {
    return paymentsApi.getMpesaTransactions();
  },

  getFinancialAnalytics: async (): Promise<FinancialAnalytics> => {
    try {
      const response = await apiClient.get<ApiResponse<FinancialAnalytics>>('/dashboard/platform');
      return response.data.data || (response.data as any);
    } catch {
      const response = await apiClient.get<ApiResponse<FinancialAnalytics>>('/dashboard/operations');
      return response.data.data || (response.data as any);
    }
  },

  getMpesaTransactions: async (): Promise<MpesaTransaction[]> => {
    try {
      const response = await apiClient.get<any>('/payments');
      const rawList: any[] = response.data.data ?? (Array.isArray(response.data) ? response.data : []);
      return rawList.map((p: any) => ({
        id: p.id,
        receiptNumber: p.receiptNumber || p.mpesaReceiptNumber || p.transactionId || p.id?.slice(0, 10).toUpperCase() || 'TXN',
        phoneNumber: p.phoneNumber || p.phone || p.customerPhone || 'N/A',
        customerName: p.customerName || (p.customer ? `${p.customer.firstName || ''} ${p.customer.lastName || ''}`.trim() : 'M-Pesa Customer'),
        amount: Number(p.amount) || 0,
        currency: p.currency || 'KES',
        type: p.paymentMethod === 'STK_PUSH' ? 'STK_PUSH' : (p.type || 'C2B'),
        packageName: p.packageName || p.plan?.name || p.description || 'Internet Access',
        status: (p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success') ? 'completed' : (p.status?.toLowerCase() === 'failed' ? 'failed' : 'pending'),
        timestamp: p.createdAt || p.timestamp || new Date().toISOString(),
        accountReference: p.accountReference || p.billRefNumber || 'STARGAZE',
        macAddress: p.macAddress,
        durationPlan: p.durationPlan,
      }));
    } catch { return []; }
  },

  getSubscribers: async (): Promise<Subscriber[]> => {
    try {
      const response = await apiClient.get<any>('/customers');
      const rawList: any[] = response.data.data ?? (Array.isArray(response.data) ? response.data : []);
      return rawList.map((c: any) => ({
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || 'Customer',
        accountNumber: c.accountNumber || c.code || c.id?.slice(0, 8).toUpperCase() || 'SUB',
        phone: c.phone || '',
        type: (c.serviceType?.toLowerCase() === 'hotspot' ? 'hotspot_voucher' : (c.serviceType?.toLowerCase() === 'static_ip' ? 'static_ip' : 'pppoe')),
        planName: c.plan?.name || c.planName || 'Standard Plan',
        bandwidthProfile: c.speedLimit || '10M/10M',
        ipAddress: c.ipAddress,
        macAddress: c.macAddress,
        status: c.status?.toLowerCase() === 'active' ? 'active' : (c.status?.toLowerCase() === 'suspended' ? 'suspended' : 'expired'),
        expiryDate: c.expiryDate || c.subscriptionExpiresAt || new Date().toISOString(),
        dataUsedGB: c.dataUsedGB || 0,
        dataLimitGB: c.dataLimitGB,
        balance: c.balance || 0,
      }));
    } catch { return []; }
  },

  grantManualVoucher: async (
    payload: ManualGrantRequest
  ): Promise<{ success: boolean; message: string; expiryDate: string }> => {
    const response = await apiClient.post<
      ApiResponse<{ success: boolean; message: string; expiryDate: string }>
    >('/payments/vouchers', payload);
    return response.data.data || (response.data as any);
  },

  generateVoucher: async (params: {
    packageName: string;
    durationHours: number;
    amount: number;
    quantity: number;
  }): Promise<{ voucherCodes: string[] }> => {
    const response = await apiClient.post<ApiResponse<{ voucherCodes: string[] }>>(
      '/vouchers/generate',
      params
    );
    return response.data.data;
  },
};
