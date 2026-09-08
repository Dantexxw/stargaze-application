import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { ManualGrantRequest } from '../../types/models';
import { Ionicons } from '@expo/vector-icons';

interface ManualVoucherGrantModalProps {
  visible: boolean;
  initialMac?: string;
  initialPhone?: string;
  onClose: () => void;
  onGrantVoucher: (payload: ManualGrantRequest) => Promise<any>;
}

export const ManualVoucherGrantModal: React.FC<ManualVoucherGrantModalProps> = ({
  visible,
  initialMac = '',
  initialPhone = '',
  onClose,
  onGrantVoucher,
}) => {
  const [macAddress, setMacAddress] = useState(initialMac);
  const [phone, setPhone] = useState(initialPhone);
  const [selectedDuration, setSelectedDuration] = useState<number>(24);
  const [customDurationHours, setCustomDurationHours] = useState('24');
  const [reason, setReason] = useState('Customer Goodwill / Outage Compensation');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMac) setMacAddress(initialMac);
    if (initialPhone) setPhone(initialPhone);
  }, [initialMac, initialPhone]);

  const durationOptions = [
    { label: '⚡ 1 Hour', hours: 1 },
    { label: '⚡ 3 Hours', hours: 3 },
    { label: '⚡ 6 Hours', hours: 6 },
    { label: '⚡ 24 Hours (1 Day)', hours: 24 },
    { label: '⚡ 7 Days', hours: 168 },
  ];

  const handleGrant = async () => {
    if (!macAddress.trim()) {
      Alert.alert('Validation Error', 'Please enter a target device MAC Address.');
      return;
    }

    setLoading(true);
    try {
      const hours =
        selectedDuration > 0
          ? selectedDuration
          : parseInt(customDurationHours, 10) || 24;

      const res = await onGrantVoucher({
        macAddress: macAddress.trim().toUpperCase(),
        phone: phone.trim(),
        durationHours: hours,
        packageName: `Manual Grant ${hours}H Pass`,
        reason: reason.trim(),
        grantedBy: 'Admin Console',
      });

      Alert.alert('Bonus Time Granted', res.message);
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to credit MAC address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card variant="glow" style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="gift" size={20} color={COLORS.amber} />
              <Text style={styles.title}>Manual Voucher MAC Grant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Directly credit an active device MAC address with complimentary hotspot internet time.
          </Text>

          <ScrollView style={styles.formScroll}>
            {/* Target MAC Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Device MAC Address *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="hardware-chip-outline" size={18} color={COLORS.textSecondary} />
                <TextInput
                  value={macAddress}
                  onChangeText={setMacAddress}
                  placeholder="e.g. 94:E6:86:AB:12:44"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                  style={[styles.input, styles.monoInput]}
                />
              </View>
            </View>

            {/* Customer Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Customer Phone Number (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color={COLORS.textSecondary} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="2547XXXXXXXX"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Bonus Duration Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Complimentary Duration</Text>
              <View style={styles.durationPillsGrid}>
                {durationOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.hours}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDuration(opt.hours)}
                    style={[
                      styles.durationPill,
                      selectedDuration === opt.hours && styles.durationPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.durationPillText,
                        selectedDuration === opt.hours && styles.durationPillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reason / CSR Note */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CSR Grant Reason</Text>
              <View style={[styles.inputContainer, { height: 50 }]}>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g. Compensation for network maintenance"
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.input}
                />
              </View>
            </View>
          </ScrollView>

          {/* Submit Action */}
          <Button
            title="Credit MAC Address & Activate"
            variant="primary"
            onPress={handleGrant}
            loading={loading}
            icon={<Ionicons name="flash" size={16} color="#FFFFFF" />}
            style={{ marginTop: SPACING.md }}
          />
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
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
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  formScroll: {
    maxHeight: 380,
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
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  durationPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  durationPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    margin: 3,
  },
  durationPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: COLORS.amber,
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  durationPillTextActive: {
    color: COLORS.amberLight,
  },
});
