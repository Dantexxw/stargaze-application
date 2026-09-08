import React, { useState } from 'react';
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
import { Badge } from '../common/Badge';
import { COLORS, SPACING, RADIUS } from '../../theme/Theme';
import { SubscriberProvisionRequest } from '../../types/models';
import { validateKenyaPhone, formatKenyaPhone } from '../../utils/formatters';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface SubscriberProvisioningModalProps {
  visible: boolean;
  onClose: () => void;
  onProvisionSuccess?: (data: any) => void;
}

export const SubscriberProvisioningModal: React.FC<SubscriberProvisioningModalProps> = ({
  visible,
  onClose,
  onProvisionSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+254 7');
  const [idNumber, setIdNumber] = useState('');
  const [location, setLocation] = useState('Westlands, Ring Road Parklands');
  const [connType, setConnectionType] = useState<'PPPOE' | 'STATIC_IP' | 'HOTSPOT_MAC'>('PPPOE');
  const [bandwidth, setBandwidth] = useState<'10M/10M' | '20M/20M' | '50M/50M' | '100M/100M'>('20M/20M');
  const [pppoeUser, setPppoeUser] = useState('');
  const [pppoePass, setPppoePass] = useState('');
  const [provisioning, setProvisioning] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim() || !validateKenyaPhone(phone)) {
        Alert.alert('Validation', 'Please enter customer name and a valid Kenyan phone number.');
        return;
      }
      // Auto-generate suggested PPPoE credentials
      const cleanUser = fullName.toLowerCase().replace(/\s+/g, '.') + '@stargaze.net';
      setPppoeUser(cleanUser);
      setPppoePass('Pass' + Math.floor(Math.random() * 9000 + 1000));
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleCompleteProvision = async () => {
    setProvisioning(true);
    try {
      const payload: SubscriberProvisionRequest = {
        fullName,
        phone: formatKenyaPhone(phone),
        idNumberOrKra: idNumber,
        connectionType: connType,
        planName: `Home Fiber ${bandwidth} Tier`,
        bandwidthProfile: bandwidth,
        pppoeUsername: pppoeUser,
        pppoePassword: pppoePass,
        location,
      };

      // Simulated backend / MikroTik Secret sync
      await new Promise((res) => setTimeout(res, 1500));

      Alert.alert(
        '✅ Subscriber Successfully Provisioned',
        `Account created on Core MikroTik Gateway & RADIUS.\nPPPoE Secret: ${pppoeUser}\nProfile: ${bandwidth}\nCustomer SMS with setup credentials sent!`
      );
      if (onProvisionSuccess) onProvisionSuccess(payload);
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to provision on MikroTik gateway.');
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card variant="glow" glowColor={COLORS.primaryGlow} style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Ionicons name="person-add" size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.title}>Subscriber Onboarding Wizard</Text>
                <Text style={styles.targetSub}>Step {step} of 3: {step === 1 ? 'Customer Info' : step === 2 ? 'Connection Profile' : 'MikroTik Verification'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={provisioning}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {step === 1 && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Legal Name / Business Entity</Text>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Dennis Kipchoge"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Primary Phone Number (Billing & SMS)</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+254 7XX XXX XXX"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>National ID / Passport / KRA PIN</Text>
                  <TextInput
                    value={idNumber}
                    onChangeText={setIdNumber}
                    placeholder="e.g. 34891024"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Installation Physical Address & Building</Text>
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="e.g. Nairobi Westlands, Apex Plaza 3rd Flr"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                  />
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.sectionLabel}>SELECT SERVICE TYPE</Text>
                <View style={styles.typeGrid}>
                  {(['PPPOE', 'STATIC_IP', 'HOTSPOT_MAC'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setConnectionType(t)}
                      style={[styles.typeBtn, connType === t && styles.typeBtnActive]}
                    >
                      <Text style={[styles.typeBtnText, connType === t && styles.typeBtnTextActive]}>
                        {t === 'PPPOE' ? 'Fixed PPPoE Fiber' : t === 'STATIC_IP' ? 'Dedicated IP' : 'Hotspot MAC'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>SELECT BANDWIDTH PROFILE</Text>
                <View style={styles.typeGrid}>
                  {(['10M/10M', '20M/20M', '50M/50M', '100M/100M'] as const).map((b) => (
                    <TouchableOpacity
                      key={b}
                      onPress={() => setBandwidth(b)}
                      style={[styles.typeBtn, bandwidth === b && styles.typeBtnActive]}
                    >
                      <Text style={[styles.typeBtnText, bandwidth === b && styles.typeBtnTextActive]}>
                        ⚡ {b}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryHeading}>Generated MikroTik Gateway Secret</Text>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>PPPoE Username:</Text>
                    <Text style={[styles.specVal, styles.mono]}>{pppoeUser}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>PPPoE Password:</Text>
                    <Text style={[styles.specVal, styles.mono]}>{pppoePass}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Bandwidth Tier:</Text>
                    <Text style={styles.specVal}>{bandwidth} Unlimited</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Target Gateway:</Text>
                    <Text style={styles.specVal}>STARGAZE-CORE-01</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Wizard Footer Navigation */}
          <View style={styles.footerRow}>
            {step > 1 && (
              <Button
                title="Back"
                variant="secondary"
                onPress={() => setStep((s) => ((s - 1) as any))}
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
            )}
            {step < 3 ? (
              <Button
                title="Next Step"
                variant="primary"
                onPress={handleNext}
                style={{ flex: 2 }}
              />
            ) : (
              <Button
                title="Provision to MikroTik"
                variant="primary"
                onPress={handleCompleteProvision}
                loading={provisioning}
                style={{ flex: 2, backgroundColor: COLORS.emeraldDark }}
              />
            )}
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  targetSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
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
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    color: COLORS.text,
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  typeBtn: {
    width: '48%',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  typeBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: COLORS.primaryLight,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  typeBtnTextActive: {
    color: COLORS.primaryLight,
  },
  summaryCard: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  summaryHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryLight,
    marginBottom: SPACING.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  mono: {
    fontFamily: 'Courier',
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
});

export default SubscriberProvisioningModal;
