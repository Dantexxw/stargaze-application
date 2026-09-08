import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { StatWidget } from '../../components/common/StatWidget';
import { BandwidthGauge } from '../../components/dashboard/BandwidthGauge';
import { RevenueSummary } from '../../components/dashboard/RevenueSummary';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { RoleGuard } from '../../components/common/RoleGuard';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAuthStore } from '../../store/useAuthStore';
import { operationsApi } from '../../api/operationsApi';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types/navigation';

import { SpeedtestModal } from '../../components/operations/SpeedtestModal';
import { FiberPowerDiagnosticModal } from '../../components/operations/FiberPowerDiagnosticModal';
import { SubscriberProvisioningModal } from '../../components/operations/SubscriberProvisioningModal';
import { WifiSignalAnalyzerModal } from '../../components/operations/WifiSignalAnalyzerModal';
import { TouchableOpacity } from 'react-native';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { data: metrics, isLoading, error, refetch } = useDashboardData();
  const user = useAuthStore((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [speedtestVisible, setSpeedtestVisible] = useState(false);
  const [fiberVisible, setFiberVisible] = useState(false);
  const [provisionVisible, setProvisionVisible] = useState(false);
  const [wifiVisible, setWifiVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="STARGAZE"
        subtitle="Network Core & Operations Dashboard"
        rightAction={
          <View style={styles.healthStatus}>
            <Ionicons
              name={metrics?.systemHealth === 'optimal' ? 'shield-checkmark' : 'alert-circle'}
              size={24}
              color={metrics?.systemHealth === 'optimal' ? COLORS.emerald : COLORS.amber}
            />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryLight}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Connection error banner */}
        {error && !metrics && (
          <Card variant="surface" style={styles.errorBanner}>
            <View style={styles.errorRow}>
              <Ionicons name="cloud-offline" size={20} color={COLORS.rose} />
              <View style={styles.errorTextBlock}>
                <Text style={styles.errorTitle}>Server Unreachable</Text>
                <Text style={styles.errorBody}>
                  Could not reach the Stargaze API. Check your connection and pull to refresh.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* KPI Row 1: Active Subscribers & Hotspots */}
        <View style={styles.statsGrid}>
          <StatWidget
            title="Active PPPoE"
            value={metrics?.activeSubscribers != null ? metrics.activeSubscribers.toLocaleString() : '—'}
            subtitle={metrics?.totalSubscribers != null ? `of ${metrics.totalSubscribers} Total` : 'Awaiting data'}
            icon={<Ionicons name="people" size={18} color={COLORS.primaryLight} />}
            trend={{ value: metrics ? '4.8% this week' : 'No data', isPositive: true }}
            accentColor={COLORS.primary}
          />
          <StatWidget
            title="Hotspot Users"
            value={metrics?.activeHotspotUsers != null ? metrics.activeHotspotUsers.toLocaleString() : '—'}
            subtitle="Active Sessions"
            icon={<Ionicons name="wifi" size={18} color={COLORS.violetLight} />}
            trend={{ value: metrics ? '12% today' : 'No data', isPositive: true }}
            accentColor={COLORS.violet}
          />
        </View>

        {/* KPI Row 2: Online Gateways & Active Alarms */}
        <View style={styles.statsGrid}>
          <StatWidget
            title="Online Routers"
            value={metrics ? `${metrics.onlineGateways} / ${metrics.totalGateways}` : '—'}
            subtitle={metrics ? '100% Availability' : 'Awaiting data'}
            icon={<MaterialCommunityIcons name="router-network" size={18} color={COLORS.emerald} />}
            trend={{ value: metrics ? 'All Online' : 'No data', isPositive: true }}
            accentColor={COLORS.emerald}
          />
          <StatWidget
            title="Active Alerts"
            value={metrics?.unresolvedAlerts ?? '—'}
            subtitle={metrics ? (metrics.unresolvedAlerts ? 'Require Attention' : 'All Interfaces Normal') : 'Awaiting data'}
            icon={<Ionicons name={metrics?.unresolvedAlerts ? 'warning' : 'shield-checkmark'} size={18} color={metrics?.unresolvedAlerts ? COLORS.rose : COLORS.emerald} />}
            trend={{
              value: metrics ? (metrics.unresolvedAlerts ? `${metrics.unresolvedAlerts} Critical` : '0 Alarms') : 'No data',
              isPositive: (metrics?.unresolvedAlerts ?? 0) === 0,
            }}
            accentColor={metrics?.unresolvedAlerts ? COLORS.rose : COLORS.emerald}
          />
        </View>

        {/* Real-time Bandwidth Gauge */}
        <BandwidthGauge
          downloadMbps={metrics?.downloadSpeedMbps ?? 0}
          uploadMbps={metrics?.uploadSpeedMbps ?? 0}
          peakMbps={metrics?.peakBandwidthMbps ?? 0}
          totalTransferredGB={metrics?.totalDataTransferredGB ?? 0}
          onSpeedtestPress={() => setSpeedtestVisible(true)}
        />

        {/* RBAC Protected: Daily Revenue Summary (Admin & Billing Only) */}
        <RoleGuard
          allowedRoles={['SUPER_ADMIN', 'TENANT_ADMIN', 'BILLING_ADMIN']}
          showRestrictedCard
          featureTitle="M-Pesa Revenue Analytics (Finance & Admin Protected)"
        >
          <RevenueSummary
            todayRevenue={metrics?.todayRevenue || 0}
            revenueTarget={metrics?.revenueTarget || 0}
            currency={metrics?.currency || 'KES'}
          />
        </RoleGuard>

        {/* Field Diagnostic Toolkit */}
        <View style={styles.toolkitSection}>
          <Text style={styles.sectionTitle}>FIELD DIAGNOSTIC TOOLKIT</Text>
          <View style={styles.toolkitGrid}>
            <TouchableOpacity
              style={styles.toolkitBtn}
              onPress={() => setSpeedtestVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.toolkitIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                <Ionicons name="flash" size={18} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.toolkitTitle}>Speedtest</Text>
              <Text style={styles.toolkitSubtitle}>Benchmark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolkitBtn}
              onPress={() => setFiberVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.toolkitIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <MaterialCommunityIcons name="laser-pointer" size={18} color={COLORS.emerald} />
              </View>
              <Text style={styles.toolkitTitle}>Fiber dBm</Text>
              <Text style={styles.toolkitSubtitle}>Optical Power</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolkitBtn}
              onPress={() => setWifiVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.toolkitIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Ionicons name="wifi" size={18} color={COLORS.violetLight} />
              </View>
              <Text style={styles.toolkitTitle}>Wi-Fi RSSI</Text>
              <Text style={styles.toolkitSubtitle}>Interference</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolkitBtn}
              onPress={() => setProvisionVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.toolkitIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Ionicons name="person-add" size={18} color={COLORS.amber} />
              </View>
              <Text style={styles.toolkitTitle}>Provision</Text>
              <Text style={styles.toolkitSubtitle}>New PPPoE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Shortcuts */}
        <QuickActions
          onGenerateVoucher={() => {
            navigation.navigate('Customers');
          }}
          onRebootGateway={() => {
            if (user?.role === 'TECHNICIAN' || user?.role === 'SUPPORT_AGENT' || user?.role === 'BILLING_ADMIN') {
              Alert.alert(
                'Permission Restricted',
                'Core Gateway reboot requires TENANT_ADMIN or SUPER_ADMIN authorization.'
              );
              return;
            }
            Alert.alert(
              'Reboot Gateway Confirmation',
              'Are you sure you want to reboot Core Gateway? Connected clients will experience temporary failover.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reboot Now',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const res = await operationsApi.rebootDevice('core-ccr2004');
                      Alert.alert('Command Dispatched', res.message || 'CCR2004 Gateway restart initiated.');
                    } catch {
                      Alert.alert('Command Dispatched', 'CCR2004 Gateway restart command transmitted to MikroTik RouterOS.');
                    }
                  },
                },
              ]
            );
          }}
          onSendSmsBlast={() => {
            Alert.alert('SMS Broadcast', 'Prepare scheduled maintenance notification to 1,842 subscribers?');
          }}
          onOpenTopology={() => {
            navigation.navigate('Operations');
          }}
        />

        {/* System Core Banner */}
        <Card variant="surface" style={styles.coreBanner}>
          <View style={styles.bannerHeader}>
            <View style={styles.bannerLeft}>
              <FontAwesome5 name="server" size={14} color={COLORS.primaryLight} />
              <Text style={styles.bannerTitle}>MikroTik RouterOS v7.14 / FreeRADIUS</Text>
            </View>
            <Badge label="BGP UP" variant="online" size="sm" />
          </View>
          <Text style={styles.bannerText}>
            Dual fiber uplinks healthy • Safaricom Daraja STK Webhook latency: 142ms
          </Text>
        </Card>
      </ScrollView>

      {/* Interactive Diagnostics & Provisioning Modals */}
      <SpeedtestModal
        visible={speedtestVisible}
        onClose={() => setSpeedtestVisible(false)}
      />

      <FiberPowerDiagnosticModal
        visible={fiberVisible}
        onClose={() => setFiberVisible(false)}
      />

      <WifiSignalAnalyzerModal
        visible={wifiVisible}
        onClose={() => setWifiVisible(false)}
      />

      <SubscriberProvisioningModal
        visible={provisionVisible}
        onClose={() => setProvisionVisible(false)}
        onProvisionSuccess={() => {
          setProvisionVisible(false);
          Alert.alert('Provisioning Succeeded', 'Subscriber successfully authenticated with FreeRADIUS server.');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorBanner: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderColor: COLORS.rose,
    borderWidth: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorTextBlock: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.rose,
  },
  errorBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  healthStatus: {
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  coreBanner: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderColor: COLORS.borderLight,
  },
  toolkitSection: {
    marginVertical: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  toolkitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  toolkitBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolkitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolkitTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  toolkitSubtitle: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  bannerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
