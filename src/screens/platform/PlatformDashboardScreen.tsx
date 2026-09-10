import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { Tenant } from '../../types/models';
import { tenantApi } from '../../api/tenantApi';
import { useTenantStore } from '../../store/useTenantStore';
import { useOperations } from '../../hooks/useOperations';
import { useDashboardData } from '../../hooks/useDashboardData';
import { operationsApi } from '../../api/operationsApi';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export const PlatformDashboardScreen: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [routerMenuOpen, setRouterMenuOpen] = useState(false);
  const [selectedRouterId, setSelectedRouterId] = useState('');

  const currentTenant = useTenantStore((state) => state.currentTenant);
  const setCurrentTenant = useTenantStore((state) => state.setCurrentTenant);
  const queryClient = useQueryClient();
  const { devices, isLoadingDevices } = useOperations();
  const dashboardQuery = useDashboardData();
  const selectedRouter = devices.find((device) => device.id === selectedRouterId) || devices[0];
  const routerStatsQuery = useQuery({
    queryKey: ['fleetRouterStatistics', selectedRouter?.id],
    queryFn: () => operationsApi.getRouterStatistics(selectedRouter!.id),
    enabled: Boolean(selectedRouter?.id),
    refetchInterval: 15000,
    staleTime: 5000,
  });

  useEffect(() => {
    setSelectedRouterId(devices[0]?.id || '');
  }, [currentTenant?.id, devices]);

  const fetchTenants = async () => {
    try {
      const data = await tenantApi.getTenants();
      setTenants(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenants();
  };

  const handleSelectTenant = async (t: Tenant) => {
    await setCurrentTenant(t);
    setAccountMenuOpen(false);
    setRouterMenuOpen(false);
    setSelectedRouterId('');
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['networkDevices', t.id], exact: true }),
      queryClient.refetchQueries({ queryKey: ['dashboardMetrics', t.id], exact: true }),
      queryClient.refetchQueries({ queryKey: ['networkAlerts', t.id], exact: true }),
      queryClient.refetchQueries({ queryKey: ['accessPointsTopology', t.id], exact: true }),
      queryClient.refetchQueries({ queryKey: ['financialAnalytics', t.id], exact: true }),
      queryClient.refetchQueries({ queryKey: ['mpesaTransactions', t.id], exact: true }),
      queryClient.refetchQueries({ queryKey: ['subscribers', t.id], exact: true }),
    ]);
    Alert.alert('Tenant Switched', 'Active scope changed to ' + t.name + ' (' + t.code + ').');
  };

  const totalSubscribers = tenants.reduce((acc, t) => acc + (t.activeSubscribers || 0), 0);
  const totalRouters = tenants.reduce((acc, t) => acc + (t.activeRouters || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="PLATFORM OVERVIEW"
        subtitle="Multi-Tenant Global ISP Fleet & Revenue"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryLight}
          />
        }
      >
        {/* Global Summary KPIs */}
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <Ionicons name="business" size={16} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.kpiValue}>{tenants.length}</Text>
            <Text style={styles.kpiLabel}>Total Tenants</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="people" size={16} color={COLORS.emerald} />
            </View>
            <Text style={styles.kpiValue}>{totalSubscribers.toLocaleString()}</Text>
            <Text style={styles.kpiLabel}>Total Clients</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <MaterialCommunityIcons name="router-network" size={16} color={COLORS.amber} />
            </View>
            <Text style={styles.kpiValue}>{totalRouters}</Text>
            <Text style={styles.kpiLabel}>Core Routers</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>ADMIN SCOPE</Text>
        <Card style={styles.scopeCard}>
          <Text style={styles.scopeLabel}>ACCOUNT / ISP TENANT</Text>
          <TouchableOpacity style={styles.scopeDropdown} onPress={() => setAccountMenuOpen((open) => !open)}>
            <Ionicons name="business-outline" size={19} color={COLORS.primaryLight} />
            <Text style={styles.scopeDropdownText} numberOfLines={1}>
              {currentTenant ? `${currentTenant.name} (${currentTenant.code})` : 'Select an ISP account'}
            </Text>
            <Ionicons name={accountMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {accountMenuOpen && (
            <View style={styles.scopeMenu}>
              {tenants.map((tenant) => (
                <TouchableOpacity
                  key={tenant.id}
                  style={[styles.scopeMenuItem, currentTenant?.id === tenant.id && styles.scopeMenuItemActive]}
                  onPress={() => handleSelectTenant(tenant)}
                >
                  <Text style={styles.scopeMenuName}>{tenant.name} ({tenant.code})</Text>
                  <Text style={styles.scopeMenuMeta}>{tenant.region}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.scopeLabel, { marginTop: SPACING.md }]}>ROUTER</Text>
          <TouchableOpacity
            style={styles.scopeDropdown}
            onPress={() => setRouterMenuOpen((open) => !open)}
            disabled={isLoadingDevices || devices.length === 0}
          >
            <MaterialCommunityIcons name="router-wireless" size={20} color={COLORS.amber} />
            <Text style={styles.scopeDropdownText} numberOfLines={1}>
              {isLoadingDevices ? 'Loading routers...' : selectedRouter?.name || 'No router available'}
            </Text>
            <Ionicons name={routerMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {routerMenuOpen && (
            <View style={styles.scopeMenu}>
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[styles.scopeMenuItem, selectedRouter?.id === device.id && styles.scopeMenuItemActive]}
                  onPress={() => {
                    setSelectedRouterId(device.id);
                    setRouterMenuOpen(false);
                  }}
                >
                  <Text style={styles.scopeMenuName}>{device.name}</Text>
                  <Text style={styles.scopeMenuMeta}>{device.model} • {device.ipAddress}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedRouter && (
            <View style={styles.routerStatsGrid}>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{selectedRouter.status.toUpperCase()}</Text>
                <Text style={styles.routerStatLabel}>Status</Text>
              </View>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{routerStatsQuery.data?.cpu?.load ?? selectedRouter.cpuLoadPercent}%</Text>
                <Text style={styles.routerStatLabel}>CPU</Text>
              </View>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{routerStatsQuery.data?.memory?.usedPercent ?? selectedRouter.ramUsagePercent}%</Text>
                <Text style={styles.routerStatLabel}>RAM</Text>
              </View>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{selectedRouter.connectedClients}</Text>
                <Text style={styles.routerStatLabel}>Clients</Text>
              </View>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>ACCOUNT STATISTICS</Text>
        <Card style={styles.scopeCard}>
          {dashboardQuery.isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primaryLight} />
          ) : dashboardQuery.error ? (
            <Text style={styles.scopeMenuMeta}>Account statistics are unavailable.</Text>
          ) : (
            <View style={styles.routerStatsGrid}>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{dashboardQuery.data?.activeSubscribers ?? 0}</Text>
                <Text style={styles.routerStatLabel}>Subscribers</Text>
              </View>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{dashboardQuery.data?.onlineGateways ?? 0}/{dashboardQuery.data?.totalGateways ?? 0}</Text>
                <Text style={styles.routerStatLabel}>Online routers</Text>
              </View>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{dashboardQuery.data?.activeHotspotUsers ?? 0}</Text>
                <Text style={styles.routerStatLabel}>Hotspot users</Text>
              </View>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>KES {Number(dashboardQuery.data?.todayRevenue ?? 0).toLocaleString()}</Text>
                <Text style={styles.routerStatLabel}>Today's revenue</Text>
              </View>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{dashboardQuery.data?.unresolvedAlerts ?? 0}</Text>
                <Text style={styles.routerStatLabel}>Open alerts</Text>
              </View>
              <View style={styles.routerStat}>
                <Text style={styles.routerStatValue}>{dashboardQuery.data?.downloadSpeedMbps ?? 0} Mbps</Text>
                <Text style={styles.routerStatLabel}>Download</Text>
              </View>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>REGISTERED ISP TENANTS ({tenants.length})</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primaryLight} style={{ marginTop: 24 }} />
        ) : (
          tenants.map((tenant) => {
            const isSelected = currentTenant?.id === tenant.id;
            return (
              <TouchableOpacity
                key={tenant.id}
                activeOpacity={0.8}
                onPress={() => handleSelectTenant(tenant)}
              >
                <Card style={[styles.tenantCard, isSelected && styles.tenantCardActive]}>
                  <View style={styles.tenantHeader}>
                    <View style={styles.tenantLeft}>
                      <View style={[styles.tenantIcon, isSelected && styles.tenantIconActive]}>
                        <Ionicons
                          name="business"
                          size={20}
                          color={isSelected ? '#FFFFFF' : COLORS.primaryLight}
                        />
                      </View>
                      <View style={styles.tenantMeta}>
                        <View style={styles.nameRow}>
                          <Text style={styles.tenantName}>{tenant.name}</Text>
                          {isSelected && (
                            <Badge label="ACTIVE SCOPE" variant="online" size="sm" />
                          )}
                        </View>
                        <Text style={styles.tenantCode}>
                          CODE: {tenant.code} • {tenant.region}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Subscribers</Text>
                      <Text style={styles.metricValue}>
                        {tenant.activeSubscribers.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Routers</Text>
                      <Text style={styles.metricValue}>{tenant.activeRouters}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Status</Text>
                      <Text style={[styles.metricValue, { color: COLORS.emerald }]}>
                        ONLINE
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  kpiCard: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  kpiIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  scopeCard: {
    marginBottom: SPACING.md,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  scopeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  scopeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  scopeDropdownText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: SPACING.sm,
  },
  scopeMenu: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  scopeMenuItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  scopeMenuItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
  },
  scopeMenuName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  scopeMenuMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  routerStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  routerStat: {
    width: '23%',
    minWidth: 70,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  routerStatValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  routerStatLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
  },
  tenantCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  tenantCardActive: {
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tenantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  tenantIconActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tenantMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  tenantCode: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
});

export default PlatformDashboardScreen;
