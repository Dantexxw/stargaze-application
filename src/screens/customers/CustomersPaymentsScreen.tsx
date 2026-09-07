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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { FinancialKpiCards } from '../../components/finance/FinancialKpiCards';
import { LiveMpesaTransactionRow } from '../../components/finance/LiveMpesaTransactionRow';
import { ManualVoucherGrantModal } from '../../components/finance/ManualVoucherGrantModal';
import { StkPushTerminalModal } from '../../components/finance/StkPushTerminalModal';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RoleGuard } from '../../components/common/RoleGuard';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { usePayments } from '../../hooks/usePayments';
import { useFinancialAnalytics } from '../../hooks/useFinancialAnalytics';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

type ViewMode = 'mpesa_stream' | 'subscribers';
type StatusFilter = 'all' | 'completed' | 'pending' | 'failed';

export const CustomersPaymentsScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isTechnician = user?.role === 'TECHNICIAN';

  const [viewMode, setViewMode] = useState<ViewMode>(
    isTechnician ? 'subscribers' : 'mpesa_stream'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Manual Grant & Voucher Modals
  const [grantModalVisible, setGrantModalVisible] = useState(false);
  const [grantTargetMac, setGrantTargetMac] = useState('');
  const [grantTargetPhone, setGrantTargetPhone] = useState('');

  // STK Push Terminal Modal
  const [stkModalVisible, setStkModalVisible] = useState(false);
  const [stkTargetPhone, setStkTargetPhone] = useState('');
  const [stkTargetMac, setStkTargetMac] = useState('');

  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [voucherPlan, setVoucherPlan] = useState('Hotspot 24-Hour Unlimited');
  const [voucherAmount, setVoucherAmount] = useState('100');
  const [voucherQty, setVoucherQty] = useState('1');

  const {
    subscribers,
    isLoadingSubscribers,
    refetchSubscribers,
    generateVouchers,
    isGeneratingVouchers,
  } = usePayments();

  const {
    analytics,
    transactions,
    isLoadingTransactions,
    isRefetchingTransactions,
    refetchTransactions,
    grantManualVoucher,
  } = useFinancialAnalytics();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTransactions(), refetchSubscribers()]);
    setRefreshing(false);
  };

  const handleOpenGrantModal = (mac?: string, phone?: string) => {
    setGrantTargetMac(mac || '');
    setGrantTargetPhone(phone || '');
    setGrantModalVisible(true);
  };

  const handleOpenStkModal = (phone?: string, mac?: string) => {
    setStkTargetPhone(phone || '');
    setStkTargetMac(mac || '');
    setStkModalVisible(true);
  };

  // Multi-parameter filter across Receipt Code, Phone, and MAC address
  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.customerName.toLowerCase().includes(q) ||
      tx.phoneNumber.includes(q) ||
      tx.receiptNumber.toLowerCase().includes(q) ||
      tx.accountReference.toLowerCase().includes(q) ||
      (tx.macAddress && tx.macAddress.toLowerCase().includes(q))
    );
  });

  const filteredSubscribers = subscribers.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.name.toLowerCase().includes(q) ||
      sub.phone.includes(q) ||
      sub.accountNumber.toLowerCase().includes(q) ||
      sub.planName.toLowerCase().includes(q) ||
      (sub.macAddress && sub.macAddress.toLowerCase().includes(q))
    );
  });

  const handleCreateVoucherBatch = async () => {
    try {
      const qty = parseInt(voucherQty, 10) || 1;
      const amt = parseInt(voucherAmount, 10) || 100;
      const res = await generateVouchers({
        packageName: voucherPlan,
        durationHours: 24,
        amount: amt,
        quantity: qty,
      });

      setBatchModalVisible(false);
      Alert.alert(
        'Vouchers Generated',
        `Batch generated successfully:\n\n${res.voucherCodes.join(
          '\n'
        )}\n\nSync dispatched to MikroTik Hotspot User DB.`
      );
    } catch {
      Alert.alert('Error', 'Could not generate voucher batch');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="FINANCE"
        subtitle="M-Pesa Live Stream, Analytics & Subscriber Base"
      />

      {/* Quick Action Ribbon */}
      <RoleGuard allowedRoles={['SUPER_ADMIN', 'TENANT_ADMIN']}>
        <View style={styles.actionStripContainer}>
          <TouchableOpacity
            style={styles.stkActionBtn}
            onPress={() => handleOpenStkModal()}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="paper-plane" size={13} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>STK Push</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.grantActionBtn}
            onPress={() => handleOpenGrantModal()}
            activeOpacity={0.8}
          >
            <Ionicons name="gift" size={15} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Grant MAC</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.voucherActionBtn}
            onPress={() => setBatchModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="ticket" size={15} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>+ Voucher</Text>
          </TouchableOpacity>
        </View>
      </RoleGuard>

      {/* Main Mode Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setViewMode('mpesa_stream')}
          style={[styles.tabButton, viewMode === 'mpesa_stream' && styles.tabButtonActive]}
        >
          <FontAwesome5
            name="money-bill-wave"
            size={14}
            color={viewMode === 'mpesa_stream' ? COLORS.emerald : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, viewMode === 'mpesa_stream' && styles.tabTextActive]}
          >
            M-Pesa Stream ({transactions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setViewMode('subscribers')}
          style={[styles.tabButton, viewMode === 'subscribers' && styles.tabButtonActive]}
        >
          <Ionicons
            name="people"
            size={16}
            color={viewMode === 'subscribers' ? COLORS.primaryLight : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, viewMode === 'subscribers' && styles.tabTextActive]}
          >
            Subscribers ({subscribers.length})
          </Text>
        </TouchableOpacity>
      </View>

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
        {/* VIEW 1: FINANCIAL ANALYTICS & LIVE M-PESA STREAM */}
        {viewMode === 'mpesa_stream' && (
          <RoleGuard
            allowedRoles={['SUPER_ADMIN', 'TENANT_ADMIN']}
            showRestrictedCard
            featureTitle="Financial & Revenue Stream (Admin Clearance Required)"
          >
            {/* Revenue & Business Analytics KPI Cards */}
            <FinancialKpiCards analytics={analytics} />

            {/* Stream Header & Live Polling Status */}
            <View style={styles.streamHeaderRow}>
              <View style={styles.streamTitleBlock}>
                <View style={styles.liveDot} />
                <Text style={styles.streamTitle}>LIVE M-PESA STK & C2B STREAM</Text>
              </View>
              <Text style={styles.pollingLabel}>Daraja Webhook Active</Text>
            </View>

            {/* Multi-Criteria Search & Filter Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={COLORS.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search M-Pesa Code, Phone, or MAC..."
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Status Filter Pills */}
              <View style={styles.statusPillGroup}>
                {(['all', 'completed', 'pending', 'failed'] as StatusFilter[]).map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setStatusFilter(st)}
                    style={[
                      styles.statusPill,
                      statusFilter === st && styles.statusPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        statusFilter === st && styles.statusPillTextActive,
                      ]}
                    >
                      {st === 'all'
                        ? 'All'
                        : st === 'completed'
                        ? '🟢 Success'
                        : st === 'pending'
                        ? '🟡 Pending'
                        : '🔴 Failed'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transactions Feed */}
            {filteredTransactions.map((tx) => (
              <LiveMpesaTransactionRow
                key={tx.id}
                transaction={tx}
                onGrantBonusPress={handleOpenGrantModal}
              />
            ))}
          </RoleGuard>
        )}

        {/* VIEW 2: SUBSCRIBER DIRECTORY */}
        {viewMode === 'subscribers' && (
          <View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={COLORS.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search Subscriber, PPPoE IP, MAC..."
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.searchInput}
                />
              </View>
            </View>

            {filteredSubscribers.map((sub) => (
              <Card key={sub.id} style={styles.subCard}>
                <View style={styles.subHeader}>
                  <View style={styles.subLeft}>
                    <Text style={styles.subName}>{sub.name}</Text>
                    <Text style={styles.subAccount}>
                      {sub.accountNumber} • {sub.phone}
                    </Text>
                  </View>
                  <Badge
                    label={sub.status.toUpperCase()}
                    variant={sub.status === 'active' ? 'online' : 'danger'}
                    size="sm"
                  />
                </View>

                <View style={styles.subDetailsRow}>
                  <View style={styles.subDetail}>
                    <Text style={styles.subDetailLabel}>Plan</Text>
                    <Text style={styles.subDetailValue}>{sub.planName}</Text>
                  </View>
                  <View style={styles.subDetail}>
                    <Text style={styles.subDetailLabel}>Profile</Text>
                    <Text style={styles.subDetailValue}>{sub.bandwidthProfile}</Text>
                  </View>
                  <View style={styles.subDetail}>
                    <Text style={styles.subDetailLabel}>Data Used</Text>
                    <Text style={styles.subDetailValue}>{sub.dataUsedGB} GB</Text>
                  </View>
                </View>

                {sub.macAddress && (
                  <View style={styles.subIpRow}>
                    <Ionicons name="hardware-chip-outline" size={12} color={COLORS.cyan} />
                    <Text style={styles.subIpText}>
                      MAC: {sub.macAddress} (IP: {sub.ipAddress || 'Dynamic'})
                    </Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* M-Pesa In-App STK Push Terminal Modal */}
      <StkPushTerminalModal
        visible={stkModalVisible}
        initialPhone={stkTargetPhone}
        initialMac={stkTargetMac}
        onClose={() => setStkModalVisible(false)}
        onSuccess={() => refetchTransactions()}
      />

      {/* Manual Voucher MAC Grant Modal */}
      <ManualVoucherGrantModal
        visible={grantModalVisible}
        initialMac={grantTargetMac}
        initialPhone={grantTargetPhone}
        onClose={() => setGrantModalVisible(false)}
        onGrantVoucher={grantManualVoucher}
      />

      {/* Batch Voucher Generator Modal */}
      <Modal visible={batchModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card variant="glow" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="ticket" size={20} color={COLORS.primaryLight} />
                <Text style={styles.modalTitle}>Issue Hotspot Vouchers</Text>
              </View>
              <TouchableOpacity onPress={() => setBatchModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Package Name</Text>
              <TextInput
                value={voucherPlan}
                onChangeText={setVoucherPlan}
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalRow}>
              <View style={[styles.modalInputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.modalLabel}>Price (KES)</Text>
                <TextInput
                  value={voucherAmount}
                  onChangeText={setVoucherAmount}
                  keyboardType="numeric"
                  style={styles.modalInput}
                />
              </View>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.modalLabel}>Quantity</Text>
                <TextInput
                  value={voucherQty}
                  onChangeText={setVoucherQty}
                  keyboardType="numeric"
                  style={styles.modalInput}
                />
              </View>
            </View>

            <Button
              title="Generate & Push to Router"
              onPress={handleCreateVoucherBatch}
              loading={isGeneratingVouchers}
              style={{ marginTop: SPACING.md }}
            />
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  actionStripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.xs,
  },
  stkActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.emeraldDark,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  grantActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.amberDark,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  voucherActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  streamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  streamTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
    marginRight: 6,
  },
  streamTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  pollingLabel: {
    fontSize: 10,
    color: COLORS.emerald,
    fontWeight: '700',
  },
  searchContainer: {
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
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    marginLeft: SPACING.sm,
  },
  statusPillGroup: {
    flexDirection: 'row',
  },
  statusPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  statusPillActive: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.primaryLight,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  statusPillTextActive: {
    color: COLORS.primaryLight,
  },
  subCard: {
    marginBottom: SPACING.xs,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subLeft: {
    flex: 1,
  },
  subName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  subAccount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  subDetail: {
    alignItems: 'center',
  },
  subDetailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  subDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  subIpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subIpText: {
    fontSize: 11,
    color: COLORS.cyan,
    marginLeft: 4,
    fontFamily: 'Courier',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    padding: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  modalInputGroup: {
    marginBottom: SPACING.md,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    height: 44,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
  },
  modalRow: {
    flexDirection: 'row',
  },
});
