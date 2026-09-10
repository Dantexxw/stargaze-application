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

function isToday(timestamp: string | undefined): boolean {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function getMpesaRevenueForDay(payments: any[], dayOffset = 0): number {
  const target = new Date();
  target.setDate(target.getDate() - dayOffset);
  return payments.reduce((total, payment) => {
    const method = String(payment.method || payment.paymentMethod || '').toUpperCase();
    const status = String(payment.status || '').toUpperCase();
    const timestamp = payment.paidAt || payment.createdAt;
    const date = timestamp ? new Date(timestamp) : null;
    const matchesDay =
      date &&
      date.getFullYear() === target.getFullYear() &&
      date.getMonth() === target.getMonth() &&
      date.getDate() === target.getDate();
    return matchesDay &&
      status === 'COMPLETED' &&
      (!method || method === 'MPESA')
      ? total + Number(payment.amount || 0)
      : total;
  }, 0);
}

export const paymentsApi = {
  getHotspotPlans: async (): Promise<HotspotPlan[]> => {
    try {
      const response = await apiClient.get<ApiResponse<HotspotPlan[]>>('/payments/vouchers/plans');
      return response.data.data || (response.data as any) || [];
    } catch {
      try {
        const response = await apiClient.get<ApiResponse<HotspotPlan[]>>('/payments/hotspot-offers');
        return response.data.data || (response.data as any) || [];
      } catch (error) {
        console.warn('[paymentsApi] Failed to fetch hotspot plans:', error);
        throw error;
      }
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
      // 1. Fetch payments with live analytics from VPS
      const payRes = await apiClient.get<any>('/payments?limit=100');
      const payBody = payRes.data;
      const payments: any[] = Array.isArray(payBody?.data)
        ? payBody.data
        : Array.isArray(payBody)
        ? payBody
        : [];

      // 2. Fetch platform dashboard for operations metrics
      let platformRes: any = null;
      try {
        const plat = await apiClient.get<any>('/dashboard/platform');
        platformRes = plat.data?.data ?? plat.data;
      } catch {}

      const totalRevenue = getMpesaRevenueForDay(payments);
      const yesterdayRevenue = getMpesaRevenueForDay(payments, 1);
      const completedTxns =
        payments.filter((payment) =>
          isToday(payment.paidAt || payment.createdAt) &&
          String(payment.status || '').toUpperCase() === 'COMPLETED'
        ).length;
      const customersCount =
        Number(platformRes?.operations?.customers) || 0;
      const avgTicket =
        completedTxns > 0 ? totalRevenue / completedTxns : 0;
      const todayTransactions = payments.filter((payment) =>
        isToday(payment.paidAt || payment.createdAt)
      );
      const completionRate = todayTransactions.length > 0
        ? Math.round((completedTxns / todayTransactions.length) * 1000) / 10
        : 0;

      return {
        todayRevenue: totalRevenue,
        yesterdayRevenue,
        revenueGrowthPercent: yesterdayRevenue > 0
          ? Math.round(((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 1000) / 10
          : 0,
        activeSubscribers: customersCount,
        hotspotSalesCount: completedTxns,
        conversionRatePercent: completionRate,
        pppoeRevenue: 0,
        hotspotRevenue: totalRevenue,
        averageTransactionValue: Math.round(avgTicket * 100) / 100,
        currency: 'KES',
      };
    } catch (err) {
      console.warn('[paymentsApi] Live VPS analytics fallback:', err);
      return {
        todayRevenue: 0,
        yesterdayRevenue: 0,
        revenueGrowthPercent: 0,
        activeSubscribers: 0,
        hotspotSalesCount: 0,
        conversionRatePercent: 0,
        pppoeRevenue: 0,
        hotspotRevenue: 0,
        averageTransactionValue: 0,
        currency: 'KES',
      };
    }
  },

  getMpesaTransactions: async (): Promise<MpesaTransaction[]> => {
    try {
      const response = await apiClient.get<any>('/payments?limit=100');
      const rawList: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
      return rawList.map((p: any) => ({
        id: p.id,
        receiptNumber:
          p.mpesaReceipt ||
          p.receiptNumber ||
          p.mpesaReceiptNumber ||
          p.transactionId ||
          p.id?.slice(0, 10).toUpperCase() ||
          'TXN',
        phoneNumber: p.phone || p.phoneNumber || p.customerPhone || p.customer?.phone || 'N/A',
        customerName:
          p.customerName ||
          (p.customer
            ? `${p.customer.firstName || ''} ${p.customer.lastName || ''}`.trim()
            : '') ||
          'Hotspot Customer',
        amount: Number(p.amount) || 0,
        currency: p.currency || 'KES',
        type:
          p.paymentMethod === 'STK_PUSH' || p.method === 'STK_PUSH'
            ? 'STK_PUSH'
            : p.type || p.method || 'C2B',
        packageName:
          p.notes ||
          p.mpesaMetadata?.planCode ||
          p.packageName ||
          p.plan?.name ||
          'Hotspot Voucher Pass',
        status:
          p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success'
            ? 'completed'
            : p.status?.toLowerCase() === 'failed'
            ? 'failed'
            : 'pending',
        timestamp: p.paidAt || p.createdAt || p.timestamp || new Date().toISOString(),
        accountReference: p.mpesaReceipt || p.accountReference || p.reference || 'STARGAZE',
        macAddress: p.mpesaMetadata?.macAddress || p.macAddress,
        durationPlan: p.durationPlan,
      }));
    } catch (error) {
      console.warn('[paymentsApi] Failed to fetch M-Pesa transactions:', error);
      throw error;
    }
  },

  getSubscribers: async (): Promise<Subscriber[]> => {
    try {
      const response = await apiClient.get<any>('/customers?limit=100');
      const rawList: any[] = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
      return rawList.map((c: any) => ({
        id: c.id,
        name:
          `${c.firstName || ''} ${c.lastName || ''}`.trim() ||
          c.name ||
          'Hotspot Customer',
        accountNumber: c.phone || c.accountNumber || c.code || c.id?.slice(0, 8).toUpperCase() || 'SUB',
        phone: c.phone || '',
        type:
          c.serviceOffered?.toLowerCase().includes('hotspot') ||
          c.connectionType?.toLowerCase().includes('hotspot')
            ? 'hotspot_voucher'
            : c.serviceType?.toLowerCase() === 'static_ip'
            ? 'static_ip'
            : 'pppoe',
        planName: c.serviceOffered || c.plan?.name || c.planName || 'HotSpot · Standard Pass',
        bandwidthProfile: c.speedLimit || '10M/10M',
        ipAddress: c.ipAddress,
        macAddress: c.macAddress,
        status:
          c.status?.toLowerCase() === 'active' || c.accountStatus?.toLowerCase() === 'active'
            ? 'active'
            : c.status?.toLowerCase() === 'suspended'
            ? 'suspended'
            : 'expired',
        expiryDate: c.expiryDate || c.subscriptionExpiresAt || c.createdAt || new Date().toISOString(),
        dataUsedGB: c.dataUsedGB || 0,
        dataLimitGB: c.dataLimitGB,
        balance: c.balance || 0,
      }));
    } catch (error) {
      console.warn('[paymentsApi] Failed to fetch subscribers:', error);
      throw error;
    }
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
