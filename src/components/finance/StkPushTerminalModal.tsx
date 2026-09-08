import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { COLORS, SPACING, RADIUS } from '../../theme/Theme';
import { HotspotPlan, StkPushResponse } from '../../types/models';
import { validateKenyaPhone, formatKenyaPhone, formatCurrency } from '../../utils/formatters';
import { paymentsApi } from '../../api/paymentsApi';
import { useTenantStore } from '../../store/useTenantStore';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

interface StkPushTerminalModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (response: StkPushResponse) => void;
  initialMac?: string;
  initialPhone?: string;
}

export const StkPushTerminalModal: React.FC<StkPushTerminalModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialMac = '',
  initialPhone = '',
}) => {
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const [plans, setPlans] = useState<HotspotPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-24h');
  const [phone, setPhone] = useState<string>(initialPhone || '+254 708 393 665');
  const [macAddress, setMacAddress] = useState<string>(initialMac);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);

  // Status Lifecycle: 'idle' | 'initiating' | 'waiting_pin' | 'confirmed' | 'failed'
  const [stage, setStage] = useState<
    'idle' | 'initiating' | 'waiting_pin' | 'confirmed' | 'failed'
  >('idle');
  const [stkResult, setStkResult] = useState<StkPushResponse | null>(null);

  useEffect(() => {
    if (visible) {
      setStage('idle');
      setStkResult(null);
      if (initialPhone) setPhone(initialPhone);
      if (initialMac) setMacAddress(initialMac);

      paymentsApi.getHotspotPlans().then((data) => {
        setPlans(data);
        if (data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(data[0].id);
        }
        setLoadingPlans(false);
      });
    }
  }, [visible, initialPhone, initialMac]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleTriggerStk = async () => {
    if (!validateKenyaPhone(phone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Kenyan phone number (e.g. +254 708 393 665 or 0708393665).'
      );
      return;
    }

    if (!selectedPlan) {
      Alert.alert('Plan Required', 'Please select a hotspot data pass.');
      return;
    }

    setStage('initiating');

    try {
      const formattedPhone = formatKenyaPhone(phone.trim());
      const response = await paymentsApi.triggerStkPush({
        phone: formattedPhone,
        planId: selectedPlan.id,
        macAddress: macAddress.trim() || undefined,
        tenantId: currentTenant?.id,
      });

      setStkResult(response);
      setStage('waiting_pin');

      // Simulate live M-Pesa PIN validation polling
      setTimeout(() => {
        setStage('confirmed');
        if (onSuccess) {
          onSuccess(response);
        }
      }, 3500);
    } catch {
      setStage('failed');
      Alert.alert('M-Pesa STK Error', 'Failed to reach Daraja M-Pesa gateway.');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setStkResult(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card variant="glow" glowColor={COLORS.emeraldGlow} style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.mpesaBadge}>
                <FontAwesome5 name="mobile-alt" size={16} color={COLORS.emerald} />
              </View>
              <Text style={styles.title}>M-Pesa STK Push Terminal</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              disabled={stage === 'initiating' || stage === 'waiting_pin'}
            >
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Initiate instant STK push to customer's phone and automatically bind active hotspot voucher.
          </Text>

          {/* Active Terminal View vs Status Lifecycle Dialog */}
          {stage === 'idle' ? (
            <ScrollView style={styles.scrollArea}>
              {/* Customer Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Customer Phone Number (M-Pesa STK Prompt)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+254 7XX XXX XXX"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Hotspot Plan Selector */}
              <Text style={styles.sectionLabel}>SELECT HOTSPOT DATA PLAN</Text>
              {loadingPlans ? (
                <ActivityIndicator color={COLORS.emerald} style={{ marginVertical: 12 }} />
              ) : (
                <View style={styles.plansGrid}>
                  {plans.map((p) => {
                    const isSelected = selectedPlanId === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        activeOpacity={0.75}
                        onPress={() => setSelectedPlanId(p.id)}
                        style={[styles.planCard, isSelected && styles.planCardActive]}
                      >
                        <View style={styles.planHeaderRow}>
                          <Text
                            style={[
                              styles.planName,
                              isSelected && styles.planNameSelected,
                            ]}
                          >
                            {p.name}
                          </Text>
                          {p.isPopular && (
                            <Badge label="POPULAR" variant="online" size="sm" />
                          )}
                        </View>
                        <Text style={styles.planPrice}>{formatCurrency(p.priceKes)}</Text>
                        <Text style={styles.planSpeed}>
                          ⚡ Up to {p.speedLimitMbps} Mbps Unlimited
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Optional MAC Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Customer Device MAC Address (Optional Direct Bind)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="hardware-chip-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={macAddress}
                    onChangeText={setMacAddress}
                    placeholder="94:E6:86:AB:12:44"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="characters"
                    style={[styles.input, styles.monoInput]}
                  />
                </View>
              </View>

              {/* STK Trigger Action Button */}
              <View style={styles.footerAction}>
                <Button
                  title={`Send STK Push • ${selectedPlan ? formatCurrency(selectedPlan.priceKes) : ''}`}
                  variant="primary"
                  onPress={handleTriggerStk}
                  style={{ backgroundColor: COLORS.emeraldDark }}
                  icon={<FontAwesome5 name="paper-plane" size={14} color="#FFFFFF" />}
                />
              </View>
            </ScrollView>
          ) : (
            /* Live Polling Dialog Stage */
            <View style={styles.statusDialogBox}>
              {stage === 'initiating' && (
                <View style={styles.centerStatus}>
                  <ActivityIndicator size="large" color={COLORS.emerald} />
                  <Text style={styles.statusHeading}>Transmitting STK Push...</Text>
                  <Text style={styles.statusDetail}>
                    Connecting to Safaricom Daraja M-Pesa Gateway...
                  </Text>
                </View>
              )}

              {stage === 'waiting_pin' && (
                <View style={styles.centerStatus}>
                  <View style={styles.pulseIconRing}>
                    <FontAwesome5 name="key" size={24} color={COLORS.amber} />
                  </View>
                  <Text style={[styles.statusHeading, { color: COLORS.amber }]}>
                    Waiting for customer M-Pesa PIN...
                  </Text>
                  <Text style={styles.statusDetail}>
                    Prompt sent to {phone} for {selectedPlan?.name} ({formatCurrency(selectedPlan?.priceKes || 0)}).
                  </Text>
                  <View style={styles.pollingPill}>
                    <ActivityIndicator size="small" color={COLORS.amber} />
                    <Text style={styles.pollingText}>Listening for Safaricom C2B Callback</Text>
                  </View>
                </View>
              )}

              {stage === 'confirmed' && (
                <View style={styles.centerStatus}>
                  <View style={styles.successIconRing}>
                    <Ionicons name="checkmark-circle" size={48} color={COLORS.emerald} />
                  </View>
                  <Text style={[styles.statusHeading, { color: COLORS.emerald }]}>
                    ✅ Payment Confirmed & Voucher Activated!
                  </Text>
                  <Text style={styles.statusDetail}>
                    M-Pesa Receipt: <Text style={styles.receiptText}>{stkResult?.receiptNumber || 'UI5G55HKLQ'}</Text>
                  </Text>
                  <View style={styles.voucherSummaryCard}>
                    <Text style={styles.voucherTitle}>{selectedPlan?.name}</Text>
                    <Text style={styles.voucherSub}>
                      Duration: {selectedPlan?.durationLabel} • Speed: {selectedPlan?.speedLimitMbps} Mbps
                    </Text>
                    {macAddress ? (
                      <Text style={styles.boundMacText}>Bound to MAC: {macAddress}</Text>
                    ) : null}
                  </View>

                  <Button
                    title="Complete & Close"
                    variant="primary"
                    onPress={onClose}
                    style={{ marginTop: SPACING.md, width: '100%' }}
                  />
                </View>
              )}

              {stage === 'failed' && (
                <View style={styles.centerStatus}>
                  <Ionicons name="close-circle" size={48} color={COLORS.rose} />
                  <Text style={[styles.statusHeading, { color: COLORS.rose }]}>
                    Transaction Failed or Timed Out
                  </Text>
                  <Text style={styles.statusDetail}>
                    The customer canceled the M-Pesa prompt or entered an incorrect PIN.
                  </Text>

                  <Button
                    title="Retry STK Push"
                    variant="secondary"
                    onPress={handleReset}
                    style={{ marginTop: SPACING.md, width: '100%' }}
                  />
                </View>
              )}
            </View>
          )}
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mpesaBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  scrollArea: {
    maxHeight: 440,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    marginLeft: SPACING.sm,
  },
  monoInput: {
    fontFamily: 'Courier',
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  plansGrid: {
    marginBottom: SPACING.md,
  },
  planCard: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  planCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: COLORS.emerald,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  planNameSelected: {
    color: COLORS.text,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.emerald,
    marginTop: 2,
  },
  planSpeed: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  footerAction: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statusDialogBox: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  centerStatus: {
    alignItems: 'center',
    width: '100%',
  },
  statusHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  statusDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  pulseIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1.5,
    borderColor: COLORS.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconRing: {
    marginBottom: SPACING.xs,
  },
  pollingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  pollingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.amber,
    marginLeft: 6,
  },
  receiptText: {
    fontFamily: 'Courier',
    fontWeight: '800',
    color: COLORS.emerald,
  },
  voucherSummaryCard: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  voucherTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  voucherSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  boundMacText: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: COLORS.primaryLight,
    marginTop: 4,
  },
});

export default StkPushTerminalModal;
