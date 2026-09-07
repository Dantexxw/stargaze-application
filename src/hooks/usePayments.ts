import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/paymentsApi';
import { useTenantStore } from '../store/useTenantStore';

export const usePayments = () => {
  const queryClient = useQueryClient();
  const currentTenant = useTenantStore((state) => state.currentTenant);

  const mpesaQuery = useQuery({
    queryKey: ['mpesaTransactions', currentTenant?.id],
    queryFn: () => paymentsApi.getMpesaTransactions(),
    refetchInterval: 8000, // Frequent polling for live M-Pesa STK push feed
  });

  const subscribersQuery = useQuery({
    queryKey: ['subscribers', currentTenant?.id],
    queryFn: () => paymentsApi.getSubscribers(),
  });

  const voucherMutation = useMutation({
    mutationFn: (params: {
      packageName: string;
      durationHours: number;
      amount: number;
      quantity: number;
    }) => paymentsApi.generateVoucher(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers', currentTenant?.id] });
    },
  });

  return {
    transactions: mpesaQuery.data || [],
    isLoadingTransactions: mpesaQuery.isLoading,
    refetchTransactions: mpesaQuery.refetch,
    subscribers: subscribersQuery.data || [],
    isLoadingSubscribers: subscribersQuery.isLoading,
    refetchSubscribers: subscribersQuery.refetch,
    generateVouchers: voucherMutation.mutateAsync,
    isGeneratingVouchers: voucherMutation.isPending,
  };
};
