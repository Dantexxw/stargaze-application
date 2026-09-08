import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { EmergencyAlert, FieldTechnician } from '../../types/models';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { validateKenyaPhone, formatKenyaPhone } from '../../utils/formatters';

interface DispatchTechModalProps {
  visible: boolean;
  alert: EmergencyAlert | null;
  technicians: FieldTechnician[];
  onClose: () => void;
  onDispatchSms: (params: {
    alertId: string;
    technicianPhone: string;
    technicianName: string;
    message: string;
  }) => Promise<any>;
}

export const DispatchTechModal: React.FC<DispatchTechModalProps> = ({
  visible,
  alert,
  technicians,
  onClose,
  onDispatchSms,
}) => {
  const [selectedTech, setSelectedTech] = useState<FieldTechnician | null>(
    technicians[0] || null
  );
  const [customPhone, setCustomPhone] = useState(
    technicians[0]?.phone || '+254 722 998 877'
  );
  const [customName, setCustomName] = useState(
    technicians[0]?.name || 'Field Technician'
  );
  const [sending, setSending] = useState(false);

  if (!alert) return null;

  const defaultSmsMessage = `[STARGAZE URGENT] Access Point Disconnected on Port ${alert.portName} (${alert.apModel}, MAC: ${alert.macAddress}) at ${alert.location}. Please proceed immediately. GPS: ${alert.latitude}, ${alert.longitude}`;

  const handleSelectTech = (tech: FieldTechnician) => {
    setSelectedTech(tech);
    setCustomPhone(tech.phone);
    setCustomName(tech.name);
  };

  const handleSendDispatch = async () => {
    if (!validateKenyaPhone(customPhone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Kenyan phone number (e.g. +254 722 123 456 or 0722123456).'
      );
      return;
    }

    setSending(true);
    try {
      const formattedPhone = formatKenyaPhone(customPhone.trim());
      const res = await onDispatchSms({
        alertId: alert.id,
        technicianPhone: formattedPhone,
        technicianName: customName.trim(),
        message: defaultSmsMessage,
      });

      Alert.alert(
        'SMS Dispatched Successfully',
        `${res.message}\n\nTracking ID: ${res.messageId}`
      );
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to transmit SMS to gateway.');
    } finally {
      setSending(false);
    }
  };

  const handleDirectCall = () => {
    if (customPhone) {
      Linking.openURL(`tel:${customPhone}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card variant="glow" glowColor={COLORS.roseGlow} style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="paper-plane" size={20} color={COLORS.rose} />
              <Text style={styles.title}>Dispatch Field Technician</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.alertSummary}>
            Incident: {alert.portName} ({alert.apName}) Disconnect at {alert.location}
          </Text>

          <ScrollView style={styles.scrollArea}>
            {/* Quick Available Technicians */}
            <Text style={styles.sectionLabel}>AVAILABLE FIELD ENGINEERS (GPS PROXIMITY)</Text>
            {technicians.map((tech) => {
              const isSelected = selectedTech?.id === tech.id;
              return (
                <TouchableOpacity
                  key={tech.id}
                  activeOpacity={0.75}
                  onPress={() => handleSelectTech(tech)}
                  style={[
                    styles.techCard,
                    isSelected && styles.techCardActive,
                  ]}
                >
                  <View style={styles.techLeft}>
                    <View style={styles.avatarCircle}>
                      <Ionicons name="person" size={18} color={COLORS.primaryLight} />
                    </View>
                    <View style={styles.techInfo}>
                      <Text style={styles.techName}>{tech.name}</Text>
                      <Text style={styles.techSub}>
                        {tech.role} • {tech.distanceKm} km away
                      </Text>
                    </View>
                  </View>

                  <Badge
                    label={tech.status.toUpperCase()}
                    variant={tech.status === 'available' ? 'online' : 'warning'}
                    size="sm"
                  />
                </TouchableOpacity>
              );
            })}

            {/* Custom Phone Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Technician Phone (SMS Destination)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color={COLORS.textSecondary} />
                <TextInput
                  value={customPhone}
                  onChangeText={setCustomPhone}
                  placeholder="+254 7XX XXX XXX"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                <TouchableOpacity onPress={handleDirectCall} style={styles.callBtn}>
                  <Ionicons name="call" size={16} color={COLORS.emerald} />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SMS Preview */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Emergency SMS Gateway Payload</Text>
              <View style={styles.smsPreviewBox}>
                <Text style={styles.smsText}>{defaultSmsMessage}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalFooter}>
            <Button
              title="Transmit Emergency SMS"
              variant="danger"
              onPress={handleSendDispatch}
              loading={sending}
              icon={<Ionicons name="send" size={16} color="#FFFFFF" />}
            />
          </View>
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
    maxHeight: '85%',
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
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  closeBtn: {
    padding: 4,
  },
  alertSummary: {
    fontSize: 12,
    color: COLORS.rose,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  scrollArea: {
    maxHeight: 400,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  techCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  techCardActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: COLORS.primaryLight,
  },
  techLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  techSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  inputGroup: {
    marginTop: SPACING.md,
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
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
    marginLeft: 4,
  },
  smsPreviewBox: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  smsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    fontFamily: 'Courier',
  },
  modalFooter: {
    marginTop: SPACING.lg,
  },
});
