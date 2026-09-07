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
      const response = await apiClient.get<ApiResponse<MpesaTransaction[]>>('/payments');
      return response.data.data || (response.data as any) || [];
    } catch { return []; }
  },

  getSubscribers: async (): Promise<Subscriber[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Subscriber[]>>('/subscribers');
      return response.data.data || (response.data as any) || [];
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
