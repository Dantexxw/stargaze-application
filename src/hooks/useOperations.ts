import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsApi } from '../api/operationsApi';
import { useTenantStore } from '../store/useTenantStore';

export const useOperations = () => {
  const queryClient = useQueryClient();
  const currentTenant = useTenantStore((state) => state.currentTenant);

  const devicesQuery = useQuery({
    queryKey: ['networkDevices', currentTenant?.id],
    queryFn: () => operationsApi.getDevices(),
    refetchInterval: 15000,
  });

  const alertsQuery = useQuery({
    queryKey: ['networkAlerts', currentTenant?.id],
    queryFn: () => operationsApi.getAlerts(),
    refetchInterval: 15000,
  });

  const rebootMutation = useMutation({
    mutationFn: (deviceId: string) => operationsApi.rebootDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networkDevices', currentTenant?.id] });
    },
  });

  return {
    devices: devicesQuery.data || [],
    isLoadingDevices: devicesQuery.isLoading,
    refetchDevices: devicesQuery.refetch,
    alerts: alertsQuery.data || [],
    isLoadingAlerts: alertsQuery.isLoading,
    refetchAlerts: alertsQuery.refetch,
    rebootDevice: rebootMutation.mutateAsync,
    isRebooting: rebootMutation.isPending,
  };
};
