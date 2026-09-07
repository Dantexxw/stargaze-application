import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsApi } from '../api/operationsApi';
import { useTenantStore } from '../store/useTenantStore';

export const useAccessPointsTopology = () => {
  const queryClient = useQueryClient();
  const currentTenant = useTenantStore((state) => state.currentTenant);

  const topologyQuery = useQuery({
    queryKey: ['accessPointsTopology', currentTenant?.id],
    queryFn: () => operationsApi.getAccessPointsTopology(),
    refetchInterval: 10000, // Poll every 10 seconds for real-time live host and traffic counts
    staleTime: 5000,
  });

  const disconnectMutation = useMutation({
    mutationFn: (macAddress: string) => operationsApi.disconnectHostDevice(macAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessPointsTopology', currentTenant?.id] });
    },
  });

  const allConnectedHosts = (topologyQuery.data || []).flatMap((ap) =>
    ap.devices.map((d) => ({ ...d, apName: ap.apName, portName: ap.portName }))
  );

  const totalHostsCount = allConnectedHosts.length;
  const totalPaidSessionsCount = allConnectedHosts.filter(
    (h) => h.status === 'active_paid'
  ).length;

  return {
    portsTopology: topologyQuery.data || [],
    allConnectedHosts,
    totalHostsCount,
    totalPaidSessionsCount,
    isLoading: topologyQuery.isLoading,
    isRefetching: topologyQuery.isRefetching,
    refetch: topologyQuery.refetch,
    disconnectDevice: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
};
