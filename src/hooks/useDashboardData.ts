import { useQuery } from '@tanstack/react-query';
import { operationsApi } from '../api/operationsApi';
import { useTenantStore } from '../store/useTenantStore';

export const useDashboardData = () => {
  const currentTenant = useTenantStore((state) => state.currentTenant);

  return useQuery({
    queryKey: ['dashboardMetrics', currentTenant?.id],
    queryFn: () => operationsApi.getDashboardMetrics(),
    refetchInterval: 10000, // Live polling every 10 seconds for real-time telemetry
    staleTime: 5000,
  });
};
