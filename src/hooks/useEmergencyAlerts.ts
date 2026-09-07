import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsApi } from '../api/operationsApi';
import { useTenantStore } from '../store/useTenantStore';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const useEmergencyAlerts = () => {
  const queryClient = useQueryClient();
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const prevAlertCountRef = useRef<number>(0);

  const alertsQuery = useQuery({
    queryKey: ['emergencyAlerts', currentTenant?.id],
    queryFn: () => operationsApi.getEmergencyAlerts(),
    refetchInterval: 8000, // Poll every 8s for critical disconnect events
    staleTime: 4000,
  });

  const techniciansQuery = useQuery({
    queryKey: ['availableTechnicians', currentTenant?.id],
    queryFn: () => operationsApi.getAvailableTechnicians(),
    staleTime: 30000,
  });

  // Haptic feedback & notification trigger on critical alert arrival
  useEffect(() => {
    const unackedCritical = (alertsQuery.data || []).filter(
      (a) => !a.acknowledged && a.severity === 'critical'
    );

    if (unackedCritical.length > 0 && unackedCritical.length > prevAlertCountRef.current) {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (e) {
          console.warn('[Haptics] Failed to trigger notification feedback', e);
        }
      }
    }
    prevAlertCountRef.current = unackedCritical.length;
  }, [alertsQuery.data]);

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => operationsApi.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyAlerts', currentTenant?.id] });
    },
  });

  const dispatchSmsMutation = useMutation({
    mutationFn: (params: {
      alertId: string;
      technicianPhone: string;
      technicianName: string;
      message: string;
    }) => operationsApi.dispatchTechnicianSms(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyAlerts', currentTenant?.id] });
    },
  });

  const pingMutation = useMutation({
    mutationFn: (host: string) => operationsApi.pingDevicePort(host),
  });

  const activeCriticalAlerts = (alertsQuery.data || []).filter((a) => !a.acknowledged);

  return {
    emergencyAlerts: alertsQuery.data || [],
    activeCriticalAlerts,
    hasCriticalAlert: activeCriticalAlerts.length > 0,
    technicians: techniciansQuery.data || [],
    isLoadingAlerts: alertsQuery.isLoading,
    refetchAlerts: alertsQuery.refetch,
    acknowledgeAlert: acknowledgeMutation.mutateAsync,
    isAcknowledging: acknowledgeMutation.isPending,
    dispatchSms: dispatchSmsMutation.mutateAsync,
    isDispatching: dispatchSmsMutation.isPending,
    pingPort: pingMutation.mutateAsync,
    isPinging: pingMutation.isPending,
  };
};
