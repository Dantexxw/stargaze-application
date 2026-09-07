import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/paymentsApi';
import { useTenantStore } from '../store/useTenantStore';
import { ManualGrantRequest } from '../types/models';

export const useFinancialAnalytics = () => {
  const queryClient = useQueryClient();
  const currentTenant = useTenantStore((state) => state.currentTenant);

  const analyticsQuery = useQuery({
    queryKey: ['financialAnalytics', currentTenant?.id],
    queryFn: () => paymentsApi.getFinancialAnalytics(),
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const mpesaStreamQuery = useQuery({
    queryKey: ['mpesaTransactionsStream', currentTenant?.id],
    queryFn: () => paymentsApi.getMpesaTransactions(),
    refetchInterval: 8000, // Real-time M-Pesa transaction polling
    staleTime: 4000,
  });

  const grantVoucherMutation = useMutation({
    mutationFn: (payload: ManualGrantRequest) => paymentsApi.grantManualVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpesaTransactionsStream', currentTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ['financialAnalytics', currentTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ['accessPointsTopology', currentTenant?.id] });
    },
  });

  return {
    analytics: analyticsQuery.data,
    isLoadingAnalytics: analyticsQuery.isLoading,
    transactions: mpesaStreamQuery.data || [],
    isLoadingTransactions: mpesaStreamQuery.isLoading,
    isRefetchingTransactions: mpesaStreamQuery.isRefetching,
    refetchTransactions: mpesaStreamQuery.refetch,
    grantManualVoucher: grantVoucherMutation.mutateAsync,
    isGrantingVoucher: grantVoucherMutation.isPending,
  };
};
