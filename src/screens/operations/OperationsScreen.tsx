import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { CriticalAlertBanner } from '../../components/operations/CriticalAlertBanner';
import { DispatchTechModal } from '../../components/operations/DispatchTechModal';
import { PingDiagnosticModal } from '../../components/operations/PingDiagnosticModal';
import { DispatchMapView } from '../../components/operations/DispatchMapView';
import { PortApCard } from '../../components/operations/PortApCard';
import { ConnectedDeviceCard } from '../../components/operations/ConnectedDeviceCard';
import { DeviceCard } from '../../components/operations/DeviceCard';
import { TopologyMap } from '../../components/operations/TopologyMap';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { useOperations } from '../../hooks/useOperations';
import { useAccessPointsTopology } from '../../hooks/useAccessPointsTopology';
import { useEmergencyAlerts } from '../../hooks/useEmergencyAlerts';
import { useAuthStore } from '../../store/useAuthStore';
import { EmergencyAlert } from '../../types/models';
import { formatTimeAgo } from '../../utils/formatters';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type TabMode = 'live_ap_hosts' | 'dispatch_map' | 'hardware' | 'topology' | 'alerts';
type HostFilterMode = 'all' | 'paid' | 'unpaid';

export const OperationsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('live_ap_hosts');
  const [hostFilter, setHostFilter] = useState<HostFilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortFilter, setSelectedPortFilter] = useState<string>('all');

  // Emergency & Dispatch Modal states
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [activeDispatchAlert, setActiveDispatchAlert] = useState<EmergencyAlert | null>(null);

  const [pingModalVisible, setPingModalVisible] = useState(false);
  const [pingTarget, setPingTarget] = useState({ host: '', name: '' });

  const {
    devices,
    isLoadingDevices,
    refetchDevices,
    alerts,
    isLoadingAlerts,
    refetchAlerts,
    rebootDevice,
  } = useOperations();

  const {
    portsTopology,
    allConnectedHosts,
    totalHostsCount,
    totalPaidSessionsCount,
    isLoading: isLoadingTopology,
    isRefetching: isRefetchingTopology,
    refetch: refetchTopology,
    disconnectDevice,
  } = useAccessPointsTopology();

  const {
    emergencyAlerts,
    activeCriticalAlerts,
    hasCriticalAlert,
    technicians,
    isLoadingAlerts: isLoadingEmergency,
    refetchAlerts: refetchEmergency,
    acknowledgeAlert,
    dispatchSms,
    pingPort,
  } = useEmergencyAlerts();

  const [refreshing, setRefreshing] = useState(false);

  const canRebootGateways = useAuthStore((state) => state.canRebootGateways);
  const canDispatchTechnicians = useAuthStore((state) => state.canDispatchTechnicians);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchEmergency(),
      refetchTopology(),
      refetchDevices(),
      refetchAlerts(),
    ]);
    setRefreshing(false);
  };

  const handleDeviceReboot = (deviceId: string, deviceName: string) => {
    if (!canRebootGateways()) {
      Alert.alert(
        'Access Restricted',
        'Remote gateway reboot commands are restricted to Super Administrators and Tenant Administrators.'
      );
      return;
    }

    Alert.alert(
      'Reboot Device',
      `Dispatch remote reboot command to ${deviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Reboot',
          style: 'destructive',
          onPress: async () => {
            try {
              await rebootDevice(deviceId);
              Alert.alert('Success', `${deviceName} reboot initiated.`);
            } catch (error) {
              console.warn('[OperationsScreen] Device reboot failed:', error);
              Alert.alert('Reboot Failed', `The VPS could not reboot ${deviceName}.`);
            }
          },
        },
      ]
    );
  };

  const handleDisconnectHost = async (mac: string) => {
    try {
      const res = await disconnectDevice(mac);
      Alert.alert('Client Disconnected', res.message);
    } catch (error) {
      console.warn('[OperationsScreen] Client disconnect failed:', error);
      Alert.alert('Disconnect Failed', `The VPS could not disconnect client ${mac}.`);
    }
  };

  const handleTriggerDispatch = (alertItem: EmergencyAlert) => {
    if (!canDispatchTechnicians()) {
      Alert.alert(
        'Access Restricted',
        'Emergency technician dispatch via SMS is restricted to Administrator roles.'
      );
      return;
    }
    setActiveDispatchAlert(alertItem);
    setDispatchModalVisible(true);
  };

  const handleTriggerPing = (alertItem: EmergencyAlert) => {
    setPingTarget({ host: alertItem.ipAddress, name: alertItem.apName });
    setPingModalVisible(true);
  };

  // Filter Port Topologies or Flattened Hosts
  const filteredPorts = portsTopology.filter((p) => {
    if (selectedPortFilter !== 'all' && p.portId !== selectedPortFilter) return false;
    return true;
  });

  const filteredFlatHosts = allConnectedHosts.filter((h) => {
    if (selectedPortFilter !== 'all' && h.portId !== selectedPortFilter) return false;
    if (hostFilter === 'paid' && h.status !== 'active_paid') return false;
    if (hostFilter === 'unpaid' && h.status !== 'connected_unpaid') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.hostname.toLowerCase().includes(q) ||
        h.ipAddress.includes(q) ||
        h.macAddress.toLowerCase().includes(q) ||
        (h.username && h.username.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="OPERATIONS"
        subtitle="Live AP Ports, Emergency Dispatch & GIS Map"
      />

      {/* Main Tab Segmented Control */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        style={styles.tabBarScroll}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('live_ap_hosts')}
          style={[styles.tabButton, activeTab === 'live_ap_hosts' && styles.tabButtonActive]}
        >
          <MaterialCommunityIcons
            name="router-wireless"
            size={15}
            color={activeTab === 'live_ap_hosts' ? COLORS.primaryLight : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'live_ap_hosts' && styles.tabTextActive]}
          >
            Live APs ({totalHostsCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('dispatch_map')}
          style={[styles.tabButton, activeTab === 'dispatch_map' && styles.tabButtonActive]}
        >
          <Ionicons
            name="navigate-circle-outline"
            size={16}
            color={activeTab === 'dispatch_map' ? COLORS.emerald : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'dispatch_map' && styles.tabTextActive]}
          >
            GPS Dispatch
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('hardware')}
          style={[styles.tabButton, activeTab === 'hardware' && styles.tabButtonActive]}
        >
          <Ionicons
            name="hardware-chip-outline"
            size={15}
            color={activeTab === 'hardware' ? COLORS.primaryLight : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'hardware' && styles.tabTextActive]}
          >
            Gateways ({devices.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('topology')}
          style={[styles.tabButton, activeTab === 'topology' && styles.tabButtonActive]}
        >
          <Ionicons
            name="git-network-outline"
            size={15}
            color={activeTab === 'topology' ? COLORS.violetLight : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'topology' && styles.tabTextActive]}
          >
            Tree Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('alerts')}
          style={[styles.tabButton, activeTab === 'alerts' && styles.tabButtonActive]}
        >
          <Ionicons
            name="notifications-outline"
            size={15}
            color={activeTab === 'alerts' ? COLORS.rose : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}
          >
            Alerts ({activeCriticalAlerts.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
        {/* CRITICAL DISCONNECT ALERT BANNER (High-Priority Alert Card) */}
        {hasCriticalAlert &&
          activeCriticalAlerts.map((crit) => (
            <CriticalAlertBanner
              key={crit.id}
              alert={crit}
              onAcknowledge={async (id) => {
                await acknowledgeAlert(id);
              }}
              onDispatchTech={handleTriggerDispatch}
              onPingPort={handleTriggerPing}
              onOpenMap={() => setActiveTab('dispatch_map')}
            />
          ))}

        {/* TAB 1: LIVE ACCESS POINTS & CONNECTED HOSTS */}
        {activeTab === 'live_ap_hosts' && (
          <View>
            {/* Live Polling Status Banner */}
            <View style={styles.pollingBanner}>
              <View style={styles.pollingLeft}>
                <View style={styles.livePulseDot} />
                <Text style={styles.pollingText}>
                  Live Polling: Active ({totalPaidSessionsCount} paid sessions / {totalHostsCount} connected hosts)
                </Text>
              </View>
              <Text style={styles.pollingInterval}>Every 10s</Text>
            </View>

            {/* Port Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portFilterScroll}>
              <TouchableOpacity
                onPress={() => setSelectedPortFilter('all')}
                style={[
                  styles.portFilterChip,
                  selectedPortFilter === 'all' && styles.portFilterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.portFilterChipText,
                    selectedPortFilter === 'all' && styles.portFilterChipTextActive,
                  ]}
                >
                  All Ports ({portsTopology.length})
                </Text>
              </TouchableOpacity>

              {portsTopology.map((p) => (
                <TouchableOpacity
                  key={p.portId}
                  onPress={() => setSelectedPortFilter(p.portId)}
                  style={[
                    styles.portFilterChip,
                    selectedPortFilter === p.portId && styles.portFilterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.portFilterChipText,
                      selectedPortFilter === p.portId && styles.portFilterChipTextActive,
                    ]}
                  >
                    {p.portName} ({p.devices.length})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search and Status Filter */}
            <View style={styles.searchFilterContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={COLORS.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Filter Hostname, IP, MAC, Username..."
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.filterPillGroup}>
                {(['all', 'paid', 'unpaid'] as HostFilterMode[]).map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setHostFilter(f)}
                    style={[
                      styles.filterPill,
                      hostFilter === f && styles.filterPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        hostFilter === f && styles.filterPillTextActive,
                      ]}
                    >
                      {f === 'all' ? 'All' : f === 'paid' ? '⚡ Active Paid' : '⚪ Unpaid'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Device Table/Cards */}
            {isLoadingTopology ? (
              <Card style={styles.emptyCard}>
                <ActivityIndicator color={COLORS.primaryLight} />
                <Text style={styles.emptyTitle}>Loading live access points...</Text>
              </Card>
            ) : searchQuery.trim() || hostFilter !== 'all' ? (
              <View>
                <Text style={styles.resultCountText}>
                  Showing {filteredFlatHosts.length} matching connected devices:
                </Text>
                {filteredFlatHosts.map((device) => (
                  <ConnectedDeviceCard
                    key={device.id}
                    device={device}
                    onDisconnect={handleDisconnectHost}
                  />
                ))}
              </View>
            ) : filteredPorts.length > 0 ? (
              filteredPorts.map((portTop) => (
                <PortApCard
                  key={portTop.portId}
                  portTopology={portTop}
                  onDisconnectDevice={handleDisconnectHost}
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Ionicons name="radio-outline" size={28} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No live access points reported</Text>
                <Text style={styles.emptySubtitle}>
                  The VPS returned no topology ports for this tenant.
                </Text>
              </Card>
            )}
          </View>
        )}

        {/* TAB 2: GPS DISPATCH & RADAR MAP */}
        {activeTab === 'dispatch_map' && (
          <DispatchMapView
            alerts={activeCriticalAlerts}
            technicians={technicians}
            ports={portsTopology}
            onDispatchTech={handleTriggerDispatch}
          />
        )}

        {/* TAB 3: HARDWARE & GATEWAYS */}
        {activeTab === 'hardware' && (
          <View>
            {isLoadingDevices ? (
              <Card style={styles.emptyCard}>
                <ActivityIndicator color={COLORS.primaryLight} />
                <Text style={styles.emptyTitle}>Loading gateways...</Text>
              </Card>
            ) : devices.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="hardware-chip-outline" size={28} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No gateways reported</Text>
              </Card>
            ) : devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onPress={() => {
                  Alert.alert(
                    device.name,
                    `Model: ${device.model}\nIP: ${device.ipAddress}\nMAC: ${device.macAddress}\nUptime: ${device.uptime}\nConnected Clients: ${device.connectedClients}`,
                    [
                      { text: 'Close', style: 'cancel' },
                      {
                        text: 'Reboot Device',
                        style: 'destructive',
                        onPress: () => handleDeviceReboot(device.id, device.name),
                      },
                    ]
                  );
                }}
              />
            ))}
          </View>
        )}

        {/* TAB 4: TOPOLOGY TREE MAP */}
        {activeTab === 'topology' && <TopologyMap devices={devices} />}

        {/* TAB 5: ALERTS & INCIDENT LOGS */}
        {activeTab === 'alerts' && (
          <View style={styles.alertsContainer}>
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                variant={alert.severity === 'critical' ? 'glow' : 'surface'}
                glowColor={COLORS.roseGlow}
                style={styles.alertCard}
              >
                <View style={styles.alertHeader}>
                  <View style={styles.alertTitleRow}>
                    <Ionicons
                      name={
                        alert.severity === 'critical'
                          ? 'alert-circle'
                          : alert.severity === 'warning'
                          ? 'warning'
                          : 'information-circle'
                      }
                      size={20}
                      color={
                        alert.severity === 'critical'
                          ? COLORS.rose
                          : alert.severity === 'warning'
                          ? COLORS.amber
                          : COLORS.primaryLight
                      }
                    />
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                  </View>
                  <Badge
                    label={alert.severity.toUpperCase()}
                    variant={
                      alert.severity === 'critical'
                        ? 'danger'
                        : alert.severity === 'warning'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  />
                </View>

                <Text style={styles.alertDescription}>{alert.description}</Text>

                <View style={styles.alertFooter}>
                  <Text style={styles.alertTimestamp}>
                    {formatTimeAgo(alert.timestamp)}
                  </Text>
                  {!alert.acknowledged && (
                    <Button
                      title="Acknowledge"
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        acknowledgeAlert(alert.id)
                          .then(() => Alert.alert('Alert Acknowledged', 'Incident logged.'))
                          .catch(() => Alert.alert('Acknowledgement Failed', 'The VPS could not update this alert.'));
                      }}
                    />
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Technician Dispatch SMS Modal */}
      <DispatchTechModal
        visible={dispatchModalVisible}
        alert={activeDispatchAlert}
        technicians={technicians}
        onClose={() => setDispatchModalVisible(false)}
        onDispatchSms={dispatchSms}
      />

      {/* Ping Diagnostic Modal */}
      <PingDiagnosticModal
        visible={pingModalVisible}
        targetHost={pingTarget.host}
        targetName={pingTarget.name}
        onClose={() => setPingModalVisible(false)}
        onRunPing={pingPort}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.xs,
  },
  tabBarScroll: {
    flexGrow: 0,
    backgroundColor: COLORS.surface,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 118,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  pollingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  pollingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
    marginRight: 6,
  },
  pollingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
    flex: 1,
  },
  pollingInterval: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  portFilterScroll: {
    marginBottom: SPACING.sm,
  },
  portFilterChip: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    marginRight: 6,
  },
  portFilterChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: COLORS.primaryLight,
  },
  portFilterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  portFilterChipTextActive: {
    color: COLORS.primaryLight,
  },
  searchFilterContainer: {
    marginBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    marginBottom: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    marginLeft: SPACING.sm,
  },
  filterPillGroup: {
    flexDirection: 'row',
    marginTop: 4,
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  filterPillActive: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.primaryLight,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.primaryLight,
  },
  resultCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginVertical: 4,
  },
  alertsContainer: {
    marginTop: SPACING.xs,
  },
  alertCard: {
    marginBottom: SPACING.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.xs,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  alertDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  alertTimestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    marginTop: SPACING.sm,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
